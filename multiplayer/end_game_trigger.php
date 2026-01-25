<?php
require __DIR__ . '/../pusher_config.php';
require __DIR__ . '/../sekret.php';

header('Content-Type: application/json');

$id_room = isset($_POST['id_room']) ? (int)$_POST['id_room'] : 0;

if (!$id_room) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'ID Room tidak valid.']);
    exit;
}

// 1. Update status room menjadi 'selesai'
$stmt_update = $conn->prepare("UPDATE room SET status = 'selesai' WHERE id_room = ?");
$stmt_update->bind_param("i", $id_room);

if ($stmt_update->execute()) {
    // 2. Ambil kode_room untuk trigger Pusher
    $stmt_room = $conn->prepare("SELECT kode_room FROM room WHERE id_room = ?");
    $stmt_room->bind_param("i", $id_room);
    $stmt_room->execute();
    $kode_room = $stmt_room->get_result()->fetch_assoc()['kode_room'];

    if ($kode_room) {
        try {
            $channel_name = 'private-quiz-' . $kode_room;
            // Siarkan event bahwa game telah selesai
            $pusher->trigger($channel_name, 'game-finished', ['message' => 'Permainan diakhiri oleh host.']);
            echo json_encode(['success' => true, 'message' => 'Permainan berhasil diakhiri.']);
        } catch (Exception $e) {
            // Game tetap berakhir, tapi log error Pusher
            error_log('Pusher trigger failed on end_game: ' . $e->getMessage());
            echo json_encode(['success' => true, 'message' => 'Permainan diakhiri (gagal notifikasi real-time).']);
        }
    }
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Gagal mengupdate status room di database.']);
}
?>