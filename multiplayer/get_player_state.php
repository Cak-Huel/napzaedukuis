<?php
require __DIR__ . '/../sekret.php';

header('Content-Type: application/json');

$id_peserta = isset($_GET['id_peserta']) ? (int)$_GET['id_peserta'] : 0;

if (!$id_peserta) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'ID Peserta tidak valid.']);
    exit;
}

$stmt = $conn->prepare("SELECT nama_guest, skor FROM room_player WHERE id_peserta = ?");
$stmt->bind_param("i", $id_peserta);
$stmt->execute();
$result = $stmt->get_result();
$player = $result->fetch_assoc();

if (!$player) {
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'Peserta tidak ditemukan.']);
    exit;
}

echo json_encode(['success' => true, 'data' => $player]);

?>