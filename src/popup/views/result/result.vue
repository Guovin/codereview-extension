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
        v-if="result || historyResult"
        type="primary"
        size="small"
        @click="run"
      >
        Run Again
        <span class="i-material-symbols-planner-review-rounded pl-2"></span>
      </el-button>
    </div>
    <VueShowdown
      v-if="result || historyResult"
      :markdown="result || historyResult"
    />
    <div v-else>
      <div class="my-4 text-sm">
        <span class="i-eos-icons-bubble-loading pr-8 text-blue-5"></span>
        Processing, please wait patiently...
      </div>
      <el-progress :percentage="percentage" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import useAI from '@/popup/hooks/use-ai.ts'

const router = useRouter()
const { getPatchParts, callAI, result, percentage } = useAI()
const historyResult = ref<string>('')

const goHome = () => {
  router.push({ name: 'Home' })
}

const run = async () => {
  historyResult.value = ''
  const parts = await getPatchParts()
  await callAI(parts)
}

onMounted(async () => {
  const url = (
    await chrome.tabs.query({ active: true, currentWindow: true })
  )[0]?.url
  if (url) {
    historyResult.value = await chrome.storage.session
      .get([url])
      .then((res: any) => {
        return res[url]
      })
    if (historyResult.value) {
      return
    }
  }
  await run()
})
</script>

<style scoped></style>
