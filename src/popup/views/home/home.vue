<template>
  <div class="absolute top-0 bottom-0 w-full">
    <el-button
      class="relative top-1/2 left-1/2 translate--1/2"
      @click="codeReview"
    >
      Start
    </el-button>
    <button
      class="absolute right-4 top-2 i-material-symbols-settings-outline-rounded text-xl hover:(cursor-pointer text-blue-5)"
      @click="goSet"
    >
      Settings
    </button>
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

<style scoped></style>
