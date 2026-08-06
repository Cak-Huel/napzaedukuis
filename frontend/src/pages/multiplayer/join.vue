<template>
  <AppLayout>
    <v-container class="join-page fill-height" fluid>
      <!-- Decorative background floating circles -->
      <div class="bg-decoration">
        <div class="bg-shape bg-shape--1" />
        <div class="bg-shape bg-shape--2" />
      </div>

      <v-row align="center" justify="center" class="fill-height">
        <v-col cols="12" sm="10" md="8" lg="6">
          <v-card class="join-card pa-4 pa-sm-6" elevation="8" rounded="xl">
            <v-card-text>
              <v-row align="center">
                <!-- Left Column: Form -->
                <v-col cols="12" md="7" class="pe-md-6">
                  <div class="d-flex align-center mb-4">
                    <v-btn
                      icon
                      variant="text"
                      size="small"
                      class="me-2"
                      @click="$router.push('/multiplayer/selection')"
                    >
                      <v-icon>mdi-arrow-left</v-icon>
                    </v-btn>
                    <h2 class="text-h5 font-weight-bold text-primary">
                      {{ t("join_room_heading") }}
                    </h2>
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

                  <v-form ref="formRef" @submit.prevent="handleJoin">
                    <!-- Kode Room -->
                    <v-text-field
                      v-model="kodeRoom"
                      :label="t('code_label')"
                      :placeholder="t('code_placeholder')"
                      variant="outlined"
                      density="comfortable"
                      maxlength="6"
                      prepend-inner-icon="mdi-numeric-6-box-multiple"
                      class="mb-2 text-uppercase font-weight-bold"
                      style="letter-spacing: 2px"
                      autocomplete="off"
                      :rules="[(v) => !!v || t('error_room_code_required')]"
                    />

                    <!-- Nama Peserta -->
                    <v-text-field
                      v-model="namaGuest"
                      :label="t('name_label')"
                      :placeholder="t('name_placeholder')"
                      variant="outlined"
                      density="comfortable"
                      maxlength="30"
                      prepend-inner-icon="mdi-account"
                      class="mb-4"
                      autocomplete="off"
                      :rules="[(v) => !!v || t('error_guest_name_required')]"
                    />

                    <!-- Submit Button -->
                    <v-btn
                      type="submit"
                      color="primary"
                      size="large"
                      block
                      rounded="xl"
                      class="text-none font-weight-bold"
                      :loading="isSubmitting"
                    >
                      <v-icon start>mdi-login</v-icon>
                      {{ t("join_button") }}
                    </v-btn>
                  </v-form>
                </v-col>

                <!-- Right Column: Visual Guide -->
                <v-col
                  cols="12"
                  md="5"
                  class="text-center d-none d-md-block border-s ps-md-6"
                >
                  <div class="lock-visual-box pa-4 rounded-xl">
                    <v-avatar
                      size="80"
                      color="primary"
                      variant="tonal"
                      class="mb-3"
                    >
                      <v-icon size="40" color="primary"
                        >mdi-lock-open-variant-outline</v-icon
                      >
                    </v-avatar>

                    <div
                      class="code-badge my-3 py-2 px-4 rounded-lg bg-surface-variant font-weight-black text-h6 text-primary"
                    >
                      123 456
                    </div>

                    <p class="text-caption text-medium-emphasis mt-2 mb-0">
                      {{ t("code_instruction") }}
                    </p>
                  </div>
                </v-col>
              </v-row>
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
import AppLayout from "@/components/AppLayout.vue";
import { API_URL } from "@/config";

const { t } = useI18n();
const router = useRouter();

const formRef = ref();
const kodeRoom = ref("");
const namaGuest = ref("");
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

async function handleJoin() {
  errorMessage.value = "";
  const { valid } = await formRef.value.validate();
  if (!valid) return;

  isSubmitting.value = true;

  try {
    const response = await fetch(`${API_URL}/rooms/join`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        kode_room: kodeRoom.value.trim().toUpperCase(),
        nama_guest: namaGuest.value.trim(),
      }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      router.push({
        path: "/multiplayer/waiting",
        query: {
          id_room: data.id_room,
          id_peserta: data.id_peserta,
          kode_room: data.kode_room,
        },
      });
    } else {
      errorMessage.value = data.message || "Gagal bergabung dengan room.";
    }
  } catch (err: any) {
    console.error("Join room error:", err);
    errorMessage.value = "Gagal terhubung ke server. Silakan coba lagi.";
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<style scoped>
.join-page {
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
  width: 400px;
  height: 400px;
  background: rgb(var(--v-theme-primary));
  top: -100px;
  right: -80px;
  animation: float 20s ease-in-out infinite;
}

.bg-shape--2 {
  width: 300px;
  height: 300px;
  background: rgb(var(--v-theme-secondary));
  bottom: -60px;
  left: -50px;
  animation: float 16s ease-in-out infinite reverse;
}

@keyframes float {
  0%,
  100% {
    transform: translate(0, 0);
  }
  50% {
    transform: translate(-20px, 20px);
  }
}

.join-card {
  position: relative;
  z-index: 1;
  backdrop-filter: blur(10px);
}

.lock-visual-box {
  background: rgba(var(--v-theme-primary), 0.04);
  border: 1px dashed rgba(var(--v-theme-primary), 0.2);
}

.code-badge {
  letter-spacing: 4px;
  display: inline-block;
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
