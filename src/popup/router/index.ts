import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '@/popup/views/home/home.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  }
]

export default createRouter({
  history: createWebHashHistory(),
  routes
})
