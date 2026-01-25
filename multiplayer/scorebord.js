document.addEventListener("DOMContentLoaded", () => {
  // Ambil id_room dari URL
  const urlParams = new URLSearchParams(window.location.search);
  const id_room = urlParams.get("id_room");

  if (!id_room) {
    alert("Error: ID Room tidak ditemukan.");
    window.location.href = "selection.php";
    return;
  }

  const topSpan = document.querySelector(".top-bar span");
  const tbody = document.querySelector("tbody");
  const endBtn = document.getElementById("end-game-btn");

  // Fungsi untuk merender seluruh tabel dari awal
  function renderTable(pesertaArr = []) {
    if (topSpan) topSpan.textContent = `👥 ${pesertaArr.length} peserta`;
    if (!tbody) return;
    tbody.innerHTML = "";

    pesertaArr.forEach((peserta, idx) => {
      const tr = document.createElement("tr");
      tr.dataset.pesertaId = peserta.id_peserta; // Tambahkan ID untuk referensi

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
      tdSkor.className = "skor"; // Tambahkan kelas untuk seleksi
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
  }

  // Fungsi untuk mengurutkan ulang tabel berdasarkan skor
  function reSortTable() {
    const rows = Array.from(tbody.querySelectorAll("tr"));
    rows.sort((a, b) => {
      const scoreA = parseInt(a.querySelector(".skor").textContent, 10);
      const scoreB = parseInt(b.querySelector(".skor").textContent, 10);
      return scoreB - scoreA; // Urutkan dari tertinggi ke terendah
    });
    // Render ulang dengan urutan baru dan update peringkat
    rows.forEach((row, index) => {
      row.cells[0].textContent = index + 1;
      tbody.appendChild(row);
    });
  }

  // --- Logika Inisialisasi dan Pusher ---
  async function initializeScoreboard() {
    try {
      // 1. Ambil data awal
      const response = await fetch(
        `get_scoreboard_data.php?id_room=${id_room}`
      );
      const data = await response.json();

      if (!data.success) throw new Error(data.message);

      renderTable(data.peserta);

      // 2. Setup Pusher
      if (typeof pusher !== "undefined" && data.kode_room) {
        const channel = pusher.subscribe(`private-quiz-${data.kode_room}`);

        // Event saat pemain menjawab
        channel.bind("player-answered", (eventData) => {
          console.log("player-answered event:", eventData);
          const { id_peserta, is_correct, new_score } = eventData;

          const playerRow = tbody.querySelector(
            `tr[data-peserta-id='${id_peserta}']`
          );
          if (playerRow) {
            // Update skor
            playerRow.querySelector(".skor").textContent = new_score;

            // Tambah indikator jawaban
            const tdJawab = document.createElement("td");
            tdJawab.className = is_correct ? "correct" : "wrong";
            tdJawab.textContent = is_correct ? "✓" : "✗";
            playerRow.appendChild(tdJawab);

            // Urutkan ulang tabel
            reSortTable();
          }
        });

        // Event saat game diakhiri
        channel.bind("game-finished", () => {
          alert("Permainan telah berakhir.");
          window.location.href = "selection.php";
        });
      }
    } catch (error) {
      console.error("Gagal memuat scoreboard:", error);
      alert("Gagal memuat papan skor: " + error.message);
    }
  }

  // --- Event Listener untuk Tombol Akhiri ---
  if (endBtn) {
    endBtn.addEventListener("click", async () => {
      if (
        !confirm("Anda yakin ingin mengakhiri permainan untuk semua peserta?")
      )
        return;

      endBtn.disabled = true;
      endBtn.textContent = "Mengakhiri...";

      try {
        const formData = new FormData();
        formData.append("id_room", id_room);
        const response = await fetch("end_game_trigger.php", {
          method: "POST",
          body: formData,
        });
        const result = await response.json();
        if (!result.success) throw new Error(result.message);
        // Redirect akan ditangani oleh event 'game-finished' dari Pusher
      } catch (error) {
        alert("Gagal mengakhiri permainan: " + error.message);
        endBtn.disabled = false;
        endBtn.textContent = "Akhiri";
      }
    });
  }

  // Jalankan inisialisasi
  initializeScoreboard();
});
