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
    <link rel="stylesheet" href="score.css" />
    <link rel="icon" type="image/x-icon" href="../aset/logo1.png" />
    <title data-key="score_summary_page_title">Ringkasan Skor - Napza Edu Card</title>
  </head>
  <body>
    <!-- Modal Skor -->
    <div class="score-modal">
      <a href="joinroom.php" class="close-btn">✕</a>
      <h3 data-key="summary_heading">Ringkasan</h3>
      <h2 class="nama-peserta"></h2>

      <!-- Stat Box -->
      <div class="stat-grid">
        <div class="stat-box">
          <p data-key="grade_label">Nilai</p>
          <h2 class="nilai-persentase"></h2>
        </div>

        <div class="stat-box">
          <p data-key="rank_label">Peringkat</p>
          <h2 class="peringkat"></h2>
        </div>

        <div class="stat-box">
          <p data-key="performance_label">Performa</p>
          <h2 class="performa"></h2>
        </div>

        <div class="stat-box">
          <p data-key="correct_label">Benar</p>
          <h2 class="total-benar"></h2>
        </div>

        <div class="stat-box">
          <p data-key="incorrect_label">Salah</p>
          <h2 class="total-salah"></h2>
        </div>

        <div class="stat-box">
          <p data-key="time_label">Waktu</p>
          <h2 class="waktu-tercepat"></h2>
        </div>

        <div class="stat-box">
          <p data-key="streak_label">Benar Beruntun</p>
          <h2 class="benar-beruntun"></h2>
        </div>
      </div>

      <!-- Review Soal -->
      <div class="review-section"></div>
    </div>
    
    <!-- Pusher JS -->
    <script src="https://js.pusher.com/8.2.0/pusher.min.js"></script>
    <script src="score.js"></script>

    <script>
      Pusher.logToConsole = true;

      // koneksi ke Pusher
      var pusher = new Pusher('48dc0e7685cb274b770b', { // App Key Anda
          cluster: 'ap1', // cluster Anda
           channelAuthorization: {
              endpoint: 'pusher_auth.php',
              transport: 'ajax'
          }
      });
  </script>
  <!-- Skrip Terjemahan -->
  <script src="../user/translations.js"></script>
  <script src="../user/profil.js"></script>
  </body>
</html>
