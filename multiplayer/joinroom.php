<!DOCTYPE html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" href="joinroom.css" />
    <link rel="icon" type="image/x-icon" href="../aset/logo1.png" />
    <title>Join Room - Napza Edu Card</title>
  </head>
  <body>
    <!-- Header -->
    <header class="navbar">
      <div class="icon">
        <img src="../aset/logo.png" alt="logo" title="Napza Edu Card" />
        <h1>NAPZA EDU CARD</h1>
      </div>

      <nav>
        <a href="../index.php">Beranda</a>
        <a href="#">Panduan</a>
        <a href="#">Tentang</a>
        <a href="#" class="btn-profil">Login</a>
      </nav>
    </header>

    <!-- Konten utama Join Room -->
    <main class="join-room-container">
      <div class="join-box">
        <div class="join-left">
          <a href="selection.php" class="back-btn">&#8592;</a>
          <h2>Join Room</h2>
          <input
            type="text"
            id="kode_room"
            name="kode_room"
            placeholder="Masukkan kode"
            maxlength="6"
            class="kode-input"
            autocomplete="off"
          />
          <input
            type="text"
            id="nama_guest"
            name="nama_guest"
            placeholder="Masukkan nama"
            maxlength="6"
            class="nama-input"
            autocomplete="off"
          />
          <button class="btn-join">
            Join
          </button>
        </div>

        <div class="join-right">
          <img src="../aset/lock.svg" class="lock-icon" />
          <div class="kode-petunjuk">123 456</div>
          <p>Masukkan enam digit kode yang disediakan oleh gurumu</p>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer>
      <p>@2025 Napza Edu card</p>
    </footer>
    <script src="http://localhost:3000/socket.io/socket.io.js"></script>
    <script src="joinroom.js"></script>
  </body>
</html>
