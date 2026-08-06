<template>
  <AppLayout @open-modal="openModal">
    <v-container class="quest-page py-6">
      <!-- Top Header & Info Card -->
      <v-card class="mb-6 border" rounded="xl" elevation="2">
        <v-card-text
          class="d-flex flex-wrap align-center justify-space-between pa-4 pa-sm-6 ga-4"
        >
          <div class="d-flex align-center ga-3">
            <v-btn
              icon
              variant="text"
              size="small"
              @click="$router.push('/multiplayer/selection')"
            >
              <v-icon>mdi-arrow-left</v-icon>
            </v-btn>
            <div>
              <div class="d-flex align-center ga-2">
                <h1 class="text-h5 font-weight-bold text-primary mb-0">
                  {{ roomDetails?.nama_room || t("quest_page_title") }}
                </h1>
                <v-chip
                  color="primary"
                  variant="tonal"
                  size="small"
                  class="font-weight-bold"
                >
                  Kode: {{ roomCode }}
                </v-chip>
              </div>
              <p class="text-caption text-medium-emphasis mb-0 mt-1">
                {{ questions.length }} {{ t("question_count_label") }}
              </p>
            </div>
          </div>

          <!-- Actions -->
          <div class="d-flex flex-wrap ga-2">
            <v-btn
              color="info"
              variant="outlined"
              rounded="lg"
              class="text-none"
              @click="openBankModal"
            >
              <v-icon start>mdi-database</v-icon>
              {{ t("bank_soal_button") }}
            </v-btn>
            <v-btn
              color="primary"
              variant="flat"
              rounded="lg"
              class="text-none"
              @click="openAddDialog"
            >
              <v-icon start>mdi-plus</v-icon>
              {{ t("add_question_button") }}
            </v-btn>
            <v-btn
              color="success"
              variant="flat"
              rounded="lg"
              class="text-none font-weight-bold"
              :disabled="questions.length === 0"
              @click="handleStartGame"
            >
              <v-icon start>mdi-play-circle</v-icon>
              {{ t("start_button") }}
            </v-btn>
          </div>
        </v-card-text>
      </v-card>

      <!-- Loading State -->
      <div v-if="isLoading" class="text-center py-12">
        <v-progress-circular indeterminate color="primary" size="48" />
        <p class="text-body-2 text-medium-emphasis mt-3">{{ t("loading") }}</p>
      </div>

      <!-- Empty State -->
      <v-card
        v-else-if="questions.length === 0"
        class="text-center py-12 border-dashed"
        rounded="xl"
        variant="outlined"
      >
        <v-icon size="64" color="medium-emphasis" class="mb-3"
          >mdi-clipboard-text-outline</v-icon
        >
        <h3 class="text-h6 font-weight-bold mb-1">
          {{ t("no_questions_yet") }}
        </h3>
        <p class="text-body-2 text-medium-emphasis mb-4">
          Tambahkan pertanyaan manual atau gunakan Bank Soal untuk mengimpor
          kuis.
        </p>
        <div class="d-flex justify-center ga-3">
          <v-btn
            color="info"
            variant="outlined"
            rounded="lg"
            class="text-none"
            @click="openBankModal"
          >
            <v-icon start>mdi-database</v-icon>
            {{ t("bank_soal_button") }}
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            rounded="lg"
            class="text-none"
            @click="openAddDialog"
          >
            <v-icon start>mdi-plus</v-icon>
            {{ t("add_question_button") }}
          </v-btn>
        </div>
      </v-card>

      <!-- Questions List -->
      <div v-else class="questions-list">
        <v-card
          v-for="(q, index) in questions"
          :key="q.id_soalmlt"
          class="mb-4 border position-relative"
          rounded="xl"
          elevation="1"
        >
          <!-- Absolute Badge-->
          <v-chip
            color="secondary"
            size="x-small"
            variant="outlined"
            class="position-absolute"
            style="top: 12px; right: 25px"
          >
            Skor: {{ q.skor }}
          </v-chip>

          <v-card-text class="pa-4 pa-sm-6">
            <!-- Question header & title -->
            <div
              class="d-flex align-start mb-3 ga-3"
              style="text-align: justify"
            >
              <div class="d-flex align-center ga-2">
                <v-avatar
                  color="primary"
                  variant="tonal"
                  size="28"
                  class="font-weight-bold text-caption"
                >
                  {{ index + 1 }}
                </v-avatar>
                <h3 class="text-subtitle-1 font-weight-bold mb-0">
                  {{ q.pertanyaan }}
                </h3>
              </div>
            </div>

            <!-- Optional Image -->
            <div v-if="q.gambar" class="my-3">
              <v-img
                :src="getImageUrl(q.gambar)"
                max-width="300"
                max-height="200"
                class="rounded-lg border"
                cover
              />
            </div>

            <!-- Options Grid -->
            <v-row class="mt-2 ga-0">
              <v-col
                v-for="optKey in ['A', 'B', 'C', 'D']"
                :key="optKey"
                cols="12"
                sm="6"
                class="pa-1"
              >
                <div
                  class="option-box pa-3 rounded-lg border d-flex align-center justify-space-between"
                  :class="{ 'option-correct': q.jwbn_benar === optKey }"
                >
                  <span class="text-body-2">
                    <strong class="me-2">{{ optKey }}.</strong>
                    {{ getOptionText(q, optKey) }}
                  </span>
                  <v-chip
                    v-if="q.jwbn_benar === optKey"
                    color="success"
                    size="x-small"
                    variant="flat"
                    class="font-weight-bold"
                  >
                    ✓
                  </v-chip>
                </div>
              </v-col>
            </v-row>

            <!-- Actions Bar -->
            <div class="d-flex justify-end ga-2 mt-4 pt-3 border-t">
              <v-btn
                color="error"
                variant="text"
                size="small"
                class="text-none"
                @click="confirmDelete(q)"
              >
                <v-icon start size="small">mdi-delete-outline</v-icon>
                {{ t("delete_button") }}
              </v-btn>
              <v-btn
                color="primary"
                variant="tonal"
                size="small"
                class="text-none"
                @click="openEditDialog(q)"
              >
                <v-icon start size="small">mdi-pencil-outline</v-icon>
                {{ t("edit_button") }}
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </div>
    </v-container>

    <!-- ===== DIALOG: ADD / EDIT QUESTION ===== -->
    <v-dialog
      v-model="questionDialog.show"
      max-width="640"
      persistent
      scrollable
    >
      <v-card rounded="xl">
        <v-card-title class="d-flex align-center pa-4">
          <v-icon color="primary" class="me-2">
            {{ questionDialog.isEdit ? "mdi-pencil" : "mdi-plus-circle" }}
          </v-icon>
          {{
            questionDialog.isEdit
              ? t("edit_question_dialog_title")
              : t("add_question_dialog_title")
          }}
          <v-spacer />
          <v-btn icon variant="text" size="small" @click="closeQuestionDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-divider />

        <v-card-text class="pa-4 pa-sm-6" style="max-height: 75vh">
          <v-form ref="questionFormRef">
            <!-- Pertanyaan -->
            <v-textarea
              v-model="formQuestion.pertanyaan"
              :label="t('question_text_label')"
              :placeholder="t('question_placeholder')"
              variant="outlined"
              rows="3"
              auto-grow
              class="mb-3"
              :rules="[(v) => !!v || 'Pertanyaan tidak boleh kosong.']"
            />

            <!-- Skor -->
            <v-text-field
              v-model.number="formQuestion.skor"
              :label="t('score_label')"
              type="number"
              min="1"
              variant="outlined"
              density="comfortable"
              style="max-width: 160px"
              class="mb-4"
            />

            <!-- Upload Gambar -->
            <v-card variant="outlined" class="pa-3 mb-4 rounded-lg">
              <p class="text-caption font-weight-bold mb-2">
                {{
                  questionDialog.isEdit
                    ? t("change_image_label")
                    : t("upload_image_label")
                }}
              </p>

              <!-- Current Image Preview in Edit mode -->
              <div
                v-if="questionDialog.isEdit && formQuestion.existingGambar"
                class="mb-3"
              >
                <v-img
                  :src="getImageUrl(formQuestion.existingGambar)"
                  max-width="200"
                  max-height="120"
                  class="rounded border mb-2"
                />
                <v-checkbox
                  v-model="formQuestion.hapusGambar"
                  :label="t('delete_current_image')"
                  density="compact"
                  hide-details
                  color="error"
                />
              </div>

              <v-file-input
                v-model="formQuestion.imageFile"
                accept="image/*"
                variant="outlined"
                density="comfortable"
                prepend-icon="mdi-camera"
                label="Pilih file gambar (JPG, PNG, GIF)"
                hide-details
              />
            </v-card>

            <!-- Option inputs A, B, C, D -->
            <p class="text-subtitle-2 font-weight-bold mb-2">
              Pilihan Jawaban & Kunci
            </p>
            <v-radio-group v-model="formQuestion.jwbn_benar" class="mt-0">
              <v-row ga-0>
                <v-col
                  v-for="optKey in ['A', 'B', 'C', 'D']"
                  :key="optKey"
                  cols="12"
                  sm="6"
                  class="pa-1"
                >
                  <v-card variant="outlined" class="pa-3 rounded-lg">
                    <div class="d-flex align-center justify-space-between mb-2">
                      <span class="font-weight-bold text-caption text-primary"
                        >Pilihan {{ optKey }}</span
                      >
                      <v-radio
                        :value="optKey"
                        color="success"
                        hide-details
                        class="ms-auto"
                      >
                        <template #label>
                          <span
                            class="text-caption font-weight-bold color-success"
                            >Kunci Benar</span
                          >
                        </template>
                      </v-radio>
                    </div>
                    <v-text-field
                      v-model="formQuestion[`jwbn_${optKey.toLowerCase()}`]"
                      :placeholder="`Isi pilihan ${optKey}`"
                      variant="outlined"
                      density="compact"
                      hide-details
                      :rules="[(v) => !!v || `Pilihan ${optKey} wajib diisi.`]"
                    />
                  </v-card>
                </v-col>
              </v-row>
            </v-radio-group>
          </v-form>
        </v-card-text>

        <v-divider />
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" class="text-none" @click="closeQuestionDialog"
            >Batal</v-btn
          >
          <v-btn
            color="primary"
            variant="flat"
            rounded="lg"
            class="text-none font-weight-bold px-6"
            :loading="questionDialog.isSaving"
            @click="saveQuestion"
          >
            Simpan
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ===== DIALOG: BANK SOAL ===== -->
    <v-dialog v-model="bankModal.show" max-width="600" scrollable>
      <v-card rounded="xl">
        <v-card-title class="d-flex align-center pa-4">
          <v-icon color="info" class="me-2">mdi-database</v-icon>
          {{ t("bank_soal_title") }}
          <v-spacer />
          <v-btn
            icon
            variant="text"
            size="small"
            @click="bankModal.show = false"
            ><v-icon>mdi-close</v-icon></v-btn
          >
        </v-card-title>
        <v-divider />

        <v-card-text class="pa-4 pa-sm-6" style="max-height: 70vh">
          <p class="text-body-2 text-medium-emphasis mb-3">
            {{ t("bank_soal_subtitle") }}
          </p>

          <v-select
            v-model="bankModal.selectedLevel"
            :items="levelItems"
            item-title="title"
            item-value="value"
            label="Pilih Level"
            variant="outlined"
            density="comfortable"
            class="mb-4"
            @update:model-value="fetchBankQuestions"
          />

          <!-- Loading state for bank -->
          <div v-if="bankModal.isLoading" class="text-center py-6">
            <v-progress-circular indeterminate color="info" size="36" />
          </div>

          <!-- List of bank questions to pick -->
          <div v-else-if="bankModal.questions.length > 0">
            <div
              v-for="bq in bankModal.questions"
              :key="bq.id"
              class="d-flex align-center pa-3 mb-2 rounded-lg border bg-surface-light cursor-pointer"
              @click="toggleBankSelection(bq.id)"
            >
              <v-checkbox
                v-model="bankModal.selectedIds"
                :value="bq.id"
                density="compact"
                hide-details
                class="me-3"
                color="info"
              />
              <span class="text-body-2 font-weight-medium">{{
                bq.question
              }}</span>
            </div>
          </div>

          <div
            v-else-if="bankModal.selectedLevel"
            class="text-center text-medium-emphasis py-6 text-body-2"
          >
            {{ t("no_bank_questions") }}
          </div>
        </v-card-text>

        <v-divider />
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn
            variant="text"
            class="text-none"
            @click="bankModal.show = false"
            >Batal</v-btn
          >
          <v-btn
            color="info"
            variant="flat"
            rounded="lg"
            class="text-none font-weight-bold px-6"
            :disabled="bankModal.selectedIds.length === 0"
            :loading="bankModal.isImporting"
            @click="importBankQuestions"
          >
            {{ t("add_selected_questions_button") }} ({{
              bankModal.selectedIds.length
            }})
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ===== DIALOG: DELETE CONFIRMATION ===== -->
    <v-dialog v-model="deleteDialog.show" max-width="400">
      <v-card rounded="xl">
        <v-card-title class="text-h6 font-weight-bold pa-4 text-error">
          <v-icon color="error" class="me-2">mdi-alert-circle-outline</v-icon>
          Hapus Pertanyaan
        </v-card-title>
        <v-card-text class="pa-4 pt-0">
          {{ t("confirm_delete_question") }}
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn
            variant="text"
            class="text-none"
            @click="deleteDialog.show = false"
            >Batal</v-btn
          >
          <v-btn
            color="error"
            variant="flat"
            rounded="lg"
            class="text-none font-weight-bold px-4"
            :loading="deleteDialog.isDeleting"
            @click="executeDelete"
          >
            Hapus
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
import { ref, onMounted, computed } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import AppLayout from "@/components/AppLayout.vue";
import { API_URL, API_BASE_URL } from "@/config";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const idRoom = computed(() => route.query.id_room as string);
const roomCode = computed(() => (route.query.kode_room as string) || "");

