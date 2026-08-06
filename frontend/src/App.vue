<template>
  <v-app>
    <router-view />
  </v-app>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

// Cek auth saat app dimuat (restore session dari token)
onMounted(async () => {
  if (authStore.token) {
    await authStore.checkAuth()
  }
})
</script>
