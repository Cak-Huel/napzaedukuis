<?php
include '../sekret.php';
session_start();

if ($_SERVER["REQUEST_METHOD"] === "POST") {
  $pertanyaan = mysqli_real_escape_string($conn, $_POST['pertanyaan']);
  $a = mysqli_real_escape_string($conn, $_POST['jwbn_a']);
  $b = mysqli_real_escape_string($conn, $_POST['jwbn_b']);
  $c = mysqli_real_escape_string($conn, $_POST['jwbn_c']);
  $d = mysqli_real_escape_string($conn, $_POST['jwbn_d']);
  $benar = mysqli_real_escape_string($conn, $_POST['jwbn_bnr']);
  
  // Jika level tidak dimasukkan di form, default ke 1
  $level = isset($_POST['lvl']) ? intval($_POST['lvl']) : 1;

  $query = "INSERT INTO soal (pertanyaan, jwbn_a, jwbn_b, jwbn_c, jwbn_d, jwbn_bnr, lvl)
            VALUES ('$pertanyaan', '$a', '$b', '$c', '$d', '$benar', $level)";
  
  if (mysqli_query($conn, $query)) {
    echo "<script>alert('Soal berhasil disimpan!'); window.location.href='../user/admin.php';</script>";
  } else {
    echo "<script>alert('Gagal menyimpan soal.'); window.history.back();</script>";
  }
} else {
  header("Location: form.php");
  exit;
}
?>