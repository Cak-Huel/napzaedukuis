<?php
session_start();
if (!isset($_SESSION['id_user'])) {
  header("Location: ../user/login.php");
  exit;
}
include '../sekret.php';

$total_level = 10;
$opened_level = 1; // default level 1 terbuka

if (isset($_SESSION['id_user'])) {
  $id_user = $_SESSION['id_user'];
  $query = mysqli_query($conn, "SELECT lvl_terakhir FROM progres WHERE id_user = $id_user");
  $data = mysqli_fetch_assoc($query);
  if ($data && $data['lvl_terakhir'] > 1) {
    $opened_level = $data['lvl_terakhir'];
  }
}
?>

<!DOCTYPE html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" href="solo.css" />
    <link rel="icon" type="image/x-icon" href="../aset/logo1.png" />
    <title>Solo Survival</title>
  </head>
  <body>
    <!-- Header -->
    <header>
      <div class="navbar">
        <div class="icon">
          <img src="../aset/logo.png" alt="logo" title="Napza Edu Card" />
          <h1>NAPZA EDU CARD</h1>
        </div>

        <nav>
          <a href="../index.php">Beranda</a>
          <a href="#">Materi</a>
          <a href="#">Panduan</a>
          <a href="#">Tentang</a>
          <?php if (isset($_SESSION['nama'])): ?>
          <button
            class="btn-profil"
            title="Profil"
            onclick="window.location.href='../user/profil.php'"
          >
            Profil
          </button>
        <?php else: ?>
          <button
            class="btn-profil"
            title="Masuk"
            onclick="window.location.href='../user/login.php'"
          >
            Login
          </button>
        <?php endif; ?>
        </nav>
      </div>
      
      <!-- Progress Section -->
      <div class="progress-section">
        <a href="../index.php" class="back-btn">&#8592;</a>
        <div class="progress-container">
          <div class="progress-bar" style="width: <?php echo ($opened_level/$total_level)*100; ?>%;"></div>
        </div>
        <p class="level-title">Pilih Level Permainan</p>
      </div>
    </header>
    <!-- End Header -->

    <main>
      <div class="level-map">
        <?php for ($i = 1; $i <= $total_level; $i++): ?>
          <div class="level<?php echo ($i > $opened_level) ? ' locked' : ''; ?>">
            <p>Level <?php echo $i; ?></p>
            <div class="pin"></div>
            <?php
              // Level yang boleh dimainkan hanya level yang sama dengan lvl_terakhir (opened_level)
              if ($i == $opened_level): ?>
              <a href="levelgame.php?level=<?php echo $i; ?>" class="btn-play">MAINKAN</a>
            <?php elseif ($i < $opened_level): ?>
              <span class="completed">✔️ Selesai</span>
            <?php else: ?>
              <div class="lock">🔒</div>
            <?php endif; ?>
          </div>
          <?php if ($i < $total_level): ?>
            <div class="connector"></div>
          <?php endif; ?>
        <?php endfor; ?>
      </div>
    </main>

    <footer>
      <p>@2025 Napza Edu card</p>
    </footer>
  </body>
</html>
