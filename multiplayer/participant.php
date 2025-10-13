<!DOCTYPE html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Comic+Neue:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="participant.css" />
    <link rel="icon" type="image/x-icon" href="../aset/logo1.png" />
    <title>NAPZA EDU CARD - Participant Code</title>
  </head>
  <body>
    <header>
      <div class="conten">
        <img src="../aset/logo.png" alt="logo" title="Napza Edu Card" />
        <h1>NAPZA EDU CARD</h1>
      </div>
      
      <div class="actions">
        <button class="pause">Pause</button>
        <button class="end" onclick="window.location.href='selection.php'">
          Akhiri
        </button>
      </div>
    </header>

    <main>
      <div class="room-box">
        <p>Masuk dengan kode</p>
        <h1></h1> <!-- kosong, diisi JS -->
        <button id="start-game-btn" class="start-btn">Mulai Game</button>
      </div>
      <div class="participants">
        <h2>Peserta yang Bergabung (<span id="total-peserta">0</span>)</h2>
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
      var pusher = new Pusher('njnnknknk1212121', { // Ganti dengan App Key Anda
          cluster: 'ap1' // Ganti dengan cluster Anda
      });
  </script>
  </body>
</html>
