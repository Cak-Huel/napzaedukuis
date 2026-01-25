document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const id_room = urlParams.get("id_room");
  const id_peserta = urlParams.get("id_peserta");

  // Elemen UI
  const playerNameEl = document.querySelector(".player-name");
  const scoreBoxEl = document.querySelector(".score-box");
  const timerBoxEl = document.querySelector(".timer-box");
  const questionTextEl = document.querySelector(".question-text");
  const questionImageEl = document.querySelector(".question-image");
  const answerBtns = document.querySelectorAll(".answer-btn");

  let currentSoal = null;
  let timer = 30;
  let timerInterval = null;

  function setButtonsDisabled(disabled) {
    answerBtns.forEach((b) => (b.disabled = disabled));
  }

  function showWaitingScreen() {
    const lang = document.documentElement.lang || "id";
    questionTextEl.textContent =
    translations[lang]?.waiting_for_next_question ||
      "Menunggu soal berikutnya dari host...";
    answerBtns.forEach((btn) => (btn.style.display = "none"));
    if (questionImageEl) questionImageEl.style.display = "none";
    setButtonsDisabled(true);
  }

  function displayQuestion(questionData) {
    currentSoal = questionData;
    const lang = document.documentElement.lang || "id";

    // Update question text
    questionTextEl.textContent = questionData.pertanyaan || ""; // This is dynamic from DB, so no data-key here
    
     // Handle image display
    if (questionImageEl) {
      if (questionData.gambar && questionData.gambar.trim() !== "") {
        questionImageEl.src = `../${questionData.gambar}`;
        questionImageEl.style.display = "block";
      } else {
        questionImageEl.style.display = "none";
      }
    }
    
    answerBtns.forEach((btn) => (btn.style.display = "block"));
    answerBtns[0].textContent = `A. ${questionData.jwbn_a || ""}`;
    answerBtns[1].textContent = `B. ${questionData.jwbn_b || ""}`;
    answerBtns[2].textContent = `C. ${questionData.jwbn_c || ""}`;
    answerBtns[3].textContent = `D. ${questionData.jwbn_d || ""}`;

    setButtonsDisabled(false);
    startTimer();
  }

  function startTimer() {
    timer = 30; // Atur durasi timer
    const lang = document.documentElement.lang || "id";
    if (timerBoxEl)
      timerBoxEl.textContent = `${
        translations[lang]?.timer_emoji || "⏱️"
      } ${timer}`;
    if (timerInterval) clearInterval(timerInterval);

    timerInterval = setInterval(() => {
      timer--;
      if (timerBoxEl)
        timerBoxEl.textContent = `${
          translations[lang]?.timer_emoji || "⏱️"
        } ${timer}`;
      if (timer <= 0) {
        clearInterval(timerInterval);
        timerBoxEl.textContent = `${translations[lang]?.timer_emoji || "⏱️"} 0`; // Ensure timer shows 0
        // Waktu habis, kirim jawaban null
        submitAnswer(null);
      }
    }, 1000);
  }

  // Untuk menampilkan layar setelah pemain selesai ---
  function showGameFinishedScreen() {
    const lang = document.documentElement.lang || "id";
    questionTextEl.textContent =
      translations[lang]?.game_finished_player_message ||
      "Anda sudah menyelesaikan kuis! 🎉 Tunggu guru untuk mengakhiri permainan bagi semua peserta.";
    answerBtns.forEach((btn) => (btn.style.display = "none"));
    if (timerInterval) clearInterval(timerInterval);
    if (questionImageEl) questionImageEl.style.display = "none";
    // Use a translated checkmark or default
    timerBoxEl.textContent =
      translations[lang]?.game_finished_timer_status || "✔️";
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

      // --- LOGIKA KOREKSI VISUAL ---
      const options = ["A", "B", "C", "D"];
      
      // 1. Warnai jawaban yang dipilih user
      if (jawaban) {
        const idx = options.indexOf(jawaban);
        if (idx >= 0 && answerBtns[idx]) {
          if (result.is_correct) {
            answerBtns[idx].style.backgroundColor = "#28a745"; // Hijau jika benar
            answerBtns[idx].style.color = "white";
          } else {
            answerBtns[idx].style.backgroundColor = "#dc3545"; // Merah jika salah
            answerBtns[idx].style.color = "white";
          }
        }
      }

      // 2. Jika salah (atau waktu habis), tunjukkan jawaban yang benar (Hijau)
      if (!result.is_correct && result.correct_answer) {
        const correctIdx = options.indexOf(result.correct_answer);
        if (correctIdx >= 0 && answerBtns[correctIdx]) {
          answerBtns[correctIdx].style.backgroundColor = "#28a745";
          answerBtns[correctIdx].style.color = "white";
        }
      }

      // 3. Beri jeda 1.5 detik agar user bisa melihat koreksi
      await new Promise(r => setTimeout(r, 1500));

      // 4. Reset warna tombol untuk soal berikutnya
      answerBtns.forEach(btn => {
        btn.style.backgroundColor = "";
        btn.style.color = "";
      });
      // -----------------------------

      if (result.success && result.next_question) {
        // Jika ada soal berikutnya, tampilkan
        displayQuestion(result.next_question);
      } else if (result.success) {
        // Jika tidak ada soal lagi, game selesai untuk pemain ini
        const lang = document.documentElement.lang || "id";
        showGameFinishedScreen();
        // Jika tidak ada soal lagi, game selesai untuk pemain ini, redirect ke halaman skor
        alert(
          translations[lang]?.alert_all_questions_complete ||
            "Selamat, Anda telah menyelesaikan semua soal!"
        );
        window.location.href = `score.php?id_room=${id_room}&id_peserta=${id_peserta}`;
      } else {
        const lang = document.documentElement.lang || "id";
        throw new Error(
          result.message ||
            translations[lang]?.alert_submit_answer_failed ||
            "Gagal mengirim jawaban."
        );
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
        const lang = document.documentElement.lang || "id";
        if (scoreBoxEl)
          scoreBoxEl.textContent = `${
            translations[lang]?.score_label || "Skor:"
          } ${result.data.skor}`;
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
        const lang = document.documentElement.lang || "id";
        // Tidak ada soal di room ini, atau sudah selesai semua
        alert(
          translations[lang]?.alert_game_finished_no_questions ||
            "Permainan telah selesai atau tidak ada soal yang tersedia."
        );
        window.location.href = `score.php?id_room=${id_room}&id_peserta=${id_peserta}`;
      }
    } catch (error) {
      console.error("Gagal mengambil soal pertama:", error);
      const lang = document.documentElement.lang || "id";
      alert(
        translations[lang]?.alert_load_game_failed || "Gagal memuat permainan."
      );
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
            const lang = document.documentElement.lang || "id";
            alert(
              translations[lang]?.alert_game_ended_by_host ||
                "Permainan diakhiri oleh host!"
            );
            window.location.href = `score.php?id_room=${id_room}&id_peserta=${id_peserta}`;
          });
        }
      });

    // 2. Channel privat untuk update skor pemain ini saja
    const playerChannel = pusher.subscribe(`private-player-${id_peserta}`);
    playerChannel.bind("score-updated", (data) => {
      // This is for real-time score updates
      const lang = document.documentElement.lang || "id";
      if (scoreBoxEl)
        scoreBoxEl.textContent = `${
          translations[lang]?.score_label || "Skor:"
        } ${data.skor || 0}`;
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
