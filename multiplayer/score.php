<!DOCTYPE html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
     <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Comic+Neue:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="score.css" />
    <link rel="icon" type="image/x-icon" href="../aset/logo1.png" />
    <title>Ringkasan Skor - Napza Edu Card</title>
  </head>
  <body>
    <!-- Modal Skor -->
    <div class="score-modal">
      <a href="joinroom.php" class="close-btn">✕</a>
      <h3>Ringkasan</h3>
      <h2 class="nama-peserta"></h2>

      <!-- Stat Box -->
      <div class="stat-grid">
        <div class="stat-box">
          <p>Nilai</p>
          <h2 class="nilai-persentase"></h2>
        </div>

        <div class="stat-box">
          <p>Peringkat</p>
          <h2 class="peringkat"></h2>
        </div>

        <div class="stat-box">
          <p>Performa</p>
          <h2 class="performa"></h2>
        </div>

        <div class="stat-box">
          <p>Benar</p>
          <h2 class="total-benar"></h2>
        </div>

        <div class="stat-box">
          <p>Salah</p>
          <h2 class="total-salah"></h2>
        </div>

        <div class="stat-box">
          <p>Waktu</p>
          <h2 class="waktu-tercepat"></h2>
        </div>

        <div class="stat-box">
          <p>Benar Beruntun</p>
          <h2 class="benar-beruntun"></h2>
        </div>
      </div>

      <!-- Review Soal -->
      <div class="review-section"></div>
    </div>
    <!-- Pusher JS (opsional di halaman ini, tapi tidak apa-apa jika ada) -->
    <script src="https://js.pusher.com/8.2.0/pusher.min.js"></script>
    <script src="score.js"></script>

    <script>
      // Aktifkan logging ke console untuk debugging (opsional, hapus saat produksi)
      Pusher.logToConsole = true;

      // Buat koneksi ke Pusher
      var pusher = new Pusher('hvgfxdxfcgvhbj525', { // Ganti dengan App Key Anda
          cluster: 'ap1', // Ganti dengan cluster Anda
           channelAuthorization: {
              endpoint: 'pusher_auth.php',
              transport: 'ajax'
          }
      });
  </script>
  </body>
</html>
