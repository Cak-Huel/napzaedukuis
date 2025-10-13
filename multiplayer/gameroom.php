<!DOCTYPE html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
     <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Comic+Neue:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="gameroom.css" />
    <link rel="icon" type="image/x-icon" href="../aset/logo1.png" />
    <title>Game Room - Napza Edu Card</title>
  </head>
  <body>
    <!-- Header Info (Nama dan Skor) -->
    <div class="top-info">
      <div class="player-name"></div> <!-- Diisi JS -->
      <div class="right-info">
        <div class="timer-box"></div> <!-- Diisi JS -->
        <div class="score-box"></div> <!-- Diisi JS -->
      </div>
    </div>

    <!-- Kartu Pertanyaan -->
    <div class="question-card">
      <div class="flower">🌸</div>
      <p></p> <!-- Diisi JS -->
      <div class="flower bottom-flower">🌸</div>
    </div>

    <!-- Jawaban -->
    <div class="answer-grid">
      <button class="answer-btn"></button>
      <button class="answer-btn"></button>
      <button class="answer-btn"></button>
      <button class="answer-btn"></button>
    </div>
    <!-- Pusher JS -->
    <script src="https://js.pusher.com/8.2.0/pusher.min.js"></script>
    <script src="gameroom.js"></script>


    <script>
      // Aktifkan logging ke console untuk debugging (opsional, hapus saat produksi)
      Pusher.logToConsole = true;

      // Buat koneksi ke Pusher
      var pusher = new Pusher('gggvgvg55451', { // Ganti dengan App Key Anda
          cluster: 'ap1' // Ganti dengan cluster Anda
      });
  </script>
  </body>
</html>
