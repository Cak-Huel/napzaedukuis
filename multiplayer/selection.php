<?php
session_start();

?>
<!DOCTYPE html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
     <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Comic+Neue:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="selection.css" />
    <link rel="icon" type="image/x-icon" href="../aset/logo1.png" />
    <title>Sharpen The Brain</title>
  </head>
  <body>
    <!-- Header -->
    <nav class="navbar">
      <div class="header">
        <img src="../aset/logo.png" alt="logo" title="Napza Edu Card" />
        <h1>NAPZA EDU CARD</h1>
      </div>

      <button class="hamburger-menu" id="hamburger-btn">
        &#9776; </button>

      <div class="navbar-nav" id="navbar-menu">
        <a href="../index.php">Beranda</a>
        <a href="#materi">Materi</a>
        <a href="#panduan">Panduan</a>
        <a href="#tentang">Tentang</a>
        <?php if (isset($_SESSION['nama'])): ?>
          <button
            class="btn-profile"
            title="Profil"
            onclick="window.location.href='../user/profil.php'"
          >
            Profil
          </button>
        <?php else: ?>
          <button
            class="btn-login"
            title="Masuk"
            onclick="window.location.href='../user/login.php'"
          >
            Login
          </button>
        <?php endif; ?>
      </div>
    </nav>
    <!-- End Header -->

    <!-- content -->
    <div class="fiture">
      <h3 style="text-align: center">PILIH SEBAGAI</h3>

      <div class="game">
        <a href="joinroom.php" class="solo">
          <img src="../aset/profile.png" alt="player" />
          <h5>PLAYER</h5>
        </a>

        <a href="creatroom.php" class="multipalyer">
          <img src="../aset/profile.png" alt="author" />
          <h5>AUTHOR</h5>
        </a>
      </div>
    </div>
    <!-- End content -->

     <!-- Modal Dialog -->
<div id="modal-overlay" style="display:none;">
  <div id="modal-dialog">
    <span id="modal-close">&times;</span>
    <h2 id="modal-title">Judul Modal</h2>
    <h4 id="modal-subtitle">Sub Judul</h4>
    <div id="modal-content">Isi modal di sini.</div>
  </div>
</div>
<!-- End Modal Dialog -->

    <footer>
      <p>@2025 Napza Edu card</p>
    </footer>

    <script src="../modal.js"></script>
  </body>
</html>
