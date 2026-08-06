<template>
  <AppLayout>
    <v-container class="admin-dashboard py-6">
      <!-- Title Card -->
      <v-card class="mb-6 border text-center relative-card" rounded="xl" elevation="3">
        <v-card-text class="pa-6 pa-sm-8 d-flex flex-column align-center justify-center">
          <v-avatar color="primary" size="80" variant="tonal" class="mb-4">
            <v-icon size="40" color="primary">mdi-shield-crown-outline</v-icon>
          </v-avatar>
          <h1 class="text-h4 font-weight-black text-primary mb-1">
            PANEL ADMIN
          </h1>
          <p class="text-subtitle-1 text-medium-emphasis mb-0">
            Kelola Bank Soal utama kuis Solo & Multiplayer Napza Edu Card
          </p>
        </v-card-text>
      </v-card>

      <!-- Main Admin Panel Tabs -->
      <v-card rounded="xl" class="border" elevation="2">
        <v-tabs v-model="activeTab" bg-color="primary" class="rounded-t-xl text-white">
          <v-tab value="soal" class="text-none font-weight-bold">
            <v-icon start>mdi-database</v-icon>
            Bank Soal
          </v-tab>
          <v-tab value="laporan" class="text-none font-weight-bold">
            <v-icon start>mdi-chart-bar</v-icon>
            Statistik Level
          </v-tab>
        </v-tabs>

        <v-window v-model="activeTab" class="pa-4 pa-sm-6">
          <!-- TAB 1: Bank Soal CRUD -->
          <v-window-item value="soal">
            <!-- Filter & Controls -->
            <v-row class="mb-4 align-center ga-0">
              <!-- Search question -->
              <v-col cols="12" sm="5" class="pa-1">
                <v-text-field
                  v-model="searchQuery"
                  label="Cari pertanyaan..."
                  prepend-inner-icon="mdi-magnify"
                  density="comfortable"
                  variant="outlined"
                  hide-details
                  rounded="lg"
                />
              </v-col>

              <!-- Filter by Level -->
              <v-col cols="12" sm="3" class="pa-1">
                <v-select
                  v-model="filterLevel"
                  label="Filter Level"
                  :items="['Semua Level', ...Array.from({ length: 10 }, (_, i) => i + 1)]"
                  density="comfortable"
                  variant="outlined"
                  hide-details
                  rounded="lg"
                />
              </v-col>

              <v-spacer />

              <!-- Add question button -->
              <v-col cols="12" sm="3" class="text-sm-right pa-1">
                <v-btn
                  color="primary"
                  variant="flat"
                  rounded="lg"
                  class="text-none font-weight-bold"
                  @click="openAddDialog"
                >
                  <v-icon start>mdi-plus-circle</v-icon>
                  Tambah Soal
                </v-btn>
              </v-col>
            </v-row>

            <!-- Loading Spinner -->
            <div v-if="isLoading" class="text-center py-12">
              <v-progress-circular indeterminate color="primary" size="48" />
              <p class="text-body-2 text-medium-emphasis mt-3">Memuat Bank Soal...</p>
            </div>

            <!-- Empty State -->
            <div v-else-if="filteredQuestions.length === 0" class="text-center py-12 border-dashed rounded-xl">
              <v-icon size="64" color="medium-emphasis" class="mb-3">mdi-database-alert-outline</v-icon>
              <h3 class="text-h6 font-weight-bold mb-1">Tidak Ada Soal</h3>
              <p class="text-body-2 text-medium-emphasis">Tidak ditemukan soal kuis untuk kriteria pencarian ini.</p>
            </div>

            <!-- Data Table (Custom list table) -->
            <v-table v-else class="admin-soal-table border rounded-xl overflow-hidden">
              <thead>
                <tr>
                  <th class="text-center" style="width: 80px;">Level</th>
                  <th>Pertanyaan</th>
                  <th class="text-center" style="width: 140px;">Gambar</th>
                  <th class="text-center" style="width: 160px;">Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="q in paginatedQuestions" :key="q.id">
                  <!-- Level -->
                  <td class="text-center font-weight-bold">
                    <v-chip color="primary" size="small" variant="flat">Lvl {{ q.lvl }}</v-chip>
                  </td>

                  <!-- Question Text -->
                  <td class="text-body-2 font-weight-medium">
                    <div class="text-truncate" style="max-width: 450px;">{{ q.pertanyaan }}</div>
                    <div class="text-caption text-medium-emphasis d-flex flex-wrap ga-2 mt-1">
                      <span>A: {{ q.jwbn_a }}</span> • 
                      <span>B: {{ q.jwbn_b }}</span> • 
                      <span>C: {{ q.jwbn_c }}</span> • 
                      <span>D: {{ q.jwbn_d }}</span> • 
                      <strong class="text-success">Kunci: {{ q.jwbn_bnr }}</strong>
                    </div>
                  </td>

                  <!-- Image Status / Preview -->
                  <td class="text-center">
                    <v-avatar v-if="q.gambar" size="44" rounded="lg" class="border cursor-pointer elevation-1" @click="viewImage(q.gambar)">
                      <v-img :src="getImageUrl(q.gambar)" cover />
                    </v-avatar>
                    <v-chip v-else size="small" color="grey-lighten-2" variant="tonal">
                      <v-icon start size="14">mdi-image-off-outline</v-icon> Tidak Ada
                    </v-chip>
                  </td>

                  <!-- Actions -->
                  <td class="text-center">
                    <div class="d-flex justify-center ga-2">
                      <v-btn icon color="primary" variant="tonal" size="small" @click="openEditDialog(q)" title="Edit">
                        <v-icon size="18">mdi-pencil-outline</v-icon>
                      </v-btn>
                      <v-btn icon color="error" variant="tonal" size="small" @click="openDeleteDialog(q)" title="Hapus">
                        <v-icon size="18">mdi-trash-can-outline</v-icon>
                      </v-btn>
                    </div>
                  </td>
                </tr>
              </tbody>
            </v-table>

            <!-- Pagination Controls -->
            <div class="d-flex justify-center mt-4" v-if="totalPages > 1">
              <v-pagination
                v-model="currentPage"
                :length="totalPages"
                rounded="circle"
                color="primary"
                density="comfortable"
              />
            </div>
          </v-window-item>

          <!-- TAB 2: Statistik Laporan -->
          <v-window-item value="laporan">
            <v-row class="ga-0">
              <v-col cols="12" md="6" class="pa-2">
                <v-card class="border pa-4" rounded="xl" variant="flat">
                  <h3 class="text-subtitle-1 font-weight-bold mb-3 d-flex align-center ga-2">
                    <v-icon color="primary">mdi-counter</v-icon> Total Soal Per Level
                  </h3>
                  <v-table density="compact">
                    <thead>
                      <tr>
                        <th>Level</th>
                        <th class="text-center">Jumlah Soal</th>
                        <th>Status Kelayakan</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="l in 10" :key="l">
                        <td class="font-weight-bold">Level {{ l }}</td>
                        <td class="text-center">{{ getLevelCount(l) }}</td>
                        <td>
                          <v-chip :color="getLevelCount(l) >= 5 ? 'success' : 'warning'" size="x-small" variant="flat">
                            {{ getLevelCount(l) >= 5 ? 'Layak Solo Mode' : 'Butuh Soal Tambahan' }}
                          </v-chip>
                        </td>
                      </tr>
                    </tbody>
                  </v-table>
                </v-card>
              </v-col>

              <v-col cols="12" md="6" class="pa-2">
                <v-card class="border pa-4 bg-primary-lighten-5" rounded="xl" variant="flat">
                  <h3 class="text-subtitle-1 font-weight-bold mb-3 text-primary">
                    ℹ️ Panduan Pengelolaan
                  </h3>
                  <p class="text-body-2 mb-3" style="text-align: justify;">
                    Semua soal yang diinput di sini akan masuk ke dalam <strong>Bank Soal Utama</strong> (tabel <code>soal</code>).
                  </p>
                  <p class="text-body-2 mb-3" style="text-align: justify;">
                    Soal ini otomatis tersedia untuk para Guru/Author saat mengimpor pertanyaan kuis multiplayer, serta digunakan langsung oleh pemain kuis mode singleplayer/solo.
                  </p>
                  <p class="text-body-2" style="text-align: justify;">
                    <strong>Syarat Kelayakan Solo Mode</strong>: Setiap Level kuis solo idealnya membutuhkan minimal 5 soal untuk bisa dimainkan dengan lancar.
                  </p>
                </v-card>
              </v-col>
            </v-row>
          </v-window-item>
        </v-window>
      </v-card>
    </v-container>

    <!-- Dialog Tambah / Edit Soal -->
    <v-dialog v-model="dialog.show" max-width="640" scrollable persistent>
      <v-card rounded="xl">
        <v-card-title class="d-flex align-center pa-4 border-b">
          <v-icon color="primary" class="me-2">{{ dialog.isEdit ? 'mdi-pencil' : 'mdi-plus-circle' }}</v-icon>
          <span class="font-weight-bold">{{ dialog.isEdit ? 'Edit Pertanyaan Bank' : 'Tambah Pertanyaan Baru' }}</span>
          <v-spacer />
          <v-btn icon variant="text" size="small" @click="dialog.show = false"><v-icon>mdi-close</v-icon></v-btn>
        </v-card-title>

        <v-card-text class="pa-4 pa-sm-6" style="max-height: 70vh;">
          <v-form ref="formRef" v-model="formValid" lazy-validation>
            <!-- Level Selector -->
            <v-select
              v-model="formSoal.lvl"
              label="Level Soal"
              :items="Array.from({ length: 10 }, (_, i) => i + 1)"
              type="number"
              variant="outlined"
              density="comfortable"
              class="mb-3"
              required
            />

            <!-- Question Text -->
            <v-textarea
              v-model="formSoal.pertanyaan"
              label="Teks Pertanyaan"
              placeholder="Tulis pertanyaan kuis di sini..."
              variant="outlined"
              density="comfortable"
              class="mb-3"
              rows="3"
              :rules="[(v: string) => !!v || 'Pertanyaan wajib diisi.']"
              required
            />

            <!-- Image File Input -->
            <v-file-input
              v-model="formSoal.fileGambar"
              label="Unggah File Gambar (opsional)"
              accept="image/*"
              prepend-icon=""
              prepend-inner-icon="mdi-image-plus"
              variant="outlined"
              density="comfortable"
              class="mb-2"
            />

            <!-- Existing Image Preview & Remove Checkbox -->
            <div v-if="dialog.isEdit && formSoal.existingGambar" class="mb-4 pa-3 border rounded-lg d-flex align-center justify-space-between">
              <div class="d-flex align-center ga-3">
                <v-avatar rounded="lg" size="48" class="border">
                  <v-img :src="getImageUrl(formSoal.existingGambar)" cover />
                </v-avatar>
                <span class="text-caption text-medium-emphasis">Gambar saat ini</span>
              </div>
              <v-checkbox
                v-model="formSoal.hapusGambar"
                label="Hapus gambar lama"
                color="error"
                density="compact"
                hide-details
              />
            </div>

            <v-divider class="my-4" />

            <!-- Options inputs -->
            <v-row class="ga-0">
              <v-col cols="12" sm="6" class="pa-1">
                <v-text-field
                  v-model="formSoal.jwbn_a"
                  label="Jawaban A"
                  placeholder="Isi jawaban opsi A"
                  variant="outlined"
                  density="comfortable"
                  :rules="[(v: string) => !!v || 'Opsi A wajib diisi.']"
                  required
                />
              </v-col>
              <v-col cols="12" sm="6" class="pa-1">
                <v-text-field
                  v-model="formSoal.jwbn_b"
                  label="Jawaban B"
                  placeholder="Isi jawaban opsi B"
                  variant="outlined"
                  density="comfortable"
                  :rules="[(v: string) => !!v || 'Opsi B wajib diisi.']"
                  required
                />
              </v-col>
              <v-col cols="12" sm="6" class="pa-1">
                <v-text-field
                  v-model="formSoal.jwbn_c"
                  label="Jawaban C"
                  placeholder="Isi jawaban opsi C"
                  variant="outlined"
                  density="comfortable"
                  :rules="[(v: string) => !!v || 'Opsi C wajib diisi.']"
                  required
                />
              </v-col>
              <v-col cols="12" sm="6" class="pa-1">
                <v-text-field
                  v-model="formSoal.jwbn_d"
                  label="Jawaban D"
                  placeholder="Isi jawaban opsi D"
                  variant="outlined"
                  density="comfortable"
                  :rules="[(v: string) => !!v || 'Opsi D wajib diisi.']"
                  required
                />
              </v-col>
            </v-row>

            <!-- Correct Option selector -->
            <v-select
              v-model="formSoal.jwbn_bnr"
              label="Kunci Jawaban Benar"
              :items="['A', 'B', 'C', 'D']"
              variant="outlined"
              density="comfortable"
              class="mt-3"
              :rules="[(v: string) => !!v || 'Kunci jawaban wajib dipilih.']"
              required
            />
          </v-form>
        </v-card-text>

        <v-card-actions class="pa-4 pt-0 border-t justify-end ga-2">
          <v-btn variant="text" rounded="lg" class="text-none font-weight-bold" @click="dialog.show = false">
            Batal
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            rounded="lg"
            class="text-none font-weight-bold px-6"
            :loading="dialog.isSaving"
            :disabled="!formValid"
            @click="saveQuestion"
          >
            Simpan Soal
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog Konfirmasi Hapus -->
    <v-dialog v-model="deleteDialog.show" max-width="440">
      <v-card rounded="xl">
        <v-card-text class="text-center pa-6">
          <v-avatar color="error" size="64" variant="tonal" class="mb-4">
            <v-icon size="32">mdi-trash-can-outline</v-icon>
          </v-avatar>
          <h3 class="text-h6 font-weight-bold mb-2">Hapus Soal Bank?</h3>
          <p class="text-body-2 text-medium-emphasis mb-0">
            Anda yakin ingin menghapus soal ini dari Bank Soal utama? Tindakan ini tidak bisa dibatalkan.
          </p>
        </v-card-text>
        <v-card-actions class="pa-4 pt-0 justify-center ga-2">
          <v-btn variant="text" class="text-none px-6" rounded="lg" @click="deleteDialog.show = false">
            Batal
          </v-btn>
          <v-btn
            color="error"
            variant="flat"
            rounded="lg"
            class="text-none font-weight-bold px-6"
            :loading="deleteDialog.isDeleting"
            @click="deleteQuestion"
          >
            Hapus Soal
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog Preview Image -->
    <v-dialog v-model="previewImageDialog.show" max-width="500">
      <v-card rounded="xl" class="overflow-hidden">
        <v-img :src="previewImageDialog.url" max-height="400" contain class="bg-black" />
        <v-card-actions class="justify-center">
          <v-btn color="primary" variant="text" @click="previewImageDialog.show = false">Tutup</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar Feedback -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000" location="top" rounded="lg">
      <div class="d-flex align-center">
        <v-icon class="me-2">{{ snackbar.icon }}</v-icon>
        {{ snackbar.text }}
      </div>
    </v-snackbar>


  </AppLayout>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import AppLayout from '@/components/AppLayout.vue'
