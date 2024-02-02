import { scrollToDetail } from '@/content-script'
import { ChatGPTAPI } from 'chatgpt'
import { Buffer } from 'buffer'

self.Buffer = Buffer

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

chrome.runtime.onMessage.addListener((message: any, _, sendResponse) => {
  ;(async () => {
    const { tabId, type, data } = message
    if (type === 'callAI') {
      const { apiKey, apiBaseUrl, url, message } = data
      const r = await callAI(apiKey, apiBaseUrl, message)
      sendResponse({ url, text: r.text })
      await chrome.action.setBadgeText({ text: '+1' })
      await chrome.action.setBadgeBackgroundColor({ color: '#ff4d4f' })
      await chrome.action.setBadgeTextColor({ color: '#fff' })
    }
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
