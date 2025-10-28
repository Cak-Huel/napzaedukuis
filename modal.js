const hamburgerBtn = document.getElementById("hamburger-btn");
const navbarMenu = document.getElementById("navbar-menu");
const body = document.body;

// Fungsi untuk membuka/menutup Side Bar
function toggleSidebar() {
  if (navbarMenu) {
    navbarMenu.classList.toggle("open");
  }
  // Mengunci scrolling pada body saat sidebar terbuka (opsional, untuk mencegah konten bergeser)
  if (navbarMenu && navbarMenu.classList.contains("open")) {
    body.style.overflow = "hidden";
  } else {
    body.style.overflow = "auto";
  }
}

// Tambahkan event listener untuk tombol hamburger
if (hamburgerBtn) {
  hamburgerBtn.addEventListener("click", toggleSidebar);
}

// Fungsi yang memanggil modal, tambahkan penutupan Side Bar di sini
function showModal({ title, subtitle, content }) {
  // Jika sidebar terbuka, tutup dulu sebelum modal muncul
  if (navbarMenu && navbarMenu.classList.contains("open")) {
    toggleSidebar();
  }
  document.getElementById("modal-title").textContent = title || "";
  document.getElementById("modal-subtitle").textContent = subtitle || "";
  document.getElementById("modal-content").innerHTML = content || "";
  document.getElementById("modal-overlay").style.display = "flex";
}
function closeModal() {
  document.getElementById("modal-overlay").style.display = "none";
}
document.getElementById("modal-close").onclick = closeModal;

// Show modal on first load (beranda)
window.addEventListener("DOMContentLoaded", function () {
  const modalShown = sessionStorage.getItem("welcomeShown");

  if (!modalShown) {
    showModal({
      title: "Selamat Datang!",
      subtitle: "Beranda Napza Edu Card",
      content: `
      <iframe src="viewpdf.php" width="100%" height="400px" style="border:none;"></iframe>
    `,
    });
    sessionStorage.setItem("welcomeShown", "true");
  }

  // Tambahkan penutup Side Bar saat link menu diklik (terutama link non-modal seperti Beranda)
  if (navbarMenu) {
    const menuLinks = navbarMenu.querySelectorAll("a, button");
    menuLinks.forEach((link) => {
      link.addEventListener("click", () => {
        if (navbarMenu.classList.contains("open")) {
          setTimeout(toggleSidebar, 100);
        }
      });
    });
  }
});

// Show modal on menu click
const materiMenu = document.querySelector('a[href="#materi"]');
if (materiMenu) {
  materiMenu.onclick = function (e) {
    e.preventDefault();
    showModal({
      title: "Materi",
      subtitle: "File PDF Materi",
      content: `
      <iframe src="/gameweb/viewpdf.php" width="100%" height="400px" style="border:none;"></iframe>
    `,
    });
  };
}

const panduanMenu = document.querySelector('a[href="#panduan"]');
if (panduanMenu) {
  panduanMenu.onclick = function (e) {
    e.preventDefault();
    showModal({
      title: "Panduan",
      subtitle: "",
      content: `
      <div style="text-align: justify;">
      <h3>Solo Survival</h3>
        <ul>
          <li>Solo survival hanya dimainkan oleh 1 orang</li>
          <li>Memiliki beberapa level dan setiap level terdapat 5 kartu berisi
          pertanyaan atau studi kasus</li>
          <li>Pengguna dapat mereset level pada fitr reset kapanpun jika ingin
          mengulang permainan dari awal</li>
        </ul>
        <h3>Sharpen The Brain</h3>
        <ul>
          <li>Sharpen the brain merupakan fitur mode multiplayer yang dapat
          dimainkan secara bersamaan</li>
          <li>Mode ini memiliki 2 fitur yaitu Player dan Author</li>
          <li>Player adalah fitur untuk pemain yang bermain menggunakan kode room</li>
          <li>Author adalah fitur untuk pembuat room yang dapat membuat pertanyaan,
          durasi waktu menjawab, dan dapat menghapus room</li>
          <li>Hanya ada 1 pengguna yang menjadi author dalam 1 room</li>
          <li>Setelah athor membuat room, akan diberikan kode untuk dapat diakses oleh player</li>
          <li>Jumlah player tidak terbatas</li>
          <li>Author dapat memantau jumlah player dan pringkat serta skor dari
          masing-masing player</li>
        </ul>
      </div>
      `,
    });
  };
}

const tentangMenu = document.querySelector('a[href="#tentang"]');
if (tentangMenu) {
  tentangMenu.onclick = function (e) {
    e.preventDefault();
    showModal({
      title: "Tentang",
      subtitle: "",
      content: `
        <div style="text-align: justify;">
          <p>Perkenalkan saya Muhammad Rafi Amrullah mahasiswa Universitas Negeri Surabaya Prodi S1 Bimbingan dan Konseling 2022 sebagai penggagas game NAPZA EDU CARD. Dan rekan saya Rahul Ubaidillah mahasiswa Universitas Negeri Surabaya Prodi S1 Pendidikan Teknologi Informasi 2023 sebagai Developer game ini.</p>
          <p>Terimakasih saya ucapkan kepada pengguna yang telah mendukung dengan cara menggunakan, menyebarkan game berbasis website saya ini.</p>
          <p>Memang game berbasis website saya ini masih jauh dari kata sempurna. Maka dari itu, saya harap kepada pengguna khususnya web developer bisa ikut serta dalam pengembangan atau membuat versi yang lebih baik dari game berbasis website ini.</p>
          <p>Cukup sekian dan terimakasih.</p>
          <p>Kritik dan saran: <br>
            <a href="https://github.com/Cak-Huel/napzaedukuis" target="_blank" style="color: #1f8dff;">Repository GitHub</a><br>
            <a href="https://instagram.com/rafiamrullah._" target="_blank" style="color: #1f8dff;">@rafiamrullah._</a><br>
            <a href="https://instagram.com/rahul_lamograp" target="_blank" style="color: #1f8dff;">@rahul_lamograp</a>
          </p>
          <p>Versi: 1.7.25 (akses awal)</p>
        </div>
      `,
    });
  };
}
