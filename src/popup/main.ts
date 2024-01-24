import { createApp } from 'vue'
import Popup from './popup.vue'
import ElementPlus from 'element-plus'
import router from './router'
import 'virtual:uno.css'
import 'element-plus/dist/index.css'

const app = createApp(Popup)
app.use(ElementPlus)
app.use(router)
app.mount('#app')
