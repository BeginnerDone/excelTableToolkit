import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { title: '首页' }
  },
  {
    path: '/basic',
    name: 'Basic',
    component: () => import('@/views/BasicExample.vue'),
    meta: { title: '基础示例' }
  },
  {
    path: '/advanced',
    name: 'Advanced',
    component: () => import('@/views/AdvancedExample.vue'),
    meta: { title: '高级示例' }
  },
  {
    path: '/clipboard',
    name: 'Clipboard',
    component: () => import('@/views/ClipboardExample.vue'),
    meta: { title: '剪贴板操作' }
  },
  {
    path: '/validation',
    name: 'Validation',
    component: () => import('@/views/ValidationExample.vue'),
    meta: { title: '数据验证' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router