const roomDetails = ref<any>(null);
const questions = ref<any[]>([]);
const isLoading = ref(true);

const showPanduan = ref(false);
const showMateri = ref(false);
const showTentang = ref(false);

const snackbar = ref({
  show: false,
  text: "",
  color: "success",
  icon: "mdi-check-circle",
});

// Question Form State
const questionFormRef = ref();
const questionDialog = ref({
  show: false,
  isEdit: false,
  editingId: null as number | null,
  isSaving: false,
});

interface FormQuestionState {
  pertanyaan: string;
  skor: number;
  jwbn_a: string;
  jwbn_b: string;
  jwbn_c: string;
  jwbn_d: string;
  jwbn_benar: string;
  existingGambar: string;
  hapusGambar: boolean;
  imageFile: File | null;
  [key: string]: any;
}

const formQuestion = ref<FormQuestionState>({
  pertanyaan: "",
  skor: 1,
  jwbn_a: "",
  jwbn_b: "",
  jwbn_c: "",
  jwbn_d: "",
  jwbn_benar: "A",
  existingGambar: "",
  hapusGambar: false,
  imageFile: null,
});

// Bank Soal State
const bankModal = ref({
  show: false,
  selectedLevel: null as number | null,
  isLoading: false,
  questions: [] as any[],
  selectedIds: [] as number[],
  isImporting: false,
});

