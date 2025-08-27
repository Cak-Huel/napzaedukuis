<?php
session_start();
header("Cache-Control: no-cache, must-revalidate");
header("Expires: Sat, 1 Jul 2000 05:00:00 GMT");
include '../sekret.php';

if (!isset($_SESSION['id_user'])) {
    header("Location: ../index.php");
    exit;
}

$id_user = $_SESSION['id_user'];

// Ambil data user
$query_user = mysqli_query($conn, "SELECT nama, email FROM orang WHERE id_user = $id_user");
$data_user = mysqli_fetch_assoc($query_user);

// Ambil data progres
$query_progress = mysqli_query($conn, "SELECT lvl_terakhir, skor_total FROM progres WHERE id_user = $id_user");
$data_progress = mysqli_fetch_assoc($query_progress);
?>

<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <link rel="stylesheet" href="profil.css" />
  <link rel="icon" type="image/x-icon" href="../aset/logo1.png" />
  <title>Profil Saya</title>
</head>
<body>
<div class="container">
    
    <h1>Profil Pengguna</h1>

    <?php if ($data_user): ?>
        <p><strong>Nama:</strong> <?= htmlspecialchars($data_user['nama']) ?></p>
        <p><strong>Email:</strong> <?= htmlspecialchars($data_user['email']) ?></p>
    <?php endif; ?>

    <?php if ($data_progress): ?>
        <p><strong>Level Terakhir:</strong> <?= $data_progress['lvl_terakhir'] ?></p>
        <p><strong>Skor Total:</strong> <?= $data_progress['skor_total'] ?></p>
    <?php else: ?>
        <p><em>Belum ada progres.</em></p>
    <?php endif; ?>

    <form action="logout.php" method="post">
        <button type="submit" class="btn-logout">Logout</button>
    </form>

    <button type="button" class="btn-back" onclick="window.history.back();">← Kembali</button>
</div>
</body>
</html>