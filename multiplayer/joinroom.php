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
    <link rel="stylesheet" href="joinroom.css" />
    <link rel="icon" type="image/x-icon" href="../aset/logo1.png" />
    <title>Join Room - Napza Edu Card</title>
  </head>
  <body>
    <!-- Header -->
    <header class="navbar">
      <div class="icon">
        <img src="../aset/logo.png" alt="logo" title="Napza Edu Card" />
        <h1>NAPZA EDU CARD</h1>
      </div>

      <button class="hamburger-menu" id="hamburger-btn">
        &#9776; </button>

      <nav id="navbar-menu">
        <a href="../index.php" data-key="home_menu">Beranda</a>
        <a href="#panduan" data-key="guidance_menu">Panduan</a>
        <a href="#tentang" data-key="about_menu">Tentang</a>
      </nav>
    </header>

    <!-- Konten utama Join Room -->
    <main class="join-room-container">
      <div class="join-box">
        <div class="join-left">
          <a href="selection.php" class="back-btn">&#8592;</a>
          <h2 data-key="join_room_heading">Join Room</h2>
          <input
            type="text"
            id="kode_room"
            name="kode_room"
            data-key-placeholder="code_placeholder"
            placeholder="Masukkan kode"
            maxlength="6"
            class="kode-input"
            autocomplete="off"
          />
          <input
            type="text"
            id="nama_guest"
            name="nama_guest"
            data-key-placeholder="name_placeholder"
            placeholder="Masukkan nama"
            maxlength="6"
            class="nama-input"
            autocomplete="off"
          />
          <button class="btn-join" data-key="join_button">
            Join
          </button>
        </div>

        <div class="join-right">
          <img src="../aset/lock.svg" class="lock-icon" />
          <div class="kode-petunjuk">123 456</div>
          <p data-key="code_instruction">Masukkan enam digit kode yang disediakan oleh gurumu</p>
        </div>
      </div>
    </main>

    <!-- Modal Dialog -->
<div id="modal-overlay" style="display:none;">
  <div id="modal-dialog">
    <span id="modal-close">&times;</span>
    <h2 id="modal-title" data-key="modal_title_placeholder">Judul Modal</h2>
    <h4 id="modal-subtitle" data-key="modal_subtitle_placeholder">Sub Judul</h4>
    <div id="modal-content">Isi modal di sini.</div>
  </div>
</div>
<!-- End Modal Dialog -->

    <!-- Footer -->
    <footer>
      <p>@2025 Napza Edu card</p>
    </footer>
    <script src="../modal.js"></script>
    <!-- Pusher JS -->
    <script src="https://js.pusher.com/8.2.0/pusher.min.js"></script>
    <script src="joinroom.js"></script>

    <script>
      // Aktifkan logging ke console untuk debugging (opsional, hapus saat produksi)
      Pusher.logToConsole = true;

      // Buat koneksi ke Pusher
      var pusher = new Pusher('48dc0e7685cb274b770b', { // Ganti dengan App Key Anda
          cluster: 'ap1' // Ganti dengan cluster Anda
       });
  </script>
  <!-- Skrip Terjemahan -->
  <script src="../user/translations.js"></script>
  <script src="../user/profil.js"></script>
  </body>
</html>