import { API_URL, API_BASE_URL } from '@/config'

const { t } = useI18n()
const authStore = useAuthStore()

const activeTab = ref('soal')
const questions = ref<any[]>([])
const isLoading = ref(true)
const searchQuery = ref('')
const filterLevel = ref('Semua Level')

// Pagination state
const currentPage = ref(1)
const itemsPerPage = 5

const totalPages = computed(() => {
  return Math.ceil(filteredQuestions.value.length / itemsPerPage)
})

const paginatedQuestions = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredQuestions.value.slice(start, end)
})

watch([searchQuery, filterLevel], () => {
  currentPage.value = 1
})



// Dialogs States
const dialog = ref({
  show: false,
  isEdit: false,
  editingId: 0,
  isSaving: false,
})

const formRef = ref()
const formValid = ref(false)

const formSoal = ref({
  pertanyaan: '',
  jwbn_a: '',
  jwbn_b: '',
  jwbn_c: '',
  jwbn_d: '',
  jwbn_bnr: 'A',
  lvl: 1,
  fileGambar: [] as any,
  existingGambar: '',
  hapusGambar: false,
})

const deleteDialog = ref({
  show: false,
  questionId: 0,
  isDeleting: false,
})

const previewImageDialog = ref({
  show: false,
  url: '',
})

