<template>
  <AppLayout>
    <v-container class="score-page py-6">
      <!-- Title & Header Bar -->
      <v-card
        class="mb-6 border text-center relative-card"
        rounded="xl"
        elevation="3"
      >
        <v-card-text
          class="pa-6 pa-sm-8 d-flex flex-column align-center justify-center"
        >
          <v-avatar color="primary" size="80" variant="tonal" class="mb-4">
            <v-icon size="40" color="primary">mdi-medal-outline</v-icon>
          </v-avatar>
          <h1 class="text-h4 font-weight-black text-primary mb-1">
            {{ t("score_page_title") }}
          </h1>
          <p class="text-subtitle-1 text-medium-emphasis mb-0">
            {{ t("score_summary_heading") }} untuk
            <strong class="text-high-emphasis">{{
              scoreDetails?.nama_guest
            }}</strong>
          </p>
        </v-card-text>
      </v-card>

      <!-- Stats Grid -->
      <v-row class="mb-6 ga-0">
        <!-- Grade / Nilai -->
        <v-col cols="6" sm="4" md="3" class="pa-2">
          <v-card
            class="stat-card border text-center pa-4"
            rounded="xl"
            variant="flat"
          >
            <p class="text-caption text-medium-emphasis font-weight-bold mb-1">
              {{ t("score_grade_label") }}
            </p>
            <h2 class="text-h4 font-weight-black text-primary">{{ grade }}%</h2>
          </v-card>
        </v-col>

        <!-- Rank -->
        <v-col cols="6" sm="4" md="3" class="pa-2">
          <v-card
            class="stat-card border text-center pa-4"
            rounded="xl"
            variant="flat"
          >
            <p class="text-caption text-medium-emphasis font-weight-bold mb-1">
              {{ t("score_rank_label") }}
            </p>
            <h2 class="text-h4 font-weight-black text-info">
              {{ scoreDetails?.ranking }}/{{ scoreDetails?.total_peserta }}
            </h2>
          </v-card>
        </v-col>

        <!-- Performance / Skor -->
        <v-col cols="6" sm="4" md="3" class="pa-2">
          <v-card
            class="stat-card border text-center pa-4"
            rounded="xl"
            variant="flat"
          >
            <p class="text-caption text-medium-emphasis font-weight-bold mb-1">
              {{ t("score_performance_label") }}
            </p>
            <h2 class="text-h4 font-weight-black text-amber-darken-2">
              {{ scoreDetails?.skor }}
            </h2>
          </v-card>
        </v-col>

        <!-- Correct / Benar -->
        <v-col cols="6" sm="4" md="3" class="pa-2">
          <v-card
            class="stat-card border text-center pa-4"
            rounded="xl"
            variant="flat"
          >
            <p class="text-caption text-medium-emphasis font-weight-bold mb-1">
              {{ t("score_correct_label") }}
            </p>
            <h2 class="text-h4 font-weight-black text-success">
              {{ scoreDetails?.total_benar }}
            </h2>
          </v-card>
        </v-col>

        <!-- Incorrect / Salah -->
        <v-col cols="6" sm="4" md="3" class="pa-2">
          <v-card
            class="stat-card border text-center pa-4"
            rounded="xl"
            variant="flat"
          >
            <p class="text-caption text-medium-emphasis font-weight-bold mb-1">
              {{ t("score_incorrect_label") }}
            </p>
            <h2 class="text-h4 font-weight-black text-error">
              {{ scoreDetails?.total_salah }}
            </h2>
          </v-card>
        </v-col>

        <!-- Fastest Time -->
        <v-col cols="6" sm="4" md="3" class="pa-2">
          <v-card
            class="stat-card border text-center pa-4"
            rounded="xl"
            variant="flat"
          >
            <p class="text-caption text-medium-emphasis font-weight-bold mb-1">
              {{ t("score_time_label") }}
            </p>
            <h2 class="text-h4 font-weight-black text-purple">
              {{ scoreDetails?.waktu_tercepat }}s
            </h2>
          </v-card>
        </v-col>

        <!-- Streak -->
        <v-col cols="12" sm="8" md="6" class="pa-2">
          <v-card
            class="stat-card border text-center pa-4"
            rounded="xl"
            variant="flat"
          >
            <p class="text-caption text-medium-emphasis font-weight-bold mb-1">
              {{ t("score_streak_label") }}
            </p>
            <h2 class="text-h4 font-weight-black text-orange-darken-3">
              🔥 {{ scoreDetails?.benar_beruntun }}
            </h2>
          </v-card>
        </v-col>
      </v-row>

      <!-- Review Section -->
      <v-card class="border" rounded="xl" elevation="2">
        <v-card-title
          class="pa-4 pa-sm-5 border-b d-flex align-center justify-space-between"
        >
          <div class="d-flex align-center ga-2">
            <v-icon color="primary">mdi-ballot-outline</v-icon>
            <span class="text-h6 font-weight-bold" style="font-size: 1.1rem">{{
              t("score_review_heading")
            }}</span>
          </div>
          <v-chip
            color="primary"
            variant="flat"
            size="small"
            class="font-weight-bold"
          >
            {{ scoreDetails?.review?.length || 0 }}
            {{ t("question_count_label") }}
          </v-chip>
        </v-card-title>

        <v-card-text
          class="pa-4 pa-sm-6 max-height-review overflow-y-auto bg-surface-light"
        >
          <!-- Question Review Items -->
          <v-card
            v-for="(item, idx) in scoreDetails?.review"
            :key="idx"
            class="mb-4 border pa-4 pa-sm-5 position-relative"
            rounded="lg"
            elevation="1"
          >
            <!-- Absolute Badge -->
            <v-chip
              :color="item.benar_user ? 'success' : 'error'"
              size="x-small"
              variant="flat"
              class="font-weight-bold position-absolute"
              style="top: 12px; right: 12px"
            >
              {{
                item.benar_user
                  ? t("score_correct_badge")
                  : t("score_wrong_badge")
              }}
            </v-chip>

            <!-- Question header -->
            <div
              class="d-flex align-start mb-3 ga-3"
              style="text-align: justify"
            >
              <div class="d-flex align-center ga-2">
                <v-avatar
                  color="primary"
                  variant="tonal"
                  size="28"
                  class="font-weight-black text-caption"
                >
                  {{ Number(idx) + 1 }}
                </v-avatar>
                <h4 class="text-subtitle-1 font-weight-bold mb-0">
                  {{ item.pertanyaan }}
                </h4>
              </div>
            </div>

            <!-- Options mapping -->
            <v-row class="ga-0">
              <v-col
                v-for="opt in ['A', 'B', 'C', 'D']"
                :key="opt"
                cols="12"
                sm="6"
                class="pa-1"
              >
                <div
                  class="option-item pa-3 rounded-lg border d-flex align-center justify-space-between text-body-2"
                  :class="getOptionClass(item, opt)"
                >
                  <span>
                    <strong class="me-2">{{ opt }}.</strong>
                    {{ item[`jwbn_${opt.toLowerCase()}`] }}
                  </span>

                  <span
                    v-if="opt === item.jawaban_user"
                    class="text-caption font-weight-bold"
                  >
                    {{ item.benar_user ? "✓" : "✗" }}
                  </span>
                </div>
              </v-col>
            </v-row>
          </v-card>
        </v-card-text>
      </v-card>

      <!-- Action Buttons -->
      <div class="d-flex justify-center mt-6">
        <v-btn
          color="primary"
          size="large"
          rounded="xl"
          elevation="3"
          class="px-8 font-weight-bold text-none"
          @click="router.push('/')"
        >
          <v-icon start>mdi-home</v-icon>
          {{ t("scoreboard_back_to_beranda") }}
        </v-btn>
      </div>
    </v-container>
  </AppLayout>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import AppLayout from "@/components/AppLayout.vue";
