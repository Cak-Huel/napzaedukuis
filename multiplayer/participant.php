<!DOCTYPE html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
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
        <button class="start">Mulai</button>
      </div>
      <div class="participants">
        <h3>Peserta</h3>
        <div class="names"></div> <!-- kosong, diisi JS -->
      </div>
    </main>
    <script src="http://localhost:3000/socket.io/socket.io.js"></script>
    <script src="participant.js"></script>
  </body>
</html>
