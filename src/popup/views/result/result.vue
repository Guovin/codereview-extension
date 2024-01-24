<template>
  <div>
    <el-button @click="goHome">Home</el-button>
    {{ result }}
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