import { API_URL } from "@/config";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const idRoom = computed(() => route.query.id_room as string);
const idPeserta = computed(() => route.query.id_peserta as string);

const scoreDetails = ref<any>(null);

const showPanduan = ref(false);
const showMateri = ref(false);
const showTentang = ref(false);

function openModal(type: string) {
  if (type === "materi") showMateri.value = true;
  else if (type === "panduan") showPanduan.value = true;
  else if (type === "tentang") showTentang.value = true;
}

// Calculate grade percentage
const grade = computed(() => {
  if (!scoreDetails.value || !scoreDetails.value.total_soal) return 0;
  return Math.round(
    (scoreDetails.value.total_benar / scoreDetails.value.total_soal) * 100,
  );
});

/**
 * Fetch detailed score statistics and reviews
 */
async function fetchScoreDetails() {
  if (!idPeserta.value || !idRoom.value) return;
  try {
    const res = await fetch(
      `${API_URL}/rooms/player/${idPeserta.value}/score-details?id_room=${idRoom.value}`,
    );
    const data = await res.json();
    if (res.ok && data.success) {
      scoreDetails.value = data;
    }
  } catch (err) {
    console.error("Fetch score details error:", err);
  }
}

/**
 * Visual styling classes for option items in review section
 */
function getOptionClass(item: any, opt: string) {
  const isKunci = opt === item.kunci_jawaban;
  const isSelected = opt === item.jawaban_user;

  if (isSelected && isKunci) {
    return "option-correct";
  }
  if (isSelected && !isKunci) {
    return "option-wrong";
  }
  if (!isSelected && isKunci) {
    return "option-koreksi";
  }
  return "bg-white";
}

onMounted(() => {
  if (!idPeserta.value || !idRoom.value) {
    router.push("/multiplayer/join");
    return;
  }
  fetchScoreDetails();
});
</script>

<style scoped>
.v-row {
  display: flex;
  justify-content: space-between;
}

.score-page {
  max-width: 900px;
}

.relative-card {
  background: linear-gradient(
    135deg,
    rgba(var(--v-theme-primary), 0.05) 0%,
    rgba(var(--v-theme-secondary), 0.08) 100%
  );
}

.stat-card {
  background-color: rgba(var(--v-theme-primary), 0.02);
  transition: transform 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  background-color: rgba(var(--v-theme-primary), 0.05);
}

.max-height-review {
  max-height: 480px;
}

/* Custom CSS Scrollbar style */
.max-height-review::-webkit-scrollbar {
  width: 8px;
}

.max-height-review::-webkit-scrollbar-thumb {
  background: rgba(var(--v-theme-primary), 0.2);
  border-radius: 4px;
}

/* Review Options styling colors */
.option-item {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  transition: all 0.2s ease;
}

.option-correct {
  background-color: rgba(var(--v-theme-success), 0.1) !important;
  border-color: rgb(var(--v-theme-success)) !important;
  color: rgb(var(--v-theme-success-darken-1)) !important;
  font-weight: bold;
}

.option-wrong {
  background-color: rgba(var(--v-theme-error), 0.1) !important;
  border-color: rgb(var(--v-theme-error)) !important;
  color: rgb(var(--v-theme-error-darken-1)) !important;
  text-decoration: line-through;
  opacity: 0.8;
}

.option-koreksi {
  background-color: rgba(var(--v-theme-info), 0.08) !important;
  border-color: rgb(var(--v-theme-info)) !important;
  color: rgb(var(--v-theme-info-darken-1)) !important;
  font-weight: bold;
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
