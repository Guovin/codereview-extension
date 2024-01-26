<template>
  <div>
    <div class="flex justify-between items-center">
      <button
        class="i-material-symbols-house-outline-rounded text-xl text-gray-500 hover:(cursor-pointer text-blue-5)"
        @click="goHome"
      >
        Home
      </button>
      <el-button type="primary" size="small" @click="run">
        Run Again<span class="i-material-symbols-send pl-2"></span>
      </el-button>
    </div>
    <VueShowdown v-if="percentage === 100" :markdown="result" />
    <div v-else>
      <div class="my-4 text-sm">Processing, please wait patiently...</div>
      <el-progress :percentage="percentage" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import useAI from '@/popup/hooks/use-ai.ts'

const router = useRouter()
const { getPatchParts, callAI, result, percentage } = useAI()
const goHome = () => {
  router.push({ name: 'Home' })
}

const run = async () => {
  const parts = await getPatchParts()
  await callAI(parts)
}

onMounted(() => {
  run()
})
</script>

<style scoped></style>
