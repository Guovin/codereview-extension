import { ref } from 'vue'
import { ChatGPTAPI } from 'chatgpt'
import { ElMessage } from 'element-plus'

export default function useAI(userApiKey?: string, apiBaseUrl?: string) {
  const provider = ref<string>('')
  const result = ref<string>('')
  const percentage = ref<number>(0)
  const loading = ref<boolean>(false)
  const message = ref<string>('loading...')
  const warning = ref<string>('')
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
    if (url && result.value && percentage.value === 100) {
      loading.value = false
    }
  }

  const chatCallback = (res: string) => {
    result.value = res
  }

  const callAI = async () => {
    if (chrome && chrome.runtime) {
      const port = chrome.runtime.connect()
      try {
        port.postMessage({
          type: 'callAI'
        })
        port.onMessage.addListener((res: any) => {
          if (res) {
            const { data, percentNum } = res
            percentage.value = percentNum
            callback(data)
          }
        })
      } catch (e: any) {
        loading.value = false
        throw new Error(e)
      }
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

  const updatePage = (data: any) => {
    provider.value = data.provider
    result.value = data.result
    percentage.value = data.percentage
    loading.value = data.loading
    message.value = data.message
    warning.value = data.warning
  }

  return {
    percentage,
    result,
    callAI,
    getApiKey,
    setApiKey,
    getApiBaseUrl,
    setApiBaseUrl,
    chatWithAI,
    loading,
    message,
    updatePage,
    warning
  }
}
