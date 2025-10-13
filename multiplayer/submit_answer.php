<?php
require __DIR__ . '/../pusher-config.php';
require __DIR__ . '/../sekret.php';

header('Content-Type: application/json');

$id_peserta = isset($_POST['id_peserta']) ? (int)$_POST['id_peserta'] : 0;
$id_room = isset($_POST['id_room']) ? (int)$_POST['id_room'] : 0; // Tambahkan id_room
$id_soalmlt = isset($_POST['id_soalmlt']) ? (int)$_POST['id_soalmlt'] : 0;
$jawaban = isset($_POST['jawaban']) ? $_POST['jawaban'] : null;
$waktu_jawab = isset($_POST['waktu_jawab']) ? (int)$_POST['waktu_jawab'] : 30;

if (!$id_peserta || !$id_soalmlt) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Data tidak lengkap.']);
    exit;
}

// 1. Ambil soal untuk validasi jawaban dan skor
$stmt_soal = $conn->prepare("SELECT jwbn_benar, skor FROM soal_mlt WHERE id_soalmlt = ?");
$stmt_soal->bind_param("i", $id_soalmlt);
$stmt_soal->execute();
$result_soal = $stmt_soal->get_result();
$soal = $result_soal->fetch_assoc();

if (!$soal) {
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'Soal tidak ditemukan.']);
    exit;
}

$is_correct = ($jawaban !== null && strtolower(trim($jawaban)) === strtolower(trim($soal['jwbn_benar'])));
$skor_didapat = $is_correct ? (int)$soal['skor'] : 0;

// 2. Simpan jawaban ke tabel jawaban_room
$stmt_insert = $conn->prepare("INSERT INTO jawaban_room (id_peserta, id_soalmlt, jawaban, benar, waktu_jawab) VALUES (?, ?, ?, ?, ?)");
$benar_val = $is_correct ? 1 : 0;
$stmt_insert->bind_param("iisii", $id_peserta, $id_soalmlt, $jawaban, $benar_val, $waktu_jawab);
$stmt_insert->execute();

// 3. Update skor pemain jika jawaban benar
if ($is_correct) {
    $stmt_update = $conn->prepare("UPDATE room_player SET skor = skor + ? WHERE id_peserta = ?");
    $stmt_update->bind_param("ii", $skor_didapat, $id_peserta);
    $stmt_update->execute();
}

// 4. Ambil skor terbaru pemain
$stmt_skor = $conn->prepare("SELECT skor FROM room_player WHERE id_peserta = ?");
$stmt_skor->bind_param("i", $id_peserta);
$stmt_skor->execute();
$skor_terbaru = $stmt_skor->get_result()->fetch_assoc()['skor'];

// 5. Ambil kode_room untuk channel Pusher
$stmt_room = $conn->prepare("SELECT r.kode_room FROM room r JOIN room_player rp ON r.id_room = rp.id_room WHERE rp.id_peserta = ?");
$stmt_room->bind_param("i", $id_peserta);
$stmt_room->execute();
$kode_room = $stmt_room->get_result()->fetch_assoc()['kode_room'];

if ($kode_room) {
    try {
        // Event 1: Kirim skor terbaru HANYA ke pemain yang menjawab
        $player_channel = 'private-player-' . $id_peserta;
        $pusher->trigger($player_channel, 'score-updated', ['skor' => $skor_terbaru]);

        // Event 2: Beri tahu scoreboard bahwa pemain ini telah menjawab
        $room_channel = 'private-quiz-' . $kode_room;
        $pusher->trigger($room_channel, 'player-answered', [
            'id_peserta' => $id_peserta,
            'id_soalmlt' => $id_soalmlt,
            'is_correct' => $is_correct,
            'new_score' => (int)$skor_terbaru // Tambahkan skor terbaru
        ]);

    } catch (Exception $e) {
        error_log('Pusher trigger failed in submit_answer: ' . $e->getMessage());
    }
}

// 6. **BARU**: Cari soal berikutnya untuk dikirim kembali ke client
$sql_next = "SELECT sm.* FROM soal_mlt sm 
             WHERE sm.id_room = ? 
             AND sm.id_soalmlt NOT IN (
                 SELECT id_soalmlt FROM jawaban_room WHERE id_peserta = ?
             ) 
             ORDER BY sm.id_soalmlt ASC 
             LIMIT 1";

$stmt_next = $conn->prepare($sql_next);
$stmt_next->bind_param("ii", $id_room, $id_peserta);
$stmt_next->execute();
$next_question = $stmt_next->get_result()->fetch_assoc();

if ($next_question) {
    unset($next_question['jwbn_benar']); // Jangan kirim jawaban
}

// 7. Kirim response yang berisi status jawaban dan soal berikutnya
echo json_encode(['success' => true, 'is_correct' => $is_correct, 'new_score' => $skor_terbaru, 'next_question' => $next_question]);

?>