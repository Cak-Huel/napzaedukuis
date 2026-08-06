<template>
  <AppLayout @open-modal="() => {}">
    <v-container class="fill-height">
      <v-row align="center" justify="center">
        <v-col cols="12" sm="8" md="6" class="text-center">
          <v-icon size="80" color="primary" class="mb-4">mdi-hammer-wrench</v-icon>
          <h2 class="text-h5 font-weight-bold mb-2">Halaman Sedang Dikembangkan</h2>
          <p class="text-body-1 text-medium-emphasis mb-6">
            Halaman ini belum tersedia. Fitur ini akan segera dimigrasikan.
          </p>
          <v-btn color="primary" variant="flat" class="text-none" rounded="lg" @click="$router.push('/')">
            <v-icon start>mdi-home</v-icon>
            Kembali ke Beranda
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </AppLayout>
</template>

<script lang="ts" setup>
import AppLayout from '@/components/AppLayout.vue'
</script>
