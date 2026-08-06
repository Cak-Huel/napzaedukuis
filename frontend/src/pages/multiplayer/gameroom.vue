<template>
  <AppLayout>
    <v-container
      class="gameroom-page py-6 fill-height d-flex align-center justify-center"
    >
      <div class="w-100" style="max-width: 800px">
        <!-- Top Info Header (Name, Progress, Timer, Score) -->
        <v-card class="mb-6 border" rounded="xl" elevation="3">
          <v-card-text
            class="d-flex flex-wrap align-center justify-space-between pa-4 pa-sm-6 ga-4"
          >
            <!-- Player Name -->
            <div class="d-flex align-center ga-3">
              <v-avatar
                color="primary"
                variant="tonal"
                size="40"
                class="font-weight-bold"
              >
                {{ playerName ? playerName.charAt(0).toUpperCase() : "P" }}
              </v-avatar>
              <div>
                <h3 class="text-subtitle-1 font-weight-bold mb-0">
                  {{ playerName || "Player" }}
                </h3>
                <span
                  class="text-caption text-medium-emphasis"
                  v-if="totalQuestions > 0"
                >
                  {{
                    t("question_indicator", {
                      current:
                        answeredCount + 1 > totalQuestions
                          ? totalQuestions
                          : answeredCount + 1,
                      total: totalQuestions,
                    })
                  }}
                </span>
              </div>
            </div>

            <!-- Timer and Score -->
            <div class="d-flex align-center ga-3">
              <v-chip
                color="amber-darken-2"
                variant="flat"
                class="font-weight-black text-white px-4"
                size="large"
              >
                <v-icon
                  start
                  size="18"
                  class="timer-icon"
                  :class="{ 'pulse-timer': timer <= 10 }"
                  >mdi-clock-outline</v-icon
                >
                {{ timer }}s
              </v-chip>
              <v-chip
                color="primary"
                variant="flat"
                class="font-weight-black px-4"
                size="large"
              >
                <v-icon start size="18">mdi-star-outline</v-icon>
                {{ score }} pts
              </v-chip>
            </div>
          </v-card-text>

          <!-- Question Progress Bar -->
          <v-progress-linear
            v-if="totalQuestions > 0"
            :model-value="(answeredCount / totalQuestions) * 100"
            color="primary"
            height="6"
            rounded
          />
        </v-card>

        <!-- Main Card Area (Question / Finished State / Waiting State) -->
        <v-window v-model="gameState" disabled>
          <!-- 1. Question Slide -->
          <v-window-item value="question">
            <v-card
              class="question-card mb-6 border text-center"
              rounded="xl"
              elevation="4"
            >
              <v-card-text
                class="pa-6 pa-sm-8 d-flex flex-column justify-center align-center"
              >
                <!-- Optional Question Image -->
                <div
                  v-if="currentQuestion?.gambar"
                  class="question-image-container mb-4"
                >
                  <v-img
                    :src="getImageUrl(currentQuestion.gambar)"
                    max-height="250"
                    max-width="100%"
                    contain
                    class="rounded-xl border bg-grey-lighten-4"
                  />
                </div>

                <!-- Decorative elements -->
                <div class="deco-icon top-left">🌸</div>
                <div class="deco-icon bottom-right">🌸</div>

                <!-- Question Text -->
                <h2
                  class="text-h5 font-weight-bold text-white px-4 text-shadow py-4"
                >
                  {{ currentQuestion?.pertanyaan }}
                </h2>
              </v-card-text>
            </v-card>

            <!-- Answers Grid -->
            <v-row class="answer-grid ga-0">
              <v-col
                v-for="optionKey in ['A', 'B', 'C', 'D']"
                :key="optionKey"
                cols="12"
                sm="6"
                class="pa-2"
              >
                <v-btn
                  block
                  size="x-large"
                  rounded="xl"
                  variant="flat"
                  class="answer-btn text-none text-wrap text-start justify-start px-6 py-4 font-weight-medium border-2"
                  min-height="72"
                  height="auto"
                  :disabled="isButtonsDisabled"
                  :color="getOptionColor(optionKey)"
                  @click="handleSelectAnswer(optionKey)"
                >
                  <span class="text-h6 font-weight-black me-2"
                    >{{ optionKey }}.</span
                  >
                  <span class="text-body-1">{{
                    currentQuestion
                      ? currentQuestion[`jwbn_${optionKey.toLowerCase()}`]
                      : ""
                  }}</span>

                  <!-- Checkmark / Cross indicator inside button -->
                  <v-spacer />
                  <v-icon
                    v-if="
                      submittedAnswer &&
                      (optionKey === correctFeedbackAnswer ||
                        optionKey === submittedAnswer)
                    "
                    :color="
                      optionKey === correctFeedbackAnswer
                        ? 'success-darken-1'
                        : 'error-darken-1'
                    "
                    class="ms-2"
                  >
                    {{
                      optionKey === correctFeedbackAnswer
                        ? "mdi-check-circle"
                        : "mdi-close-circle"
                    }}
                  </v-icon>
                </v-btn>
              </v-col>
            </v-row>
          </v-window-item>

          <!-- 2. Waiting State Slide -->
          <v-window-item value="waiting">
            <v-card class="pa-8 text-center border" rounded="xl" elevation="3">
              <v-card-text class="py-12">
                <v-progress-circular
                  indeterminate
                  color="primary"
                  size="64"
                  width="6"
                  class="mb-4"
                />
                <h3 class="text-h6 font-weight-bold mb-1">
                  {{ t("waiting_for_next_question") }}
                </h3>
                <p class="text-body-2 text-medium-emphasis">
                  Harap tunggu sementara guru menyiapkan atau memperbarui soal.
                </p>
              </v-card-text>
            </v-card>
          </v-window-item>

          <!-- 3. Finished State Slide -->
          <v-window-item value="finished">
            <v-card class="pa-8 text-center border" rounded="xl" elevation="4">
              <v-card-text
                class="py-12 d-flex flex-column align-center justify-center"
              >
                <v-avatar
                  color="success"
                  size="80"
                  variant="tonal"
                  class="mb-4 text-success animation-bounce"
                >
                  <v-icon size="48">mdi-trophy-outline</v-icon>
                </v-avatar>
                <h2 class="text-h4 font-weight-black text-success mb-2">
                  Quiz Selesai!
                </h2>
                <p class="text-body-1 text-medium-emphasis mb-6 max-width-600">
                  {{ t("game_finished_player_message") }}
                </p>
                <v-btn
                  color="primary"
                  size="large"
                  rounded="xl"
                  class="px-8 font-weight-bold text-none"
                  elevation="3"
                  @click="goToScorePage"
                >
                  <v-icon start>mdi-file-chart-outline</v-icon>
                  {{ t("view_score_button") }}
                </v-btn>
              </v-card-text>
            </v-card>
          </v-window-item>
        </v-window>
      </div>
    </v-container>
  </AppLayout>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import AppLayout from "@/components/AppLayout.vue";
