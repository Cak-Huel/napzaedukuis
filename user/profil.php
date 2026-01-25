<?php
session_start();
header("Cache-Control: no-cache, must-revalidate");
header("Expires: Sat, 1 Jul 2000 05:00:00 GMT");

$current_lang = $_SESSION['lang'] ?? 'id'; // Default 'id'

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
<html lang="<?= $current_lang ?>">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
   <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Quicksand:wght@300..700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="profil.css" />
  <link rel="icon" type="image/x-icon" href="../aset/logo1.png" />
  <title data-key="page_title">Profil Saya</title>
</head>
<body>
<div class="container">
    
    <h1 data-key="profile_title">Profil Pengguna</h1>

    <?php if ($data_user): ?>
        <p><strong data-key="name_label">Nama:</strong> <?= htmlspecialchars($data_user['nama']) ?></p>
        <p><strong data-key="email_label">Email:</strong> <?= htmlspecialchars($data_user['email']) ?></p>
    <?php endif; ?>

    <?php if ($data_progress): ?>
        <p><strong data-key="last_level_label">Level Terakhir:</strong> <?= $data_progress['lvl_terakhir'] ?></p>
        <p><strong data-key="total_score_label">Skor Total:</strong> <?= $data_progress['skor_total'] ?></p>
    <?php else: ?>
        <p><em data-key="no_progress">Belum ada progres.</em></p>
    <?php endif; ?>

    <form action="logout.php" method="post">
        <button type="submit" class="btn-logout" data-key="logout_button">Logout</button>
    </form>

    <button type="button" class="btn-back" onclick="window.history.back();" data-key="back_button">← Kembali</button>
</div>

<script src="translations.js"></script>
<script src="profil.js"></script>

</body>
</html>