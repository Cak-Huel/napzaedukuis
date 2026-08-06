/**
 * router/index.ts
 *
 * Routes untuk Napza Edu Card
 */

import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/pages/index.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/pages/login.vue'),
      meta: { guest: true }, // Hanya untuk user yang belum login
    },
  ],
})

export default router
