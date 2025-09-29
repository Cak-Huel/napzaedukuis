<?php
session_start();
include '../sekret.php';

if (!isset($_SESSION['id_room'])) {
  // Jika id_room belum ada di session, redirect ke halaman pembuatan room atau quest
  header("Location: creatroom.php");
  exit();
}
$id_room = $_SESSION['id_room'];

// Jika form disubmit, buat soal baru di room yang sudah otomatis dibuat
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $pertanyaan = $_POST['pertanyaan'];
    $jwbn_a = $_POST['jwbn_a'];
    $jwbn_b = $_POST['jwbn_b'];
    $jwbn_c = $_POST['jwbn_c'];
    $jwbn_d = $_POST['jwbn_d'];
    $jwbn_benar = $_POST['jwbn_benar'];
    $skor = $_POST['skor'];

    // id_room sudah pasti valid karena sudah dibuat/sudah ada di session
    $sql = "INSERT INTO soal_mlt (id_room, pertanyaan, jwbn_a, jwbn_b, jwbn_c, jwbn_d, jwbn_benar, skor)
            VALUES ('$id_room', '$pertanyaan', '$jwbn_a', '$jwbn_b', '$jwbn_c', '$jwbn_d', '$jwbn_benar', '$skor')";
    if (mysqli_query($conn, $sql)) {
        header("Location: quest.php");
        exit();
    } else {
        echo "Gagal menyimpan data: " . mysqli_error($conn);
    }
}
?>
<!DOCTYPE html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
     <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Comic+Neue:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="create.css" />
    <link rel="icon" type="image/x-icon" href="../aset/logo1.png" />
    <title>Create - Napza Edu Card</title>
  </head>
  <body class="bg-primary">
    <!-- Header -->
    <header class="topbar">
      <div class="icon">
        <img src="../aset/logo1.png" alt="logo" title="Napza Edu Card" />
        <h1>NAPZA EDU CARD</h1>
      </div>
      <nav>
        <!-- <a href="../index.php">Beranda</a> -->
        <a href="#panduan">Panduan</a>
        <a href="#tentang">Tentang</a>
        <!-- <button class="btn-login">Login</button> -->
      </nav>
    </header>

    <!-- Konten utama -->
    <main class="container">
      <!-- <button class="btn-back" onclick="window.location.href='selection.php'">
        ←
      </button> -->

      <form method="POST" class="question-section">
        <div class="top-right">
          <div class="info-box">⏰ 30</div>
          <div class="info-box">
            Skor <input type="number" name="skor" value="1" min="1" style="width:50px;" required>
          </div>
          <button class="btn-save" type="submit">
            Simpan
          </button>
        </div>
        <textarea name="pertanyaan" placeholder="Masukkan Pertanyaan" required></textarea>

        <!-- Jawaban -->
        <div class="answers">
          <div class="answer-card">
            <input type="text" name="jwbn_a" placeholder="Masukkan Jawaban" required />
            <input type="radio" name="jwbn_benar" value="A" class="correct-radio" required /> Benar
          </div>
          <div class="answer-card">
            <input type="text" name="jwbn_b" placeholder="Masukkan Jawaban" required />
            <input type="radio" name="jwbn_benar" value="B" class="correct-radio" /> Benar
          </div>
          <div class="answer-card">
            <input type="text" name="jwbn_c" placeholder="Masukkan Jawaban" required />
            <input type="radio" name="jwbn_benar" value="C" class="correct-radio" /> Benar
          </div>
          <div class="answer-card">
            <input type="text" name="jwbn_d" placeholder="Masukkan Jawaban" required />
            <input type="radio" name="jwbn_benar" value="D" class="correct-radio" /> Benar
          </div>
        </div>
      </form>
    </main>

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