<?php
session_start();
if (!isset($_SESSION['id_user'])) {
  header("Location: ../user/login.php");
  exit;
}
include '../sekret.php';

$total_level = 10;
$opened_level = 1; // default level 1 terbuka
$current_lang = $_SESSION['lang'] ?? 'id'; // Tentukan bahasa, default 'id'

if (isset($_SESSION['id_user'])) {
  $id_user = $_SESSION['id_user'];
  $query = mysqli_query($conn, "SELECT lvl_terakhir FROM progres WHERE id_user = $id_user");
  $data = mysqli_fetch_assoc($query);
  if ($data && $data['lvl_terakhir'] > 1) {
    $opened_level = $data['lvl_terakhir'];
  }
}

// Ambil data progres, sediakan nilai default jika tidak ada
$query_progress = mysqli_query($conn, "SELECT lvl_terakhir, skor_total FROM progres WHERE id_user = $id_user");
$data_progress = mysqli_fetch_assoc($query_progress);
$total_score = $data_progress['skor_total'] ?? 0; // Default ke 0 jika belum ada progres
?>

<!DOCTYPE html>
<html lang="<?= $current_lang ?>">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Quicksand:wght@300..700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="solo.css" />
    <link rel="icon" type="image/x-icon" href="../aset/logo1.png" />
    <title data-key="solo_survival_title">Solo Survival</title>
  </head>
  <body>
    <!-- Header -->
    <header>
      <div class="navbar">
        <div class="icon">
          <img src="../aset/logo.png" alt="logo" title="Napza Edu Card" />
          <h1>NAPZA EDU CARD</h1>
        </div>

        <button class="hamburger-menu" id="hamburger-btn">
        &#9776; </button>

        <nav  id="navbar-menu">
          <a href="../index.php" data-key="home_menu">Beranda</a>
          <a href="#materi" data-key="material_menu">Materi</a>
          <a href="#panduan" data-key="guidance_menu">Panduan</a>
          <a href="#tentang" data-key="about_menu">Tentang</a>
          
          <?php if (isset($_SESSION['nama'])): ?>
          <button
            class="btn-profil"
            title="Profil"
            onclick="window.location.href='../user/profil.php'"
            data-key="profile_button"
          >
            Profil
          </button>
        <?php else: ?>
          <button
            class="btn-profil"
            title="Masuk"
            onclick="window.location.href='../user/login.php'"
            data-key="lohin_button_menu"
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
        <p class="level-title" data-key="select_game_level">Pilih Level Permainan</p>
         <div class="game-stats">
            <span><span data-key="total_score_label">Skor Total:</span> <span id="points"><?= htmlspecialchars($total_score) ?></span></span>
        </div>
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
              <a href="levelgame.php?level=<?php echo $i; ?>" class="btn-play" data-key="play_button">MAINKAN</a>
            <?php elseif ($i < $opened_level): ?>
              <span class="completed" data-key="completed_status">✔️ Selesai</span>
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

<div class="reset-container">
        <button id="reset-progress-btn" class="reset-btn" data-key="reset_progress_button">
            Reset Progress Level
        </button>
      </div>
      
          <button id="nextLevel" style="display: none;" onclick="window.location='levelgame.php?level=<?php echo $level+1; ?>'" data-key="next_level_button">
            Lanjut ke Level Berikutnya
            </button>

    <footer>
      <p>@2025 Napza Edu card</p>
    </footer>
    
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            const resetBtn = document.getElementById('reset-progress-btn');
            
            if (resetBtn) {
                resetBtn.addEventListener('click', () => {
                    // Konfirmasi dari pengguna
                    const confirmation = confirm("PERINGATAN: Apakah Anda yakin ingin mereset semua progress level Anda? Tindakan ini tidak dapat dibatalkan!");
                    
                    if (confirmation) {
                        // Lakukan request AJAX ke reset_progress.php
                        fetch('reset_progres.php', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        })
                        .then(response => response.json())
                        .then(data => {
                            if (data.status === 'success') {
                                alert(data.message);
                                // Muat ulang halaman untuk menampilkan level 1 yang aktif
                                window.location.reload(); 
                            } else {
                                alert(data.message);
                            }
                        })
                        .catch(error => {
                            console.error('Error:', error);
                            alert('Terjadi kesalahan koneksi.');
                        });
                    }
                });
            }
        });
      </script>
      
    <script src="../modal.js"></script>
        <!-- Skrip Terjemahan -->
    <script src="../user/translations.js"></script>
    <script src="../user/profil.js"></script>
  </body>
</html>
