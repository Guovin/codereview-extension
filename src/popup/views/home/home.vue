<template>
  <div class="P-home">
    <el-button
      class="relative top-1/2 left-1/2 translate--1/2"
      @click="codeReview"
    >
      start
    </el-button>
    <el-button class="absolute right-4 top-2" @click="goSet">设置</el-button>
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router'

const router = useRouter()
const codeReview = () => {
  router.push({ name: 'Result' })
}

const goSet = () => {
  router.push({ name: 'Settings' })
}
</script>

<style scoped>
.P-home {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 100%;
  background: linear-gradient(#f48c8d, #f4c58d);
}
</style>
