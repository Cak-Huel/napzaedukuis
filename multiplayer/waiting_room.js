const socket = io("http://localhost:3000", { transports: ["websocket"] });

document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const id_room = urlParams.get("id_room");
  const id_peserta = urlParams.get("id_peserta");
  const playerList = document.getElementById("player-list");

  if (!id_room) {
    console.error("waiting_room: id_room tidak ditemukan di URL");
    return;
  }

  function renderPlayers(names = []) {
    playerList.innerHTML = "";
    if (!names.length) {
      const li = document.createElement("li");
      li.textContent = "Belum ada peserta.";
      playerList.appendChild(li);
      return;
    }
    names.forEach((n) => {
      const li = document.createElement("li");
      li.textContent = n;
      playerList.appendChild(li);
    });
  }

  socket.on("connect", () => {
    console.log("waiting_room socket connected", socket.id);
    // mintain info room dan minta server memasukkan socket ke room (server-side harus melakukan socket.join)
    socket.emit("get_room_info_by_id", id_room);
  });

  // update berkala (jaga agar daftar pemain tetap segar)
  const updater = setInterval(() => {
    if (socket.connected) socket.emit("get_room_info_by_id", id_room);
  }, 2000);

  socket.on("room_info", (data) => {
    console.log("waiting_room received room_info", data);
    // pastikan data untuk room ini
    if (!data || !data.success) return;
    // tampilkan peserta
    const peserta = Array.isArray(data.peserta) ? data.peserta : [];
    renderPlayers(peserta);
  });

  // diterima ketika guru/author menekan Mulai (server harus broadcast ke room dengan id_room)
  socket.on("game_started", (data) => {
    console.log("waiting_room received game_started", data);
    if (!data) return;
    if (String(data.id_room) === String(id_room)) {
      // redirect peserta ke gameroom
      const url = `gameroom.php?id_room=${encodeURIComponent(
        id_room
      )}&id_peserta=${encodeURIComponent(id_peserta || "")}`;
      // beri sedikit delay supaya client sempat memproses
      setTimeout(() => (window.location.href = url), 200);
    }
  });

  socket.on("game_ended", (data) => {
    console.log("waiting_room received game_ended", data);
    alert("Permainan diakhiri oleh host.");
    window.location.href = "selection.php";
  });

  socket.on("connect_error", (err) => {
    console.error("waiting_room connect_error", err);
  });

  socket.on("disconnect", (reason) => {
    console.warn("waiting_room disconnected:", reason);
  });

  // bersihkan interval ketika pindah halaman
  window.addEventListener("beforeunload", () => clearInterval(updater));
});
