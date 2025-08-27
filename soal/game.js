let currentIndex = 0;
let soalList = [];
let skor = 0;
let timer = 30;
let timerInterval;
let totalDijawab = 0;

const skorDisplay = document.getElementById("skor");
const timerDisplay = document.getElementById("timer");
const questionBox = document.getElementById("question-box");
const cards = document.querySelectorAll(".card");
const nextLevelBtn = document.getElementById("nextLevel");

function startGame() {
  const level = new URLSearchParams(window.location.search).get("level") || 1;

  fetch(`load_soal.php?level=${level}`)
    .then((res) => res.json())
    .then((data) => {
      soalList = data;
      setupCards();
    });
}

function setupCards() {
  cards.forEach((card, index) => {
    card.addEventListener("click", () => {
      if (card.classList.contains("disabled")) return;
      showQuestion(index);
    });
  });
}

function showQuestion(index) {
  const soal = soalList[index];
  if (!soal) return;

  cards[index].classList.add("disabled");

  const pertanyaanHTML = `
    <div class="popup">
      <h3>${soal.pertanyaan}</h3>
      <div class="options">
        <button onclick="pilihJawaban(this, '${soal.jawaban}', 'A', ${index})">${soal.a}</button>
        <button onclick="pilihJawaban(this, '${soal.jawaban}', 'B', ${index})">${soal.b}</button>
        <button onclick="pilihJawaban(this, '${soal.jawaban}', 'C', ${index})">${soal.c}</button>
        <button onclick="pilihJawaban(this, '${soal.jawaban}', 'D', ${index})">${soal.d}</button>
      </div>
    </div>
  `;

  questionBox.innerHTML = pertanyaanHTML;
  questionBox.style.display = "block";

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
      closeQuestion(index, false);
    }
  }, 1000);
}

function pilihJawaban(btn, jawabanBenar, jawabanPilih, index) {
  clearInterval(timerInterval);

  const isCorrect = jawabanPilih === jawabanBenar;
  btn.style.background = isCorrect ? "green" : "red";

  if (isCorrect) {
    skor += 10;
    skorDisplay.innerText = skor;
  }

  setTimeout(() => {
    closeQuestion(index, isCorrect);
  }, 1000);
}

function closeQuestion(index, benar) {
  questionBox.style.display = "none";
  const card = cards[index];
  card.innerHTML = benar ? "✔️" : "❌";
  card.classList.add(benar ? "benar" : "salah");

  totalDijawab++;

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
