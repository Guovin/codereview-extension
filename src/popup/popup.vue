<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

onMounted(async () => {
  await chrome.storage.sync.get('darkMode').then((r: any) => {
    if (r.darkMode) {
      document.documentElement.className = r.darkMode
    }
  })
})
</script>

<style>
body {
  position: relative;
  width: 380px;
  height: 500px;
}
</style>