import { API_URL, API_BASE_URL } from "@/config";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const idRoom = computed(() => route.query.id_room as string);
const idPeserta = computed(() => route.query.id_peserta as string);

// Game State Definitions
// 'waiting': lobby/loading state, 'question': answering questions, 'finished': completed
const gameState = ref<"waiting" | "question" | "finished">("waiting");

// Player profile info
const playerName = ref("");
const score = ref(0);

// Quiz / Question State
const currentQuestion = ref<any>(null);
const totalQuestions = ref(0);
const answeredCount = ref(0);

// Timer
const timer = ref(30);
let timerInterval: ReturnType<typeof setInterval> | null = null;

// Answering Feedback / Controls
const isButtonsDisabled = ref(false);
const submittedAnswer = ref<string | null>(null);
const isSubmittedCorrect = ref<boolean | null>(null);
const correctFeedbackAnswer = ref<string | null>(null);

// Dialog states for layout
const showPanduan = ref(false);
const showMateri = ref(false);
const showTentang = ref(false);

// Polling interval for checking host status (e.g. if host ends game)
let statusPollInterval: ReturnType<typeof setInterval> | null = null;

function openModal(type: string) {
  if (type === "materi") showMateri.value = true;
  else if (type === "panduan") showPanduan.value = true;
  else if (type === "tentang") showTentang.value = true;
}