const snackbar = ref({
  show: false,
  text: '',
  color: 'success',
  icon: 'mdi-check-circle',
})

function showToast(text: string, color = 'success', icon = 'mdi-check-circle') {
  snackbar.value = { show: true, text, color, icon }
}

function getImageUrl(relPath: string) {
  if (!relPath) return ''
  if (relPath.startsWith('http')) return relPath
  return `${API_BASE_URL}/${relPath.replace(/^\//, '')}`
}

function viewImage(relPath: string) {
  previewImageDialog.value = {
    show: true,
    url: getImageUrl(relPath),
  }
}

/**
 * Fetch all bank questions from API
 */
async function fetchAllQuestions() {
  isLoading.value = true
  try {
    const res = await fetch(`${API_URL}/questions/bank/all`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    })
    const data = await res.json()
    if (res.ok && data.success) {
      questions.value = data.questions || []
    } else {
      showToast('Gagal memuat bank soal.', 'error', 'mdi-alert-circle')
    }
  } catch (err) {
    console.error('Fetch bank questions error:', err)
    showToast('Gagal terhubung ke server.', 'error', 'mdi-alert-circle')
  } finally {
    isLoading.value = false
  }
}

// Compute statistics counts per level
function getLevelCount(lvl: number) {
  return questions.value.filter(q => q.lvl === lvl).length
}

