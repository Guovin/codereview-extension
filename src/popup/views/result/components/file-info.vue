<template>
  <div class="text-blue-5 cursor-pointer flex" @click="scrollHandle">
    <span class="i-material-symbols-file-open-outline-rounded text-lg"></span>
    <div class="ml-2 break-all">
      <span v-if="data.file">File: {{ data.file }}</span>
      <span v-if="data.file && data.lineNum">,</span>
      <span v-if="data.lineNum" class="pl-2">LineNum: {{ data.lineNum }}</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps<{
  data: any
}>()

const scrollHandle = () => {
  window.parent.postMessage(JSON.parse(JSON.stringify(props.data)), '*')
}
</script>

<style scoped></style>
