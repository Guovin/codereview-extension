import { createApp } from 'vue'
import 'virtual:uno.css'
import Popup from './popup.vue'
import ElementPlus from 'element-plus'
import router from './router'

const app = createApp(Popup)
app.use(ElementPlus)
app.use(router)
app.mount('#app')
