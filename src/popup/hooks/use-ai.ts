import { ref } from 'vue'
import { ChatGPTAPI } from 'chatgpt'
import { ElMessage } from 'element-plus'
import parseGitPatch from 'parse-git-patch'
import FileInfo from '@/popup/views/result/components/file-info.vue'

export default function useAI(userApiKey?: string, apiBaseUrl?: string) {
  const provider = ref<string>('')
  const result = ref<string>('')
  const percentage = ref<number>(0)
  const loading = ref<boolean>(false)
  const message = ref<string>('loading...')
  const getApiKey = async () => {
    return (
      userApiKey ||
      (await chrome.storage.sync.get('apiKey').then((item) => {
        return item.apiKey
      }))
    )
  }

  const setApiKey = async (key: string) => {
    await chrome.storage.sync.set({ apiKey: key })
  }

  const getApiBaseUrl = async () => {
    return (
      apiBaseUrl ||
      (await chrome.storage.sync.get('apiBaseUrl').then((item) => {
        return item.apiBaseUrl
      })) ||
      'https://api.openai.com/v1'
    )
  }

  const setApiBaseUrl = async (url: string) => {
    await chrome.storage.sync.set({ apiBaseUrl: url })
  }

  const callback = async (data: any) => {
    const { url, text } = data
    result.value += `${text}\n`
    if (url && result.value) {
      await chrome.storage.session.set({ [url]: result.value })
      if (percentage.value === 100) {
        loading.value = false
      }
    }
  }

  const chatCallback = (res: string) => {
    result.value = res
  }

  const getPatchParts = async () => {
    const tab = (
      await chrome.tabs.query({ active: true, currentWindow: true })
    )[0]
    if (!tab || !tab.id) {
      return
    }
    const isGitLabResult = (
      await chrome.scripting.executeScript({
        target: { tabId: tab.id, allFrames: true },
        func: () => {
          return document.querySelectorAll('meta[content="GitLab"]').length
        }
      })
    )[0]
    if ('result' in isGitLabResult && isGitLabResult.result == 1) {
      provider.value = 'GitLab'
    }
    if (provider.value !== 'GitLab') {
      ElMessage.warning('Only support GitLab now.')
      return
    } else if (
      provider.value === 'GitLab' &&
      !tab?.url?.includes('/-/merge_requests/')
    ) {
      ElMessage.warning('Please open a GitLab merge request page.')
      return
    }
    message.value = 'Getting diff code...'
    loading.value = true
    result.value = ''
    const patch = await fetch(tab.url + '.patch').then((r: any) => r.text())
    const text = patch.replace(/GIT\sbinary\spatch(.*)literal\s0/gims, '')
    const parse = parseGitPatch(text)
    loading.value = false
    return { url: tab.url, files: parse?.files || [] }
  }

  const callAI = async (url: string, messages: any[]) => {
    if (!messages.length) return
    message.value = 'Waiting for AI response...'
    loading.value = true
    let apiKey, apiBaseUrl
    try {
      apiKey = await getApiKey()
      apiBaseUrl = await getApiBaseUrl()
    } catch (e: any) {
      loading.value = false
      throw new Error(e)
    }
    if (apiKey) {
      if (chrome && chrome.runtime) {
        for (let i = 0; i < messages.length; i++) {
          try {
            chrome.runtime.sendMessage(
              {
                type: 'callAI',
                data: {
                  apiKey,
                  apiBaseUrl,
                  url,
                  message: JSON.stringify(messages[i])
                }
              },
              (res: any) => {
                if (res) {
                  percentage.value = Math.floor(
                    (i + 1) * (100 / messages.length)
                  )
                  callback(res)
                }
              }
            )
          } catch (e: any) {
            loading.value = false
            throw new Error(e)
          }
        }
      }
    } else {
      loading.value = false
      ElMessage.warning('Please set your API key first.')
    }
  }

  const chatWithAI = async (message: string) => {
    if (!message) return
    loading.value = true
    let apiKey, apiBaseUrl
    try {
      apiKey = await getApiKey()
      apiBaseUrl = await getApiBaseUrl()
    } catch (e: any) {
      loading.value = false
      throw new Error(e)
    }
    if (apiKey) {
      const api = new ChatGPTAPI({
        apiKey,
        apiBaseUrl
      })
      try {
        const options: any = {
          onProgress: (r: any) => chatCallback(r.text)
        }
        await api.sendMessage(message, options)
      } catch (e: any) {
        throw new Error(e)
      }
    } else {
      ElMessage.warning('Please set your API key first.')
    }
    loading.value = false
  }

  return {
    components: { FileInfo },
    percentage,
    result,
    callAI,
    getApiKey,
    setApiKey,
    getApiBaseUrl,
    setApiBaseUrl,
    getPatchParts,
    chatWithAI,
    loading,
    message
  }
}
