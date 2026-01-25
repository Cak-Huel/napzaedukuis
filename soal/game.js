// --- 1. MEMBACA DATA DARI HTML ---
const dataElement = document.getElementById("quiz-data");
const quizData = JSON.parse(dataElement.textContent);

// --- 2. SELEKTOR DOM ---
const cards = document.querySelectorAll(".card");
const pageOverlay = document.getElementById("page-overlay");
const timerEl = document.getElementById("timer");
const pointsEl = document.getElementById("points");
const levelEl = document.getElementById("level");

// Modal
const modalOverlay = document.getElementById("completion-modal-overlay");
const modalScoreEl = document.getElementById("modal-score");
const nextLevelBtn = document.getElementById("next-level-btn");

// --- 3. STATUS GAME (STATE) ---
let points = 0;
let level = parseInt(levelEl.textContent) || 1;
let timeLeft = 40; // Sesuai dengan tampilan awal di HTML
let timerInterval = null;
let activeCard = null; // Kartu yang sedang dibuka
let answeredCards = 0; // Menghitung jumlah kartu yang sudah dijawab

// --- 4. FUNGSI UTAMA ---

/**
 * Memulai permainan saat halaman dimuat
 */
function initializeGame() {
  updateScoreboard();
  resetTimer();

  // Tambahkan event listener ke setiap kartu
  cards.forEach((card) => {
    card.addEventListener("click", () => handleCardClick(card));
  });

  // Event listener untuk overlay (menutup kartu)
  pageOverlay.addEventListener("click", closeActiveCard);

  // Event listener untuk tombol next level (me-reset game)
  nextLevelBtn.addEventListener("click", goToNextLevel);
}

/**
 * Menangani logika saat kartu diklik
 */
function handleCardClick(card) {
  // Jangan lakukan apa-apa jika kartu sudah dijawab atau kartu lain sedang aktif
  if (
    card.classList.contains("is-correct") ||
    card.classList.contains("is-wrong") ||
    activeCard
  ) {
    return;
  }

  activeCard = card;

  // 1. Ambil data kuis berdasarkan data-id kartu
  const cardId = card.dataset.id;
  const data = quizData.find((q) => q.id == cardId);

  // 2. Isi konten di belakang kartu
  populateCardBack(card, data);

  // 3. Tambahkan kelas untuk animasi
  card.classList.add("is-flipped", "is-active");
  pageOverlay.classList.add("visible");

  // 4. Mulai timer
  startTimer();
}

/**
 * Mengisi HTML di bagian belakang kartu dengan data kuis
 */
function populateCardBack(card, data) {
  const cardBack = card.querySelector(".card-back");

  // Buat HTML untuk pilihan ganda
  const optionLetters = ["A", "B", "C", "D"];
  const optionsHTML = data.options
    .map(
      (option, index) =>
        `<button class="option-btn" data-option="${optionLetters[index]}">${option}</button>`
    )
    .join("");

  // Menangani jika path gambar NULL dari database
  const imageHTML = data.image
    ? `<img src="${data.image}" alt="Petunjuk Kuis" class="card-back-image">`
    : "";

  cardBack.innerHTML = `
        <button class="close-btn" aria-label="Tutup">X</button>
        ${imageHTML}
        <div class="card-content-wrapper">
        <h3 class="card-back-question">${data.question}</h3>
        <div class="options-list">
            ${optionsHTML}
        </div>
    </div>
    `;

  // Tambahkan event listener ke tombol 'X' dan tombol pilihan
  cardBack.querySelector(".close-btn").addEventListener("click", (e) => {
    e.stopPropagation(); // Hentikan event agar tidak memicu overlay click
    closeActiveCard();
  });

  cardBack.querySelectorAll(".option-btn").forEach((btn) => {
    btn.addEventListener("click", () => handleAnswer(btn, data.correctAnswer));
  });
}

/**
 * Menangani logika saat pengguna memilih jawaban
 */
function handleAnswer(selectedButton, correctAnswer) {
  stopTimer();

  const allOptions = activeCard.querySelectorAll(".option-btn");
  // Nonaktifkan semua tombol pilihan
  allOptions.forEach((btn) => btn.classList.add("disabled"));

  // Ambil opsi dari data-attribute, bukan dari textContent
  const selectedAnswer = selectedButton.dataset.option;

  if (selectedAnswer === correctAnswer) {
    // --- Jawaban Benar ---
    points += 10; // Skor 10 per jawaban benar
    selectedButton.classList.add("correct");
    activeCard.classList.add("is-correct");

    // Tutup kartu setelah 10 detik
    setTimeout(closeActiveCard, 10000);
  } else {
    // --- Jawaban Salah ---
    selectedButton.classList.add("wrong");
    // Tampilkan jawaban yang benar
    allOptions.forEach((btn) => {
      if (btn.dataset.option === correctAnswer) {
        btn.classList.add("correct");
      }
    });
    activeCard.classList.add("is-wrong");

    // Tutup kartu setelah 10 detik
    setTimeout(closeActiveCard, 10000);
  }

  answeredCards++;
  updateScoreboard();

  // Cek apakah level selesai
  checkLevelCompletion();
}

