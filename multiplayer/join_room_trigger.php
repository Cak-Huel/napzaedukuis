<?php
require __DIR__ . '/../pusher-config.php'; // Memanggil konfigurasi Pusher
require __DIR__ . '/../sekret.php'; // Memanggil koneksi DB (sesuaikan path)

header('Content-Type: application/json');

// Ambil data dari POST request
$kode_room = isset($_POST['kode_room']) ? trim(strtoupper($_POST['kode_room'])) : '';
$nama_guest = isset($_POST['nama_guest']) ? trim($_POST['nama_guest']) : '';

if (empty($kode_room) || empty($nama_guest)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Kode room dan nama harus diisi.']);
    exit;
}

// 1. Cari id_room berdasarkan kode_room
$stmt_room = $conn->prepare("SELECT id_room FROM room WHERE kode_room = ? AND status = 'menunggu'");
$stmt_room->bind_param("s", $kode_room);
$stmt_room->execute();
$result_room = $stmt_room->get_result();

if ($result_room->num_rows === 0) {
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'Kode room tidak ditemukan atau permainan sudah dimulai.']);
    exit;
}

$room = $result_room->fetch_assoc();
$id_room = $room['id_room'];

// 2. Masukkan peserta baru ke tabel room_player
$stmt_insert = $conn->prepare("INSERT INTO room_player (id_room, nama_guest, skor, waktu_masuk) VALUES (?, ?, 0, NOW())");
$stmt_insert->bind_param("is", $id_room, $nama_guest);

if (!$stmt_insert->execute()) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Gagal menyimpan data peserta.']);
    exit;
}

$id_peserta = $stmt_insert->insert_id;

// 3. Ambil daftar peserta terbaru untuk dikirim via Pusher
/*$stmt_players = $conn->prepare("SELECT nama_guest FROM room_player WHERE id_room = ? ORDER BY waktu_masuk ASC");
$stmt_players->bind_param("i", $id_room);
$stmt_players->execute();
$result_players = $stmt_players->get_result();
$players = $result_players->fetch_all(MYSQLI_ASSOC);
$peserta_list = array_map(fn($p) => $p['nama_guest'], $players);
*/

// 4. Memicu event Pusher ke channel room
$channel_name = 'private-quiz-' . $kode_room; // Gunakan kode_room agar konsisten
$event_name = 'participant-joined';
$data_pusher = ['nama_guest' => $nama_guest];

try {
    // Variabel $pusher didapat dari pusher-config.php
    $pusher->trigger($channel_name, $event_name, $data_pusher);
} catch (Exception $e) {
    // Jika gagal trigger, proses join tetap dianggap berhasil, tapi log error
    error_log('Pusher trigger failed: ' . $e->getMessage());
}

// 5. Kirim respons sukses ke client (joinroom.js)
echo json_encode([
    'success' => true,
    'id_room' => $id_room,
    'id_peserta' => $id_peserta
]);

?>