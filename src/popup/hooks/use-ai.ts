import { ref } from 'vue'
import { ChatGPTAPI } from 'chatgpt'
import { ElMessage } from 'element-plus'
import * as parseDiff from 'parse-diff'

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

  const getPatchParts = async () => {
    const tab = (
      await chrome.tabs.query({ active: true, currentWindow: true })
    )[0]
    const patch = await fetch(tab.url + '.patch').then((r: any) => r.text())
    const text = patch.replace(/GIT\sbinary\spatch(.*)literal\s0/gims, '')
    const files = parseDiff(text)
    const patchParts: any[] = []
    files.forEach((file: any) => {
      const patchPartArray = []

      patchPartArray.push('```diff')
      if ('from' in file && 'to' in file) {
        patchPartArray.push('diff --git a' + file.from + ' b' + file.to)
      }
      if ('new' in file && file.new === true && 'newMode' in file) {
        patchPartArray.push('new file mode ' + file.newMode)
      }
      if ('from' in file) {
        patchPartArray.push('--- ' + file.from)
      }
      if ('to' in file) {
        patchPartArray.push('+++ ' + file.to)
      }
      if ('chunks' in file) {
        patchPartArray.push(
          file.chunks.map((c: any) =>
            c.changes.map((t: any) => t.content).join('\n')
          )
        )
      }
      patchPartArray.push('```')
      patchPartArray.push(
        '\nDo not provide feedback yet. I will confirm once all code changes were submitted.'
      )

      let patchPart = patchPartArray.join('\n')
      if (patchPart.length >= 15384) {
        patchPart = patchPart.slice(0, 15384)
        // warning = 'Some parts of your patch were truncated as it was larger than 4096 tokens or 15384 characters. The review might not be as complete.'
      }
      patchParts.push(patchPart)
    })
    return patchParts
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
    setApiBaseUrl,
    getPatchParts
  }
}