const levelItems = Array.from({ length: 10 }, (_, i) => ({
  title: `Level ${i + 1}`,
  value: i + 1,
}));

// Delete Dialog State
const deleteDialog = ref({
  show: false,
  questionId: null as number | null,
  isDeleting: false,
});

function openModal(type: string) {
  if (type === "materi") showMateri.value = true;
  else if (type === "panduan") showPanduan.value = true;
  else if (type === "tentang") showTentang.value = true;
}

function showToast(text: string, color = "success", icon = "mdi-check-circle") {
  snackbar.value = { show: true, text, color, icon };
}

function getImageUrl(relPath: string) {
  if (!relPath) return "";
  if (relPath.startsWith("http")) return relPath;
  return `${API_BASE_URL}/${relPath.replace(/^\//, "")}`;
}

function getOptionText(q: any, optKey: string) {
  const key = `jwbn_${optKey.toLowerCase()}`;
  return q[key] || "";
}

// Fetch Questions & Room Info
async function fetchRoomAndQuestions() {
  if (!idRoom.value) {
    router.push("/multiplayer/selection");
    return;
  }

  isLoading.value = true;
  try {
    const res = await fetch(`${API_URL}/questions?id_room=${idRoom.value}`);
    const data = await res.json();
    if (res.ok && data.success) {
      questions.value = data.questions || [];
    }

    if (roomCode.value) {
      const roomRes = await fetch(`${API_URL}/rooms/${roomCode.value}`);
      const roomData = await roomRes.json();
      if (roomRes.ok && roomData.success) {
        roomDetails.value = roomData.room;
      }
    }
  } catch (err) {
    console.error("Fetch questions error:", err);
    showToast("Gagal memuat pertanyaan.", "error", "mdi-alert-circle");
  } finally {
    isLoading.value = false;
  }
}

