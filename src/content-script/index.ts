import { createApp } from 'vue'
import 'virtual:uno.css'
import Content from './content.vue'
import ElementPlus from 'element-plus'

const app = createApp(Content)
app.use(ElementPlus)
app.mount('#app')
