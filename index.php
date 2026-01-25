<?php
session_start();
$current_lang = $_SESSION['lang'] ?? 'id'; // Tentukan bahasa, default 'id'

?>
<!DOCTYPE html>
<html lang="<?= $current_lang ?>">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Quicksand:wght@300..700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="indexstyle.css" />
    <link rel="icon" type="image/x-icon" href="aset/logo1.png" />
    <title data-key="main_page_title">Napza Edu Card</title>
  </head>
  <body>
    <!-- Header -->
    <nav class="navbar">
      <div class="header">
        <img src="aset/logo.png" alt="logo" title="Napza Edu Card" />
        <h1>NAPZA EDU CARD</h1>
      </div>

      <button class="hamburger-menu" id="hamburger-btn">
        &#9776; </button>

      <div class="navbar-nav" id="navbar-menu">
        <a href="index.php" data-key="home_menu">Beranda</a>
        <a href="#materi" data-key="material_menu">Materi</a>
        <a href="#panduan" data-key="guidance_menu">Panduan</a>
        <a href="#tentang" data-key="about_menu">Tentang</a>
        <div class="language-switcher">
        <select id="lang-switcher">
          <option value="id" <?= ($current_lang == 'id') ? 'selected' : '' ?>>Indonesia</option>
          <option value="en" <?= ($current_lang == 'en') ? 'selected' : '' ?>>English</option>
        </select>
        </div>
      </div>
    </nav>
    <!-- End Header -->

    <!-- content -->
    <div class="fiture">
    <!-- Tombol Poster Melayang -->
    <div class="floating-poster-btn" onclick="openPosterModal()" title="Lihat Poster Edukasi">
      <img src="aset/poster/poster 1.jpg" alt="Poster">
      <p data-key="view_educational_posters">Lihat Poster Edukasi</p>
    </div>
        
      <h3 style="text-align: center" data-key="test_knowledge_prompt">SIAP UNTUK MENGUJI PENGETAHUANMU?</h3>

      <div class="game">
        <!-- <a href="multiplayer/joinroom.php" class="solo">
          <img src="aset/profile.png" alt="person" />
          <h5 data-key="player_role">PLAYER</h5>
        </a> -->

        <a href="multiplayer/selection.php" class="multipalyer">
          <img src="aset/audience.png" alt="people" />
          <h5 data-key="people_role">SHARPEN THE BRAIN</h5>
        </a>
      </div>
    </div>
    <!-- End content -->

    <!-- Modal Dialog -->
<div id="modal-overlay" style="display:none;">
  <div id="modal-dialog">
    <span id="modal-close">&times;</span>
    <h2 id="modal-title" data-key="modal_title_placeholder">Judul Modal</h2>
    <h4 id="modal-subtitle" data-key="modal_subtitle_placeholder">Sub Judul</h4>
    <div id="modal-content">Isi modal di sini.</div>
  </div>
</div><!-- End Modal Dialog -->

    <footer>
      <p data-key="footer_text">@2025 Napza Edu card</p>
    </footer>
    
  <!-- Modal Slider Poster -->
  <div id="posterOverlay" class="poster-overlay" onclick="if(event.target === this) closePosterModal()">
    <div class="poster-container">
      <span class="poster-close" onclick="closePosterModal()">&times;</span>
      <div class="poster-slider">
        <div class="poster-track" id="posterTrack">
          <img src="aset/poster/poster 1.jpg" alt="Poster 1">
          <img src="aset/poster/poster 2.jpg" alt="Poster 2">
          <img src="aset/poster/poster 3.jpg" alt="Poster 3">
          <img src="aset/poster/poster 4.jpg" alt="Poster 4">
          <img src="aset/poster/poster 5.jpg" alt="Poster 5">
          <img src="aset/poster/poster 6.jpg" alt="Poster 6">
        </div>
      </div>
      <div class="poster-nav">
        <button onclick="movePoster(-1)">&#10094;</button>
        <button onclick="movePoster(1)">&#10095;</button>
      </div>
    </div>
  </div>

  <script>
    let currentPosterIndex = 0;
    const posterTrack = document.getElementById('posterTrack');
    const totalPosters = 6;

    function openPosterModal() {
      document.getElementById('posterOverlay').style.display = 'flex';
      currentPosterIndex = 0;
      updatePosterSlider();
    }

    function closePosterModal() {
      document.getElementById('posterOverlay').style.display = 'none';
    }

    function movePoster(direction) {
      currentPosterIndex += direction;
      if (currentPosterIndex < 0) {
        currentPosterIndex = totalPosters - 1;
      } else if (currentPosterIndex >= totalPosters) {
        currentPosterIndex = 0;
      }
      updatePosterSlider();
    }

    function updatePosterSlider() {
      posterTrack.style.transform = `translateX(-${currentPosterIndex * 100}%)`;
    }
  </script>

    <script src="modal.js"></script>
    <!-- Skrip Terjemahan -->
    <script src="user/translations.js"></script>
    <script src="user/profil.js"></script>
  </body>
</html>
