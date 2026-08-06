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
      meta: { guest: true },
    },
    // Placeholder routes — akan diimplementasi di migrasi berikutnya
    {
      path: '/register',
      name: 'register',
      component: () => import('@/pages/register.vue'),
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('@/pages/admin.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/multiplayer/selection',
      name: 'multiplayer-selection',
      component: () => import('@/pages/multiplayer/selection.vue'),
    },
    {
      path: '/multiplayer/join',
      name: 'multiplayer-join',
      component: () => import('@/pages/multiplayer/join.vue'),
    },
    {
      path: '/multiplayer/create',
      name: 'multiplayer-create',
      component: () => import('@/pages/multiplayer/create.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/multiplayer/waiting',
      name: 'multiplayer-waiting',
      component: () => import('@/pages/multiplayer/waiting.vue'),
    },
    {
      path: '/multiplayer/quest',
      name: 'multiplayer-quest',
      component: () => import('@/pages/multiplayer/quest.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/multiplayer/participant',
      name: 'multiplayer-participant',
      component: () => import('@/pages/multiplayer/participant.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/multiplayer/gameroom',
      name: 'multiplayer-gameroom',
      component: () => import('@/pages/multiplayer/gameroom.vue'),
    },
    {
      path: '/multiplayer/score',
      name: 'multiplayer-score',
      component: () => import('@/pages/multiplayer/score.vue'),
    },
    {
      path: '/multiplayer/scoreboard',
      name: 'multiplayer-scoreboard',
      component: () => import('@/pages/multiplayer/scoreboard.vue'),
      meta: { requiresAuth: true },
    },
    // Catch-all 404
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/pages/placeholder.vue'),
    },
  ],
})

import { useAuthStore } from '@/stores/auth'

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Jika token ada tetapi data user belum dimuat (misal setelah refresh), ambil data user
  if (authStore.token && !authStore.user) {
    await authStore.checkAuth()
  }

  const isLoggedIn = !!authStore.token
  const isAdmin = authStore.user?.role === 'admin'

  if (to.meta.requiresAuth && !isLoggedIn) {
    next('/login')
  } else if (to.meta.requiresAdmin && !isAdmin) {
    next('/')
  } else if (to.meta.guest && isLoggedIn) {
    next('/')
  } else {
    next()
  }
})

export default router
