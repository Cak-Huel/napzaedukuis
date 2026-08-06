<template>
  <AppLayout>
    <v-container class="waiting-page fill-height" fluid>
      <div class="bg-decoration">
        <div class="bg-shape bg-shape--1" />
        <div class="bg-shape bg-shape--2" />
      </div>

      <v-row align="center" justify="center" class="fill-height">
        <v-col cols="12" sm="10" md="8" lg="6">
          <v-card class="waiting-card pa-4 pa-sm-6" elevation="8" rounded="xl">
            <v-card-text class="text-center">
              <!-- Header & Pulsing Status -->
              <div class="mb-6">
                <v-avatar
                  size="72"
                  color="primary"
                  variant="tonal"
                  class="pulse-avatar mb-3"
                >
                  <v-icon size="36" color="primary">mdi-timer-sand</v-icon>
                </v-avatar>
                <h2 class="text-h5 font-weight-bold text-primary mb-1">
                  {{ t("waiting_room_heading") }}
                </h2>
                <v-chip
                  color="secondary"
                  variant="tonal"
                  class="font-weight-bold my-2"
                >
                  Kode Room: {{ roomCode || "..." }}
                </v-chip>
                <p class="text-body-2 text-medium-emphasis mb-0">
                  {{ t("waiting_for_host_start") }}
                </p>
              </div>

              <v-divider class="mb-4" />

              <!-- Participant List -->
              <div class="d-flex align-center justify-space-between mb-3 px-2">
                <span class="text-subtitle-2 font-weight-bold">
                  {{ t("joined_participants_heading") }}
                </span>
                <v-chip
                  color="primary"
                  size="small"
                  variant="flat"
                  class="font-weight-bold"
                >
                  {{ participants.length }} Peserta
                </v-chip>
              </div>

              <!-- Loading / Empty / List -->
              <div v-if="isLoading" class="py-6">
                <v-progress-circular indeterminate color="primary" size="36" />
              </div>

              <div
                v-else-if="participants.length === 0"
                class="py-6 text-medium-emphasis text-body-2"
              >
                {{ t("waiting_players_empty") }}
              </div>

              <v-list
                v-else
                rounded="lg"
                class="bg-surface-light border text-start py-2"
              >
                <v-list-item
                  v-for="(name, idx) in participants"
                  :key="idx"
                  class="py-2"
                >
                  <template #prepend>
                    <v-avatar
                      color="primary"
                      size="32"
                      variant="tonal"
                      class="font-weight-bold me-3"
                    >
                      {{ name.charAt(0).toUpperCase() }}
                    </v-avatar>
                  </template>
                  <v-list-item-title class="font-weight-bold">
                    {{ name }}
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </AppLayout>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import AppLayout from "@/components/AppLayout.vue";
import { API_URL } from "@/config";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const idRoom = computed(() => route.query.id_room as string);
const idPeserta = computed(() => route.query.id_peserta as string);

const roomCode = ref("");
const participants = ref<string[]>([]);
const isLoading = ref(true);

const showPanduan = ref(false);
const showMateri = ref(false);
const showTentang = ref(false);

let pollTimer: any = null;

function openModal(type: string) {
  if (type === "materi") showMateri.value = true;
  else if (type === "panduan") showPanduan.value = true;
  else if (type === "tentang") showTentang.value = true;
}

async function checkRoomStatus() {
  if (!idRoom.value) return;

  try {
    const res = await fetch(`${API_URL}/rooms/details/${idRoom.value}`);
    const data = await res.json();

    if (res.ok && data.success) {
      roomCode.value = data.kode_room;
      participants.value = data.peserta || [];

      // If game has started, redirect to gameroom!
      if (data.status === "mulai") {
        clearPolling();
        router.push({
          path: "/multiplayer/gameroom",
          query: {
            id_room: idRoom.value,
            id_peserta: idPeserta.value,
          },
        });
      } else if (data.status === "selesai") {
        clearPolling();
        router.push("/multiplayer/selection");
      }
    }
  } catch (err) {
    console.error("Fetch waiting room details error:", err);
  } finally {
    isLoading.value = false;
  }
}

function startPolling() {
  checkRoomStatus();
  pollTimer = setInterval(checkRoomStatus, 3000);
}

function clearPolling() {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
}

onMounted(() => {
  if (!idRoom.value || !idPeserta.value) {
    router.push("/multiplayer/join");
    return;
  }
  startPolling();
});

onUnmounted(() => {
  clearPolling();
});
</script>

<style scoped>
.waiting-page {
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
  left: -80px;
  animation: float 20s ease-in-out infinite;
}

.bg-shape--2 {
  width: 300px;
  height: 300px;
  background: rgb(var(--v-theme-secondary));
  bottom: -60px;
  right: -50px;
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

.waiting-card {
  position: relative;
  z-index: 1;
  backdrop-filter: blur(10px);
}

.pulse-avatar {
  animation: pulse 2s infinite ease-in-out;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(var(--v-theme-primary), 0.4);
  }
  70% {
    transform: scale(1.05);
    box-shadow: 0 0 0 15px rgba(var(--v-theme-primary), 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(var(--v-theme-primary), 0);
  }
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
