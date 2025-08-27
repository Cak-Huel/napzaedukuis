<!DOCTYPE html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
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

    <script src="http://localhost:3000/socket.io/socket.io.js"></script>
    <script src="score.js"></script>
  </body>
</html>