/**
 * Menutup kartu yang sedang aktif
 */
function closeActiveCard() {
  if (!activeCard) return;

  stopTimer();
  resetTimer(); // Siapkan timer untuk kartu berikutnya

  activeCard.classList.remove("is-flipped", "is-active");
  pageOverlay.classList.remove("visible");

  // Kosongkan konten card-back setelah animasi selesai
  setTimeout(() => {
    if (activeCard) {
      // Pastikan activeCard masih ada
      activeCard.querySelector(".card-back").innerHTML = "";
      activeCard = null; // Setel ulang kartu aktif
    }
  }, 800); // Sesuaikan dengan durasi transisi CSS
}

/**
 * Memeriksa apakah semua kartu sudah terjawab dan menyimpan progres.
 */
function checkLevelCompletion() {
  if (answeredCards === cards.length) {
    // Simpan progres dan tampilkan modal setelah 1 detik
    setTimeout(() => {
      saveProgress()
        .then(() => {
          // Jika progres berhasil disimpan, tampilkan modal
          modalScoreEl.textContent = points;
          modalOverlay.classList.add("visible");
        })
        .catch((error) => {
          // Jika gagal, tetap tampilkan modal tapi beri tahu user
          console.error(
            "Gagal menyimpan progres, tapi modal tetap ditampilkan.",
            error
          );
          modalScoreEl.textContent = points;
          modalOverlay.classList.add("visible");
          // Anda bisa menambahkan elemen pesan error di modal jika diperlukan
        });
    }, 1000);
  }
}

/**
 * Mengirim progres (skor dan level) ke server.
 * @returns {Promise}
 */
function saveProgress() {
  // Kirim data menggunakan Fetch API ke endpoint PHP
  const formData = new URLSearchParams();
  formData.append("skor", points);
  formData.append("lvl", level);

  // Mengembalikan promise dari fetch
  return fetch("update_progres.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData,
  })
    .then((response) => {
      if (!response.ok)
        throw new Error("Gagal menyimpan progres. Pastikan Anda sudah login.");
      return response.json();
    })
    .then((data) => {
      if (data.status !== "success") {
        throw new Error(
          "Penyimpanan progres gagal: " +
            (data.message || "Error tidak diketahui.")
        );
      }
      console.log("Progres berhasil disimpan.");
      return data;
    });
}

/**
 * Mengarahkan pengguna ke level berikutnya.
 */
function goToNextLevel() {
  // Logika penyimpanan sudah dipindah ke checkLevelCompletion.
  // Fungsi ini sekarang hanya bertugas untuk navigasi.
  if (nextLevelBtn) {
    // Pastikan tombol nextLevelBtn ada
    const nextLevel = nextLevelBtn.dataset.nextLevel;
    window.location.href = `levelgame.php?level=${nextLevel}`;
  }
}

// --- 5. FUNGSI TIMER ---
function startTimer() {
  timeLeft = 40; // Reset waktu
  updateTimerDisplay();

  clearInterval(timerInterval); // Hentikan timer lama jika ada

  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();

    if (timeLeft <= 0) {
      handleTimeout();
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

function resetTimer() {
  timeLeft = 40; // Sesuaikan dengan nilai awal
  updateTimerDisplay();
}

/**
 * Logika jika waktu habis (dianggap salah)
 */
function handleTimeout() {
  stopTimer();
  if (!activeCard) return;

  // Tandai sebagai salah
  activeCard.classList.add("is-wrong");
  answeredCards++;

  // Tampilkan jawaban yang benar
  const data = quizData.find((q) => q.id == activeCard.dataset.id);
  const allOptions = activeCard.querySelectorAll(".option-btn");
  allOptions.forEach((btn) => {
    btn.classList.add("disabled");
    if (btn.dataset.option === data.correctAnswer) {
      // Menggunakan data-option
      btn.classList.add("correct");
    }
  });

  // Tutup setelah 2 detik
  setTimeout(closeActiveCard, 2000);
  checkLevelCompletion();
}

// --- 6. FUNGSI UTILITAS ---

function updateScoreboard() {
  pointsEl.textContent = points;
  levelEl.textContent = level;
}

function updateTimerDisplay() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  // Format "00:00"
  timerEl.textContent = `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
}

// --- 7. Jalankan Game ---
document.addEventListener("DOMContentLoaded", initializeGame);
