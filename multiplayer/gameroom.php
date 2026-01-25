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
    <link rel="stylesheet" href="gameroom.css" />
    <link rel="icon" type="image/x-icon" href="../aset/logo1.png" />
    <title data-key="gameroom_page_title">Game Room - Napza Edu Card</title>
  </head>
  <body>
    <!-- Header Info (Nama dan Skor) -->
    <div class="top-info">
      <div class="player-name"></div> <!-- Diisi JS -->
      <div class="right-info">
        <div class="timer-box" data-key="timer_display_label"></div> <!-- Diisi JS -->
        <div class="score-box" data-key="points_display_label"></div> <!-- Diisi JS -->
      </div>
    </div>

    <!-- Kartu Pertanyaan -->
    <div class="question-card">
      <div class="flower">🌸</div>
      <img src="" alt="Gambar Soal" class="question-image" style="display: none; max-width: 80%; max-height: 200px; margin: 0 auto 15px; border-radius: 10px; object-fit: cover;">
      <p class="question-text" data-key="question_placeholder"></p> <!-- Diisi JS -->
      <div class="flower bottom-flower">🌸</div>
    </div>

    <!-- Jawaban -->
    <div class="answer-grid">
      <button class="answer-btn" data-key="answer_a_placeholder"></button>
      <button class="answer-btn" data-key="answer_b_placeholder"></button>
      <button class="answer-btn" data-key="answer_c_placeholder"></button>
      <button class="answer-btn" data-key="answer_d_placeholder"></button>
    </div>
    <!-- Pusher JS -->
    <script src="https://js.pusher.com/8.2.0/pusher.min.js"></script>
    <script src="gameroom.js"></script>


    <script>
      // Aktifkan logging ke console untuk debugging (opsional, hapus saat produksi)
      Pusher.logToConsole = true;

      // Buat koneksi ke Pusher
      var pusher = new Pusher('48dc0e7685cb274b770b', { // Ganti dengan App Key Anda
          cluster: 'ap1', // Ganti dengan cluster Anda
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