// Filtered questions computation for search and level
const filteredQuestions = computed(() => {
  return questions.value.filter(q => {
    // 1. Filter by level
    if (filterLevel.value !== 'Semua Level' && q.lvl !== parseInt(filterLevel.value)) {
      return false
    }
    // 2. Filter by search text
    if (searchQuery.value.trim() !== '') {
      const qText = q.pertanyaan.toLowerCase()
      const search = searchQuery.value.toLowerCase()
      return qText.includes(search)
    }
    return true
  })
})

/**
 * Add / Edit Form Actions
 */
function openAddDialog() {
  dialog.value = {
    show: true,
    isEdit: false,
    editingId: 0,
    isSaving: false,
  }
  formSoal.value = {
    pertanyaan: '',
    jwbn_a: '',
    jwbn_b: '',
    jwbn_c: '',
    jwbn_d: '',
    jwbn_bnr: 'A',
    lvl: 1,
    fileGambar: null,
    existingGambar: '',
    hapusGambar: false,
  }
  if (formRef.value) formRef.value.resetValidation()
}

function openEditDialog(q: any) {
  dialog.value = {
    show: true,
    isEdit: true,
    editingId: q.id,
    isSaving: false,
  }
  formSoal.value = {
    pertanyaan: q.pertanyaan,
    jwbn_a: q.jwbn_a,
    jwbn_b: q.jwbn_b,
    jwbn_c: q.jwbn_c,
    jwbn_d: q.jwbn_d,
    jwbn_bnr: q.jwbn_bnr,
    lvl: q.lvl,
    fileGambar: null,
    existingGambar: q.gambar || '',
    hapusGambar: false,
  }
  if (formRef.value) formRef.value.resetValidation()
}

