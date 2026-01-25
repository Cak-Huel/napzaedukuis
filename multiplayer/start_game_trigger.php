<?php
require __DIR__ . '/../pusher_config.php'; // Memanggil konfigurasi Pusher
require __DIR__ . '/../sekret.php'; // Memanggil koneksi DB (sesuaikan path)

header('Content-Type: application/json');

// Ambil id_room dari POST request
$id_room = isset($_POST['id_room']) ? (int)$_POST['id_room'] : 0;

if (!$id_room) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'ID room tidak valid.']);
    exit;
}

// Ambil kode_room dari database berdasarkan id_room
$stmt_room = $conn->prepare("SELECT kode_room FROM room WHERE id_room = ?");
$stmt_room->bind_param("i", $id_room);
$stmt_room->execute();
$room_result = $stmt_room->get_result()->fetch_assoc();

if (!$room_result) {
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'Room tidak ditemukan.']);
    exit;
}
$kode_room = $room_result['kode_room'];


// Update status room di database menjadi 'mulai'
$stmt = $conn->prepare("UPDATE room SET status = 'mulai' WHERE id_room = ?");
$stmt->bind_param("i", $id_room);

if ($stmt->execute()) {
    // Kirim event ke channel room yang spesifik
    $channel_name = 'private-quiz-' . $kode_room; // Nama channel yang konsisten
    $event_name = 'game-started';
    $data = ['message' => 'Permainan dimulai!']; // Data bisa apa saja

    try {
        // Variabel $pusher didapat dari pusher-config.php
        $pusher->trigger($channel_name, $event_name, $data);
        echo json_encode(['success' => true, 'message' => 'Game berhasil dimulai.']);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Gagal memicu event Pusher: ' . $e->getMessage()]);
    }
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Gagal mengupdate status room di database.']);
}
?>