// Add Question Dialog
function openAddDialog() {
  questionDialog.value = {
    show: true,
    isEdit: false,
    editingId: null,
    isSaving: false,
  };
  formQuestion.value = {
    pertanyaan: "",
    skor: 1,
    jwbn_a: "",
    jwbn_b: "",
    jwbn_c: "",
    jwbn_d: "",
    jwbn_benar: "A",
    existingGambar: "",
    hapusGambar: false,
    imageFile: null,
  };
}

// Edit Question Dialog
function openEditDialog(q: any) {
  questionDialog.value = {
    show: true,
    isEdit: true,
    editingId: q.id_soalmlt,
    isSaving: false,
  };
  formQuestion.value = {
    pertanyaan: q.pertanyaan,
    skor: q.skor || 1,
    jwbn_a: q.jwbn_a,
    jwbn_b: q.jwbn_b,
    jwbn_c: q.jwbn_c,
    jwbn_d: q.jwbn_d,
    jwbn_benar: q.jwbn_benar || "A",
    existingGambar: q.gambar || "",
    hapusGambar: false,
    imageFile: null,
  };
}

function closeQuestionDialog() {
  questionDialog.value.show = false;
}

// Save Question (Create or Update)
async function saveQuestion() {
  const { valid } = await questionFormRef.value.validate();
  if (!valid) return;

  questionDialog.value.isSaving = true;

  try {
    const formData = new FormData();
    formData.append("id_room", idRoom.value);
    formData.append("pertanyaan", formQuestion.value.pertanyaan);
    formData.append("skor", String(formQuestion.value.skor));
    formData.append("jwbn_a", formQuestion.value.jwbn_a);
    formData.append("jwbn_b", formQuestion.value.jwbn_b);
    formData.append("jwbn_c", formQuestion.value.jwbn_c);
    formData.append("jwbn_d", formQuestion.value.jwbn_d);
    formData.append("jwbn_benar", formQuestion.value.jwbn_benar);

    if (formQuestion.value.imageFile) {
      formData.append("gambar", formQuestion.value.imageFile);
    }
    if (formQuestion.value.hapusGambar) {
      formData.append("hapus_gambar", "1");
    }

    const isEdit = questionDialog.value.isEdit;
    const url = isEdit
      ? `${API_URL}/questions/${questionDialog.value.editingId}`
      : `${API_URL}/questions`;

    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
      body: formData,
    });

    const data = await res.json();

    if (res.ok && data.success) {
      showToast(
        isEdit
          ? "Pertanyaan berhasil diperbarui."
          : "Pertanyaan berhasil ditambahkan.",
      );
      closeQuestionDialog();
      await fetchRoomAndQuestions();
    } else {
      showToast(
        data.message || "Gagal menyimpan pertanyaan.",
        "error",
        "mdi-alert-circle",
      );
    }
  } catch (err: any) {
    console.error("Save question error:", err);
    showToast("Gagal terhubung ke server.", "error", "mdi-alert-circle");
  } finally {
    questionDialog.value.isSaving = false;
  }
}

