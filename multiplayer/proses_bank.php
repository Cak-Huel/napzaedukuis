<?php
session_start();
include '../sekret.php';

// Pastikan id_room ada di session
$id_room = $_SESSION['id_room'] ?? null;
$selected_soal = $_POST['selected_soal'] ?? [];

if (!$id_room) {
    die("Error: Session id_room tidak ditemukan. Silakan masuk kembali ke room.");
}

if (empty($selected_soal)) {
    header("Location: quest.php?error=no_selection");
    exit();
}

try {
    foreach ($selected_soal as $id_solo) {
        // 1. Ambil data dari tabel soal (Solo)
        // Sesuaikan nama kolom jwbn_bnr sesuai database solo Anda
        $stmt = $conn->prepare("SELECT pertanyaan, gambar, jwbn_a, jwbn_b, jwbn_c, jwbn_d, jwbn_bnr FROM soal WHERE id_soal = ?");
        $stmt->bind_param("i", $id_solo);
        $stmt->execute();
        $res = $stmt->get_result();
        $data = $res->fetch_assoc();

        if ($data) {
            // 2. Masukkan ke tabel soal_mlt (Multiplayer)
            // Tambahkan kolom 'skor' sesuai struktur yang Anda sebutkan
            $sumber = 'bank';
            $skor_default = 10; // Atur skor default jika perlu
            
            $ins = $conn->prepare("INSERT INTO soal_mlt 
                (id_room, pertanyaan, gambar, jwbn_a, jwbn_b, jwbn_c, jwbn_d, jwbn_benar, skor, sumber_soal, id_soal_solo) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            
            // "isssssssisi" -> id_room(i), pert(s), gbr(s), a(s), b(s), c(s), d(s), benar(s), skor(i), sumber(s), id_solo(i)
            $ins->bind_param("isssssssisi", 
                $id_room, 
                $data['pertanyaan'], 
                $data['gambar'], 
                $data['jwbn_a'], 
                $data['jwbn_b'], 
                $data['jwbn_c'], 
                $data['jwbn_d'], 
                $data['jwbn_bnr'], // Dari kolom solo jwbn_bnr masuk ke jwbn_benar
                $skor_default, 
                $sumber, 
                $id_solo
            );
            $ins->execute();
        }
    }
    
    // Berhasil, kembali ke halaman daftar pertanyaan
    header("Location: quest.php?status=success");
} catch (Exception $e) {
    // Log error untuk admin, jangan tampilkan ke user
    error_log("Error Bank Soal: " . $e->getMessage());
    header("Location: quest.php?error=failed_process");
}
exit();