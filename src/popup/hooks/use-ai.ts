import { ref } from 'vue'
import { ChatGPTAPI } from 'chatgpt'
import { ElMessage } from 'element-plus'

export default function useAI(userApiKey?: string, apiBaseUrl?: string) {
  const apiKey = ref<string>('')
  const percentage = ref<number>(0)
  const result = ref()
  const getApiKey = async () => {
    const key =
      userApiKey ||
      (await chrome.storage.sync.get('apiKey').then((item) => {
        return item.apiKey
      }))
    if (!key) {
      throw new Error('apiKey is required')
    }
    apiKey.value = key
  }

  const setApiKey = async (key: string) => {
    await chrome.storage.sync.set({ apiKey: key }, () => {
      ElMessage.success('设置成功')
    })
  }

  const callback = (res: string) => {
    console.log(res)
  }

  const callAI = async (messages: string[]) => {
    try {
      await getApiKey()
    } catch (e) {
      return ElMessage.warning('请先设置apiKey')
    }
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

  return {
    apiKey,
    percentage,
    result,
    callAI,
    getApiKey,
    setApiKey
  }
}
