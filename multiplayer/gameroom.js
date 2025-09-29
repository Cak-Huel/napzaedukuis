const socket = io("http://localhost:3000", { transports: ["websocket"] });

const urlParams = new URLSearchParams(window.location.search);
const id_room = urlParams.get("id_room");
const id_peserta = urlParams.get("id_peserta");

let currentSoal = null;
let timer = 30;
let timerInterval = null;
let answeredSoalId = null;
let requestingQuestion = false;

// Disable/enable tombol jawaban
function setButtonsDisabled(disabled) {
  document
    .querySelectorAll(".answer-btn")
    .forEach((b) => (b.disabled = disabled));
}

// Request soal awal
socket.emit("get_question", { id_room, id_peserta });

// Handler soal baru
socket.on("question_data", (data) => {
  if (!data) {
    window.location.href = `score.php?id_room=${id_room}&id_peserta=${id_peserta}`;
    return;
  }
  answeredSoalId = null;
  requestingQuestion = false;
  currentSoal = data;
  document.querySelector(".question-card p").textContent =
    data.pertanyaan || "";
  const answerBtns = document.querySelectorAll(".answer-btn");
  answerBtns[0].textContent = "A " + (data.jwbn_a || "");
  answerBtns[1].textContent = "B " + (data.jwbn_b || "");
  answerBtns[2].textContent = "C " + (data.jwbn_c || "");
  answerBtns[3].textContent = "D " + (data.jwbn_d || "");
  setButtonsDisabled(false);

  // Reset timer
  timer = 30;
  const timerBox = document.querySelector(".timer-box");
  if (timerBox) timerBox.textContent = `⏱️ ${timer}`;
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timer--;
    if (timerBox) timerBox.textContent = `⏱️ ${timer}`;
    if (timer <= 0) {
      clearInterval(timerInterval);
      if (!currentSoal || answeredSoalId === currentSoal.id_soalmlt) return;
      submitAnswer(null); // waktu habis
    }
  }, 1000);
});

// Jawab pertanyaan
document.querySelectorAll(".answer-btn").forEach((btn, idx) => {
  btn.onclick = function () {
    submitAnswer(["A", "B", "C", "D"][idx]);
  };
});

// Submit jawaban (mencegah submit ganda)
function submitAnswer(jawaban) {
  if (!currentSoal) return;
  if (answeredSoalId === currentSoal.id_soalmlt) return;
  answeredSoalId = currentSoal.id_soalmlt;
  clearInterval(timerInterval);
  setButtonsDisabled(true);
  socket.emit("submit_answer", {
    id_peserta,
    id_soalmlt: currentSoal.id_soalmlt,
    jawaban,
    waktu_jawab: 30 - timer,
  });
}

// Skor update
socket.on("score_update", (data) => {
  const sb = document.querySelector(".score-box");
  if (sb) sb.textContent = `Skor ${data.skor || 0}`;
});

// Next question diterima dari server
socket.on("next_question", () => {
  if (!id_room || !id_peserta) return;
  if (!socket.connected) return;
  if (requestingQuestion) return;
  requestingQuestion = true;
  socket.emit("get_question", { id_room, id_peserta });
  setTimeout(() => (requestingQuestion = false), 1200);
});

// Game ended dari server
socket.on("game_ended", (data) => {
  alert("Permainan diakhiri oleh host.");
  window.location.href = `score.php?id_room=${id_room}&id_peserta=${id_peserta}`;
});

// Handle reconnect
socket.on("connect", () => {
  if (!currentSoal) socket.emit("get_question", { id_room, id_peserta });
});

// Error log koneksi
socket.on("connect_error", (err) => {
  console.error("connect_error on gameroom socket:", err);
});
