document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const id_room = urlParams.get("id_room");
  const id_peserta = urlParams.get("id_peserta");

  // Elemen UI
  const playerNameEl = document.querySelector(".player-name");
  const scoreBoxEl = document.querySelector(".score-box");
  const timerBoxEl = document.querySelector(".timer-box");
  const questionCardEl = document.querySelector(".question-card p");
  const answerBtns = document.querySelectorAll(".answer-btn");

  let currentSoal = null;
  let timer = 30;
  let timerInterval = null;

  function setButtonsDisabled(disabled) {
    answerBtns.forEach((b) => (b.disabled = disabled));
  }

  function showWaitingScreen() {
    questionCardEl.textContent = "Menunggu soal berikutnya dari host...";
    answerBtns.forEach((btn) => (btn.style.display = "none"));
    setButtonsDisabled(true);
  }

  function displayQuestion(questionData) {
    currentSoal = questionData;
    questionCardEl.textContent = questionData.pertanyaan || "";

    answerBtns.forEach((btn) => (btn.style.display = "block"));
    answerBtns[0].textContent = "A. " + (questionData.jwbn_a || "");
    answerBtns[1].textContent = "B. " + (questionData.jwbn_b || "");
    answerBtns[2].textContent = "C. " + (questionData.jwbn_c || "");
    answerBtns[3].textContent = "D. " + (questionData.jwbn_d || "");

    setButtonsDisabled(false);
    startTimer();
  }

  function startTimer() {
    timer = 30; // Atur durasi timer
    if (timerBoxEl) timerBoxEl.textContent = `⏱️ ${timer}`;
    if (timerInterval) clearInterval(timerInterval);

    timerInterval = setInterval(() => {
      timer--;
      if (timerBoxEl) timerBoxEl.textContent = `⏱️ ${timer}`;
      if (timer <= 0) {
        clearInterval(timerInterval);
        // Waktu habis, kirim jawaban null
        submitAnswer(null);
      }
    }, 1000);
  }

  // Untuk menampilkan layar setelah pemain selesai ---
  function showGameFinishedScreen() {
    questionCardEl.textContent =
      "Anda sudah menyelesaikan kuis! 🎉 Tunggu guru untuk mengakhiri permainan bagi semua peserta.";
    answerBtns.forEach((btn) => (btn.style.display = "none"));
    if (timerInterval) clearInterval(timerInterval);
    timerBoxEl.textContent = "✔️";
    setButtonsDisabled(true);
  }

  async function submitAnswer(jawaban) {
    if (!currentSoal) return;

    clearInterval(timerInterval);
    setButtonsDisabled(true);

    const soalIdToSubmit = currentSoal.id_soalmlt;
    currentSoal = null; // Mencegah submit ganda

    const formData = new FormData();
    formData.append("id_room", id_room); // Kirim id_room juga
    formData.append("id_peserta", id_peserta);
    formData.append("id_soalmlt", soalIdToSubmit);
    if (jawaban) {
      formData.append("jawaban", jawaban);
    }
    formData.append("waktu_jawab", 30 - timer);

    try {
      const response = await fetch("submit_answer.php", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();

      if (result.success && result.next_question) {
        // Jika ada soal berikutnya, tampilkan
        displayQuestion(result.next_question);
      } else if (result.success) {
        // Jika tidak ada soal lagi, game selesai untuk pemain ini
        showGameFinishedScreen();
        // Jika tidak ada soal lagi, game selesai untuk pemain ini, redirect ke halaman skor
        alert("Selamat, Anda telah menyelesaikan semua soal!");
        window.location.href = `score.php?id_room=${id_room}&id_peserta=${id_peserta}`;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error("Gagal mengirim jawaban:", error);
      alert("Gagal mengirim jawaban, coba lagi.");
      setButtonsDisabled(false); // Aktifkan lagi tombol jika gagal
    }
  }

  async function initializePlayerState() {
    try {
      const response = await fetch(
        `get_player_state.php?id_peserta=${id_peserta}`
      );
      const result = await response.json();
      if (result.success) {
        if (playerNameEl) playerNameEl.textContent = result.data.nama_guest;
        if (scoreBoxEl) scoreBoxEl.textContent = `Skor: ${result.data.skor}`;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error("Gagal memuat info pemain:", error);
      alert("Gagal memuat info pemain.");
    }
  }

  async function getFirstQuestion() {
    try {
      const response = await fetch(
        `get_question.php?id_room=${id_room}&id_peserta=${id_peserta}`
      );
      const result = await response.json();
      if (result.success && result.question) {
        displayQuestion(result.question);
      } else {
        // Tidak ada soal di room ini, atau sudah selesai semua
        alert("Permainan telah selesai atau tidak ada soal yang tersedia.");
        window.location.href = `score.php?id_room=${id_room}&id_peserta=${id_peserta}`;
      }
    } catch (error) {
      console.error("Gagal mengambil soal pertama:", error);
      alert("Gagal memuat permainan.");
    }
  }

  // --- Setup Pusher ---
  if (typeof pusher !== "undefined") {
    // Channel untuk menerima event umum seperti game-finished dari host
    fetch(`get_room_details.php?id_room=${id_room}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.kode_room) {
          const roomChannel = pusher.subscribe(
            `private-quiz-${data.kode_room}`
          );
          roomChannel.bind("game-finished", (event) => {
            alert("Permainan diakhiri oleh host!");
            window.location.href = `score.php?id_room=${id_room}&id_peserta=${id_peserta}`;
          });
        }
      });

    // 2. Channel privat untuk update skor pemain ini saja
    const playerChannel = pusher.subscribe(`private-player-${id_peserta}`);
    playerChannel.bind("score-updated", (data) => {
      if (scoreBoxEl) scoreBoxEl.textContent = `Skor: ${data.skor || 0}`;
    });
  }

  // --- Event Listeners untuk Tombol Jawaban ---
  answerBtns.forEach((btn, idx) => {
    btn.onclick = () => {
      const answerChoice = ["A", "B", "C", "D"][idx];
      submitAnswer(answerChoice);
    };
  });

  // --- Inisialisasi ---
  initializePlayerState();
  getFirstQuestion(); // Ambil soal pertama, bukan menunggu
});
