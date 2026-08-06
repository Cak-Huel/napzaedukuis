<template>
  <v-container class="login-page fill-height" fluid>
    <!-- Background decoration -->
    <div class="bg-decoration">
      <div class="bg-circle bg-circle--1" />
      <div class="bg-circle bg-circle--2" />
      <div class="bg-circle bg-circle--3" />
    </div>

    <v-row align="center" justify="center" class="fill-height">
      <v-col cols="12" sm="8" md="5" lg="4" xl="3">
        <!-- Login Card -->
        <v-card class="login-card pa-2" elevation="8">
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
                {{ t("login_title") }}
              </h1>
              <p class="text-body-2 text-medium-emphasis mt-1">
                {{ t("login_subtitle") }}
              </p>
            </div>

            <!-- Login Form -->
            <v-form
              ref="formRef"
              v-model="formValid"
              @submit.prevent="handleLogin"
              lazy-validation
            >
              <v-text-field
                v-model="email"
                :label="t('email_label')"
                :placeholder="t('email_placeholder')"
                type="email"
                prepend-inner-icon="mdi-email-outline"
                :rules="emailRules"
                :disabled="authStore.loading"
                autocomplete="email"
                class="mb-1"
              />

              <v-text-field
                v-model="password"
                :label="t('password_label')"
                :placeholder="t('password_placeholder')"
                :type="showPassword ? 'text' : 'password'"
                prepend-inner-icon="mdi-lock-outline"
                :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                :rules="passwordRules"
                :disabled="authStore.loading"
                autocomplete="current-password"
                class="mb-2"
                @click:append-inner="showPassword = !showPassword"
              />

              <v-btn
                type="submit"
                color="primary"
                size="large"
                block
                :loading="authStore.loading"
                :disabled="!formValid"
                class="mt-2 login-btn text-none"
                elevation="2"
              >
                <v-icon start>mdi-login</v-icon>
                {{ t("login_button") }}
              </v-btn>
            </v-form>

            <!-- Resend verification for unverified accounts -->
            <v-btn
              v-if="showResendBtn"
              color="secondary"
              variant="outlined"
              size="large"
              block
              :loading="resending"
              class="mt-3 text-none"
              elevation="1"
              @click="handleResendVerification"
            >
              <v-icon start>mdi-email-send-outline</v-icon>
              {{ t("resend_verification_btn") }}
            </v-btn>

            <!-- Divider -->
            <div class="d-flex align-center my-5">
              <v-divider />
            </div>

            <!-- Register link -->
            <div class="text-center">
              <span class="text-body-2 text-medium-emphasis">
                {{ t("no_account_text") }}
              </span>
              <router-link
                to="/register"
                class="text-body-2 font-weight-bold text-primary text-decoration-none ms-1"
              >
                {{ t("register_link") }}
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
      :timeout="4000"
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
import { ref, computed, watch, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { API_URL } from "@/config";

const { t, locale } = useI18n();
const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

// Form state
const formRef = ref();
const formValid = ref(false);
const email = ref("");
const password = ref("");
const showPassword = ref(false);

// Language switcher
const currentLocale = computed({
  get: () => locale.value,
  set: (val: string) => {
    locale.value = val;
  },
});

// Snackbar
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
const emailRules = [
  (v: string) => !!v || t("validation_required", { field: t("email_label") }),
  (v: string) => /.+@.+\..+/.test(v) || t("validation_email"),
];

const passwordRules = [
  (v: string) =>
    !!v || t("validation_required", { field: t("password_label") }),
  (v: string) =>
    v.length >= 3 ||
    t("validation_min_length", { field: t("password_label"), min: 3 }),
];

// Login handler
async function handleLogin() {
  const { valid } = await formRef.value.validate();
  if (!valid) return;

  try {
    const data = await authStore.login(email.value, password.value);

    showNotification(
      t("login_success", { name: data.user.nama }),
      "success",
      "mdi-check-circle",
    );

    // Redirect berdasarkan role setelah 800ms
    setTimeout(() => {
      if (data.user.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/");
      }
    }, 800);
  } catch (error: any) {
    if (error.requiresVerification) {
      showResendBtn.value = true;
      unverifiedEmail.value = error.email || email.value;
    }
    showNotification(
      error.message || t("login_error_server"),
      "error",
      "mdi-alert-circle",
    );
  }
}

// Resend verification email handler
const showResendBtn = ref(false);
const unverifiedEmail = ref("");
const resending = ref(false);

async function handleResendVerification() {
  if (!unverifiedEmail.value) return;
  resending.value = true;
  try {
    const res = await fetch(`${API_URL}/auth/resend-verification`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: unverifiedEmail.value }),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      showNotification(
        data.message || t("registration_success_desc"),
        "success",
        "mdi-email-check",
      );
      showResendBtn.value = false;

      // If we got a preview URL in console/response (Ethereal test mode)
      if (data.preview_url) {
        console.log(`✉️ Test email link: ${data.preview_url}`);
        window.open(data.preview_url, "_blank");
      }
    } else {
      showNotification(
        data.message || t("login_error_server"),
        "error",
        "mdi-alert-circle",
      );
    }
  } catch (err) {
    showNotification(t("login_error_server"), "error", "mdi-alert-circle");
  } finally {
    resending.value = false;
  }
}

// Navigate back
function goBack() {
  router.push("/");
}

// Check for registration success query param
onMounted(() => {
  if (route.query.registered === "true") {
    showNotification(t("register_success"), "success", "mdi-check-circle");
    // Clean URL
    router.replace({ query: {} });
  }

  // If already logged in, redirect
  if (authStore.isLoggedIn) {
    router.push("/");
  }
});
</script>

<style scoped>
.login-page {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
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

@keyframes float {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  25% {
    transform: translate(30px, -30px) scale(1.05);
  }
  50% {
    transform: translate(-20px, 20px) scale(0.95);
  }
  75% {
    transform: translate(15px, 10px) scale(1.02);
  }
}

/* Card styling */
.login-card {
  position: relative;
  z-index: 1;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(var(--v-theme-primary), 0.08);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.login-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12) !important;
}

/* Logo avatar */
.logo-avatar {
  background: rgba(var(--v-theme-primary), 0.1);
  padding: 8px;
  border: 2px solid rgba(var(--v-theme-primary), 0.15);
}

/* Login button */
.login-btn {
  font-weight: 600;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
}

.login-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(var(--v-theme-primary), 0.35) !important;
}

/* Language toggle */
.lang-toggle {
  background: rgba(var(--v-theme-surface), 0.8);
  backdrop-filter: blur(8px);
}
</style>
