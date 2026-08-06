<template>
  <AppLayout>
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-bg" />
      <v-container class="hero-content">
        <div class="bg-decoration">
          <div class="bg-circle bg-circle--1" />
          <div class="bg-circle bg-circle--2" />
          <div class="bg-circle bg-circle--3" />
        </div>
        <v-row align="center" justify="center">
          <v-col cols="12" md="8" lg="6" class="text-center">
            <h1
              class="hero-title text-h4 text-sm-h3 font-weight-bold mb-3"
              style="margin-top: 10px"
            >
              {{ t("hero_title") }}
            </h1>
            <p
              class="hero-subtitle text-body-1 text-medium-emphasis mb-8"
              style="margin-bottom: 10px"
            >
              {{ t("hero_subtitle") }}
            </p>

            <!-- Game Mode Card -->
            <v-card
              class="game-card mx-auto"
              max-width="340"
              hover
              @click="$router.push('/multiplayer/selection')"
            >
              <div class="game-card-glow" />
              <v-card-text class="text-center pa-6">
                <v-avatar size="80" color="primary" class="mb-4">
                  <v-img src="/audience.png" alt="Multiplayer" />
                </v-avatar>
                <h3 class="text-h6 font-weight-bold">
                  {{ t("sharpen_brain") }}
                </h3>
                <p class="text-body-2 text-medium-emphasis mt-1">
                  {{ t("sharpen_brain_desc") }}
                </p>
              </v-card-text>
              <v-card-actions class="justify-center pb-4">
                <v-btn
                  color="primary"
                  variant="flat"
                  class="text-none px-6"
                  rounded="xl"
                >
                  <v-icon start>mdi-play-circle</v-icon>
                  Mulai
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-container>

      <!-- Floating Poster Button -->
      <v-btn
        class="floating-poster"
        color="white"
        elevation="4"
        rounded="lg"
        size="small"
        style="bottom: 55px; right: 25px"
        @click="showPoster = true"
      >
        <v-icon start color="primary">mdi-image-multiple</v-icon>
        <span class="text-caption text-none">{{ t("view_posters") }}</span>
      </v-btn>
    </section>

    <!-- ===== DIALOGS ===== -->

    <!-- Poster Carousel Dialog -->
    <v-dialog v-model="showPoster" max-width="500">
      <v-card rounded="xl" color="grey-darken-4">
        <v-card-title class="d-flex align-center pa-4 text-white">
          <v-icon color="white" class="me-2">mdi-image-multiple</v-icon>
          {{ t("poster_title") }}
          <v-spacer />
          <v-btn icon variant="text" size="small" @click="showPoster = false">
            <v-icon color="white">mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-carousel
          v-model="posterIndex"
          :show-arrows="showNavArrows"
          hide-delimiter-background
          :height="posterHeight"
        >
          <v-carousel-item v-for="i in 6" :key="i">
            <v-img
              :src="`/poster/poster ${i}.jpg`"
              :alt="`Poster ${i}`"
              contain
              :height="posterHeight"
              class="rounded-lg mx-auto"
            />
          </v-carousel-item>
        </v-carousel>
        <div class="text-center pa-3">
          <span class="text-caption text-white">
            {{ posterIndex + 1 }} / 6
          </span>
        </div>
      </v-card>
    </v-dialog>

    <!-- Welcome Dialog (first visit) -->
    <v-dialog v-model="showWelcome" max-width="500" persistent>
      <v-card rounded="xl">
        <v-card-title class="d-flex align-center pa-4">
          <v-icon color="primary" class="me-2">mdi-hand-wave</v-icon>
          {{
            welcomeStep === "panduan"
              ? t("welcome_title") + " — " + t("guidance_title")
              : t("material_title")
          }}
          <v-spacer />
        </v-card-title>
        <v-divider />
        <v-card-text class="pa-4">
          <!-- Panduan step -->
          <template v-if="welcomeStep === 'panduan'">
            <v-carousel :show-arrows="showNavArrows" hide-delimiter-background :height="posterHeight">
              <v-carousel-item v-for="i in 16" :key="i">
                <v-img
                  :src="`/panduan/${i}.jpg`"
                  :alt="`Panduan ${i}`"
                  contain
                  :height="posterHeight"
                  class="rounded-lg mx-auto"
                />
              </v-carousel-item>
            </v-carousel>
          </template>
          <!-- Materi step -->
          <template v-else>
            <div class="overflow-y-auto" style="max-height: 60vh">
              <v-img
                v-for="i in 21"
                :key="i"
                :src="`/materi/${i}.jpg`"
                :alt="`Materi ${i}`"
                class="mb-3 rounded-lg"
              />
            </div>
          </template>
        </v-card-text>
        <v-divider />
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn
            color="primary"
            variant="flat"
            class="text-none"
            rounded="lg"
            @click="advanceWelcome"
          >
            {{ welcomeStep === "panduan" ? "Lanjut ke Materi →" : t("close") }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </AppLayout>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { useDisplay } from "vuetify";
import { useAuthStore } from "@/stores/auth";
import AppLayout from "@/components/AppLayout.vue";

const { t } = useI18n();
const router = useRouter();
const authStore = useAuthStore();
const { xs, smAndDown } = useDisplay();

// Responsive heights for carousels
const posterHeight = computed(() => {
  if (xs.value) return 380;     // Mobile
  if (smAndDown.value) return 480; // Tablet
  return 550;                 // Desktop
});

// Show navigation arrows only on desktop (hide on xs/sm screen sizes)
const showNavArrows = computed(() => {
  return !smAndDown.value;
});

// Modal states
const showPoster = ref(false);
const posterIndex = ref(0);

// Welcome flow
const showWelcome = ref(false);
const welcomeStep = ref<"panduan" | "materi">("panduan");

function advanceWelcome() {
  if (welcomeStep.value === "panduan") {
    welcomeStep.value = "materi";
  } else {
    showWelcome.value = false;
  }
}

onMounted(() => {
  // Jika role user adalah admin, paksa arahkan ke /admin langsung
  if (authStore.user?.role === "admin") {
    router.replace("/admin");
    return;
  }

  const welcomed = sessionStorage.getItem("welcomeShown");
  if (!welcomed) {
    showWelcome.value = true;
    welcomeStep.value = "panduan";
    sessionStorage.setItem("welcomeShown", "true");
  }
});
</script>

<style scoped>
/* Hero section */
.hero-section {
  position: relative;
  min-height: calc(100vh - 64px - 48px); /* minus appbar and footer */
  display: flex;
  align-items: center;
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  inset: 0;
  background: url("/bg-trans.png") center / cover no-repeat;
  opacity: 0.06;
  z-index: 0;
}

.hero-content {
  position: relative;
  z-index: 1;
}

.hero-logo {
  background: rgba(var(--v-theme-primary), 0.1);
  border: 3px solid rgba(var(--v-theme-primary), 0.15);
  animation: float-logo 6s ease-in-out infinite;
}

/* Animated background circles */
.bg-decoration {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}

.bg-circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.08;
}

