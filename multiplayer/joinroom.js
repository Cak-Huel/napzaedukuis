const socket = io("http://localhost:3000", { transports: ["websocket"] });

document.addEventListener("DOMContentLoaded", () => {
  const kodeEl = document.getElementById("kode_room");
  const namaEl = document.getElementById("nama_guest");
  const btnJoin = document.querySelector(".btn-join");

  // buat elemen error kecil jika belum ada
  let errEl = document.querySelector(".join-error");
  if (!errEl) {
    errEl = document.createElement("div");
    errEl.className = "join-error";
    errEl.style.color = "red";
    errEl.style.marginTop = "8px";
    const left = document.querySelector(".join-left");
    if (left) left.appendChild(errEl);
  }

  function showError(msg) {
    errEl.textContent = msg || "";
  }

  function setButtonBusy(busy) {
    btnJoin.disabled = busy;
    btnJoin.textContent = busy ? "Menghubungkan..." : "Join";
  }

  function doJoin(e) {
    if (e) e.preventDefault();
    showError("");

    const kode = (kodeEl.value || "").trim().toUpperCase();
    const nama = (namaEl.value || "").trim();

    if (!kode) {
      showError("Masukkan kode room.");
      kodeEl.focus();
      return;
    }
    if (!nama) {
      showError("Masukkan nama peserta.");
      namaEl.focus();
      return;
    }

    setButtonBusy(true);
    socket.emit("join_room", { kode_room: kode, nama_guest: nama });
  }

  // klik tombol
  btnJoin.addEventListener("click", doJoin);

  // enter pada input akan submit
  [kodeEl, namaEl].forEach((el) =>
    el.addEventListener("keypress", (ev) => {
      if (ev.key === "Enter") doJoin(ev);
    })
  );

  // balasan server
  socket.on("join_result", (data) => {
    setButtonBusy(false);
    if (data && data.success) {
      // redirect ke waiting room dengan id_room dan id_peserta dari server
      const id_room = encodeURIComponent(data.id_room);
      const id_peserta = encodeURIComponent(data.id_peserta);
      window.location.href = `waiting_room.php?id_room=${id_room}&id_peserta=${id_peserta}`;
    } else {
      showError(
        (data && data.message) ||
          "Gagal join room. Periksa kode atau coba lagi."
      );
    }
  });

  socket.on("connect_error", (err) => {
    setButtonBusy(false);
    showError("Gagal terhubung ke server WebSocket.");
    console.error("socket connect_error:", err);
  });

  socket.on("disconnect", (reason) => {
    // jika disconnect tiba2, beri tahu user
    if (reason !== "io client disconnect") {
      showError("Terputus dari server.");
    }
  });
});