async function saveQuestion() {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  dialog.value.isSaving = true

  // Create form data for image upload capability
  const formData = new FormData()
  formData.append('pertanyaan', formSoal.value.pertanyaan)
  formData.append('jwbn_a', formSoal.value.jwbn_a)
  formData.append('jwbn_b', formSoal.value.jwbn_b)
  formData.append('jwbn_c', formSoal.value.jwbn_c)
  formData.append('jwbn_d', formSoal.value.jwbn_d)
  formData.append('jwbn_bnr', formSoal.value.jwbn_bnr)
  formData.append('lvl', formSoal.value.lvl.toString())

  if (formSoal.value.fileGambar && formSoal.value.fileGambar.length > 0) {
    formData.append('gambar', formSoal.value.fileGambar[0])
  } else if (formSoal.value.fileGambar instanceof File) {
    formData.append('gambar', formSoal.value.fileGambar)
  }

  if (formSoal.value.hapusGambar) {
    formData.append('hapus_gambar', '1')
  }

  const isEdit = dialog.value.isEdit
  const url = isEdit
    ? `${API_URL}/questions/bank/${dialog.value.editingId}`
    : `${API_URL}/questions/bank`

  try {
    const res = await fetch(url, {
      method: isEdit ? 'PUT' : 'POST',
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
      body: formData,
    })

    const data = await res.json()

    if (res.ok && data.success) {
      dialog.value.show = false
      showToast(data.message || 'Soal berhasil disimpan.')
      fetchAllQuestions()
    } else {
      showToast(data.message || 'Gagal menyimpan soal.', 'error', 'mdi-alert-circle')
    }
  } catch (err) {
    console.error('Save question error:', err)
    showToast('Terjadi kesalahan koneksi server.', 'error', 'mdi-alert-circle')
  } finally {
    dialog.value.isSaving = false
  }
}