// Delete Question
function confirmDelete(q: any) {
  deleteDialog.value = {
    show: true,
    questionId: q.id_soalmlt,
    isDeleting: false,
  };
}

async function executeDelete() {
  if (!deleteDialog.value.questionId) return;

  deleteDialog.value.isDeleting = true;
  try {
    const res = await fetch(
      `${API_URL}/questions/${deleteDialog.value.questionId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authStore.token}`,
        },
      },
    );
    const data = await res.json();

    if (res.ok && data.success) {
      showToast("Pertanyaan berhasil dihapus.");
      deleteDialog.value.show = false;
      await fetchRoomAndQuestions();
    } else {
      showToast(
        data.message || "Gagal menghapus pertanyaan.",
        "error",
        "mdi-alert-circle",
      );
    }
  } catch (err) {
    console.error("Delete question error:", err);
    showToast("Gagal terhubung ke server.", "error", "mdi-alert-circle");
  } finally {
    deleteDialog.value.isDeleting = false;
  }
}

// Bank Soal Modal
function openBankModal() {
  bankModal.value = {
    show: true,
    selectedLevel: 1,
    isLoading: false,
    questions: [],
    selectedIds: [],
    isImporting: false,
  };
  fetchBankQuestions(1);
}

async function fetchBankQuestions(lvl: number | null) {
  if (!lvl) return;
  bankModal.value.isLoading = true;
  bankModal.value.selectedIds = [];
  try {
    const res = await fetch(`${API_URL}/questions/bank?lvl=${lvl}`);
    const data = await res.json();
    if (res.ok && data.success) {
      bankModal.value.questions = data.questions || [];
    }
  } catch (err) {
    console.error("Fetch bank error:", err);
  } finally {
    bankModal.value.isLoading = false;
  }
}

