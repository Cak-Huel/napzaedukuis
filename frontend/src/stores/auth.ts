import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

import { API_URL } from '@/config'

interface User {
  id_user: number
  nama: string
  role: string
  email?: string
}

export const useAuthStore = defineStore('auth', () => {
  // State
  const token = ref<string | null>(localStorage.getItem('token'))
  const user = ref<User | null>(null)
  const loading = ref(false)

  // Getters
  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const userName = computed(() => user.value?.nama || '')

  // Actions

  /**
   * Login: kirim email + password ke backend, simpan JWT token.
   */
  async function login(email: string, password: string) {
    loading.value = true
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        const err = new Error(data.message || 'Login gagal.') as any;
        if (data.requiresVerification) {
          err.requiresVerification = true;
          err.email = data.email;
        }
        throw err;
      }

      // Simpan token dan user
      token.value = data.token
      user.value = data.user
      localStorage.setItem('token', data.token)

      return data
    } finally {
      loading.value = false
    }
  }

  /**
   * Cek auth: ambil data user dari token yang tersimpan.
   */
  async function checkAuth() {
    if (!token.value) return false

    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token.value}` },
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        logout()
        return false
      }

      user.value = data.user
      return true
    } catch {
      logout()
      return false
    }
  }

  /**
   * Logout: hapus token dan user data.
   */
  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
  }

  return {
    token,
    user,
    loading,
    isLoggedIn,
    isAdmin,
    userName,
    login,
    checkAuth,
    logout,
  }
})
