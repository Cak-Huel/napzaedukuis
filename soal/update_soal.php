<?php
include '../sekret.php';
session_start();

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    // 1. Ambil ID Soal dan Sanitasi Data
    $id_soal = isset($_POST['id']) ? intval($_POST['id']) : 0;
    
    if ($id_soal === 0) {
        echo "<script>alert('Error: ID Soal tidak ditemukan.'); window.history.back();</script>";
        exit;
    }

    $pertanyaan = mysqli_real_escape_string($conn, $_POST['pertanyaan']);
    $a = mysqli_real_escape_string($conn, $_POST['jwbn_a']);
    $b = mysqli_real_escape_string($conn, $_POST['jwbn_b']);
    $c = mysqli_real_escape_string($conn, $_POST['jwbn_c']);
    $d = mysqli_real_escape_string($conn, $_POST['jwbn_d']);
    $benar = mysqli_real_escape_string($conn, $_POST['jwbn_bnr']);
    $level = isset($_POST['lvl']) ? intval($_POST['lvl']) : 1;
    
    // Inisialisasi bagian query UPDATE untuk gambar
    $gambar_update_query = "";

    // 2. Logika Upload Gambar BARU
    if (isset($_FILES['gambar']) && $_FILES['gambar']['error'] === UPLOAD_ERR_OK) {
        // Logika upload sama seperti proses_soal.php
        $file_tmp = $_FILES['gambar']['tmp_name'];
        $file_name = $_FILES['gambar']['name'];
        $file_ext = strtolower(pathinfo($file_name, PATHINFO_EXTENSION));
        $new_file_name = uniqid('img_', true) . '.' . $file_ext;
        $upload_dir = 'uploads/';
        $target_file = $upload_dir . $new_file_name;

        $allowed_extensions = array('jpg', 'jpeg', 'png', 'gif');
        if (!in_array($file_ext, $allowed_extensions)) {
            echo "<script>alert('Gagal: Ekstensi file tidak didukung.'); window.history.back();</script>";
            exit;
        }

        if (move_uploaded_file($file_tmp, $target_file)) {
            $path_gambar_baru = mysqli_real_escape_string($conn, $target_file);
            // UPDATE: Tambahkan path gambar baru ke query
            $gambar_update_query = ", gambar = '$path_gambar_baru'";
            
            // OPSIONAL: Hapus gambar lama jika ada
            // Dapatkan path gambar lama dari database (diperlukan query SELECT terpisah)
        } else {
            echo "<script>alert('Gagal mengupload file gambar baru.'); window.history.back();</script>";
            exit;
        }
    }

    // 3. Query UPDATE Data
    $query = "UPDATE soal SET 
                pertanyaan = '$pertanyaan',
                jwbn_a = '$a',
                jwbn_b = '$b',
                jwbn_c = '$c',
                jwbn_d = '$d',
                jwbn_bnr = '$benar',
                lvl = $level
                $gambar_update_query
              WHERE id_soal = $id_soal";
    
    if (mysqli_query($conn, $query)) {
        echo "<script>alert('Soal ID $id_soal berhasil diupdate!'); window.location.href='../user/admin.php?menu=pertanyaan';</script>";
    } else {
        echo "<script>alert('Gagal mengupdate soal. Error: " . mysqli_error($conn) . "'); window.history.back();</script>";
    }
} else {
    header("Location: form.php");
    exit;
}
?>