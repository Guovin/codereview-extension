import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '@/popup/views/home/home.vue'
import Result from '@/popup/views/result/result.vue'
import Chat from '@/popup/views/chat/chat.vue'
import Settings from '@/popup/views/settings/settings.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/result',
    name: 'Result',
    component: Result
  },
  {
    path: '/chat',
    name: 'Chat',
    component: Chat
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings
  }
]

export default createRouter({
  history: createWebHashHistory(),
  routes
})
