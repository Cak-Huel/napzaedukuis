document.addEventListener("DOMContentLoaded", () => {
  // Ambil id_room dan id_peserta dari URL
  const urlParams = new URLSearchParams(window.location.search);
  const id_room = urlParams.get("id_room");
  const id_peserta = urlParams.get("id_peserta");

  if (!id_room || !id_peserta) {
    alert("Error: Informasi skor tidak lengkap.");
    return;
  }

  function renderScoreDetails(data) {
    // Nama peserta
    document.querySelector(".nama-peserta").textContent = data.nama_guest;

    // Nilai (persentase benar dari total soal)
    const nilaiPersen =
      data.total_soal > 0
        ? Math.round((data.total_benar / data.total_soal) * 100)
        : 0;
    document.querySelector(".nilai-persentase").textContent = `${nilaiPersen}%`;

    // Peringkat
    document.querySelector(
      ".peringkat"
    ).textContent = `${data.ranking}/${data.total_peserta}`;

    // Performa (total skor benar)
    document.querySelector(".performa").textContent = data.skor;

    // Total benar
    document.querySelector(".total-benar").textContent = data.total_benar;

    // Total salah
    document.querySelector(".total-salah").textContent = data.total_salah;

    // Waktu tercepat
    document.querySelector(
      ".waktu-tercepat"
    ).textContent = `${data.waktu_tercepat} S`;

    // Benar beruntun
    document.querySelector(".benar-beruntun").textContent = data.benar_beruntun;

    // Review soal
    const reviewSection = document.querySelector(".review-section");
    reviewSection.innerHTML = "<h4>Review Soal</h4>";
    data.review.forEach((item) => {
      const div = document.createElement("div");
      div.className = "review-item";
      div.innerHTML = `
        <p><strong>${item.pertanyaan}</strong></p>
        <p class="review-options">
          ${["A", "B", "C", "D"]
            .map((opt) => {
              let kelas = "";
              if (opt === item.jawaban_user && item.benar_user)
                kelas = "jawaban-benar";
              else if (opt === item.jawaban_user && !item.benar_user)
                kelas = "jawaban-salah";
              else if (opt === item.kunci_jawaban) kelas = "jawaban-kunci";
              return `<span class="${kelas}">${opt}. ${
                item[`jwbn_${opt.toLowerCase()}`]
              }</span>`;
            })
            .join("")}
        </p>
      `;
      reviewSection.appendChild(div);
    });
  }

  // Fungsi utama untuk mengambil dan menampilkan data
  async function loadScore() {
    try {
      const response = await fetch(
        `get_score_detail.php?id_room=${id_room}&id_peserta=${id_peserta}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        renderScoreDetails(data);
      } else {
        throw new Error(data.message || "Gagal mengambil data skor.");
      }
    } catch (error) {
      console.error("Gagal memuat skor:", error);
      document.querySelector(".score-modal").innerHTML =
        "<h2>Gagal memuat data skor.</h2><p>Silakan coba lagi nanti.</p>";
    }
  }

  loadScore();
});
