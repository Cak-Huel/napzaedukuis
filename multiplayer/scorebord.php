<!DOCTYPE html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
     <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Comic+Neue:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="scorebord.css" />
    <link rel="icon" type="image/x-icon" href="../aset/logo1.png" />
    <title>NAPZA EDU CARD - Scoreboard</title>
  </head>
  <body>
    <header>
      <div class="nav">
        <img src="../aset/logo.png" alt="logo" title="Napza Edu Card" />
        <h1>NAPZA EDU CARD</h1>
      </div>

      <div class="button-group">
        <button class="pause">Pause</button>
        <button class="end" id="end-game-btn">Akhiri</button>
      </div>
    </header>

    <main>
      <div class="card">
        <div class="top-bar">
          <span></span> <!-- Diisi jumlah peserta oleh JS -->
        </div>
        <h2>Responden</h2>
        <table>
          <thead>
            <tr>
              <th>Peringkat</th>
              <th>Nama</th>
              <th>Performa</th>
              <th colspan="7">Jawaban</th>
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
      var pusher = new Pusher('kmkmkmkmknjnj545', { // Ganti dengan App Key Anda
          cluster: 'ap1' // Ganti dengan cluster Anda
      });
  </script>
  </body>
</html>
