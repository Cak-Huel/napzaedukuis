<?php
session_start();
if (!isset($_SESSION['id_user'])) {
  header("Location: ../user/login.php");
  exit;
}
$level = isset($_GET['level']) ? intval($_GET['level']) : 1;
?>

<!DOCTYPE html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" href="levelgame.css" />
    <link rel="icon" type="image/x-icon" href="../aset/logo1.png" />
    <script src="game.js" defer></script>
    <title>Level <?php echo $level; ?> - NAPZA EDU CARD</title>
  </head>
  <body>
    <!-- Header -->
    <header class="navbar">
      <div class="icon">
        <img src="../aset/logo.png" alt="logo" title="Napza Edu Card" />
        <h1>NAPZA EDU CARD</h1>
      </div>

      <nav>
        <a href="#">Panduan</a>
        <a href="#">Tentang</a>
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
      </nav>
    </header>
    <!-- End Header -->

    <!-- perent header -->
    <div class="level-header">
      <a href="solo.php" class="back-btn">&#8592;</a>
      <h2>Level <?php echo $level; ?></h2>
      <div class="game-info">
        <div class="timer">⏱️ <span id="timer">30</span></div>
        <div class="score">Skor <span id="skor">0</span></div>
      </div>
    </div>
    <!-- End parent header -->

    <!-- Kartu-kartu permainan -->
    <main class="card-container">
      <img src="../aset/card.png" alt="Kartu 1" class="card" />
      <img src="../aset/card.png" alt="Kartu 2" class="card" />
      <img src="../aset/card.png" alt="Kartu 3" class="card" />
      <img src="../aset/card.png" alt="Kartu 4" class="card" />
      <img src="../aset/card.png" alt="Kartu 5" class="card" />
    </main>

    <!-- Petunjuk -->
    <p class="instruction">Klik kartu untuk melihat dan menjawab pertanyaan</p>

    <!-- Kontainer untuk pertanyaan -->
    <div id="question-box" style="display: none;" class="question-popup"></div>
    
    <!-- Tombol lanjut level -->
     <button id="nextLevel" style="display: none;" onclick="window.location='levelgame.php?level=<?php echo $level+1; ?>'">
      Lanjut ke Level Berikutnya
      </button>

  </body>
</html>
