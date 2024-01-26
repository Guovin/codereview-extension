import { createApp } from 'vue'
import Popup from './popup.vue'
import ElementPlus from 'element-plus'
import router from './router'
import 'virtual:uno.css'
import 'element-plus/dist/index.css'
import { VueShowdown } from 'vue-showdown'
import { Buffer } from 'buffer'

window.Buffer = Buffer
const app = createApp(Popup)
app.use(ElementPlus)
app.use(router)
app.component('VueShowdown', VueShowdown)
app.mount('#app')
