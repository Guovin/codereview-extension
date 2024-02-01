const findWithScroll = (fileName: string, lineNum: number) => {
  const fileDomList = document.getElementsByClassName('diff-file')
  const fileDom = Array.from(fileDomList).find((item: any) => {
    return item.getAttribute('data-path') === fileName
  })
  if (fileDom) {
    const lineDomList = fileDom.getElementsByClassName('diff-grid-left')
    const lineDom = Array.from(lineDomList).find((item: any) => {
      return item.getAttribute('data-interop-line') === String(lineNum)
    })
    if (lineDom) {
      lineDom.scrollIntoView()
    }
  }
}

export async function scrollToDetail(
  tabId: number,
  fileName: string,
  lineNum: number
) {
  if (tabId) {
    await chrome.scripting.executeScript({
      target: { tabId },
      func: findWithScroll,
      args: [fileName, lineNum]
    })
  }
}
