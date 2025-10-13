<?php
require __DIR__ . '/../sekret.php';

header('Content-Type: application/json');

$id_room = isset($_GET['id_room']) ? (int)$_GET['id_room'] : 0;
$id_peserta = isset($_GET['id_peserta']) ? (int)$_GET['id_peserta'] : 0;

if (!$id_room || !$id_peserta) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Data tidak lengkap.']);
    exit;
}

// Ambil soal berikutnya yang BELUM dijawab oleh peserta ini di room ini.
// Ini akan mengambil soal pertama saat awal, dan soal selanjutnya jika halaman di-refresh.
$sql = "SELECT sm.* FROM soal_mlt sm 
        WHERE sm.id_room = ? 
        AND sm.id_soalmlt NOT IN (
            SELECT id_soalmlt FROM jawaban_room WHERE id_peserta = ?
        ) 
        ORDER BY sm.id_soalmlt ASC 
        LIMIT 1";

$stmt = $conn->prepare($sql);
$stmt->bind_param("ii", $id_room, $id_peserta);
$stmt->execute();
$result = $stmt->get_result();
$soal = $result->fetch_assoc();

if ($soal) {
    // Kirim soal tanpa jawaban yang benar
    unset($soal['jwbn_benar']);
    echo json_encode(['success' => true, 'question' => $soal]);
} else {
    // Tidak ada soal lagi atau game selesai
    echo json_encode(['success' => true, 'question' => null, 'message' => 'Tidak ada soal lagi.']);
}
?>