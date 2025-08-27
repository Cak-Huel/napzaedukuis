<!DOCTYPE html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
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

    <script src="http://localhost:3000/socket.io/socket.io.js"></script>
    <script src="scorebord.js"></script>
  </body>
</html>
