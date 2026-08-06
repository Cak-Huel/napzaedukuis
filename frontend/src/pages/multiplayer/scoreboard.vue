<template>
  <AppLayout>
    <v-container class="scoreboard-page py-6">
      <!-- Header Card with Room Info & Controls -->
      <v-card class="header-card mb-6 border" rounded="xl" elevation="3">
        <v-card-text class="pa-5 pa-sm-6">
          <div
            class="d-flex flex-column flex-sm-row align-center justify-center justify-sm-space-between text-center text-sm-start ga-4"
          >
            <!-- Left: Room Info -->
            <div class="d-flex flex-column flex-sm-row align-center ga-3">
              <v-avatar
                color="primary"
                size="48"
                variant="tonal"
                class="flex-shrink-0"
              >
                <v-icon size="24">mdi-trophy</v-icon>
              </v-avatar>
              <div>
                <div
                  class="d-flex align-center justify-center justify-sm-start flex-wrap ga-2"
                >
                  <h1 class="text-h5 font-weight-bold text-on-surface mb-0">
                    {{ t("scoreboard_page_title") }}
                  </h1>
                  <v-chip
                    color="error"
                    size="small"
                    variant="flat"
                    class="font-weight-black live-badge"
                  >
                    <v-icon start size="10" class="pulse-dot"
                      >mdi-circle</v-icon
                    >
                    {{ t("scoreboard_live_badge") }}
                  </v-chip>
                </div>
                <div
                  class="d-flex align-center justify-center justify-sm-start flex-wrap ga-2 mt-1"
                >
                  <span class="text-body-2 text-medium-emphasis">
                    {{ roomName || "Kuis Multiplayer" }}
                  </span>
                  <v-chip
                    color="primary"
                    variant="outlined"
                    size="x-small"
                    class="font-weight-bold"
                  >
                    {{ t("scoreboard_room_code") }}: {{ roomCode }}
                  </v-chip>
                </div>
              </div>
            </div>

            <!-- Right: Stats & Actions -->
            <div
              class="d-flex align-center justify-center justify-sm-end flex-wrap ga-3"
            >
              <!-- Stats Chips -->
              <v-chip color="info" variant="tonal" class="font-weight-bold">
                <v-icon start size="16">mdi-account-group</v-icon>
                {{ peserta.length }} {{ t("total_participants_label") }}
              </v-chip>
              <v-chip
                color="secondary"
                variant="tonal"
                class="font-weight-bold"
              >
                <v-icon start size="16">mdi-help-circle</v-icon>
                {{ totalSoal }} {{ t("total_questions_label") }}
              </v-chip>

              <!-- End Game Button -->
              <v-btn
                color="error"
                variant="flat"
                rounded="lg"
                class="text-none font-weight-bold"
                @click="confirmEndDialog = true"
              >
                <v-icon start>mdi-stop-circle-outline</v-icon>
                {{ t("end_game_button") }}
              </v-btn>
            </div>
          </div>
        </v-card-text>
      </v-card>

      <!-- Podium Section for Top 3 -->
      <div v-if="peserta.length >= 1" class="podium-section mb-6">
        <div
          class="podium-container d-flex justify-center align-end ga-4 flex-wrap"
        >
          <!-- 2nd Place (if exists) -->
          <div
            v-if="peserta.length >= 2"
            class="podium-item podium-second text-center"
          >
            <v-avatar
              :color="medalColors[1]"
              size="64"
              class="mb-2 podium-avatar elevation-4"
            >
              <span class="text-h5 font-weight-black text-white">
                {{ peserta[1].nama_guest.charAt(0).toUpperCase() }}
              </span>
            </v-avatar>
            <v-chip
              color="grey-lighten-1"
              size="small"
              variant="flat"
              class="mb-1 font-weight-bold"
            >
              🥈 2
            </v-chip>
            <p
              class="text-body-2 font-weight-bold text-truncate mb-0"
              style="max-width: 120px"
            >
              {{ peserta[1].nama_guest }}
            </p>
            <p class="text-caption text-medium-emphasis mb-0">
              {{ peserta[1].skor }} {{ t("scoreboard_points") }}
            </p>
            <div class="podium-bar podium-bar-silver"></div>
          </div>

          <!-- 1st Place -->
          <div class="podium-item podium-first text-center">
            <v-icon color="amber-darken-1" size="28" class="crown-icon"
              >mdi-crown</v-icon
            >
            <v-avatar
              :color="medalColors[0]"
              size="80"
              class="mb-2 podium-avatar podium-avatar-first elevation-6"
            >
              <span class="text-h4 font-weight-black text-white">
                {{ peserta[0].nama_guest.charAt(0).toUpperCase() }}
              </span>
            </v-avatar>
            <v-chip
              color="amber-darken-1"
              size="small"
              variant="flat"
              class="mb-1 font-weight-bold"
            >
              🥇 1
            </v-chip>
            <p
              class="text-body-1 font-weight-black text-truncate mb-0"
              style="max-width: 140px"
            >
              {{ peserta[0].nama_guest }}
            </p>
            <p class="text-body-2 font-weight-bold text-primary mb-0">
              {{ peserta[0].skor }} {{ t("scoreboard_points") }}
            </p>
            <div class="podium-bar podium-bar-gold"></div>
          </div>

          <!-- 3rd Place (if exists) -->
          <div
            v-if="peserta.length >= 3"
            class="podium-item podium-third text-center"
          >
            <v-avatar
              :color="medalColors[2]"
              size="56"
              class="mb-2 podium-avatar elevation-3"
            >
              <span class="text-h6 font-weight-black text-white">
                {{ peserta[2].nama_guest.charAt(0).toUpperCase() }}
              </span>
            </v-avatar>
            <v-chip
              color="orange-darken-3"
              size="small"
              variant="flat"
              class="mb-1 font-weight-bold text-white"
            >
              🥉 3
            </v-chip>
            <p
              class="text-body-2 font-weight-bold text-truncate mb-0"
              style="max-width: 110px"
            >
              {{ peserta[2].nama_guest }}
            </p>
            <p class="text-caption text-medium-emphasis mb-0">
              {{ peserta[2].skor }} {{ t("scoreboard_points") }}
            </p>
            <div class="podium-bar podium-bar-bronze"></div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading && peserta.length === 0" class="text-center py-12">
        <v-progress-circular indeterminate color="primary" size="48" />
        <p class="text-body-2 text-medium-emphasis mt-3">{{ t("loading") }}</p>
      </div>

      <!-- Empty State -->
      <v-card
        v-else-if="peserta.length === 0"
        class="text-center py-12 border-dashed"
        rounded="xl"
        variant="outlined"
      >
        <v-icon size="64" color="medium-emphasis" class="mb-3 pulse-icon"
          >mdi-account-clock</v-icon
        >
        <h3 class="text-h6 font-weight-bold mb-1">
          {{ t("no_participants_scoreboard") }}
        </h3>
        <p class="text-body-2 text-medium-emphasis">
          {{ t("waiting_answers") }}
        </p>
      </v-card>

      <!-- Scoreboard Table Card -->
      <v-card v-else class="border" rounded="xl" elevation="2">
        <v-card-title
          class="d-flex align-center justify-space-between pa-4 pa-sm-5 border-b"
        >
          <div class="d-flex align-center ga-2">
            <v-icon color="primary">mdi-format-list-numbered</v-icon>
            <span class="text-h6 font-weight-bold">{{
              t("respondents_heading")
            }}</span>
          </div>
          <v-chip
            color="primary"
            size="large"
            variant="flat"
            class="font-weight-bold"
          >
            👥 {{ peserta.length }} {{ t("total_participants_label") }}
          </v-chip>
        </v-card-title>

        <v-card-text class="pa-0">
          <v-table class="scoreboard-table">
            <thead>
              <tr>
                <th class="text-center" style="width: 80px">
                  {{ t("rank_header") }}
                </th>
                <th>{{ t("name_header") }}</th>
                <th class="text-center" style="width: 120px">
                  {{ t("performance_header") }}
                </th>
                <th class="text-center">{{ t("answers_header") }}</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(p, idx) in peserta"
                :key="p.id_peserta"
                class="scoreboard-row"
                :class="{ 'top-three-row': idx < 3 }"
              >
                <!-- Rank -->
                <td class="text-center">
                  <v-avatar
                    v-if="idx < 3"
                    :color="medalColors[idx]"
                    size="32"
                    class="font-weight-black text-white"
                  >
                    {{ idx + 1 }}
                  </v-avatar>
                  <span v-else class="font-weight-bold text-medium-emphasis">{{
                    idx + 1
                  }}</span>
                </td>

                <!-- Name -->
                <td>
                  <div class="d-flex align-center ga-2">
                    <v-avatar
                      :color="idx < 3 ? medalColors[idx] : 'grey-lighten-2'"
                      size="36"
                      :variant="idx < 3 ? 'flat' : 'tonal'"
                      class="font-weight-bold flex-shrink-0"
                    >
                      <span :class="idx < 3 ? 'text-white' : ''">
                        {{ p.nama_guest.charAt(0).toUpperCase() }}
                      </span>
                    </v-avatar>
                    <div>
                      <span class="font-weight-bold text-body-2 d-block">{{
                        p.nama_guest
                      }}</span>
                      <span
                        v-if="idx === 0"
                        class="text-caption text-amber-darken-2 font-weight-bold"
                      >
                        ⭐ {{ t("top_performer") }}
                      </span>
                    </div>
                  </div>
                </td>

                <!-- Score -->
                <td class="text-center">
                  <v-chip
                    :color="
                      idx === 0
                        ? 'amber-darken-1'
                        : idx < 3
                          ? 'primary'
                          : 'default'
                    "
                    :variant="idx < 3 ? 'flat' : 'tonal'"
                    size="small"
                    class="font-weight-black"
                  >
                    {{ p.skor }}
                  </v-chip>
                </td>

                <!-- Answer indicators -->
                <td
                  class="text-center"
                  style="max-width: 280px; min-width: 150px"
                >
                  <div
                    class="d-flex justify-center ga-1 overflow-x-auto py-1 px-2 no-scrollbar"
                    style="max-width: 100%"
                  >
                    <v-avatar
                      v-for="(j, jIdx) in p.jawaban"
                      :key="jIdx"
                      :color="j.benar ? 'success' : 'error'"
                      size="24"
                      class="answer-indicator flex-shrink-0"
                      variant="flat"
                    >
                      <v-icon size="14" color="white">
                        {{ j.benar ? "mdi-check" : "mdi-close" }}
                      </v-icon>
                    </v-avatar>
                    <!-- Empty slots for unanswered questions -->
                    <v-avatar
                      v-for="n in Math.max(
                        0,
                        totalSoal - (p.jawaban?.length || 0),
                      )"
                      :key="'empty-' + n"
                      color="grey-lighten-3"
                      size="24"
                      class="answer-indicator"
                      variant="flat"
                    >
                      <v-icon size="14" color="grey-lighten-1"
                        >mdi-minus</v-icon
                      >
                    </v-avatar>
                  </div>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>
      </v-card>
    </v-container>

    <!-- Confirm End Game Dialog -->
    <v-dialog v-model="confirmEndDialog" max-width="440">
      <v-card rounded="xl">
        <v-card-text class="text-center pa-6">
          <v-avatar color="error" size="64" variant="tonal" class="mb-4">
            <v-icon size="32">mdi-alert-circle-outline</v-icon>
          </v-avatar>
          <h3 class="text-h6 font-weight-bold mb-2">
            {{ t("end_game_confirm_title") }}
          </h3>
          <p class="text-body-2 text-medium-emphasis mb-0">
            {{ t("end_game_confirm_text") }}
          </p>
        </v-card-text>
        <v-card-actions class="pa-4 pt-0 justify-center ga-2">
          <v-btn
            variant="text"
            class="text-none px-6"
            rounded="lg"
            @click="confirmEndDialog = false"
          >
            {{ t("close") }}
          </v-btn>
          <v-btn
            color="error"
            variant="flat"
            rounded="lg"
            class="text-none font-weight-bold px-6"
            :loading="isEnding"
            @click="handleEndGame"
          >
            <v-icon start>mdi-stop-circle</v-icon>
            {{ t("end_game_button") }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar Notifications -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="3000"
      location="top"
      rounded="lg"
    >
      <div class="d-flex align-center">
        <v-icon class="me-2">{{ snackbar.icon }}</v-icon>
        {{ snackbar.text }}
      </div>
    </v-snackbar>
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
const totalSoal = ref(0);

interface PesertaAnswer {
  benar: boolean;
}

interface Peserta {
  id_peserta: number;
  nama_guest: string;
  skor: number;
  jawaban: PesertaAnswer[];
}

const peserta = ref<Peserta[]>([]);
const isLoading = ref(true);
const isEnding = ref(false);
const confirmEndDialog = ref(false);

const showPanduan = ref(false);
const showMateri = ref(false);
const showTentang = ref(false);

const snackbar = ref({
  show: false,
  text: "",
  color: "success",
  icon: "mdi-check-circle",
});

let pollTimer: ReturnType<typeof setInterval> | null = null;

// Medal colors for top 3
const medalColors = [
  "amber-darken-1",
  "blue-grey-lighten-1",
  "deep-orange-lighten-1",
];

function openModal(type: string) {
  if (type === "materi") showMateri.value = true;
  else if (type === "panduan") showPanduan.value = true;
  else if (type === "tentang") showTentang.value = true;
}

function showToast(text: string, color = "success", icon = "mdi-check-circle") {
  snackbar.value = { show: true, text, color, icon };
}

/**
 * Fetch scoreboard data from the Express API
 */
async function fetchScoreboard() {
  if (!idRoom.value) return;

  try {
    const res = await fetch(`${API_URL}/rooms/${idRoom.value}/scoreboard`);
    const data = await res.json();

    if (res.ok && data.success) {
      roomCode.value = data.kode_room || "";
      roomName.value = data.nama_room || "";
      totalSoal.value = data.total_soal || 0;
      peserta.value = (data.peserta || []).map((p: any) => ({
        ...p,
        jawaban: p.jawaban || [],
      }));

      // If game has been ended externally, redirect
      if (data.status === "selesai") {
        clearPolling();
        showToast(t("game_ended_success"), "info", "mdi-information");
        setTimeout(() => {
          router.push("/multiplayer/selection");
        }, 1500);
      }
    }
  } catch (err) {
    console.error("Fetch scoreboard error:", err);
  } finally {
    isLoading.value = false;
  }
}

/**
 * Start polling scoreboard data every 3 seconds
 */
function startPolling() {
  fetchScoreboard();
  pollTimer = setInterval(fetchScoreboard, 3000);
}

function clearPolling() {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
}

/**
 * End the game — POST to /api/rooms/:id_room/end
 */
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
      showToast(t("game_ended_success"));

      // Give brief time for snackbar to show, then redirect
      setTimeout(() => {
        router.push("/multiplayer/selection");
      }, 1500);
    } else {
      showToast(
        data.message || t("game_ended_error"),
        "error",
        "mdi-alert-circle",
      );
    }
  } catch (err) {
    console.error("End game error:", err);
    showToast(t("game_ended_error"), "error", "mdi-alert-circle");
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
.scoreboard-page {
  max-width: 1080px;
}

/* Header Card */
.header-card {
  background: linear-gradient(
    135deg,
    rgba(var(--v-theme-primary), 0.04) 0%,
    rgba(var(--v-theme-secondary), 0.06) 100%
  );
}

/* Live Badge Pulse */
.live-badge {
  letter-spacing: 1.5px;
}

.pulse-dot {
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
}

/* Podium Section */
.podium-section {
  padding: 8px 0;
}

.podium-container {
  min-height: 200px;
}

.podium-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.podium-first {
  z-index: 2;
}

.podium-avatar {
  border: 3px solid rgba(255, 255, 255, 0.6);
  transition: transform 0.3s ease;
}

.podium-avatar:hover {
  transform: scale(1.1);
}

.podium-avatar-first {
  border-width: 4px;
  box-shadow: 0 0 24px rgba(255, 193, 7, 0.4) !important;
}

.crown-icon {
  animation: float 2s ease-in-out infinite;
  margin-bottom: -4px;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-6px);
  }
}

