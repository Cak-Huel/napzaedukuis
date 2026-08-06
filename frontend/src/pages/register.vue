<template>
  <v-container class="register-page fill-height" fluid>
    <!-- Background decoration -->
    <div class="bg-decoration">
      <div class="bg-circle bg-circle--1" />
      <div class="bg-circle bg-circle--2" />
      <div class="bg-circle bg-circle--3" />
    </div>

    <v-row align="center" justify="center" class="fill-height">
      <v-col cols="12" sm="8" md="5" lg="4" xl="3">
        <!-- Register Card -->
        <v-card class="register-card pa-2" elevation="8">
          <v-card-text class="pa-6 pa-sm-8">
            <!-- Back button -->
            <div class="d-flex justify-space-between">
              <v-btn
                icon
                variant="text"
                size="small"
                class="mb-2"
                :aria-label="t('back_button')"
                @click="goBack"
              >
                <v-icon>mdi-arrow-left</v-icon>
              </v-btn>
              <!-- Language Switcher -->
              <v-btn-toggle
                v-model="currentLocale"
                mandatory
                density="compact"
                rounded="lg"
                color="primary"
                class="lang-toggle"
              >
                <v-btn value="id" size="small" class="text-none"> 🇮🇩 ID </v-btn>
                <v-btn value="en" size="small" class="text-none"> 🇬🇧 EN </v-btn>
              </v-btn-toggle>
            </div>

            <!-- Logo & Title -->
            <div class="text-center mb-6">
              <v-avatar size="72" class="mb-4 logo-avatar">
                <v-img src="/logo1.png" alt="Napza Edu Card Logo" />
              </v-avatar>
              <h1 class="text-h5 font-weight-bold text-primary">
                {{ t("register_title") }}
              </h1>
              <p class="text-body-2 text-medium-emphasis mt-1">
                {{ t("register_subtitle") }}
              </p>
            </div>

            <!-- Registration Success Info State -->
            <div v-if="isSuccess" class="text-center py-4">
              <v-avatar color="success" size="64" class="mb-4">
                <v-icon size="36" color="white">mdi-email-check-outline</v-icon>
              </v-avatar>
              <h3 class="text-h6 font-weight-bold text-success mb-2">
                Registrasi Berhasil!
              </h3>
              <p class="text-body-2 text-medium-emphasis mb-6">
                {{ t("registration_success_desc") }}
              </p>

              <!-- Ethereal Email Preview URL button for development/testing -->
              <v-btn
                v-if="previewUrl"
                color="success"
                variant="flat"
                block
                class="mb-4 text-none font-weight-bold"
                size="large"
                @click="openMailPreview"
              >
                <v-icon start>mdi-open-in-new</v-icon>
                Buka Email Simulasi (Ethereal)
              </v-btn>

              <v-btn
                color="primary"
                variant="flat"
                block
                size="large"
                class="text-none font-weight-bold"
                @click="goToLogin"
              >
                <v-icon start>mdi-login</v-icon>
                Ke Halaman Login
              </v-btn>
            </div>

            <!-- Registration Form -->
            <v-form
              v-else
              ref="formRef"
              v-model="formValid"
              @submit.prevent="handleRegister"
              lazy-validation
            >
              <v-text-field
                v-model="nama"
                :label="t('full_name_label')"
                :placeholder="t('full_name_placeholder')"
                type="text"
                prepend-inner-icon="mdi-account-outline"
                :rules="nameRules"
                :disabled="loading"
                class="mb-1"
                required
              />

              <v-text-field
                v-model="email"
                :label="t('email_label')"
                :placeholder="t('email_placeholder')"
                type="email"
                prepend-inner-icon="mdi-email-outline"
                :rules="emailRules"
                :disabled="loading"
                autocomplete="email"
                class="mb-1"
                required
              />

              <v-text-field
                v-model="password"
                :label="t('password_label')"
                :placeholder="t('password_placeholder')"
                :type="showPassword ? 'text' : 'password'"
                prepend-inner-icon="mdi-lock-outline"
                :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                :rules="passwordRules"
                :disabled="loading"
                autocomplete="new-password"
                class="mb-1"
                required
                @click:append-inner="showPassword = !showPassword"
              />

              <v-text-field
                v-model="confirmPassword"
                :label="t('confirm_password_label')"
                :placeholder="t('confirm_password_placeholder')"
                :type="showConfirmPassword ? 'text' : 'password'"
                prepend-inner-icon="mdi-lock-check-outline"
                :append-inner-icon="
                  showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye'
                "
                :rules="confirmPasswordRules"
                :disabled="loading"
                autocomplete="new-password"
                class="mb-3"
                required
                @click:append-inner="showConfirmPassword = !showConfirmPassword"
              />

              <v-btn
                type="submit"
                color="primary"
                size="large"
                block
                :loading="loading"
                :disabled="!formValid"
                class="mt-2 register-btn text-none"
                elevation="2"
              >
                <v-icon start>mdi-account-plus-outline</v-icon>
                {{ t("register_link") }}
              </v-btn>
            </v-form>

            <!-- Divider -->
            <div v-if="!isSuccess" class="d-flex align-center my-5">
              <v-divider />
            </div>

            <!-- Login link -->
            <div v-if="!isSuccess" class="text-center">
              <span class="text-body-2 text-medium-emphasis">
                {{ t("already_have_account_text") }}
              </span>
              <router-link
                to="/login"
                class="text-body-2 font-weight-bold text-primary text-decoration-none ms-1"
              >
                {{ t("login_link") }}
              </router-link>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Snackbar notifications -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="5000"
      location="top"
      rounded="lg"
    >
      <div class="d-flex align-center">
        <v-icon class="me-2">{{ snackbar.icon }}</v-icon>
        {{ snackbar.text }}
      </div>
      <template #actions>
        <v-btn variant="text" @click="snackbar.show = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { API_URL } from "@/config";

