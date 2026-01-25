<?php
include '../sekret.php';
session_start();

if (!isset($_SESSION['id_user'])) {
  http_response_code(401);
  echo json_encode(['status'=>'no-session']);
  exit;
}

$id_user = $_SESSION['id_user'];
$skor_tambahan = isset($_POST['skor']) ? intval($_POST['skor']) : 0;
$level_selesai = isset($_POST['lvl']) ? intval($_POST['lvl']) : 1;


$cek = mysqli_query($conn, "SELECT * FROM progres WHERE id_user = $id_user");
if (mysqli_num_rows($cek) > 0) {
  $result = mysqli_query($conn, "
    UPDATE progres 
    SET lvl_terakhir = GREATEST(lvl_terakhir, $level_selesai + 1), 
        skor_total = skor_total + $skor_tambahan
    WHERE id_user = $id_user
  ");
} else {
  $result = mysqli_query($conn, "
    INSERT INTO progres (id_user, lvl_terakhir, skor_total) 
    VALUES ($id_user, $level_selesai + 1, $skor_tambahan)
  ");
}
if ($result) {
  echo json_encode(['status' => 'success']);
} else {
  // KIRIM PESAN ERROR
  echo json_encode(['status' => 'error', 'mysql_error' => mysqli_error($conn)]);
}
?>