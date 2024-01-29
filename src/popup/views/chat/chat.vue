<template>
  <div>
    <button
      class="i-material-symbols-house-outline-rounded text-xl text-gray-500 hover:(cursor-pointer text-blue-5)"
      @click="goHome"
    >
      Home
    </button>
    <VueShowdown v-if="result" :markdown="result" />
    <div class="absolute bottom-0 w-full">
      <el-input
        v-model="content"
        type="textarea"
        placeholder="Ask Question for AI"
      ></el-input>
      <el-button
        type="primary"
        size="small"
        :loading="loading"
        class="float-right mt-2"
        @click="send"
      >
        send
        <span class="i-material-symbols-send pl-2"></span>
      </el-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import useAI from '@/popup/hooks/use-ai.ts'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

const content = ref('')
const router = useRouter()
const { chatWithAI, result, loading } = useAI()

const goHome = () => {
  router.push({ name: 'Home' })
}

const send = () => {
  if (!content.value) {
    return ElMessage.warning('Please input content')
  }
  chatWithAI(content.value)
}
</script>

<style scoped></style>
