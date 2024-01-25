<template>
  <div>
    <button
      class="i-material-symbols-house-outline-rounded text-xl hover:(cursor-pointer text-blue-5)"
      @click="goHome"
    >
      Home
    </button>
    <div>
      {{ result }}
    </div>
    <el-progress :percentage="percentage" />
  </div>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import useAI from '@/popup/hooks/use-ai.ts'

const router = useRouter()
const { percentage, getPatchParts, callAI, result } = useAI()
const goHome = () => {
  router.push({ name: 'Home' })
}

onMounted(async () => {
  const parts = await getPatchParts()
  await callAI(parts)
})
</script>

<style scoped></style>
