<template>
  <div>
    <button
      class="i-material-symbols-house-outline-rounded text-xl text-gray-500 hover:(cursor-pointer text-blue-5)"
      @click="goHome"
    >
      Home
    </button>
    <el-form
      ref="ruleFormRef"
      :model="ruleForm"
      label-width="80px"
      status-icon
      :rules="rules"
    >
      <el-form-item label="apiKey" prop="apiKey">
        <el-input
          v-model="ruleForm.apiKey"
          type="password"
          show-password
          autocomplete="off"
        />
      </el-form-item>
      <el-form-item label="apiBaseUrl" prop="apiBaseUrl">
        <el-input v-model="ruleForm.apiBaseUrl" />
      </el-form-item>
      <el-form-item class="float-right">
        <el-button type="primary" @click="submitForm">
          Save
          <span class="i-material-symbols-save-as-outline-rounded pl-2"></span>
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue'
import useAI from '@/popup/hooks/use-ai.ts'
import { FormInstance, FormRules, ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

const { getApiKey, setApiKey, getApiBaseUrl, setApiBaseUrl } = useAI()
const router = useRouter()
const ruleFormRef = ref<FormInstance>()
const ruleForm = reactive({
  apiKey: '',
  apiBaseUrl: ''
})

const validatePass = (_: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('Please input the apiKey'))
  } else {
    callback()
  }
}

const rules = reactive<FormRules<typeof ruleForm>>({
  apiKey: [{ validator: validatePass, trigger: 'blur' }]
})

const submitForm = () => {
  if (!ruleFormRef.value) return
  ruleFormRef.value?.validate((valid: any) => {
    if (valid) {
      setApiKey(ruleForm.apiKey)
      setApiBaseUrl(ruleForm.apiBaseUrl)
      ElMessage.success('Save successfully')
    }
  })
}

const goHome = () => {
  router.push({ name: 'Home' })
}

onMounted(async () => {
  ruleForm.apiKey = await getApiKey()
  ruleForm.apiBaseUrl = await getApiBaseUrl()
})
</script>

<style scoped></style>
