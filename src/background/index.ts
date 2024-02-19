import { scrollToDetail } from '@/content-script'
import { ChatGPTAPI } from 'chatgpt'
import { Buffer } from 'buffer'
import parseGitPatch from 'parse-git-patch'

self.Buffer = Buffer

let globalState = {
  provider: '',
  result: '',
  percentage: 0,
  loading: false,
  message: 'loading...',
  warning: ''
}

const updateGlobalState = async (url: string) => {
  await chrome.storage.local.set({ [url]: globalState })
  const { isPopupOpen } = await chrome.storage.local.get('isPopupOpen')
  if (isPopupOpen) {
    await chrome.runtime.sendMessage({
      type: 'updateGlobalState',
      url,
      data: globalState
    })
  }
}

const resetGlobalState = async (url: string) => {
  globalState = {
    provider: '',
    result: '',
    percentage: 0,
    loading: false,
    message: 'loading...',
    warning: ''
  }
  await updateGlobalState(url)
}

const getApiKey = async () => {
  return await chrome.storage.sync.get('apiKey').then((item) => {
    return item.apiKey
  })
}

const getApiBaseUrl = async () => {
  return (
    (await chrome.storage.sync.get('apiBaseUrl').then((item) => {
      return item.apiBaseUrl
    })) || 'https://api.openai.com/v1'
  )
}

const getPatchParts = async (tab: any) => {
  const url = tab.url
  const isGitLabResult = (
    await chrome.scripting.executeScript({
      target: { tabId: tab.id, allFrames: true },
      func: () => {
        return document.querySelectorAll('meta[content="GitLab"]').length
      }
    })
  )[0]
  if ('result' in isGitLabResult && isGitLabResult.result == 1) {
    globalState.provider = 'GitLab'
  }
  if (globalState.provider !== 'GitLab') {
    globalState.warning = 'Only support GitLab now.'
    await updateGlobalState(url)
    return
  } else if (
    globalState.provider === 'GitLab' &&
    !tab?.url?.includes('/-/merge_requests/')
  ) {
    globalState.warning = 'Please open a GitLab merge request page.'
    await updateGlobalState(url)
    return
  }
  globalState.message = 'Getting diff code...'
  globalState.loading = true
  globalState.result = ''
  globalState.percentage = 0
  await updateGlobalState(url)
  const patch = await fetch(tab.url + '.patch').then((r: any) => r.text())
  const text = patch.replace(/GIT\sbinary\spatch(.*)literal\s0/gims, '')
  const parse = parseGitPatch(text)
  globalState.loading = false
  await updateGlobalState(url)
  return { url: tab.url, files: parse?.files || [] }
}

const callAI = async (apiKey: string, apiBaseUrl: string, message: string) => {
  const api = new ChatGPTAPI({
    apiKey,
    apiBaseUrl,
    fetch: self.fetch.bind(self),
    systemMessage: `You are a programming code change reviewer, provide feedback on the code changes given. Do not introduce yourselves. Please use chinese language.
          Your task is:
          - Review the code changes and provide feedback.
          - If there are any bugs, highlight them.
          - Provide details on missed use of best-practices.
          - Does the code do what it says in the commit messages?
          - Do not highlight minor issues and nitpicks.
          - Use bullet points if you have multiple comments.
          - Provide security recommendations if there are any.
          - Return the file name and line number of the code change you are providing feedback on. The format example is <file-info :data="{ file: 'src/index.js', lineNum: 10 }" />, file-info is Vue component name.
          You are provided with the code changes (diffs) in a unidiff format.
          Do not provide feedback yet. I will follow-up with a description of the change in a new message.
          `
  })
  try {
    return await api.sendMessage(message)
  } catch (e: any) {
    throw new Error(e)
  }
}

chrome.runtime.onConnect.addListener((port: any) => {
  port.onMessage.addListener(async (message: any) => {
    const { type } = message
    if (type === 'callAI') {
      const tab = (
        await chrome.tabs.query({ active: true, currentWindow: true })
      )[0]
      if (!tab || !tab.id) {
        return
      }
      const url = tab.url || ''
      await resetGlobalState(url)
      let apiKey, apiBaseUrl
      try {
        apiKey = await getApiKey()
        apiBaseUrl = await getApiBaseUrl()
      } catch (e: any) {
        globalState.loading = false
        await updateGlobalState(url)
        throw new Error(e)
      }
      if (!apiKey) {
        globalState.loading = false
        globalState.warning = 'Please set your API key first.'
        await updateGlobalState(url)
        return
      }
      const parts = await getPatchParts(tab)
      if (!parts) return
      const messages = parts?.files || []
      if (!url) return
      if (!messages.length) {
        globalState.warning = 'No code changes found.'
        await updateGlobalState(url)
        return
      }
      await chrome.storage.local.remove(url)
      globalState.message = 'Waiting for AI response...'
      globalState.loading = true
      await updateGlobalState(url)
      for (let i = 0; i < messages.length; i++) {
        const r = await callAI(apiKey, apiBaseUrl, JSON.stringify(messages[i]))
        const percentNum = Math.floor((i + 1) * (100 / messages.length))
        globalState.percentage = percentNum
        await updateGlobalState(url)
        if (port.sender?.tab?.id) {
          port.postMessage({ data: { url, text: r.text }, percentNum })
        }
        if (url && r.text) {
          let text =
            (await chrome.storage.local.get([url]).then((r: any) => {
              return r[url]?.result
            })) || ''
          text += `${r.text}\n`
          globalState.result = text
          await updateGlobalState(url)
          if (i === messages.length - 1) {
            globalState.loading = false
            await updateGlobalState(url)
            chrome.storage.local.get('isPopupOpen', (r: any) => {
              if (!r.isPopupOpen) {
                chrome.storage.local.set({ REVIEW_UNREAD: true })
                chrome.action.setBadgeText({ text: '+1' })
                chrome.action.setBadgeBackgroundColor({ color: '#ff4d4f' })
                chrome.action.setBadgeTextColor({ color: '#fff' })
              }
            })
          }
        }
      }
    }
  })
})

chrome.runtime.onMessage.addListener((message: any) => {
  ;(async () => {
    const { tabId, type, data } = message
    if (type === 'scroll') {
      if (!tabId) return
      const { file, lineNum } = data
      if (file && lineNum) {
        await scrollToDetail(tabId, file, lineNum)
      }
    }
  })()
  return true
})