function getImageUrl(relPath: string) {
  if (!relPath) return "";
  if (relPath.startsWith("http")) return relPath;
  return `${API_BASE_URL}/${relPath.replace(/^\//, "")}`;
}

/**
 * Fetch player profile & score state
 */
async function fetchPlayerState() {
  if (!idPeserta.value) return;
  try {
    const res = await fetch(`${API_URL}/rooms/player/${idPeserta.value}`);
    const data = await res.json();
    if (res.ok && data.success) {
      playerName.value = data.data.nama_guest;
      score.value = data.data.skor;
    }
  } catch (err) {
    console.error("Fetch player state error:", err);
  }
}

/**
 * Fetch next unanswered question
 */
async function fetchNextQuestion() {
  if (!idRoom.value || !idPeserta.value) return;
  try {
    const res = await fetch(
      `${API_URL}/questions/next?id_room=${idRoom.value}&id_peserta=${idPeserta.value}`,
    );
    const data = await res.json();
    if (res.ok && data.success) {
      totalQuestions.value = data.total_soal;
      answeredCount.value = data.answered_count;

      if (data.question) {
        currentQuestion.value = data.question;
        gameState.value = "question";
        resetQuestionState();
        startTimer();
      } else {
        // No questions left
        gameState.value = "finished";
        clearTimer();
      }
    } else {
      alert(t("alert_load_game_failed"));
    }
  } catch (err) {
    console.error("Fetch next question error:", err);
    alert(t("alert_load_game_failed"));
  }
}

/**
 * Reset answering / feedback variables for the next question
 */
function resetQuestionState() {
  submittedAnswer.value = null;
  isSubmittedCorrect.value = null;
  correctFeedbackAnswer.value = null;
  isButtonsDisabled.value = false;
}

/**
 * Timer management
 */
function startTimer() {
  timer.value = 30;
  clearTimer();
  timerInterval = setInterval(() => {
    timer.value--;
    if (timer.value <= 0) {
      clearTimer();
      // Auto-submit null answer on timeout
      handleSubmitAnswer(null);
    }
  }, 1000);
}

function clearTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

/**
 * Submit answer action triggered by user click or timeout
 */
async function handleSelectAnswer(ans: string) {
  if (isButtonsDisabled.value) return;
  await handleSubmitAnswer(ans);
}

