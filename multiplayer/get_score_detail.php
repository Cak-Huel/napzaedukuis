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

$response = ['success' => true];

// 1. Ambil data dasar peserta
$stmt_player = $conn->prepare("SELECT nama_guest, skor FROM room_player WHERE id_peserta = ?");
$stmt_player->bind_param("i", $id_peserta);
$stmt_player->execute();
$player_data = $stmt_player->get_result()->fetch_assoc();
$response['nama_guest'] = $player_data['nama_guest'] ?? 'N/A';
$response['skor'] = (int)($player_data['skor'] ?? 0);

// 2. Ambil total peserta dan hitung peringkat
$stmt_rank = $conn->prepare("SELECT id_peserta FROM room_player WHERE id_room = ? ORDER BY skor DESC, waktu_masuk ASC");
$stmt_rank->bind_param("i", $id_room);
$stmt_rank->execute();
$all_players = $stmt_rank->get_result()->fetch_all(MYSQLI_ASSOC);
$response['total_peserta'] = count($all_players);
$rank = array_search($id_peserta, array_column($all_players, 'id_peserta')) + 1;
$response['ranking'] = $rank > 0 ? $rank : $response['total_peserta'];

// 3. Ambil semua jawaban peserta untuk dianalisis
$stmt_answers = $conn->prepare("SELECT benar, waktu_jawab FROM jawaban_room WHERE id_peserta = ? ORDER BY id_soalmlt ASC");
$stmt_answers->bind_param("i", $id_peserta);
$stmt_answers->execute();
$answers = $stmt_answers->get_result()->fetch_all(MYSQLI_ASSOC);

$total_benar = 0;
$total_salah = 0;
$waktu_tercepat = 30;
$benar_beruntun = 0;
$current_streak = 0;

foreach ($answers as $answer) {
    if ((int)$answer['benar'] === 1) {
        $total_benar++;
        $current_streak++;
        if ((int)$answer['waktu_jawab'] < $waktu_tercepat) {
            $waktu_tercepat = (int)$answer['waktu_jawab'];
        }
    } else {
        $total_salah++;
        $current_streak = 0;
    }
    if ($current_streak > $benar_beruntun) {
        $benar_beruntun = $current_streak;
    }
}

$response['total_benar'] = $total_benar;
$response['total_salah'] = $total_salah;
$response['waktu_tercepat'] = $waktu_tercepat;
$response['benar_beruntun'] = $benar_beruntun;

// 4. Ambil total soal dalam room
$stmt_total_soal = $conn->prepare("SELECT COUNT(*) as total FROM soal_mlt WHERE id_room = ?");
$stmt_total_soal->bind_param("i", $id_room);
$stmt_total_soal->execute();
$total_soal_data = $stmt_total_soal->get_result()->fetch_assoc();
$response['total_soal'] = (int)($total_soal_data['total'] ?? 0);

// 5. Ambil data untuk review soal
$sql_review = "SELECT s.pertanyaan, s.jwbn_a, s.jwbn_b, s.jwbn_c, s.jwbn_d, s.jwbn_benar AS kunci_jawaban, 
                      j.jawaban AS jawaban_user, j.benar AS benar_user 
               FROM soal_mlt s 
               LEFT JOIN jawaban_room j ON s.id_soalmlt = j.id_soalmlt AND j.id_peserta = ?
               WHERE s.id_room = ? 
               ORDER BY s.id_soalmlt ASC";

$stmt_review = $conn->prepare($sql_review);
$stmt_review->bind_param("ii", $id_peserta, $id_room);
$stmt_review->execute();
$review_result = $stmt_review->get_result();
$review_data = [];

while ($row = $review_result->fetch_assoc()) {
    $review_data[] = [
        'pertanyaan' => $row['pertanyaan'],
        'jwbn_a' => $row['jwbn_a'],
        'jwbn_b' => $row['jwbn_b'],
        'jwbn_c' => $row['jwbn_c'],
        'jwbn_d' => $row['jwbn_d'],
        'kunci_jawaban' => $row['kunci_jawaban'],
        'jawaban_user' => $row['jawaban_user'],
        'benar_user' => (bool)$row['benar_user']
    ];
}
$response['review'] = $review_data;

echo json_encode($response);

?>