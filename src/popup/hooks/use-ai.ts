import { ref } from 'vue'
import { ChatGPTAPI } from 'chatgpt'
import { ElMessage } from 'element-plus'
import parseGitPatch from 'parse-git-patch'

export default function useAI(userApiKey?: string, apiBaseUrl?: string) {
  const result = ref<string>('')
  const percentage = ref<number>(0)
  const loading = ref<boolean>(false)
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

  const callback = async (url: string, percentageNum: number, res: string) => {
    percentage.value = percentageNum
    if (percentageNum === 100) {
      result.value = res
      if (url) {
        await chrome.storage.session.set({ [url]: res })
      }
    }
  }

  const chatCallback = (res: string) => {
    result.value = res
  }

  const getPatchParts = async () => {
    result.value = ''
    const tab = (
      await chrome.tabs.query({ active: true, currentWindow: true })
    )[0]
    const patch = await fetch(tab.url + '.patch').then((r: any) => r.text())
    const text = patch.replace(/GIT\sbinary\spatch(.*)literal\s0/gims, '')
    const { files } = parseGitPatch(text)
    const patchParts: any[] = files.map((file: any) => {
      const patchList: any[] = []
      file.modifiedLines.forEach((item: any) => {
        if (item.line) patchList.push(`${item.added ? '+' : '-'} ${item.line}`)
      })
      return patchList.join('\n')
    })
    return patchParts
  }

  const callAI = async (messages: string[]) => {
    if (!messages.length) return
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
        apiBaseUrl,
        systemMessage: `You are a programming code change reviewer, provide feedback on the code changes given. Do not introduce yourselves. Please use chinese language.
          Your task is:
          - Review the code changes and provide feedback.
          - If there are any bugs, highlight them.
          - Provide details on missed use of best-practices.
          - Does the code do what it says in the commit messages?
          - Do not highlight minor issues and nitpicks.
          - Use bullet points if you have multiple comments.
          - Provide security recommendations if there are any.
          You are provided with the code changes (diffs) in a unidiff format.
          Do not provide feedback yet. I will follow-up with a description of the change in a new message.
          `
      })
      const url = (
        await chrome.tabs.query({ active: true, currentWindow: true })
      )[0]?.url
      percentage.value = 0
      for (let i = 0; i < messages.length; i++) {
        try {
          const percentageNum = Math.floor((i + 1) * (100 / messages.length))
          const options: any = {
            onProgress: (r: any) => callback(url || '', percentageNum, r.text)
          }
          await api.sendMessage(messages[i], options)
        } catch (e: any) {
          throw new Error(e)
        }
      }
    } else {
      ElMessage.warning('Please set your API key first.')
    }
    loading.value = false
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
    percentage,
    result,
    callAI,
    getApiKey,
    setApiKey,
    getApiBaseUrl,
    setApiBaseUrl,
    getPatchParts,
    chatWithAI,
    loading
  }
}
