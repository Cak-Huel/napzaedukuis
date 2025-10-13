<?php
include '../sekret.php';
session_start();

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    // 1. Inisiasi dan Sanitasi Data Teks
    $pertanyaan = mysqli_real_escape_string($conn, $_POST['pertanyaan']);
    $a = mysqli_real_escape_string($conn, $_POST['jwbn_a']);
    $b = mysqli_real_escape_string($conn, $_POST['jwbn_b']);
    $c = mysqli_real_escape_string($conn, $_POST['jwbn_c']);
    $d = mysqli_real_escape_string($conn, $_POST['jwbn_d']);
    $benar = mysqli_real_escape_string($conn, $_POST['jwbn_bnr']);
    $level = isset($_POST['lvl']) ? intval($_POST['lvl']) : 1;

    // Inisialisasi path gambar
    $path_gambar = NULL;

    // 2. Logika Upload Gambar
    if (isset($_FILES['gambar']) && $_FILES['gambar']['error'] === UPLOAD_ERR_OK) {
        $file_tmp = $_FILES['gambar']['tmp_name'];
        $file_name = $_FILES['gambar']['name'];
        $file_size = $_FILES['gambar']['size'];
        $file_ext = strtolower(pathinfo($file_name, PATHINFO_EXTENSION));
        
        // Buat nama file unik (PENTING untuk menghindari konflik nama)
        $new_file_name = uniqid('img_', true) . '.' . $file_ext;
        
        // Tentukan folder tujuan (Buat folder ini di public_html/soal/uploads/)
        $upload_dir = 'uploads/';
        $target_file = $upload_dir . $new_file_name;

        // Cek ekstensi (hanya izinkan gambar)
        $allowed_extensions = array('jpg', 'jpeg', 'png', 'gif');
        if (!in_array($file_ext, $allowed_extensions)) {
            echo "<script>alert('Gagal: Ekstensi file tidak didukung. Hanya JPG, JPEG, PNG, GIF yang diizinkan.'); window.history.back();</script>";
            exit;
        }

        // Pindahkan file dari lokasi temporer ke folder tujuan
        if (move_uploaded_file($file_tmp, $target_file)) {
            // Jika berhasil, simpan path relatif ke database
            $path_gambar = mysqli_real_escape_string($conn, $target_file);
        } else {
            echo "<script>alert('Gagal mengupload file gambar.'); window.history.back();</script>";
            exit;
        }
    }
    
    // 3. Masukkan Data ke Database
    // Gunakan NULL jika tidak ada gambar (sesuai setting database)
    $gambar_query = $path_gambar ? "'$path_gambar'" : "NULL";

    $query = "INSERT INTO soal (pertanyaan, jwbn_a, jwbn_b, jwbn_c, jwbn_d, jwbn_bnr, lvl, gambar)
              VALUES ('$pertanyaan', '$a', '$b', '$c', '$d', '$benar', $level, $gambar_query)";
    
    if (mysqli_query($conn, $query)) {
        echo "<script>alert('Soal berhasil disimpan!'); window.location.href='../user/admin.php';</script>";
    } else {
        // Jika gagal, hapus file yang mungkin sudah terupload
        if ($path_gambar && file_exists($target_file)) {
             unlink($target_file);
        }
        echo "<script>alert('Gagal menyimpan soal. Error: " . mysqli_error($conn) . "'); window.history.back();</script>";
    }
} else {
    header("Location: form.php");
    exit;
}
?>