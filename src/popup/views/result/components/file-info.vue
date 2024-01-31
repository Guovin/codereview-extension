<template>
  <div
    class="text-blue-5 cursor-pointer flex justify-between"
    @click="scrollHandle"
  >
    <span class="i-material-symbols-file-open-outline-rounded text-lg"></span>
    <div class="ml-2 break-all">
      <span v-if="data.file">File: {{ data.file }}</span>
      <span v-if="data.file && data.lineNum">,</span>
      <span v-if="data.lineNum" class="pl-2">LineNum: {{ data.lineNum }}</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  data: any
}>()

const scrollHandle = () => {
  console.log('scrollHandle')
}
</script>

<style scoped></style>
