import { ref } from 'vue'
import { ChatGPTAPI } from 'chatgpt'
import { ElMessage } from 'element-plus'

export default function useAI(userApiKey?: string, apiBaseUrl?: string) {
  const percentage = ref<number>(0)
  const result = ref()
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

  const callback = (res: string) => {
    console.log(res)
  }

  const callAI = async (messages: string[]) => {
    let apiKey, apiBaseUrl
    try {
      apiKey = await getApiKey()
      apiBaseUrl = await getApiBaseUrl()
    } catch (e: any) {
      throw new Error(e)
    }
    if (apiKey) {
      const api = new ChatGPTAPI({
        apiKey,
        apiBaseUrl,
        systemMessage:
          'You are a programming code change reviewer, provide feedback on the code changes given. Do not introduce yourselves. Please use chinese language.'
      })
      for (let i = 0; i < messages.length; i++) {
        try {
          const options =
            i === messages.length - 1
              ? { onProgress: (r: any) => callback(r.text) }
              : {
                  onProgress: () => {
                    callback(`${i}`)
                  }
                }
          const res = await api.sendMessage(messages[i], options)
          percentage.value = i * (100 / messages.length)
          result.value = res
        } catch (e: any) {
          throw new Error(e)
        }
      }
    } else {
      ElMessage.warning('Please set your API key first.')
    }
  }

  return {
    percentage,
    result,
    callAI,
    getApiKey,
    setApiKey,
    getApiBaseUrl,
    setApiBaseUrl
  }
}
