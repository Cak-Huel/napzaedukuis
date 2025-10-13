document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const id_room = urlParams.get("id_room");
  const id_peserta = urlParams.get("id_peserta");
  const playerList = document.getElementById("player-list");
  const container = document.querySelector(".container");

  if (!id_room || !id_peserta) {
    console.error("waiting_room: id_room tidak ditemukan di URL");
    if (container) {
      container.innerHTML =
        "<h2>Error</h2><p>Informasi room atau peserta tidak valid. Silakan kembali dan coba bergabung lagi.</p>";
    }
    return;
  }

  // Fungsi untuk merender daftar pemain di UI
  function renderPlayers(names = []) {
    playerList.innerHTML = "";
    if (!names.length) {
      const li = document.createElement("li");
      li.textContent = "Menunggu pemain lain...";
      playerList.appendChild(li);
      return;
    }
    names.forEach((n) => {
      const li = document.createElement("li");
      li.textContent = n;
      // Tandai nama pemain saat ini (opsional)
      // if (n === 'NAMA_ANDA_DARI_SESSION_ATAU_LOCALSTORAGE') {
      //   li.style.fontWeight = 'bold';
      // }
      playerList.appendChild(li);
    });
  }

  // Fungsi untuk menambahkan satu pemain ke UI
  function addPlayerToList(name) {
    // Hapus pesan "Menunggu pemain lain..." jika ada
    const waitingMessage = playerList.querySelector("li");
    if (
      waitingMessage &&
      waitingMessage.textContent === "Menunggu pemain lain..."
    ) {
      playerList.innerHTML = "";
    }

    const li = document.createElement("li");
    li.textContent = name;
    playerList.appendChild(li);
  }

  // --- Logika Inisialisasi Terpadu (Fetch + Pusher) ---

  async function initializeRoom() {
    // 1. Ambil data awal (pemain dan kode room) dalam satu panggilan
    try {
      const response = await fetch(`get_room_details.php?id_room=${id_room}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        // Render daftar pemain awal
        renderPlayers(data.peserta || []);

        // 2. Gunakan data yang sama untuk setup Pusher
        if (typeof Pusher === "undefined") {
          console.error("Pusher JS tidak ditemukan.");
          return;
        }

        const channelName = `private-quiz-${data.kode_room}`;
        const channel = pusher.subscribe(channelName);

        // Event saat pemain baru bergabung (lebih efisien)
        channel.bind("participant-joined", function (eventData) {
          console.log("Event participant-joined diterima:", eventData);
          if (eventData && eventData.nama_guest) {
            addPlayerToList(eventData.nama_guest);
          }
        });

        // Event saat game dimulai oleh host
        channel.bind("game-started", function (eventData) {
          console.log("Event game-started diterima:", eventData);
          // Redirect ke halaman game
          const url = `gameroom.php?id_room=${encodeURIComponent(
            id_room
          )}&id_peserta=${encodeURIComponent(id_peserta)}`;
          window.location.href = url;
        });
      } else {
        throw new Error(data.message || "Gagal mengambil data room.");
      }
    } catch (error) {
      console.error("Inisialisasi room gagal:", error);
      alert("Gagal memuat informasi room: " + error.message);
    }
  }

  // Panggil fungsi inisialisasi utama
  initializeRoom();
});
