<?php
session_start();
include '../sekret.php';

$current_lang = $_SESSION['lang'] ?? 'id'; // Tentukan bahasa, default 'id'

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
    $skor = (int)$_POST['skor'];
    $gambar_path = null;

  // Proses unggah gambar jika ada
  if (isset($_FILES['gambar']) && $_FILES['gambar']['error'] === UPLOAD_ERR_OK) {
    $upload_dir = '../uploads/';
    if (!is_dir($upload_dir)) {
      mkdir($upload_dir, 0777, true); // Buat direktori jika belum ada
    }

    $file_info = pathinfo($_FILES['gambar']['name']);
    $file_extension = strtolower($file_info['extension']);
    $allowed_extensions = ['jpg', 'jpeg', 'png', 'gif'];

    if (in_array($file_extension, $allowed_extensions)) {
      $new_file_name = uniqid('img_', true) . '.' . $file_extension;
      $dest_path = $upload_dir . $new_file_name;

      if (move_uploaded_file($_FILES['gambar']['tmp_name'], $dest_path)) {
        $gambar_path = 'uploads/' . $new_file_name; // Simpan path relatif dari root (Gameweb)
      } else {
        exit("Gagal memindahkan file yang diunggah.");
      }
    } else {
      exit("Tipe file gambar tidak valid. Hanya JPG, JPEG, PNG, GIF yang diizinkan.");
    }
  }

  // Menggunakan prepared statement untuk mencegah SQL Injection
  $sql = "INSERT INTO soal_mlt (id_room, pertanyaan, jwbn_a, jwbn_b, jwbn_c, jwbn_d, jwbn_benar, skor, gambar)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
  $stmt = mysqli_prepare($conn, $sql);
  mysqli_stmt_bind_param($stmt, "issssssis", $id_room, $pertanyaan, $jwbn_a, $jwbn_b, $jwbn_c, $jwbn_d, $jwbn_benar, $skor, $gambar_path);

  if (mysqli_stmt_execute($stmt)) {
    header("Location: quest.php");
    exit();
  } else {
    exit("Gagal menyimpan data: " . mysqli_error($conn));
  }
}
?>
<!DOCTYPE html>
<html lang="<?= $current_lang ?>">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Quicksand:wght@300..700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="create.css" />
    <link rel="icon" type="image/x-icon" href="../aset/logo1.png" />
    <title data-key="create_page_title">Create - Napza Edu Card</title>
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
        <a href="#panduan" data-key="guidance_menu">Panduan</a>
        <a href="#tentang" data-key="about_menu">Tentang</a>
        <!-- <button class="btn-login">Login</button> -->
      </nav>
    </header>

    <!-- Konten utama -->
    <main class="container">
      <!-- <button class="btn-back" onclick="window.location.href='selection.php'">
        ←
      </button> -->

      <form method="POST" class="question-section" enctype="multipart/form-data">
        <div class="top-right">
          <div class="info-box">⏰ 30</div>
          <div class="info-box"><span data-key="score_label_create_form">Skor</span>
            <input type="number" name="skor" value="1" min="1" style="width:50px;" required>
          </div>
          <button class="btn-save" type="submit" data-key="save_button">Simpan</button>
        </div>
        <textarea name="pertanyaan" data-key-placeholder="question_input_placeholder" placeholder="Masukkan Pertanyaan" required></textarea>
          <div class="image-upload-container" style="margin: 15px 0;">
            <label for="gambar" data-key="image_upload_label">Unggah Gambar (Opsional):</label>
            <input type="file" id="gambar" name="gambar" accept="image/*">
          </div>
      
      <!-- Jawaban -->
        <div class="answers">
          <div class="answer-card">
            <input type="text" name="jwbn_a" data-key-placeholder="answer_input_placeholder" placeholder="Masukkan Jawaban" required />
            <input type="radio" name="jwbn_benar" value="A" class="correct-radio" required /> <span data-key="correct_answer_radio_label">Benar</span>
          </div>
          <div class="answer-card">
            <input type="text" name="jwbn_b" data-key-placeholder="answer_input_placeholder" placeholder="Masukkan Jawaban" required />
            <input type="radio" name="jwbn_benar" value="B" class="correct-radio" /> <span data-key="correct_answer_radio_label">Benar</span>
          </div>
          <div class="answer-card">
            <input type="text" name="jwbn_c" data-key-placeholder="answer_input_placeholder" placeholder="Masukkan Jawaban" required />
            <input type="radio" name="jwbn_benar" value="C" class="correct-radio" /> <span data-key="correct_answer_radio_label">Benar</span>
          </div>
          <div class="answer-card">
            <input type="text" name="jwbn_d" data-key-placeholder="answer_input_placeholder" placeholder="Masukkan Jawaban" required />
            <input type="radio" name="jwbn_benar" value="D" class="correct-radio" /> <span data-key="correct_answer_radio_label">Benar</span>
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
  <script src="../user/translations.js"></script>
  <script src="../user/profil.js"></script>
  </body>
</html>