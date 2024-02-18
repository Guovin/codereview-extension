<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue'

onMounted(() => {
  chrome.storage.sync.get('darkMode').then((r: any) => {
    if (r.darkMode) {
      document.documentElement.className = r.darkMode
    }
  })
  chrome.storage.local.set({ isPopupOpen: true })
})

onBeforeUnmount(() => {
  chrome.storage.local.set({ isPopupOpen: false })
})
</script>

<style>
body {
  position: relative;
  width: 380px;
  height: 500px;
}
</style>
