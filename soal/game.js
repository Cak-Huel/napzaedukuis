let currentIndex = 0;
let soalList = [];
let skor = 0;
let timer = 30;
let timerInterval;
let totalDijawab = 0;

const skorDisplay = document.getElementById("skor");
const timerDisplay = document.getElementById("timer");
// Variabel lama questionBox dan cards dihapus atau diubah
const nextLevelBtn = document.getElementById("nextLevel");

// MENGUBAH: Selektor kartu disesuaikan ke elemen kontainer flip-card
const cardContainers = document.querySelectorAll(".flip-card");
const cardContainerMain = document.querySelector(".card-container"); // Tambahkan ini

function startGame() {
  const level = new URLSearchParams(window.location.search).get("level") || 1;

  fetch(`load_soal.php?level=${level}`)
    .then((res) => res.json())
    .then((data) => {
      soalList = data;
      // Memanggil fungsi untuk mengatur event listener pada kartu
      setupCards();
    });
}

// MENGUBAH: Fungsi setupCards sekarang hanya menambahkan event listener ke kontainer luar
function setupCards() {
  cardContainers.forEach((container, index) => {
    // Menambahkan event listener ke seluruh kontainer kartu
    container.addEventListener("click", () => {
      // Pastikan kartu belum dijawab atau sedang dalam proses
      if (container.classList.contains("answered")) return;

      // Memicu fungsi flipCard (memutar dan mengisi pertanyaan)
      flipCard(container, index);
    });
  });
}

// FUNGSI BARU: Menggantikan showQuestion lama dan mengurus animasi flip
function flipCard(cardContainer, index) {
  const soal = soalList[index];
  // Tambahkan kondisi untuk menghindari flip jika sudah dijawab
  if (!soal || cardContainer.classList.contains("answered")) return;

  // 1. TAMBAH KELAS FOKUS
  // Hapus fokus dari kartu lain jika ada, lalu tambahkan pada kartu saat ini
  cardContainers.forEach((c) => c.classList.remove("is-focused"));
  cardContainer.classList.add("is-focused");
  if (cardContainerMain) cardContainerMain.classList.add("has-focus"); // Tambah kelas ke kontainer utama

  // 2. Isi konten pertanyaan ke sisi belakang kartu (tetap sama)
  const cardInner = cardContainer.querySelector(".flip-card-inner");
  const cardBack = cardContainer.querySelector(".flip-card-back");
  cardBack.innerHTML = `
        <div class="question-content">
            <h3 id="q-title-${index}">${soal.pertanyaan}</h3>
            <div id="q-options-${index}" class="options">
                <button class="answer-btn" data-jawaban-pilih="A">${soal.a}</button>
                <button class="answer-btn" data-jawaban-pilih="B">${soal.b}</button>
                <button class="answer-btn" data-jawaban-pilih="C">${soal.c}</button>
                <button class="answer-btn" data-jawaban-pilih="D">${soal.d}</button>
            </div>
        </div>
    `;

  // 3. Tambahkan event listener untuk tombol jawaban yang baru dibuat
  const answerButtons = cardBack.querySelectorAll(".answer-btn");
  answerButtons.forEach((btn) => {
    btn.addEventListener("click", (event) => {
      event.stopPropagation();
      pilihJawaban(
        btn,
        soal.jawaban,
        btn.getAttribute("data-jawaban-pilih"),
        index
      );
    });
  });

  // 4. PUTAR KARTU (beri jeda agar efek fokus terlihat)
  setTimeout(() => {
    cardInner.classList.add("is-flipped");
  }, 10);

  // 5. Mulai Timer
  startTimer(index);
}

function startTimer(index) {
  timer = 30;
  timerDisplay.innerText = timer;
  clearInterval(timerInterval);

  timerInterval = setInterval(() => {
    timer--;
    timerDisplay.innerText = timer;

    if (timer <= 0) {
      clearInterval(timerInterval);
      // Panggil closeQuestion dan putar kembali kartu
      closeQuestion(index, false);
    }
  }, 1000);
}

function pilihJawaban(btn, jawabanBenar, jawabanPilih, index) {
  clearInterval(timerInterval);

  const isCorrect = jawabanPilih === jawabanBenar;
  // MENGUBAH: Menambahkan kelas CSS untuk menampilkan warna (telah ditambahkan di CSS)
  btn.classList.add(isCorrect ? "correct" : "incorrect");

  // Nonaktifkan semua tombol jawaban di kartu yang sama
  const optionsDiv = btn.closest(".options");
  optionsDiv
    .querySelectorAll(".answer-btn")
    .forEach((b) => (b.disabled = true));

  if (isCorrect) {
    skor += 10;
    skorDisplay.innerText = skor;
  }

  setTimeout(() => {
    // Panggil closeQuestion dan putar kembali kartu
    closeQuestion(index, isCorrect);
  }, 1000);
}

// MENGUBAH: Fungsi closeQuestion sekarang memutar kartu kembali dan menghilangkan fokus
function closeQuestion(index, benar) {
  totalDijawab++;

  const cardContainer = cardContainers[index];
  const cardInner = cardContainer.querySelector(".flip-card-inner");
  const cardFront = cardContainer.querySelector(".flip-card-front");

  // TANDAI KARTU SUDAH DIJAWAB
  cardContainer.classList.add("answered");

  // TAMPILKAN HASIL PADA SISI DEPAN KARTU
  cardFront.innerHTML = `
        <div style="
            display: flex; 
            justify-content: center; 
            align-items: center; 
            height: 100%; 
            font-size: 50px; 
            color: white;
            border-radius: 12px;
            background-color: ${benar ? "#4caf50" : "#f44336"};
        ">
            ${benar ? "✔️" : "❌"}
        </div>
    `;

  // 1. PUTAR KEMBALI KARTU
  setTimeout(() => {
    cardInner.classList.remove("is-flipped");
  }, 500); // 500ms setelah jawaban ditandai

  // 2. HILANGKAN FOKUS
  setTimeout(() => {
    cardContainer.classList.remove("is-focused");
    if (cardContainerMain) cardContainerMain.classList.remove("has-focus");
  }, 1100); // setelah animasi selesai

  // Lanjutkan ke logika level
  if (totalDijawab === soalList.length) {
    nextLevelBtn.style.display = "block";
    updateProgres();
  }
}

function updateProgres() {
  const level = new URLSearchParams(window.location.search).get("level") || 1;

  fetch("update_progres.php", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `skor=${skor}&lvl=${level}`,
  })
    .then((res) => {
      if (!res.ok) {
        alert("Gagal menyimpan progres! Pastikan Anda sudah login.");
        return null;
      }
      return res.json();
    })
    .then((data) => {
      if (data && data.status !== "success") {
        alert("Progres tidak tersimpan!");
      } else if (data && data.status === "success") {
        // Optional: tampilkan notifikasi progres berhasil
        // alert("Progres berhasil disimpan!");
      }
    })
    .catch((err) => {
      alert("Terjadi kesalahan koneksi ke server!");
    });
}

window.onload = startGame;
