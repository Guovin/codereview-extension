<template>
  <div>
    <div class="flex justify-between items-center">
      <button
        class="i-material-symbols-house-outline-rounded text-xl text-gray-500 hover:(cursor-pointer text-blue-5)"
        @click="goHome"
      >
        Home
      </button>
      <el-button
        v-if="result || historyResult || runOver"
        type="primary"
        size="small"
        @click="run"
      >
        Run Again
        <span class="i-material-symbols-planner-review-rounded pl-2"></span>
      </el-button>
    </div>
    <!--    use sandbox to solve unsafe-eval -->
    <iframe
      v-show="(result || historyResult) && !loading"
      ref="sandbox"
      :src="`/src/popup/sandbox.html?darkMode=${darkMode}`"
      class="w-full h-[470px] border-none"
    ></iframe>
    <div v-if="loading">
      <div class="my-4 text-sm">
        <span class="i-eos-icons-bubble-loading pr-8 text-blue-5"></span>
        {{ message }}
      </div>
      <el-progress :percentage="percentage" />
    </div>
    <div v-if="warning">
      <div class="my-4 text-sm">
        <span
          class="i-material-symbols-warning-rounded pr-8 text-yellow"
        ></span>
        {{ warning }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, nextTick, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import useAI from '@/popup/hooks/use-ai.ts'

const router = useRouter()
const { callAI, result, percentage, loading, message, updatePage, warning } =
  useAI()
const historyResult = ref<string>('')
const sandbox = ref()
const runOver = ref<boolean>(false)
const darkMode = ref<boolean>(false)

const goHome = () => {
  router.push({ name: 'Home' })
}

const run = async () => {
  historyResult.value = ''
  await callAI()
  runOver.value = true
}

const handleMessage = (data: any) => {
  setTimeout(() => {
    sandbox.value?.contentWindow.postMessage(
      JSON.parse(JSON.stringify(data)),
      '*'
    )
  }, 100)
}

watchEffect(() => {
  if (result.value) {
    handleMessage(result.value)
  }
})

onMounted(async () => {
  await chrome.storage.sync.get('darkMode').then((r: any) => {
    if (r.darkMode) {
      darkMode.value = r.darkMode
    }
  })
  const tab = (
    await chrome.tabs.query({ active: true, currentWindow: true })
  )[0]
  chrome.storage.local.get('globalState', (data) => {
    if (data.globalState && data.globalState.url === tab?.url) {
      updatePage(data.globalState)
    }
  })
  chrome.runtime.onMessage.addListener((message: any) => {
    if (message.type === 'updateGlobalState' && message.data.url === tab?.url) {
      updatePage(message.data)
    }
  })
  if (tab && tab.url) {
    const url = tab.url || ''
    if (!url) return
    historyResult.value = await chrome.storage.session
      .get([url])
      .then((res: any) => {
        return res[url]
      })
    if (historyResult.value) {
      await nextTick(() => {
        handleMessage(historyResult.value)
      })
    }
  }
  if (!historyResult.value) {
    await run()
  }
  window.addEventListener('message', (e: any) => {
    if (e.data && chrome && chrome.runtime) {
      chrome.runtime.sendMessage({
        tabId: tab.id,
        type: 'scroll',
        data: e.data
      })
    }
  })
})
</script>

<style scoped>
iframe {
  color-scheme: light;
}
</style>