const { t, locale } = useI18n();
const router = useRouter();
const authStore = useAuthStore();

// Form states
const formRef = ref();
const formValid = ref(false);
const nama = ref("");
const email = ref("");
const password = ref("");
const confirmPassword = ref("");

const showPassword = ref(false);
const showConfirmPassword = ref(false);
const loading = ref(false);
const isSuccess = ref(false);
const previewUrl = ref("");

// Language Switcher
const currentLocale = computed({
  get: () => locale.value,
  set: (val: string) => {
    locale.value = val;
  },
});

// Snackbar State
const snackbar = ref({
  show: false,
  text: "",
  color: "success",
  icon: "mdi-check-circle",
});

function showNotification(
  text: string,
  color = "success",
  icon = "mdi-check-circle",
) {
  snackbar.value = { show: true, text, color, icon };
}

// Validation rules
const nameRules = [
  (v: string) =>
    !!v || t("validation_required", { field: t("full_name_label") }),
  (v: string) =>
    v.length >= 3 ||
    t("validation_min_length", { field: t("full_name_label"), min: 3 }),
];

const emailRules = [
  (v: string) => !!v || t("validation_required", { field: t("email_label") }),
  (v: string) => /.+@.+\..+/.test(v) || t("validation_email"),
];

const passwordRules = [
  (v: string) =>
    !!v || t("validation_required", { field: t("password_label") }),
  (v: string) =>
    v.length >= 6 ||
    t("validation_min_length", { field: t("password_label"), min: 6 }),
];

const confirmPasswordRules = [
  (v: string) =>
    !!v || t("validation_required", { field: t("confirm_password_label") }),
  (v: string) => v === password.value || "Password tidak sama.",
];

// Register Form handler
async function handleRegister() {
  const { valid } = await formRef.value.validate();
  if (!valid) return;

  loading.value = true;
  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nama: nama.value,
        email: email.value,
        password: password.value,
      }),
    });

    const data = await res.json();

    if (res.ok && data.success) {
      isSuccess.value = true;
      previewUrl.value = data.preview_url || "";
      showNotification(data.message, "success", "mdi-email-check");
    } else {
      showNotification(
        data.message || "Registrasi gagal.",
        "error",
        "mdi-alert-circle",
      );
    }
  } catch (error) {
    showNotification(t("login_error_server"), "error", "mdi-alert-circle");
  } finally {
    loading.value = false;
  }
}

// Navigation helpers
function goBack() {
  router.push("/login");
}

function goToLogin() {
  router.push("/login");
}

function openMailPreview() {
  if (previewUrl.value) {
    window.open(previewUrl.value, "_blank");
  }
}

onMounted(() => {
  if (authStore.isLoggedIn) {
    router.push("/");
  }
});
</script>

<style scoped>
.register-page {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
}

/* Animated background circles matching login.vue design */
.bg-decoration {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

.bg-circle {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.12;
}

.bg-circle--1 {
  width: 350px;
  height: 350px;
  background: rgb(var(--v-theme-primary));
  top: -50px;
  left: -50px;
  animation: float-slow 15s infinite ease-in-out;
}

.bg-circle--2 {
  width: 400px;
  height: 400px;
  background: rgb(var(--v-theme-secondary));
  bottom: -100px;
  right: -50px;
  animation: float-slow 18s infinite ease-in-out reverse;
}

.bg-circle--3 {
  width: 250px;
  height: 250px;
  background: rgb(var(--v-theme-info));
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: float-slow 22s infinite ease-in-out;
}

@keyframes float-slow {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  50% {
    transform: translate(25px, -35px) scale(1.08);
  }
}

.register-card {
  position: relative;
  z-index: 1;
  background: rgba(var(--v-theme-surface), 0.8) !important;
  backdrop-filter: blur(16px);
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08) !important;
  border-radius: 24px !important;
}

.logo-avatar {
  background: rgba(var(--v-theme-primary), 0.05);
  padding: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.register-btn {
  font-weight: 700;
  letter-spacing: 0.5px;
  transition: transform 0.2s ease;
}

.register-btn:hover:not(:disabled) {
  transform: translateY(-2px);
}

.lang-toggle {
  background: rgba(var(--v-theme-surface), 0.6);
  backdrop-filter: blur(8px);
}
</style>