function toggleBankSelection(id: number) {
  const idx = bankModal.value.selectedIds.indexOf(id);
  if (idx > -1) {
    bankModal.value.selectedIds.splice(idx, 1);
  } else {
    bankModal.value.selectedIds.push(id);
  }
}

async function importBankQuestions() {
  if (bankModal.value.selectedIds.length === 0) return;

  bankModal.value.isImporting = true;
  try {
    const res = await fetch(`${API_URL}/questions/import-bank`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authStore.token}`,
      },
      body: JSON.stringify({
        id_room: parseInt(idRoom.value),
        selected_soal: bankModal.value.selectedIds,
      }),
    });
    const data = await res.json();

    if (res.ok && data.success) {
      showToast(data.message || "Soal berhasil diimpor dari bank.");
      bankModal.value.show = false;
      await fetchRoomAndQuestions();
    } else {
      showToast(
        data.message || "Gagal mengimpor dari bank.",
        "error",
        "mdi-alert-circle",
      );
    }
  } catch (err) {
    console.error("Import bank error:", err);
    showToast("Gagal terhubung ke server.", "error", "mdi-alert-circle");
  } finally {
    bankModal.value.isImporting = false;
  }
}

// Start Game
function handleStartGame() {
  router.push({
    path: "/multiplayer/participant",
    query: {
      id_room: idRoom.value,
      kode_room: roomCode.value,
    },
  });
}

onMounted(() => {
  fetchRoomAndQuestions();
});
</script>

<style scoped>
.quest-page {
  max-width: 960px;
}

.option-box {
  background: rgba(var(--v-theme-on-surface), 0.02);
  transition: all 0.2s ease;
}

.option-correct {
  background: rgba(var(--v-theme-success), 0.1) !important;
  border-color: rgb(var(--v-theme-success)) !important;
}

.card-hover {
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.card-hover:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08) !important;
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
