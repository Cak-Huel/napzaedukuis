<template>
  <v-layout class="app-layout">
    <!-- App Bar / Navbar -->
    <v-app-bar
      color="primary"
      density="comfortable"
      elevation="2"
      style="padding-left: 25px; padding-right: 25px"
    >
      <!-- Logo & Title -->
      <template #prepend style="margin: 25px auto">
        <div class="d-flex align-center" style="gap: 10px">
          <!-- If not in active game, render router-link to "/" -->
          <!-- If not in active game or admin, render router-link to "/" -->
          <router-link
            v-if="!isGamePath && !hideNavMenus"
            to="/"
            class="d-flex align-center text-decoration-none"
            style="gap: 10px"
          >
            <v-avatar size="36" rounded="lg">
              <v-img src="/logo.png" alt="Logo" />
            </v-avatar>
            <span class="text-h6 font-weight-bold text-white d-none d-sm-block">
              {{ t("app_title") }}
            </span>
          </router-link>
          <!-- If in active game or admin, render static layout without link -->
          <div v-else class="d-flex align-center text-white" style="gap: 10px">
            <v-avatar size="36" rounded="lg">
              <v-img src="/logo.png" alt="Logo" />
            </v-avatar>
            <span class="text-h6 font-weight-bold text-white d-none d-sm-block">
              {{ t("app_title") }}
            </span>
          </div>
        </div>
      </template>

      <!-- Desktop menu -->
      <template #default>
        <div class="d-none d-md-flex align-center ms-auto" style="gap: 4px">
          <v-btn
            v-if="!isGamePath && !hideNavMenus"
            variant="text"
            color="white"
            class="text-none"
            @click="$router.push('/')"
          >
            {{ t("home_menu") }}
          </v-btn>
          <v-btn
            v-if="!hideNavMenus"
            variant="text"
            color="white"
            class="text-none"
            @click="showMateri = true"
          >
            {{ t("material_menu") }}
          </v-btn>
          <v-btn
            v-if="!hideNavMenus"
            variant="text"
            color="white"
            class="text-none"
            @click="showPanduan = true"
          >
            {{ t("guidance_menu") }}
          </v-btn>
          <v-btn
            v-if="!hideNavMenus"
            variant="text"
            color="white"
            class="text-none"
            @click="showTentang = true"
          >
            {{ t("about_menu") }}
          </v-btn>

          <!-- Language switcher -->
          <v-btn-toggle
            v-model="currentLocale"
            mandatory
            density="compact"
            rounded="lg"
            class="ms-2"
            style="background: rgba(255, 255, 255, 0.15)"
          >
            <v-btn
              value="id"
              size="x-small"
              class="text-none text-white"
              variant="text"
            >
              🇮🇩
            </v-btn>
            <v-btn
              value="en"
              size="x-small"
              class="text-none text-white"
              variant="text"
            >
              🇬🇧
            </v-btn>
          </v-btn-toggle>

          <!-- Auth buttons -->
          <v-btn
            v-if="!authStore.isLoggedIn"
            variant="tonal"
            color="white"
            class="text-none ms-2"
            rounded="xl"
            size="small"
            @click="$router.push('/login')"
          >
            <v-icon start size="small">mdi-login</v-icon>
            {{ t("login_button") }}
          </v-btn>

          <v-menu v-else location="bottom end">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                variant="tonal"
                color="white"
                class="text-none ms-2"
                rounded="xl"
                size="small"
              >
                <v-icon start size="small">mdi-account-circle</v-icon>
                {{ authStore.userName }}
              </v-btn>
            </template>
            <v-list density="compact" rounded="lg">
              <v-list-item
                prepend-icon="mdi-account"
                :title="t('profile_menu')"
                @click="openProfileDialog"
              />
              <v-divider />
              <v-list-item
                prepend-icon="mdi-logout"
                :title="t('logout_menu')"
                @click="handleLogout"
              />
            </v-list>
          </v-menu>
        </div>

        <!-- Mobile hamburger -->
        <v-app-bar-nav-icon
          class="d-md-none ms-auto"
          color="white"
          @click="drawer = !drawer"
        />
      </template>
    </v-app-bar>

    <!-- Mobile Navigation Drawer -->
    <v-navigation-drawer
      v-model="drawer"
      location="right"
      temporary
      class="d-md-none"
    >
      <v-list density="compact" nav>
        <v-list-item
          v-if="!isGamePath && !hideNavMenus"
          prepend-icon="mdi-home"
          :title="t('home_menu')"
          @click="
            drawer = false;
            $router.push('/');
          "
        />
        <v-list-item
          v-if="!hideNavMenus"
          prepend-icon="mdi-book-open-variant"
          :title="t('material_menu')"
          @click="
            drawer = false;
            showMateri = true;
          "
        />
        <v-list-item
          v-if="!hideNavMenus"
          prepend-icon="mdi-compass"
          :title="t('guidance_menu')"
          @click="
            drawer = false;
            showPanduan = true;
          "
        />
        <v-list-item
          v-if="!hideNavMenus"
          prepend-icon="mdi-information"
          :title="t('about_menu')"
          @click="
            drawer = false;
            showTentang = true;
          "
        />

        <v-divider class="my-2" />

        <!-- Language -->
        <v-list-subheader>Language</v-list-subheader>
        <v-list-item>
          <v-btn-toggle
            v-model="currentLocale"
            mandatory
            density="compact"
            rounded="lg"
            color="primary"
          >
            <v-btn value="id" size="small" class="text-none">🇮🇩 ID</v-btn>
            <v-btn value="en" size="small" class="text-none">🇬🇧 EN</v-btn>
          </v-btn-toggle>
        </v-list-item>

        <v-divider class="my-2" />

        <!-- Auth -->
        <v-list-item
          v-if="!authStore.isLoggedIn"
          prepend-icon="mdi-login"
          title="Login"
          @click="
            drawer = false;
            $router.push('/login');
          "
        />
        <template v-else>
          <v-list-item
            prepend-icon="mdi-account"
            :title="t('profile_menu')"
            @click="
              drawer = false;
              openProfileDialog();
            "
          />
          <v-list-item
            prepend-icon="mdi-logout"
            :title="t('logout_menu')"
            @click="
              drawer = false;
              handleLogout();
            "
          />
        </template>
      </v-list>
    </v-navigation-drawer>

    <!-- Page Content -->
    <v-main>
      <slot />
    </v-main>

    <!-- Footer -->
    <v-footer app color="surface-variant" class="justify-center">
      <span class="text-body-2 text-medium-emphasis">
        {{ t("footer_text") }}
      </span>
    </v-footer>

    <!-- ===== SHARED DIALOGS ===== -->

    <!-- Panduan Dialog -->
    <v-dialog v-model="showPanduan" max-width="700">
      <v-card rounded="xl">
        <v-card-title class="d-flex align-center pa-4">
          <v-icon color="primary" class="me-2">mdi-compass</v-icon>
          {{ t("guidance_title") }}
          <v-spacer />
          <v-btn icon variant="text" size="small" @click="showPanduan = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-divider />
        <v-card-text class="pa-4">
          <v-carousel
            :show-arrows="showNavArrows"
            hide-delimiter-background
            :height="posterHeight"
          >
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
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Materi Dialog -->
    <v-dialog v-model="showMateri" max-width="520" scrollable>
      <v-card rounded="xl">
        <v-card-title class="d-flex align-center pa-4">
          <v-icon color="primary" class="me-2">mdi-book-open-variant</v-icon>
          {{ t("material_title") }}
          <v-spacer />
          <v-btn icon variant="text" size="small" @click="showMateri = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-divider />
        <v-card-text class="pa-4" style="max-height: 70vh">
          <v-img
            v-for="i in 21"
            :key="i"
            :src="`/materi/${i}.jpg`"
            :alt="`Materi ${i}`"
            class="mb-3 rounded-lg"
          />
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Tentang Dialog -->
    <v-dialog v-model="showTentang" max-width="480">
      <v-card rounded="xl">
        <v-card-title class="d-flex align-center pa-4">
          <v-icon color="primary" class="me-2">mdi-information</v-icon>
          {{ t("about_title") }}
          <v-spacer />
          <v-btn icon variant="text" size="small" @click="showTentang = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-divider />
        <v-card-text class="pa-5">
          <div class="text-center mb-4">
            <v-img
              src="/fot.jpg"
              alt="Team Photo"
              class="rounded-xl mx-auto"
              max-width="360"
              cover
            />
          </div>
          <p class="text-body-2 mb-3" style="text-align: justify">
            {{ t("about_text_1") }}
          </p>
          <p class="text-body-2 mb-3" style="text-align: justify">
            {{ t("about_text_2") }}
          </p>
          <p class="text-body-2 mb-3" style="text-align: justify">
            {{ t("about_text_3") }}
          </p>
          <p class="text-body-2 mb-4" style="text-align: justify">
            {{ t("about_text_4") }}
          </p>
          <v-divider class="mb-3" />
          <p class="text-body-2">
            {{ t("about_feedback") }}<br />
            <a
              href="https://instagram.com/rafiamrullah._"
              target="_blank"
              class="text-primary font-weight-bold text-decoration-none"
            >
              @rafiamrullah._
            </a>
          </p>
          <p class="text-caption text-medium-emphasis mt-2">
            {{ t("about_version") }}
          </p>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Profile Dialog -->
    <v-dialog v-model="showProfile" max-width="500" persistent>
      <v-card rounded="xl">
        <v-card-title class="d-flex align-center pa-4 border-b">
          <v-icon color="primary" class="me-2">mdi-account-circle</v-icon>
          <span class="font-weight-bold">Profil Pengguna</span>
          <v-spacer />
          <v-btn
            icon
            variant="text"
            size="small"
            @click="showProfile = false"
            :disabled="isSavingPassword"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="pa-4 pa-sm-6">
          <!-- User Details Info -->
          <div class="mb-5 pa-4 border rounded-xl bg-surface-light">
            <div class="d-flex align-center mb-3">
              <v-avatar color="primary" size="48" variant="tonal" class="me-3">
                <v-icon size="24">mdi-account</v-icon>
              </v-avatar>
              <div>
                <h3 class="text-subtitle-1 font-weight-bold leading-tight">
                  {{ authStore.userName }}
                </h3>
                <span class="text-caption text-medium-emphasis">{{
                  authStore.user?.email || "Email belum dimuat"
                }}</span>
              </div>
            </div>
          </div>

          <v-divider class="my-4" />

          <!-- Change Password Form -->
          <h4 class="text-subtitle-2 font-weight-bold mb-3">
            <v-icon start size="18" color="primary">mdi-lock-reset</v-icon> Ubah
            Password
          </h4>

          <v-alert
            v-if="profileAlert.show"
            :type="profileAlert.type"
            variant="tonal"
            density="comfortable"
            class="mb-4 text-body-2"
            closable
            @click:close="profileAlert.show = false"
          >
            {{ profileAlert.text }}
          </v-alert>

          <v-form
            ref="passwordFormRef"
            v-model="passwordFormValid"
            lazy-validation
          >
            <v-text-field
              v-model="passwordForm.oldPassword"
              label="Password Lama"
              placeholder="Masukkan password saat ini"
              variant="outlined"
              density="comfortable"
              :type="showOldPw ? 'text' : 'password'"
              :append-inner-icon="showOldPw ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="showOldPw = !showOldPw"
              :rules="[(v: string) => !!v || 'Password lama wajib diisi.']"
              required
              class="mb-2"
            />

            <v-text-field
              v-model="passwordForm.newPassword"
              label="Password Baru"
              placeholder="Minimal 6 karakter"
              variant="outlined"
              density="comfortable"
              :type="showNewPw ? 'text' : 'password'"
              :append-inner-icon="showNewPw ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="showNewPw = !showNewPw"
              :rules="[
                (v: string) => !!v || 'Password baru wajib diisi.',
                (v: string) =>
                  v.length >= 6 || 'Password baru minimal 6 karakter.',
              ]"
              required
              class="mb-2"
            />

            <v-text-field
              v-model="passwordForm.confirmPassword"
              label="Konfirmasi Password Baru"
              placeholder="Ulangi password baru"
              variant="outlined"
              density="comfortable"
              :type="showConfirmPw ? 'text' : 'password'"
              :append-inner-icon="showConfirmPw ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="showConfirmPw = !showConfirmPw"
              :rules="[
                (v: string) => !!v || 'Konfirmasi password wajib diisi.',
                (v: string) =>
                  v === passwordForm.newPassword ||
                  'Konfirmasi password tidak cocok.',
              ]"
              required
            />
          </v-form>
        </v-card-text>

        <v-card-actions
          class="pa-4 border-t d-flex justify-space-between align-center"
        >
          <v-btn
            color="error"
            variant="tonal"
            rounded="lg"
            class="text-none font-weight-bold"
            prepend-icon="mdi-logout"
            :disabled="isSavingPassword"
            @click="
              showProfile = false;
              handleLogout();
            "
          >
            Logout
          </v-btn>
          <div class="d-flex ga-2">
            <v-btn
              variant="text"
              rounded="lg"
              class="text-none font-weight-bold"
              @click="showProfile = false"
              :disabled="isSavingPassword"
            >
              Batal
            </v-btn>
            <v-btn
              color="primary"
              variant="flat"
              rounded="lg"
              class="text-none font-weight-bold px-4"
              :loading="isSavingPassword"
              :disabled="!passwordFormValid"
              @click="saveNewPassword"
            >
              Simpan Sandi
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script lang="ts" setup>
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter, useRoute } from "vue-router";
import { useDisplay } from "vuetify";
import { useAuthStore } from "@/stores/auth";

