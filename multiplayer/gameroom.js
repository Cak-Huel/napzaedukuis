// gameroom.js (versi robust)
// Pastikan file ini adalah file yang dibundle/serve ke peserta
const socket = io("http://localhost:3000", { transports: ["websocket"] });

const urlParams = new URLSearchParams(window.location.search);
const id_room = urlParams.get("id_room");
const id_peserta = urlParams.get("id_peserta");

// Validasi id_peserta
if (!id_peserta) {
  alert("ID peserta tidak ditemukan. Silakan join room terlebih dahulu.");
  window.location.href = "joinroom.php";
  throw new Error("ID peserta kosong, redirect ke joinroom.php");
}

let currentSoal = null;
let timer = 30;
let timerInterval = null;
let answeredSoalId = null;
let requestingQuestion = false;

function setButtonsDisabled(disabled) {
  document
    .querySelectorAll(".answer-btn")
    .forEach((b) => (b.disabled = disabled));
}

function log(...args) {
  console.log("[gameroom]", ...args);
}

// Request initial question
socket.on("connect", () => {
  log("connected", socket.id);
  // join socket room supaya dapat broadcast
  socket.emit("get_room_info_by_id", id_room);
  // minta soal saat connect (first load atau reconnect)
  socket.emit("get_question", { id_room, id_peserta });
});

socket.on("question_data", (data) => {
  log("question_data received", data);
  if (!data) {
    // tidak ada soal lagi
    window.location.href = `score.php?id_room=${encodeURIComponent(
      id_room
    )}&id_peserta=${encodeURIComponent(id_peserta || "")}`;
    return;
  }
  // reset guard untuk soal baru
  answeredSoalId = null;
  requestingQuestion = false;
  currentSoal = data;

  // render soal
  const qEl = document.querySelector(".question-card p");
  if (qEl) qEl.textContent = data.pertanyaan || "";
  const btns = document.querySelectorAll(".answer-btn");
  if (btns.length >= 4) {
    btns[0].textContent = "A " + (data.jwbn_a || "");
    btns[1].textContent = "B " + (data.jwbn_b || "");
    btns[2].textContent = "C " + (data.jwbn_c || "");
    btns[3].textContent = "D " + (data.jwbn_d || "");
  }
  setButtonsDisabled(false);

  // timer
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

document.querySelectorAll(".answer-btn").forEach((btn, idx) => {
  btn.onclick = function () {
    submitAnswer(["A", "B", "C", "D"][idx]);
  };
});

function submitAnswer(jawaban) {
  if (!currentSoal) return;
  if (answeredSoalId === currentSoal.id_soalmlt) {
    log("duplicate submit prevented for", currentSoal.id_soalmlt);
    return;
  }
  answeredSoalId = currentSoal.id_soalmlt;
  clearInterval(timerInterval);
  setButtonsDisabled(true);

  const payload = {
    id_peserta,
    id_soalmlt: currentSoal.id_soalmlt,
    jawaban,
    waktu_jawab: 30 - timer,
  };
  log("Kirim jawaban:", payload);
  socket.emit("submit_answer", payload);

  // Tambahkan ini untuk refresh otomatis setelah submit
  setTimeout(() => {
    window.location.reload();
  }, 500); // beri delay agar server sempat proses
}

// server may instruct next_question
socket.on("next_question", () => {
  log("next_question received");
  if (!id_room || !id_peserta) {
    log("missing id_room or id_peserta");
    return;
  }
  if (!socket.connected) {
    log("socket not connected");
    return;
  }
  if (requestingQuestion) {
    log("already requesting question, skip");
    return;
  }
  requestingQuestion = true;
  socket.emit("get_question", { id_room, id_peserta });
  setTimeout(() => (requestingQuestion = false), 1500);
});

socket.on("score_update", (data) => {
  const sb = document.querySelector(".score-box");
  if (sb) sb.textContent = `Skor ${data.skor || 0}`;
});

socket.on("game_ended", (data) => {
  log("game_ended", data);
  alert("Permainan diakhiri oleh host.");
  window.location.href = `score.php?id_room=${id_room}&id_peserta=${id_peserta}`;
});

socket.on("connect_error", (err) => {
  console.error("[gameroom] connect_error:", err);
});
socket.on("reconnect_error", (err) => {
  console.error("[gameroom] reconnect_error:", err);
});