async function handleSubmitAnswer(answer: string | null) {
  if (!currentQuestion.value) return;
  clearTimer();
  isButtonsDisabled.value = true;
  submittedAnswer.value = answer;

  const timeUsed = 30 - timer.value;

  try {
    const res = await fetch(`${API_URL}/questions/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id_room: idRoom.value,
        id_peserta: idPeserta.value,
        id_soalmlt: currentQuestion.value.id_soalmlt,
        jawaban: answer,
        waktu_jawab: timeUsed,
      }),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      isSubmittedCorrect.value = data.is_correct;
      correctFeedbackAnswer.value = data.correct_answer;
      score.value = data.new_score;
      totalQuestions.value = data.total_soal;
      answeredCount.value = data.answered_count;

      // Delay to show visual correction feedback (1.5 seconds)
      setTimeout(() => {
        if (data.next_question) {
          currentQuestion.value = data.next_question;
          resetQuestionState();
          startTimer();
        } else {
          gameState.value = "finished";
        }
      }, 1500);
    } else {
      alert(data.message || t("alert_submit_answer_failed"));
      isButtonsDisabled.value = false;
      startTimer();
    }
  } catch (err) {
    console.error("Submit answer error:", err);
    alert(t("alert_submit_answer_failed"));
    isButtonsDisabled.value = false;
    startTimer();
  }
}

/**
 * Returns color classes/values for answer buttons during normal/feedback state
 */
function getOptionColor(optionKey: string): string {
  // If not submitted yet
  if (!submittedAnswer.value) {
    return "white";
  }

  // Highlight correct answer in green
  if (optionKey === correctFeedbackAnswer.value) {
    return "success";
  }

  // If user selected this wrong option, highlight in red
  if (optionKey === submittedAnswer.value && !isSubmittedCorrect.value) {
    return "error";
  }

  // All other buttons are greyed out slightly during feedback
  return "grey-lighten-4";
}

/**
 * Navigate to score page (Author ends game or player finishes)
 */
function goToScorePage() {
  clearAllIntervals();
  router.push({
    path: "/multiplayer/score",
    query: {
      id_room: idRoom.value,
      id_peserta: idPeserta.value,
    },
  });
}

/**
 * Periodically check room status to see if host terminated the session
 */
async function checkRoomStatus() {
  if (!idRoom.value) return;
  try {
    const res = await fetch(`${API_URL}/rooms/details/${idRoom.value}`);
    const data = await res.json();
    if (res.ok && data.success) {
      if (data.status === "selesai") {
        goToScorePage();
      }
    }
  } catch (err) {
    console.error("Check room status error:", err);
  }
}

function clearAllIntervals() {
  clearTimer();
  if (statusPollInterval) {
    clearInterval(statusPollInterval);
    statusPollInterval = null;
  }
}

onMounted(() => {
  if (!idRoom.value || !idPeserta.value) {
    router.push("/multiplayer/join");
    return;
  }
  fetchPlayerState();
  fetchNextQuestion();

  // Poll status every 2 seconds to detect host finishing game
  statusPollInterval = setInterval(checkRoomStatus, 2000);
});

onUnmounted(() => {
  clearAllIntervals();
});
</script>

<style scoped>
.gameroom-page {
  min-height: calc(100vh - 64px - 48px);
}

.text-shadow {
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
}

/* Question Card styling with NAPZA Edu theme (card background image / styles) */
.question-card {
  background-image: linear-gradient(135deg, #1f8dff 0%, #0056b3 100%);
  border: 3px solid rgba(255, 255, 255, 0.4) !important;
  position: relative;
  overflow: hidden;
}

.deco-icon {
  position: absolute;
  font-size: 24px;
}

.deco-icon.top-left {
  top: 12px;
  left: 12px;
}

.deco-icon.bottom-right {
  bottom: 12px;
  right: 12px;
}

.question-image-container {
  width: 100%;
}

/* Custom Answer Button Styles */
.answer-btn {
  border: 2px solid rgba(var(--v-theme-on-surface), 0.08) !important;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.04) !important;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.answer-btn :deep(.v-btn__content) {
  white-space: normal !important;
  word-break: break-word !important;
  text-align: left !important;
  display: flex !important;
  align-items: center !important;
  justify-content: flex-start !important;
  width: 100% !important;
}

.answer-btn:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.08) !important;
  border-color: rgb(var(--v-theme-primary)) !important;
}

/* Timer icon pulse animation on low time */
.pulse-timer {
  animation: pulse-timer-anim 1s infinite alternate;
  color: rgb(var(--v-theme-error)) !important;
}

@keyframes pulse-timer-anim {
  from {
    transform: scale(1);
  }
  to {
    transform: scale(1.3);
  }
}

/* Bounce animation for success state icon */
.animation-bounce {
  animation: bounce 1.5s infinite;
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
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
