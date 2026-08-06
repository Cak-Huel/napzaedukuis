<template>
  <AppLayout>
    <v-container class="participant-page py-6">
      <!-- Big Room Code Hero Banner -->
      <v-card
        class="hero-code-card mb-6 text-center border"
        rounded="xl"
        elevation="4"
      >
        <v-card-text class="py-8 px-4">
          <p
            class="text-subtitle-1 text-medium-emphasis mb-2 font-weight-medium"
          >
            {{ t("join_with_code_instruction") }}
          </p>
          <div class="code-display font-weight-black text-primary my-3">
            {{ roomCode || "......" }}
          </div>
          <v-chip color="secondary" variant="tonal" class="font-weight-bold">
            {{ roomName || "Kuis Multiplayer" }}
          </v-chip>

          <!-- Control Buttons -->
          <div class="d-flex justify-center flex-wrap ga-3 mt-6">
            <v-btn
              color="success"
              size="large"
              rounded="xl"
              elevation="3"
              class="px-8 text-none font-weight-bold"
              :loading="isStarting"
              :disabled="participants.length === 0"
              @click="handleStartGame"
            >
              <v-icon start size="large">mdi-play-circle</v-icon>
              {{ t("start_game_button") }}
            </v-btn>
          </div>
        </v-card-text>
      </v-card>

      <!-- Participants List Card -->
      <v-card class="border" rounded="xl" elevation="2">
        <v-card-title
          class="d-flex align-center justify-space-between pa-4 pa-sm-6 border-b"
        >
          <div class="d-flex align-center ga-2">
            <v-icon color="primary">mdi-account-group</v-icon>
            <span class="text-h6 font-weight-bold">
              {{ t("joined_participants_heading") }}
            </span>
          </div>
          <v-chip
            color="primary"
            size="large"
            variant="flat"
            class="font-weight-bold"
          >
            {{ participants.length }} Peserta
          </v-chip>
        </v-card-title>

        <v-card-text class="pa-4 pa-sm-6">
          <div v-if="isLoading" class="text-center py-8">
            <v-progress-circular indeterminate color="primary" size="36" />
          </div>

          <div
            v-else-if="participants.length === 0"
            class="text-center py-8 text-medium-emphasis"
          >
            <v-icon size="48" color="medium-emphasis" class="mb-2"
              >mdi-account-clock-outline</v-icon
            >
            <p class="text-body-1 font-weight-medium mb-1">
              Menunggu peserta bergabung...
            </p>
            <p class="text-caption">
              Minta siswa membuka website dan memasukkan kode room di atas.
            </p>
          </div>

          <v-row v-else class="ga-0">
            <v-col
              v-for="(name, idx) in participants"
              :key="idx"
              cols="12"
              sm="6"
              md="4"
              class="pa-2"
            >
              <v-card
                variant="outlined"
                class="participant-item-card pa-3 rounded-lg d-flex align-center"
              >
                <v-avatar
                  color="primary"
                  size="36"
                  variant="tonal"
                  class="font-weight-bold me-3"
                >
                  {{ name.charAt(0).toUpperCase() }}
                </v-avatar>
                <div class="text-truncate">
                  <span
                    class="font-weight-bold text-body-1 d-block text-truncate"
                    >{{ name }}</span
                  >
                  <span class="text-caption text-medium-emphasis"
                    >Peserta {{ idx + 1 }}</span
                  >
                </div>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-container>
  </AppLayout>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import AppLayout from "@/components/AppLayout.vue";
import { API_URL } from "@/config";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const idRoom = computed(() => route.query.id_room as string);

const roomCode = ref("");
const roomName = ref("");
const participants = ref<string[]>([]);
const isLoading = ref(true);
const isStarting = ref(false);
const isEnding = ref(false);
const confirmEndDialog = ref(false);

const showPanduan = ref(false);
const showMateri = ref(false);
const showTentang = ref(false);

let pollTimer: any = null;

function openModal(type: string) {
  if (type === "materi") showMateri.value = true;
  else if (type === "panduan") showPanduan.value = true;
  else if (type === "tentang") showTentang.value = true;
}

async function fetchRoomDetails() {
  if (!idRoom.value) return;

  try {
    const res = await fetch(`${API_URL}/rooms/details/${idRoom.value}`);
    const data = await res.json();

    if (res.ok && data.success) {
      roomCode.value = data.kode_room;
      roomName.value = data.nama_room;
      participants.value = data.peserta || [];
    }
  } catch (err) {
    console.error("Fetch participant lobby error:", err);
  } finally {
    isLoading.value = false;
  }
}

function startPolling() {
  fetchRoomDetails();
  pollTimer = setInterval(fetchRoomDetails, 2500);
}

function clearPolling() {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
}

async function handleStartGame() {
  if (participants.value.length === 0) return;

  isStarting.value = true;
  try {
    const res = await fetch(`${API_URL}/rooms/${idRoom.value}/start`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    });
    const data = await res.json();

    if (res.ok && data.success) {
      clearPolling();
      router.push({
        path: "/multiplayer/scoreboard",
        query: { id_room: idRoom.value, kode_room: roomCode.value },
      });
    } else {
      alert(data.message || "Gagal memulai permainan.");
    }
  } catch (err) {
    console.error("Start game error:", err);
    alert("Gagal terhubung ke server.");
  } finally {
    isStarting.value = false;
  }
}

async function handleEndGame() {
  isEnding.value = true;
  try {
    const res = await fetch(`${API_URL}/rooms/${idRoom.value}/end`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    });
    const data = await res.json();

    if (res.ok && data.success) {
      clearPolling();
      confirmEndDialog.value = false;
      router.push("/multiplayer/selection");
    } else {
      alert(data.message || "Gagal mengakhiri permainan.");
    }
  } catch (err) {
    console.error("End game error:", err);
    alert("Gagal terhubung ke server.");
  } finally {
    isEnding.value = false;
  }
}

onMounted(() => {
  if (!idRoom.value) {
    router.push("/multiplayer/selection");
    return;
  }
  startPolling();
});

onUnmounted(() => {
  clearPolling();
});
</script>

<style scoped>
.participant-page {
  max-width: 960px;
}

.hero-code-card {
  background: linear-gradient(
    135deg,
    rgba(var(--v-theme-primary), 0.05) 0%,
    rgba(var(--v-theme-secondary), 0.08) 100%
  );
}

.code-display {
  font-size: 3.5rem;
  letter-spacing: 12px;
  line-height: 1;
}

@media (max-width: 600px) {
  .code-display {
    font-size: 2.5rem;
    letter-spacing: 6px;
  }
}

.participant-item-card {
  background: rgba(var(--v-theme-surface), 0.8);
  transition: transform 0.2s ease;
}

.participant-item-card:hover {
  transform: translateY(-2px);
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
