// scorebord.js (versi robust)
const socket = io("http://localhost:3000", { transports: ["websocket"] });

const urlParams = new URLSearchParams(window.location.search);
const id_room = urlParams.get("id_room");

function log(...args) {
  console.log("[scoreboard]", ...args);
}

function updateScoreboard() {
  socket.emit("get_scoreboard", id_room);
}
updateScoreboard();
setInterval(updateScoreboard, 3000);

socket.on("scoreboard_data", (data) => {
  log("scoreboard_data", data);
  const pesertaArr = Array.isArray(data.peserta) ? data.peserta : [];
  const topSpan = document.querySelector(".top-bar span");
  if (topSpan) topSpan.textContent = `👥 ${pesertaArr.length} peserta`;
  const tbody = document.querySelector("tbody");
  if (!tbody) return;
  tbody.innerHTML = "";
  pesertaArr.forEach((peserta, idx) => {
    const tr = document.createElement("tr");
    const tdRank = document.createElement("td");
    tdRank.textContent = idx + 1;
    tr.appendChild(tdRank);
    const tdNama = document.createElement("td");
    tdNama.textContent = peserta.nama_guest || "";
    tr.appendChild(tdNama);
    const tdSkor = document.createElement("td");
    tdSkor.textContent = peserta.skor || 0;
    tr.appendChild(tdSkor);
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
    window.location.href = "selection.php";
  } else {
    alert((data && data.message) || "Gagal mengakhiri permainan.");
    if (endBtn) {
      endBtn.disabled = false;
      endBtn.textContent = "Akhiri";
    }
  }
});

socket.on("game_ended", (data) => {
  log("game_ended received", data);
  window.location.href = "../index.php";
});
socket.on("connect_error", (err) => {
  console.error("[scoreboard] connect_error:", err);
});
socket.on("reconnect_error", (err) => {
  console.error("[scoreboard] reconnect_error:", err);
});
