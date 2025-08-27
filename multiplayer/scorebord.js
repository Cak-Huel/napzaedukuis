// Paksa transport websocket untuk menghindari masalah polling handshake
const socket = io("http://localhost:3000", { transports: ["websocket"] });

// Ambil id_room dari URL
const urlParams = new URLSearchParams(window.location.search);
const id_room = urlParams.get("id_room");

// Request data scoreboard
function updateScoreboard() {
  socket.emit("get_scoreboard", id_room);
}
updateScoreboard();
setInterval(updateScoreboard, 3000); // update setiap 3 detik

socket.on("scoreboard_data", (data) => {
  // safety: jika data kosong
  const pesertaArr = Array.isArray(data.peserta) ? data.peserta : [];

  // Jumlah peserta
  const topSpan = document.querySelector(".top-bar span");
  if (topSpan) topSpan.textContent = `👥 ${pesertaArr.length} peserta`;

  // Tabel
  const tbody = document.querySelector("tbody");
  if (!tbody) return;
  tbody.innerHTML = "";

  pesertaArr.forEach((peserta, idx) => {
    const tr = document.createElement("tr");
    // Peringkat
    const tdRank = document.createElement("td");
    tdRank.textContent = idx + 1;
    tr.appendChild(tdRank);

    // Nama
    const tdNama = document.createElement("td");
    tdNama.textContent = peserta.nama_guest || "";
    tr.appendChild(tdNama);

    // Performa (skor)
    const tdSkor = document.createElement("td");
    tdSkor.textContent = peserta.skor || 0;
    tr.appendChild(tdSkor);

    // Jawaban (jika ada)
    (peserta.jawaban || []).forEach((j) => {
      const tdJawab = document.createElement("td");
      tdJawab.className = j.benar ? "correct" : "wrong";
      tdJawab.textContent = j.benar ? "✓" : "✗";
      tr.appendChild(tdJawab);
    });

    tbody.appendChild(tr);
  });
});

const endBtn = document.getElementById("end-game-btn");
if (endBtn) {
  endBtn.addEventListener("click", () => {
    if (!id_room) return;
    if (!confirm("Akhiri permainan untuk semua peserta?")) return;
    endBtn.disabled = true;
    endBtn.textContent = "Mengakhiri...";
    socket.emit("end_game", id_room);
  });
}

socket.on("end_result", (data) => {
  if (data && data.success) {
    // author/host: kembali ke halaman selection (atau halaman yg diinginkan)
    window.location.href = "selection.php";
  } else {
    alert((data && data.message) || "Gagal mengakhiri permainan.");
    if (endBtn) {
      endBtn.disabled = false;
      endBtn.textContent = "Akhiri";
    }
  }
});

// jika server broadcast game_ended, semua client di room diarahkan (peserta)
socket.on("game_ended", (data) => {
  console.log("game_ended received:", data);
  // peserta diarahkan ke halaman utama atau beranda
  window.location.href = "selection.php";
});

// log koneksi / handshake error (bantu tracing 400)
socket.on("connect_error", (err) => {
  console.error("scorebord socket connect_error:", err);
});
socket.on("reconnect_error", (err) => {
  console.error("scorebord socket reconnect_error:", err);
});
