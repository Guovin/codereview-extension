import { scrollToDetail } from '@/content-script'

chrome.runtime.onMessage.addListener(async (message: any) => {
  const { tabId, type, data } = message
  if (!tabId) return
  if (type === 'scroll') {
    const { file, lineNum } = data
    if (file && lineNum) {
      await scrollToDetail(tabId, file, lineNum)
    }
  }
})
