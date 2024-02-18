<template>
  <div class="absolute top-0 bottom-0 w-full">
    <div class="relative top-1/2 left-1/2 translate--1/2 text-center">
      <el-badge :is-dot="reviewIsDot" class="mr-4">
        <el-button @click="codeReview">
          Code Review
          <span class="i-material-symbols-planner-review-rounded pl-2"></span>
        </el-button>
      </el-badge>
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const reviewIsDot = ref(false)

const codeReview = async () => {
  await router.push({ name: 'Result' })
  await chrome.action.setBadgeText({ text: '' })
  await chrome.storage.session.set({ ['REVIEW_UNREAD']: false })
  reviewIsDot.value = false
}

const chat = () => {
  router.push({ name: 'Chat' })
}

const goSet = () => {
  router.push({ name: 'Settings' })
}

onMounted(() => {
  chrome.storage.local.get('REVIEW_UNREAD').then((r: any) => {
    if (r.REVIEW_UNREAD) {
      reviewIsDot.value = true
    }
  })
})
</script>

<style scoped></style>
