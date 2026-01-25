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
    <link rel="stylesheet" href="participant.css" />
    <link rel="icon" type="image/x-icon" href="../aset/logo1.png" />
    <title data-key="participant_page_title">NAPZA EDU CARD - Participant Code</title>
  </head>
  <body>
    <header>
      <div class="conten">
        <img src="../aset/logo.png" alt="logo" title="Napza Edu Card" />
        <h1>NAPZA EDU CARD</h1>
      </div>
      
      <div class="actions">
        <button class="pause" data-key="pause_button">Pause</button>
        <button class="end" onclick="window.location.href='selection.php'" data-key="end_button">
          Akhiri
        </button>
      </div>
    </header>

    <main>
      <div class="room-box">
        <p data-key="join_with_code_instruction">Masuk dengan kode</p>
        <h1></h1> <!-- kosong, diisi JS -->
        <button id="start-game-btn" class="start-btn" data-key="start_game_button">Mulai Game</button>
      </div>
      <div class="participants">
        <h2><span data-key="joined_participants_heading">Peserta yang Bergabung</span> (<span id="total-peserta">0</span>)</h2>
        <ul id="participant-list">
        </ul>
      </div>
    </main>
    <!-- Pusher JS -->
    <script src="https://js.pusher.com/8.2.0/pusher.min.js"></script>
    <script src="participant.js"></script>

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
