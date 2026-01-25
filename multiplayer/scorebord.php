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
    <link rel="stylesheet" href="scorebord.css" />
    <link rel="icon" type="image/x-icon" href="../aset/logo1.png" />
    <title data-key="scoreboard_page_title">NAPZA EDU CARD - Scoreboard</title>
  </head>
  <body>
    <header>
      <div class="nav">
        <img src="../aset/logo.png" alt="logo" title="Napza Edu Card" />
        <h1>NAPZA EDU CARD</h1>
      </div>

      <div class="button-group">
        <button class="pause" data-key="pause_button">Pause</button>
        <button class="end" id="end-game-btn" data-key="end_button">Akhiri</button>
      </div>
    </header>

    <main>
      <div class="card">
        <div class="top-bar">
          <span data-key="respondents_count_label"></span> <!-- Diisi jumlah peserta oleh JS -->
        </div>
        <h2 data-key="respondents_heading">Responden</h2>
        <table>
          <thead>
            <tr>
              <th data-key="rank_header">Peringkat</th>
              <th data-key="name_header">Nama</th>
              <th data-key="performance_header">Performa</th>
              <th colspan="7" data-key="answers_header">Jawaban</th>
            </tr>
          </thead>
          <tbody>
            <!-- Baris peserta akan diisi oleh JS -->
          </tbody>
        </table>
      </div>
    </main>
    <!-- Pusher JS -->
    <script src="https://js.pusher.com/8.2.0/pusher.min.js"></script>
    <script src="scorebord.js"></script>

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
