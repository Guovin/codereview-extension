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
import { useRouter } from 'vue-router'
import useAI from '@/popup/hooks/use-ai.ts'

const router = useRouter()
const { percentage, result } = useAI()
const goHome = () => {
  router.push({ name: 'Home' })
}
</script>

<style scoped></style>
