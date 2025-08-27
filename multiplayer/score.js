const socket = io("http://localhost:3000");

// Ambil id_room dan id_peserta dari URL
const urlParams = new URLSearchParams(window.location.search);
const id_room = urlParams.get("id_room");
const id_peserta = urlParams.get("id_peserta");

// Request data skor peserta
socket.emit("get_score_detail", { id_room, id_peserta });

socket.on("score_detail", (data) => {
  // Nama peserta
  document.querySelector(".nama-peserta").textContent = data.nama_guest;

  // Nilai (persentase benar dari total soal)
  const nilaiPersen = Math.round((data.total_benar / data.total_soal) * 100);
  document.querySelector(".nilai-persentase").textContent = `${nilaiPersen}%`;

  // Peringkat
  document.querySelector(".peringkat").textContent = `${data.ranking}/${data.total_peserta}`;

  // Performa (total skor benar)
  document.querySelector(".performa").textContent = data.skor;

  // Total benar
  document.querySelector(".total-benar").textContent = data.total_benar;

  // Total salah
  document.querySelector(".total-salah").textContent = data.total_salah;

  // Waktu tercepat
  document.querySelector(".waktu-tercepat").textContent = `${data.waktu_tercepat} S`;

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
      <p>
        ${["A", "B", "C", "D"].map((opt) => {
          let kelas = "";
          if (opt === item.jawaban_user && item.benar_user) kelas = "jawaban-benar";
          else if (opt === item.jawaban_user && !item.benar_user) kelas = "jawaban-salah";
          else if (opt === item.kunci_jawaban) kelas = "jawaban-benar";
          return `<span class="${kelas}">${opt} ${item[`jwbn_${opt.toLowerCase()}`]}</span>`;
        }).join(" &nbsp; ")}
      </p>
    `;
    reviewSection.appendChild(div);
  });
});