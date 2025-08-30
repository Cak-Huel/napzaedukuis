const socket = io("http://localhost:3000", { transports: ["websocket"] });

document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const id_room = urlParams.get("id_room");
  const codeEl = document.querySelector(".room-box h1");
  const namesEl = document.querySelector(".participants .names");
  const startBtn = document.querySelector(".start");

  if (!id_room) {
    console.error("participant: id_room tidak ditemukan di URL");
    return;
  }

  function renderPlayers(names = []) {
    namesEl.innerHTML = "";
    if (!names.length) {
      namesEl.textContent = "Belum ada peserta.";
      return;
    }
    names.forEach((n) => {
      const d = document.createElement("div");
      d.textContent = n;
      namesEl.appendChild(d);
    });
  }

  socket.on("connect", () => {
    console.log("participant connected", socket.id);
    console.log(
      "participant will request get_room_info_by_id with id_room:",
      id_room
    );
    socket.emit("get_room_info_by_id", id_room);
  });

  // refresh berkala untuk memastikan daftar peserta up-to-date
  const updater = setInterval(() => {
    if (socket.connected) socket.emit("get_room_info_by_id", id_room);
  }, 2000);

  socket.on("room_info", (data) => {
    console.log("Data room_info dari server:", data);
    if (!data || !data.success) return;
    // tampilkan kode room
    if (codeEl) codeEl.textContent = data.kode_room || "";
    // simpan id_room global untuk debug/compatibilitas
    window.id_room = data.id_room;
    // tampilkan peserta
    renderPlayers(Array.isArray(data.peserta) ? data.peserta : []);
  });

  // author klik Mulai -> server kirim start_result ke pengklik
  socket.on("start_result", (data) => {
    console.log("start_result:", data);
    if (data && data.success) {
      // author redirect ke scoreboard (halaman guru)
      window.location.href = `scorebord.php?id_room=${encodeURIComponent(
        id_room
      )}`;
    } else {
      alert("Gagal memulai permainan!");
      if (startBtn) {
        startBtn.disabled = false;
        startBtn.textContent = "Mulai";
      }
    }
  });

  // peserta di waiting_room akan menerima broadcast game_started -> pindah ke gameroom
  socket.on("game_started", (data) => {
    console.log("game_started:", data);
    // Guru/author tidak dialihkan ke gameroom
    // Peserta di waiting_room yang dialihkan ke gameroom, bukan di sini
  });

  // peserta menerima notifikasi game berakhir
  socket.on("game_ended", (data) => {
    console.log("participant received game_ended", data);
    alert("Permainan diakhiri oleh host.");
    window.location.href = "selection.php";
  });

  if (startBtn) {
    startBtn.addEventListener("click", () => {
      startBtn.disabled = true;
      startBtn.textContent = "Memulai...";
      socket.emit("start_game", id_room);
    });
  }

  socket.on("connect_error", (err) => {
    console.error("participant connect_error:", err);
  });

  socket.on("disconnect", (reason) => {
    console.warn("participant disconnected:", reason);
  });

  window.addEventListener("beforeunload", () => clearInterval(updater));
});
