<?php
include '../sekret.php';
session_start();

// Periksa apakah pengguna adalah admin (Wajib!)
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
  header("Location: ../user/login.php");
  exit;
}

// 1. Ambil ID Soal dari URL
$id_soal = isset($_GET['id']) ? intval($_GET['id']) : 0;

if ($id_soal > 0) {
    // 2. Dapatkan path gambar lama sebelum menghapus record dari DB (Opsional tapi Disarankan)
    $result = mysqli_query($conn, "SELECT gambar FROM soal WHERE id_soal = $id_soal");
    $soal = mysqli_fetch_assoc($result);
    $path_gambar_lama = $soal ? $soal['gambar'] : null;

    // 3. Query Hapus Data dari Database
    $query = "DELETE FROM soal WHERE id_soal = $id_soal LIMIT 1";
    
    if (mysqli_query($conn, $query)) {
        
        // 4. Hapus File Gambar dari Server (Jika ada)
        if ($path_gambar_lama) {
            // Asumsi file gambar ada di folder 'uploads/'
            $file_path = "uploads/" . basename($path_gambar_lama); 
            
            // Cek dan hapus file
            if (file_exists($file_path)) {
                unlink($file_path);
            }
        }

        echo "<script>alert('Soal ID $id_soal berhasil dihapus, termasuk file gambarnya.'); window.location.href='../user/admin.php?menu=pertanyaan';</script>";
    } else {
        echo "<script>alert('Gagal menghapus soal. Error: " . mysqli_error($conn) . "'); window.location.href='../user/admin.php?menu=pertanyaan';</script>";
    }
} else {
    echo "<script>alert('ID Soal tidak valid.'); window.location.href='../user/admin.php?menu=pertanyaan';</script>";
}
?>