.bg-circle--1 {
  width: 500px;
  height: 500px;
  background: rgb(var(--v-theme-primary));
  top: -150px;
  right: -100px;
  animation: float 20s ease-in-out infinite;
}

.bg-circle--2 {
  width: 350px;
  height: 350px;
  background: rgb(var(--v-theme-secondary));
  bottom: -100px;
  left: -80px;
  animation: float 25s ease-in-out infinite reverse;
}

.bg-circle--3 {
  width: 200px;
  height: 200px;
  background: rgb(var(--v-theme-accent));
  top: 40%;
  left: 60%;
  animation: float 18s ease-in-out infinite 5s;
}

@keyframes float-logo {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.hero-title {
  background: linear-gradient(
    135deg,
    rgb(var(--v-theme-primary)),
    rgb(var(--v-theme-secondary))
  );
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1.3;
}

.hero-subtitle {
  max-width: 480px;
  margin: 0 auto;
}

/* Game card */
.game-card {
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
  border: 1px solid rgba(var(--v-theme-primary), 0.1);
}

.game-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 16px 48px rgba(var(--v-theme-primary), 0.18) !important;
}

.game-card-glow {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(
    circle at center,
    rgba(var(--v-theme-primary), 0.06) 0%,
    transparent 50%
  );
  animation: glow-spin 8s linear infinite;
  pointer-events: none;
}

@keyframes glow-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Floating poster button */
.floating-poster {
  position: fixed;
  bottom: 70px;
  right: 20px;
  z-index: 100;
  animation: float-poster 3s ease-in-out infinite;
}

@keyframes float-poster {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

/* Panduan horizontal gallery */
.panduan-gallery {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 8px;
  scroll-snap-type: x mandatory;
}

.panduan-img {
  scroll-snap-align: start;
  flex-shrink: 0;
}

/* Scrollbar styling */
.panduan-gallery::-webkit-scrollbar {
  height: 6px;
}

.panduan-gallery::-webkit-scrollbar-track {
  background: rgba(var(--v-theme-on-surface), 0.05);
  border-radius: 3px;
}

.panduan-gallery::-webkit-scrollbar-thumb {
  background: rgba(var(--v-theme-primary), 0.3);
  border-radius: 3px;
}
</style>
