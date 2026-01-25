<?php
require __DIR__ . '/../vendor/autoload.php'; // Sesuaikan path jika perlu
include __DIR__ . '/../sekret.php'; // Sesuaikan dengan path koneksi database Anda

header('Content-Type: application/json');

$id_room = isset($_GET['id_room']) ? (int)$_GET['id_room'] : 0;

if (!$id_room) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'ID room tidak valid.']);
    exit;
}

// Ambil kode room
$stmt_room = $conn->prepare("SELECT kode_room FROM room WHERE id_room = ?");
$stmt_room->bind_param("i", $id_room);
$stmt_room->execute();
$result_room = $stmt_room->get_result();
$room = $result_room->fetch_assoc();

if (!$room) {
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'Room tidak ditemukan.']);
    exit;
}

// Ambil daftar peserta
$stmt_players = $conn->prepare("SELECT nama_guest FROM room_player WHERE id_room = ? ORDER BY waktu_masuk ASC");
$stmt_players->bind_param("i", $id_room);
$stmt_players->execute();
$result_players = $stmt_players->get_result();
$players = $result_players->fetch_all(MYSQLI_ASSOC);

$peserta = array_map(fn($p) => $p['nama_guest'], $players);

echo json_encode(['success' => true, 'kode_room' => $room['kode_room'], 'peserta' => $peserta]);
?>