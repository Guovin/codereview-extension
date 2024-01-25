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

  const callback = (res: string) => {
    console.log(res)
  }

  const callAI = async (messages: string[]) => {
    const apiKey = ref<string>('')
    try {
      apiKey.value = await getApiKey()
    } catch (e) {
      return ElMessage.warning('请先设置apiKey')
    }
    if (apiKey.value) {
      const api = new ChatGPTAPI({
        apiKey: apiKey.value,
        apiBaseUrl: apiBaseUrl || 'https://api.chatanywhere.tech/v1',
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
    }
  }

  return {
    percentage,
    result,
    callAI,
    getApiKey,
    setApiKey
  }
}
