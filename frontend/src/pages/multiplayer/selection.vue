<template>
  <AppLayout>
    <v-container class="selection-page fill-height" fluid>
      <!-- Background decoration -->
      <div class="bg-decoration">
        <div class="bg-shape bg-shape--1" />
        <div class="bg-shape bg-shape--2" />
      </div>

      <v-row align="center" justify="center" class="fill-height">
        <v-col cols="12" md="8" lg="6" class="text-center">
          <!-- Back button + Title -->
          <div class="mb-8">
            <v-btn
              icon
              variant="text"
              size="small"
              class="mb-4"
              @click="$router.push('/')"
            >
              <v-icon>mdi-arrow-left</v-icon>
            </v-btn>
            <h1 class="text-h4 font-weight-bold selection-title">
              {{ t("choose_as_title") }}
            </h1>
            <p class="text-body-1 text-medium-emphasis mt-2">
              {{ t("choose_as_subtitle") }}
            </p>
          </div>

          <!-- Role Cards -->
          <v-row justify="center" class="role-cards">
            <!-- PLAYER card -->
            <v-col cols="12" sm="5">
              <v-card
                class="role-card player-card"
                hover
                @click="$router.push('/multiplayer/join')"
              >
                <div class="role-card-accent player-accent" />
                <v-card-text class="text-center pa-6 pa-sm-8">
                  <v-avatar
                    size="90"
                    color="primary"
                    variant="tonal"
                    class="mb-4"
                  >
                    <v-img src="/profile.png" alt="Player" />
                  </v-avatar>
                  <h3 class="text-h6 font-weight-bold mb-2">
                    {{ t("player_role") }}
                  </h3>
                  <p class="text-body-2 text-medium-emphasis">
                    {{ t("player_desc") }}
                  </p>
                </v-card-text>
                <v-card-actions class="justify-center pb-5">
                  <v-btn
                    color="primary"
                    variant="flat"
                    class="text-none px-6"
                    rounded="xl"
                  >
                    <v-icon start>mdi-login-variant</v-icon>
                    {{ t("join_room_btn") }}
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-col>

            <!-- AUTHOR card -->
            <v-col cols="12" sm="5">
              <v-card
                class="role-card author-card"
                hover
                @click="handleAuthorClick"
              >
                <div class="role-card-accent author-accent" />
                <v-card-text class="text-center pa-6 pa-sm-8">
                  <v-avatar
                    size="90"
                    color="secondary"
                    variant="tonal"
                    class="mb-4"
                  >
                    <v-icon size="48" color="secondary">mdi-crown</v-icon>
                  </v-avatar>
                  <h3 class="text-h6 font-weight-bold mb-2">
                    {{ t("author_role") }}
                  </h3>
                  <p class="text-body-2 text-medium-emphasis">
                    {{ t("author_desc") }}
                  </p>
                </v-card-text>
                <v-card-actions class="justify-center pb-5">
                  <v-btn
                    color="secondary"
                    variant="flat"
                    class="text-none px-6"
                    rounded="xl"
                  >
                    <v-icon start>mdi-plus-circle</v-icon>
                    {{ t("create_room_btn") }}
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-container>

    <!-- Snackbar -->
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
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import AppLayout from "@/components/AppLayout.vue";

const { t } = useI18n();
const router = useRouter();
const authStore = useAuthStore();

const showPanduan = ref(false);
const showMateri = ref(false);
const showTentang = ref(false);

const snackbar = ref({
  show: false,
  text: "",
  color: "warning",
  icon: "mdi-alert",
});

function openModal(type: string) {
  if (type === "materi") showMateri.value = true;
  else if (type === "panduan") showPanduan.value = true;
  else if (type === "tentang") showTentang.value = true;
}

function handleAuthorClick() {
  if (!authStore.isLoggedIn) {
    snackbar.value = {
      show: true,
      text: t("author_login_required"),
      color: "warning",
      icon: "mdi-alert",
    };
    setTimeout(() => router.push("/login"), 1500);
    return;
  }
  router.push("/multiplayer/create");
}
</script>

<style scoped>
.selection-page {
  position: relative;
  min-height: calc(100vh - 64px - 48px);
  overflow: hidden;
}

/* Background shapes */
.bg-decoration {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

.bg-shape {
  position: absolute;
  border-radius: 50%;
  opacity: 0.06;
}

.bg-shape--1 {
  width: 450px;
  height: 450px;
  background: rgb(var(--v-theme-primary));
  top: -120px;
  left: -80px;
  animation: float 22s ease-in-out infinite;
}

.bg-shape--2 {
  width: 350px;
  height: 350px;
  background: rgb(var(--v-theme-secondary));
  bottom: -80px;
  right: -60px;
  animation: float 18s ease-in-out infinite reverse;
}

@keyframes float {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  50% {
    transform: translate(20px, -20px) scale(1.04);
  }
}

/* Title gradient */
.selection-title {
  background: linear-gradient(
    135deg,
    rgb(var(--v-theme-primary)),
    rgb(var(--v-theme-secondary))
  );
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Role cards */
.role-card {
  position: relative;
  z-index: 1;
  overflow: hidden;
  cursor: pointer;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.role-card:hover {
  transform: translateY(-8px);
}

.player-card:hover {
  box-shadow: 0 16px 40px rgba(var(--v-theme-primary), 0.2) !important;
}

.author-card:hover {
  box-shadow: 0 16px 40px rgba(var(--v-theme-secondary), 0.2) !important;
}

/* Top accent line */
.role-card-accent {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
}

.player-accent {
  background: linear-gradient(
    90deg,
    rgb(var(--v-theme-primary)),
    rgb(var(--v-theme-info))
  );
}

.author-accent {
  background: linear-gradient(
    90deg,
    rgb(var(--v-theme-secondary)),
    rgb(var(--v-theme-success))
  );
}

/* Panduan gallery */
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
