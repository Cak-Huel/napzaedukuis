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
    let panduanImagesHTML = "";
    const totalPanduanImages = 16;
    for (let i = 1; i <= totalPanduanImages; i++) {
      panduanImagesHTML += `<img src="/aset/panduan/${i}.jpg" alt="Panduan ${i}" style="width:100%; max-width:450px; margin-right:15px; flex-shrink: 0;">\n        `;
    }

    showModal({
      title: "Selamat Datang",
      subtitle: "Panduan",
      content: `
      <div style="display: flex; overflow-x: auto; padding-bottom: 10px;">
        ${panduanImagesHTML.trim()}
      </div>
    `,
    });
    sessionStorage.setItem("welcomeShown", "true");

    // Logika: Tampilkan modal Materi setelah modal Panduan ditutup
    const closeBtn = document.getElementById("modal-close");

    const handleWelcomeClose = function () {
      closeModal(); // Tutup modal pertama

      // Siapkan konten Materi (sama seperti di menu Materi)
      let materiImagesHTML = "";
      const totalMateriImages = 21;
      for (let i = 1; i <= totalMateriImages; i++) {
        materiImagesHTML += `<img src="/aset/materi/${i}.jpg" alt="Materi ${i}" style="width:100%; max-width:450px; margin-bottom:15px;">\n        `;
      }

      // Tampilkan modal kedua dengan sedikit jeda agar transisi lebih halus
      setTimeout(() => {
        showModal({
          title: "Materi",
          subtitle: "",
          content: `
          <div style="max-height: 460px; overflow-y: auto; text-align: center;">
            ${materiImagesHTML.trim()}
          </div>
        `,
        });
      }, 300);

      // Kembalikan fungsi tombol close ke default (hanya menutup modal) agar modal kedua bisa ditutup normal
      closeBtn.onclick = closeModal;
    };

    // Override sementara fungsi tombol close
    closeBtn.onclick = handleWelcomeClose;
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

    let materiImagesHTML = "";
    const totalMateriImages = 21;
    for (let i = 1; i <= totalMateriImages; i++) {
      materiImagesHTML += `<img src="/aset/materi/${i}.jpg" alt="Materi ${i}" style="width:100%; max-width:450px; margin-bottom:15px;">\n        `;
    }

    showModal({
      title: "Materi",
      subtitle: "",
      content: `
      <div style="max-height: 460px; overflow-y: auto; text-align: center;">
        ${materiImagesHTML.trim()}
      </div>
    `,
    });
  };
}

const panduanMenu = document.querySelector('a[href="#panduan"]');
if (panduanMenu) {
  panduanMenu.onclick = function (e) {
    e.preventDefault();

    let panduanImagesHTML = "";
    const totalPanduanImages = 16;
    for (let i = 1; i <= totalPanduanImages; i++) {
      panduanImagesHTML += `<img src="/aset/panduan/${i}.jpg" alt="Panduan ${i}" style="width:100%; max-width:450px; margin-right:15px; flex-shrink: 0;">\n        `;
    }

    showModal({
      title: "Panduan",
      subtitle: "",
      content: `
      <div style="display: flex; overflow-x: auto; padding-bottom: 10px;">
        ${panduanImagesHTML.trim()}
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
        <a href="/aset/fot.jpg" target="_blank" rel="noopener noreferrer"><img src="/aset/fot.jpg" alt="Deskripsi Foto 1" style="width:100%; max-width:500px; display:block; margin-bottom:10px;"></a>
          <p>Perkenalkan saya Muhammad Rafi Amrullah mahasiswa Universitas Negeri Surabaya Prodi S1 Bimbingan dan Konseling 2022 sebagai penggagas game NAPZA EDU CARD. Dan desaigner saya Rahul Ubaidillah mahasiswa Universitas Negeri Surabaya Prodi S1 Pendidikan Teknologi Informasi 2023 sebagai Developer game ini.</p>
          <p>Terimakasih saya ucapkan kepada pengguna yang telah mendukung dengan cara menggunakan, menyebarkan game berbasis website saya ini.</p>
          <p>Memang game berbasis website saya ini masih jauh dari kata sempurna. Maka dari itu, saya harap kepada pengguna khususnya web developer bisa ikut serta dalam pengembangan atau membuat versi yang lebih baik dari game berbasis website ini.</p>
          <p>Cukup sekian dan terimakasih.</p>
          <p>Kritik dan saran: <br>
            <a href="https://instagram.com/rafiamrullah._" target="_blank" style="color: #1f8dff;">@rafiamrullah._</a><br>
          </p>
          <p>Versi: 4.12.10.25 (akses awal)</p>
        </div>
      `,
    });
  };
}
