<template>
  <div>
    <el-form ref="ruleFormRef" :model="ruleForm" status-icon :rules="rules">
      <el-form-item label="apiKey" prop="apiKey">
        <el-input
          v-model="ruleForm.apiKey"
          type="password"
          show-password
          autocomplete="off"
        />
      </el-form-item>
      <el-form-item>
        <el-button @click="goHome">首页</el-button>
        <el-button type="primary" @click="submitForm">保存</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue'
import useAI from '@/popup/hooks/use-ai.ts'
import { FormInstance, FormRules, ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

const { getApiKey, setApiKey } = useAI()
const router = useRouter()
const ruleFormRef = ref<FormInstance>()
const ruleForm = reactive({
  apiKey: ''
})

const validatePass = (_: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('请输入apiKey'))
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
      ElMessage.success('保存成功')
    }
  })
}

const goHome = () => {
  router.push({ name: 'Home' })
}

onMounted(async () => {
  ruleForm.apiKey = await getApiKey()
})
</script>

<style scoped></style>
