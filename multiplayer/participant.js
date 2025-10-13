document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const id_room = urlParams.get("id_room");

  // Sesuaikan selektor dengan HTML di participant.php
  const codeEl = document.querySelector(".room-box h1");
  const participantListEl = document.getElementById("participant-list");
  const totalPesertaEl = document.getElementById("total-peserta");
  const startBtn = document.getElementById("start-game-btn");

  if (!id_room) {
    console.error("participant: id_room tidak ditemukan di URL");
    alert("Error: ID Room tidak ditemukan. Silakan kembali dan coba lagi.");
    return;
  }

  // Fungsi untuk merender daftar peserta
  function renderPlayers(names = []) {
    participantListEl.innerHTML = "";
    if (!names.length) {
      const li = document.createElement("li");
      li.textContent = "Belum ada peserta yang bergabung.";
      participantListEl.appendChild(li);
    } else {
      names.forEach((n) => {
        const li = document.createElement("li");
        li.textContent = n;
        participantListEl.appendChild(li);
      });
    }
    // Update jumlah peserta
    if (totalPesertaEl) {
      totalPesertaEl.textContent = names.length;
    }
  }

  // --- Logika Pusher ---

  // Inisialisasi Pusher (pastikan variabel 'pusher' sudah ada dari file PHP)
  if (typeof Pusher === "undefined") {
    console.error(
      "Pusher JS tidak ditemukan. Pastikan sudah di-include di halaman HTML."
    );
    return;
  }

  // Subscribe ke channel room yang spesifik
  const channelName = `private-quiz-${id_room}`;
  const channel = pusher.subscribe(channelName);

  // Bind ke event 'participant-joined' untuk update daftar peserta secara real-time
  channel.bind("participant-joined", function (data) {
    console.log("Event participant-joined diterima:", data);
    if (data.nama_guest) {
      addParticipantToList(data.nama_guest);
      updateParticipantCount();
    }
  });

  // Bind ke event 'game-ended' dari host
  channel.bind("game-ended", function (data) {
    console.log("participant received game_ended", data);
    alert("Permainan diakhiri oleh host.");
    window.location.href = "selection.php";
  });

  // --- Logika Fetch untuk interaksi dengan server ---

  // 1. Ambil data awal saat halaman dimuat
  async function getInitialRoomData() {
    try {
      const response = await fetch(`get_room_details.php?id_room=${id_room}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        if (codeEl) codeEl.textContent = data.kode_room || "";
        renderPlayers(data.peserta || []);
      } else {
        throw new Error(data.message || "Gagal mengambil data room.");
      }
    } catch (error) {
      console.error("Gagal mengambil data awal room:", error);
      alert("Gagal memuat informasi room. Silakan coba lagi.");
    }
  }

  // 2. Fungsi untuk memulai game saat tombol diklik
  async function startGame() {
    if (!startBtn) return;
    startBtn.disabled = true;
    startBtn.textContent = "Memulai...";

    try {
      const response = await fetch("start_game_trigger.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `id_room=${id_room}`,
      });

      const result = await response.json();
      if (response.ok && result.success) {
        // Redirect host ke halaman scoreboard
        window.location.href = `scorebord.php?id_room=${encodeURIComponent(
          id_room
        )}`;
      } else {
        throw new Error(result.message || "Gagal memulai permainan di server.");
      }
    } catch (error) {
      console.error("Error saat memulai game:", error);
      alert(`Gagal memulai permainan: ${error.message}`);
      startBtn.disabled = false;
      startBtn.textContent = "Mulai Game";
    }
  }

  // Tambahkan event listener ke tombol start
  if (startBtn) {
    startBtn.addEventListener("click", startGame);
  }

  // Panggil fungsi untuk memuat data awal
  getInitialRoomData();
});