/**
 * Delete Action
 */
function openDeleteDialog(q: any) {
  deleteDialog.value = {
    show: true,
    questionId: q.id,
    isDeleting: false,
  }
}

async function deleteQuestion() {
  deleteDialog.value.isDeleting = true
  try {
    const res = await fetch(`${API_URL}/questions/bank/${deleteDialog.value.questionId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    })
    const data = await res.json()
    if (res.ok && data.success) {
      deleteDialog.value.show = false
      showToast(data.message || 'Soal berhasil dihapus.')
      fetchAllQuestions()
    } else {
      showToast(data.message || 'Gagal menghapus soal.', 'error', 'mdi-alert-circle')
    }
  } catch (err) {
    console.error('Delete question error:', err)
    showToast('Terjadi kesalahan server.', 'error', 'mdi-alert-circle')
  } finally {
    deleteDialog.value.isDeleting = false
  }
}

onMounted(() => {
  fetchAllQuestions()
})
</script>

<style scoped>
.admin-dashboard {
  max-width: 1100px;
}

.relative-card {
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.04) 0%, rgba(var(--v-theme-secondary), 0.06) 100%);
}

.admin-soal-table th {
  font-weight: 700 !important;
  text-transform: uppercase;
  font-size: 0.75rem !important;
  letter-spacing: 0.5px;
  background: rgba(var(--v-theme-on-surface), 0.02);
}

.admin-soal-table tr:hover {
  background-color: rgba(var(--v-theme-primary), 0.02) !important;
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
