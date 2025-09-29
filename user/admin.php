<?php
session_start();
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
  header("Location: login.php");
  exit;
}
?>

<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
   <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Comic+Neue:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="admin.css" />
  <link rel="icon" type="image/x-icon" href="../aset/logo1.png" />
  <title>Admin - Napza Edu Card</title>
</head>
<body>
  <nav class="navbar">
    <div class="header">
      <img src="../aset/logo.png" alt="logo" title="Napza Edu Card" />
      <h1 class="hed" >ADMIN PANEL</h1>
    </div>
    <div class="navbar-nav">
      <a href="?menu=pertanyaan">Buat Pertanyaan</a>
      <a href="?menu=laporan">Laporan</a>
      <a href="logout.php">Logout</a>
    </div>
  </nav>
  <main>
    <?php
    $menu = isset($_GET['menu']) ? $_GET['menu'] : 'pertanyaan';
    if ($menu === 'pertanyaan') {
      include '../soal/form.php';
    } elseif ($menu === 'laporan') {
      echo "<h2>Halaman laporan belum tersedia.</h2>";
    }
    ?>
  </main>
</body>