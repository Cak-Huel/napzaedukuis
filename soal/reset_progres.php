<?php
include '../sekret.php';
session_start();

header('Content-Type: application/json');

if (!isset($_SESSION['id_user'])) {
    echo json_encode(['status' => 'error', 'message' => 'User not logged in.']);
    exit;
}

$id_user = intval($_SESSION['id_user']);

// Query untuk menghapus semua progres (skor) pengguna dari tabel yang menyimpan progres
// ASUMSI: Tabel progres pengguna bernama 'progres' atau sejenisnya
$query = "DELETE FROM progres WHERE id_user = $id_user";

if (mysqli_query($conn, $query)) {
    // Jika tidak ada tabel 'progres', ini mungkin tabel 'user' itu sendiri.
    // Jika progres disimpan di tabel 'user', gunakan UPDATE:
    /*
    $query = "UPDATE user SET skor_solo = 0, level_terakhir = 1 WHERE id = $id_user";
    mysqli_query($conn, $query);
    */
    
    // Asumsi kamu memiliki tabel 'progres' terpisah.
    
    // Setelah reset di database, reset variabel sesi (jika ada)
    unset($_SESSION['skor_solo']); 
    
    echo json_encode(['status' => 'success', 'message' => 'Progress level berhasil direset!']);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Gagal mereset progress di database.']);
}
?>