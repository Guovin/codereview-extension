<template>
  <div class="absolute top-0 bottom-0 w-full">
    <div class="relative top-1/2 left-1/2 translate--1/2 text-center">
      <el-button @click="codeReview">
        Code Review
        <span class="i-material-symbols-planner-review-rounded pl-2"></span>
      </el-button>
      <el-button @click="chat">
        Chat
        <span class="i-material-symbols-android-chat pl-2"></span>
      </el-button>
    </div>
    <button
      class="absolute right-4 top-2 i-material-symbols-settings-outline-rounded text-xl text-gray-500 hover:(cursor-pointer text-blue-5)"
      @click="goSet"
    >
      Settings
    </button>
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router'

const router = useRouter()
const codeReview = async () => {
  await router.push({ name: 'Result' })
  await chrome.action.setBadgeText({ text: '' })
}

const chat = () => {
  router.push({ name: 'Chat' })
}

const goSet = () => {
  router.push({ name: 'Settings' })
}
</script>

<style scoped></style>