.podium-bar {
  width: 100%;
  min-width: 100px;
  border-radius: 12px 12px 0 0;
  margin-top: 8px;
}

.podium-bar-gold {
  height: 80px;
  background: linear-gradient(180deg, #ffd54f 0%, #ffa000 100%);
  box-shadow: 0 4px 16px rgba(255, 160, 0, 0.3);
}

.podium-bar-silver {
  height: 56px;
  background: linear-gradient(180deg, #b0bec5 0%, #78909c 100%);
  box-shadow: 0 4px 12px rgba(120, 144, 156, 0.3);
}

.podium-bar-bronze {
  height: 40px;
  background: linear-gradient(180deg, #ffab91 0%, #e64a19 100%);
  box-shadow: 0 4px 12px rgba(230, 74, 25, 0.2);
}

/* Scoreboard Table */
.scoreboard-table th {
  font-weight: 700 !important;
  text-transform: uppercase;
  font-size: 0.75rem !important;
  letter-spacing: 0.5px;
  color: rgba(var(--v-theme-on-surface), 0.6) !important;
  background: rgba(var(--v-theme-on-surface), 0.02);
}

.scoreboard-row {
  transition: background-color 0.2s ease;
}

.scoreboard-row:hover {
  background: rgba(var(--v-theme-primary), 0.04) !important;
}

.top-three-row {
  background: rgba(var(--v-theme-primary), 0.02);
}

/* Answer Indicators */
.answer-indicator {
  transition: transform 0.2s ease;
  font-size: 11px;
}

.answer-indicator:hover {
  transform: scale(1.25);
}

/* Hide scrollbars for answers container */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* Pulse icon for empty state */
.pulse-icon {
  animation: pulse-scale 2s ease-in-out infinite;
}

@keyframes pulse-scale {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.6;
  }
  50% {
    transform: scale(1.1);
    opacity: 1;
  }
}

/* Panduan Gallery */
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

/* Responsive */
@media (max-width: 600px) {
  .podium-bar {
    min-width: 70px;
  }

  .podium-bar-gold {
    height: 60px;
  }

  .podium-bar-silver {
    height: 40px;
  }

  .podium-bar-bronze {
    height: 28px;
  }

  .podium-avatar-first {
    width: 64px !important;
    height: 64px !important;
  }
}
</style>
