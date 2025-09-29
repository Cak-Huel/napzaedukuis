<?php
session_start();
if (!isset($_SESSION['id_user'])) {
  header("Location: ../user/login.php");
  exit;
}
$level = isset($_GET['level']) ? intval($_GET['level']) : 1;
?>

<!DOCTYPE html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Comic+Neue:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="levelgame.css" />
    <link rel="icon" type="image/x-icon" href="../aset/logo1.png" />
    <script src="game.js" defer></script>
    <title>Level <?php echo $level; ?> - NAPZA EDU CARD</title>
  </head>
  <body>
    <!-- Header -->
    <header class="navbar">
      <div class="icon">
        <img src="../aset/logo.png" alt="logo" title="Napza Edu Card" />
        <h1>NAPZA EDU CARD</h1>
      </div>

      <button class="hamburger-menu" id="hamburger-btn">
        &#9776; </button>

      <nav id="navbar-menu">
        <a href="#panduan">Panduan</a>
        <a href="#tentang">Tentang</a>
        <?php if (isset($_SESSION['nama'])): ?>
          <button
            class="btn-profile"
            title="Profil"
            onclick="window.location.href='../user/profil.php'"
          >
            Profil
          </button>
        <?php else: ?>
          <button
            class="btn-login"
            title="Masuk"
            onclick="window.location.href='../user/login.php'"
          >
            Login
          </button>
        <?php endif; ?>
      </nav>
    </header>
    <!-- End Header -->

    <!-- perent header -->
    <div class="level-header">
      <a href="solo.php" class="back-btn">&#8592;</a>
      <h2>Level <?php echo $level; ?></h2>
      <div class="game-info">
        <div class="timer">⏱️ <span id="timer">30</span></div>
        <div class="score">Skor <span id="skor">0</span></div>
      </div>
    </div>
    <!-- End parent header -->

    <!-- Kartu-kartu permainan -->
    <main class="card-container">
    <div class="flip-card">
        <div class="flip-card-inner" onclick="flipCard(this, 1)">
            <div class="flip-card-front">
                <img src="../aset/card.png" alt="Kartu Depan" />
            </div>
            <div class="flip-card-back">
                <div class="question-content">
                    <h3 id="q-title-1">Memuat...</h3>
                    <div id="q-options-1" class="options">
                        <button class="answer-btn">Pilihan A</button>
                        <button class="answer-btn">Pilihan B</button>
                        <button class="answer-btn">Pilihan C</button>
                        <button class="answer-btn">Pilihan D</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="flip-card">
        <div class="flip-card-inner" onclick="flipCard(this, 2)">
            <div class="flip-card-front">
                <img src="../aset/card.png" alt="Kartu Depan" />
            </div>
            <div class="flip-card-back">
                <div class="question-content">
                    <h3 id="q-title-2">Memuat...</h3>
                    <div id="q-options-2" class="options">
                        <button class="answer-btn">Pilihan A</button>
                        <button class="answer-btn">Pilihan B</button>
                        <button class="answer-btn">Pilihan C</button>
                        <button class="answer-btn">Pilihan D</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="flip-card">
        <div class="flip-card-inner" onclick="flipCard(this, 3)">
            <div class="flip-card-front">
                <img src="../aset/card.png" alt="Kartu Depan" />
            </div>
            <div class="flip-card-back">
                <div class="question-content">
                    <h3 id="q-title-3">Memuat...</h3>
                    <div id="q-options-3" class="options">
                        <button class="answer-btn">Pilihan A</button>
                        <button class="answer-btn">Pilihan B</button>
                        <button class="answer-btn">Pilihan C</button>
                        <button class="answer-btn">Pilihan D</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="flip-card">
        <div class="flip-card-inner" onclick="flipCard(this, 4)">
            <div class="flip-card-front">
                <img src="../aset/card.png" alt="Kartu Depan" />
            </div>
            <div class="flip-card-back">
                <div class="question-content">
                    <h3 id="q-title-4">Memuat...</h3>
                    <div id="q-options-4" class="options">
                        <button class="answer-btn">Pilihan A</button>
                        <button class="answer-btn">Pilihan B</button>
                        <button class="answer-btn">Pilihan C</button>
                        <button class="answer-btn">Pilihan D</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="flip-card">
        <div class="flip-card-inner" onclick="flipCard(this, 5)">
            <div class="flip-card-front">
                <img src="../aset/card.png" alt="Kartu Depan" />
            </div>
            <div class="flip-card-back">
                <div class="question-content">
                    <h3 id="q-title-5">Memuat...</h3>
                    <div id="q-options-5" class="options">
                        <button class="answer-btn">Pilihan A</button>
                        <button class="answer-btn">Pilihan B</button>
                        <button class="answer-btn">Pilihan C</button>
                        <button class="answer-btn">Pilihan D</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    </main>
    <!-- Petunjuk -->
    <p class="instruction">Klik kartu untuk melihat dan menjawab pertanyaan</p>

    <!-- Kontainer untuk pertanyaan -->
    <div id="question-box" style="display: none;" class="question-popup"></div>
    
    <!-- Tombol lanjut level -->
     <button id="nextLevel" style="display: none;" onclick="window.location='levelgame.php?level=<?php echo $level+1; ?>'">
      Lanjut ke Level Berikutnya
      </button>

       <!-- Modal Dialog -->
<div id="modal-overlay" style="display:none;">
  <div id="modal-dialog">
    <span id="modal-close">&times;</span>
    <h2 id="modal-title">Judul Modal</h2>
    <h4 id="modal-subtitle">Sub Judul</h4>
    <div id="modal-content">Isi modal di sini.</div>
  </div>
</div>
<!-- End Modal Dialog -->

<script src="../modal.js"></script>
  </body>
</html>
