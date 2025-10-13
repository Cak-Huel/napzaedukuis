<?php
require __DIR__ . '/../sekret.php';

header('Content-Type: application/json');

$id_room = isset($_GET['id_room']) ? (int)$_GET['id_room'] : 0;

if (!$id_room) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'ID Room tidak valid.']);
    exit;
}

// Ambil kode room untuk koneksi Pusher di client
$stmt_kode = $conn->prepare("SELECT kode_room FROM room WHERE id_room = ?");
$stmt_kode->bind_param("i", $id_room);
$stmt_kode->execute();
$room_data = $stmt_kode->get_result()->fetch_assoc();
$kode_room = $room_data['kode_room'] ?? null;

// Ambil semua peserta dan skor mereka, diurutkan berdasarkan skor
$stmt_players = $conn->prepare("SELECT id_peserta, nama_guest, skor FROM room_player WHERE id_room = ? ORDER BY skor DESC, waktu_masuk ASC");
$stmt_players->bind_param("i", $id_room);
$stmt_players->execute();
$players_result = $stmt_players->get_result();
$players = $players_result->fetch_all(MYSQLI_ASSOC);

$player_ids = array_map(fn($p) => $p['id_peserta'], $players);

$scoreboard_data = [];

if (!empty($player_ids)) {
    // Ambil semua jawaban untuk semua peserta di room ini
    $placeholders = implode(',', array_fill(0, count($player_ids), '?'));
    $types = str_repeat('i', count($player_ids));
    $stmt_answers = $conn->prepare("SELECT id_peserta, benar FROM jawaban_room WHERE id_peserta IN ($placeholders) ORDER BY id_soalmlt ASC");
    $stmt_answers->bind_param($types, ...$player_ids);
    $stmt_answers->execute();
    $answers_result = $stmt_answers->get_result();
    $answers_by_player = [];
    while ($row = $answers_result->fetch_assoc()) {
        $answers_by_player[$row['id_peserta']][] = ['benar' => (bool)$row['benar']];
    }

    // Gabungkan data jawaban ke setiap pemain
    foreach ($players as &$player) {
        $player['jawaban'] = $answers_by_player[$player['id_peserta']] ?? [];
    }
}

echo json_encode(['success' => true, 'kode_room' => $kode_room, 'peserta' => $players]);
?>