const { t, locale } = useI18n();
const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const { xs, smAndDown } = useDisplay();

// Dialog open states
const showPanduan = ref(false);
const showMateri = ref(false);
const showTentang = ref(false);
const showProfile = ref(false);

// Change Password Form state
const passwordFormRef = ref();
const passwordFormValid = ref(false);
const isSavingPassword = ref(false);

const showOldPw = ref(false);
const showNewPw = ref(false);
const showConfirmPw = ref(false);

const passwordForm = ref({
  oldPassword: "",
  newPassword: "",
  confirmPassword: "",
});

const profileAlert = ref({
  show: false,
  text: "",
  type: "success" as "success" | "error" | "info" | "warning",
});

function openProfileDialog() {
  showProfile.value = true;
  passwordForm.value = {
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  };
  profileAlert.value = {
    show: false,
    text: "",
    type: "success",
  };
  showOldPw.value = false;
  showNewPw.value = false;
  showConfirmPw.value = false;
  if (passwordFormRef.value) {
    passwordFormRef.value.resetValidation();
  }
}

import { API_URL } from "@/config";

async function saveNewPassword() {
  const { valid } = await passwordFormRef.value.validate();
  if (!valid) return;

  isSavingPassword.value = true;
  profileAlert.value.show = false;

  try {
    const res = await fetch(`${API_URL}/auth/profile/password`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authStore.token}`,
      },
      body: JSON.stringify({
        oldPassword: passwordForm.value.oldPassword,
        newPassword: passwordForm.value.newPassword,
      }),
    });

    const data = await res.json();

    if (res.ok && data.success) {
      profileAlert.value = {
        show: true,
        text: data.message || "Sandi berhasil diperbarui.",
        type: "success",
      };
      passwordForm.value = {
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      };
      if (passwordFormRef.value) {
        passwordFormRef.value.resetValidation();
      }
    } else {
      profileAlert.value = {
        show: true,
        text: data.message || "Gagal memperbarui sandi.",
        type: "error",
      };
    }
  } catch (err) {
    console.error("Save password error:", err);
    profileAlert.value = {
      show: true,
      text: "Terjadi kesalahan jaringan atau server.",
      type: "error",
    };
  } finally {
    isSavingPassword.value = false;
  }
}

// Responsive heights for carousels
const posterHeight = computed(() => {
  if (xs.value) return 380; // Mobile
  if (smAndDown.value) return 480; // Tablet
  return 550; // Desktop
});

// Show navigation arrows only on desktop (hide on xs/sm screen sizes)
const showNavArrows = computed(() => {
  return !smAndDown.value;
});

const isGamePath = computed(() => {
  const path = route.path;
  const gamePaths = [
    "/multiplayer/waiting",
    "/multiplayer/gameroom",
    "/multiplayer/quest",
    "/multiplayer/participant",
    "/multiplayer/scoreboard",
    "/multiplayer/score",
  ];
  return gamePaths.some((p) => path.startsWith(p));
});

const hideNavMenus = computed(() => {
  return authStore.user?.role === "admin";
});

const drawer = ref(false);

const currentLocale = computed({
  get: () => locale.value,
  set: (val: string) => {
    locale.value = val;
  },
});

function handleLogout() {
  authStore.logout();
  router.push("/");
}
</script>
