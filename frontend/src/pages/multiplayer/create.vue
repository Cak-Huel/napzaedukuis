<template>
  <AppLayout>
    <v-container class="create-page fill-height" fluid>
      <!-- Background decoration -->
      <div class="bg-decoration">
        <div class="bg-shape bg-shape--1" />
        <div class="bg-shape bg-shape--2" />
      </div>

      <v-row align="center" justify="center" class="fill-height">
        <v-col cols="12" sm="8" md="6" lg="5">
          <v-card class="create-card pa-4 pa-sm-6" elevation="8" rounded="xl">
            <v-card-text>
              <div class="d-flex align-center mb-6">
                <v-btn
                  icon
                  variant="text"
                  size="small"
                  class="me-2"
                  @click="$router.push('/multiplayer/selection')"
                >
                  <v-icon>mdi-arrow-left</v-icon>
                </v-btn>
                <div>
                  <h2 class="text-h5 font-weight-bold text-secondary">
                    {{ t("create_room_heading") }}
                  </h2>
                  <p class="text-caption text-medium-emphasis mb-0">
                    Sebagai Author / Pengajar
                  </p>
                </div>
              </div>

              <!-- Alert error -->
              <v-alert
                v-if="errorMessage"
                type="error"
                variant="tonal"
                density="compact"
                closable
                class="mb-4"
                @click:close="errorMessage = ''"
              >
                {{ errorMessage }}
              </v-alert>

              <v-form ref="formRef" @submit.prevent="handleCreateRoom">
                <!-- Nama Room -->
                <v-text-field
                  v-model="namaRoom"
                  :label="t('room_name_label')"
                  :placeholder="t('room_name_placeholder')"
                  variant="outlined"
                  density="comfortable"
                  maxlength="100"
                  prepend-inner-icon="mdi-pencil-box-outline"
                  class="mb-6"
                  autocomplete="off"
                  :rules="[(v) => !!v || t('error_room_name_required')]"
                />

                <!-- Submit Button -->
                <v-btn
                  type="submit"
                  color="secondary"
                  size="large"
                  block
                  rounded="xl"
                  class="text-none font-weight-bold"
                  :loading="isSubmitting"
                >
                  <v-icon start>mdi-plus-circle</v-icon>
                  {{ t("create_button") }}
                </v-btn>
              </v-form>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </AppLayout>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import AppLayout from "@/components/AppLayout.vue";
import { API_URL } from "@/config";

const { t } = useI18n();
const router = useRouter();
const authStore = useAuthStore();

const formRef = ref();
const namaRoom = ref("");
const isSubmitting = ref(false);
const errorMessage = ref("");

const showPanduan = ref(false);
const showMateri = ref(false);
const showTentang = ref(false);

function openModal(type: string) {
  if (type === "materi") showMateri.value = true;
  else if (type === "panduan") showPanduan.value = true;
  else if (type === "tentang") showTentang.value = true;
}

async function handleCreateRoom() {
  errorMessage.value = "";
  const { valid } = await formRef.value.validate();
  if (!valid) return;

  isSubmitting.value = true;

  try {
    const response = await fetch(`${API_URL}/rooms/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authStore.token}`,
      },
      body: JSON.stringify({
        nama_room: namaRoom.value.trim(),
      }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      // Direct to quest / bank soal page for the created room
      router.push({
        path: "/multiplayer/quest",
        query: {
          id_room: data.room.id_room,
          kode_room: data.room.kode_room,
        },
      });
    } else {
      errorMessage.value = data.message || "Gagal membuat room.";
    }
  } catch (err: any) {
    console.error("Create room error:", err);
    errorMessage.value = "Gagal terhubung ke server. Silakan coba lagi.";
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<style scoped>
.create-page {
  position: relative;
  min-height: calc(100vh - 64px - 48px);
  overflow: hidden;
}

.bg-decoration {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

.bg-shape {
  position: absolute;
  border-radius: 50%;
  opacity: 0.05;
}

.bg-shape--1 {
  width: 450px;
  height: 450px;
  background: rgb(var(--v-theme-secondary));
  top: -120px;
  left: -80px;
  animation: float 22s ease-in-out infinite;
}

.bg-shape--2 {
  width: 350px;
  height: 350px;
  background: rgb(var(--v-theme-primary));
  bottom: -80px;
  right: -60px;
  animation: float 18s ease-in-out infinite reverse;
}

@keyframes float {
  0%,
  100% {
    transform: translate(0, 0);
  }
  50% {
    transform: translate(20px, -20px);
  }
}

.create-card {
  position: relative;
  z-index: 1;
  backdrop-filter: blur(10px);
}

.panduan-gallery {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 8px;
  scroll-snap-type: x mandatory;
}

.panduan-gallery > * {
  scroll-snap-align: start;
  flex-shrink: 0;
}
</style>
