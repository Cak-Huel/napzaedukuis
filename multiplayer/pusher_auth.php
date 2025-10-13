<?php
session_start();

// Sertakan file konfigurasi yang dibutuhkan
require __DIR__ . '/../vendor/autoload.php';
require __DIR__ . '/../pusher-config.php'; // Mengandung $pusher object
require __DIR__ . '/../sekret.php'; // Untuk koneksi $conn jika diperlukan

header('Content-Type: application/json');

// Pusher.js akan mengirimkan 'socket_id' dan 'channel_name' secara otomatis
$socket_id = $_POST['socket_id'];
$channel_name = $_POST['channel_name'];

// --- Logika Otorisasi ---
// Untuk aplikasi kuis kita, logikanya sederhana:
// Selama pengguna mencoba bergabung ke channel 'private-quiz-', kita izinkan.
// Di aplikasi lain, di sini Anda bisa menambahkan pengecekan login user,
// atau memeriksa apakah user tersebut memang anggota dari room kuis.

if (strpos($channel_name, 'private-quiz-') === 0 || strpos($channel_name, 'private-player-') === 0) {
    try {
        // Gunakan library Pusher untuk membuat "undangan" (tanda tangan otorisasi)
        $auth = $pusher->authorizeChannel($channel_name, $socket_id);
        
        // Kirim kembali "undangan" tersebut ke Pusher.js
        echo $auth;

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Authorization failed.']);
    }
} else {
    // Jika pengguna mencoba mengakses channel privat yang tidak dikenal, tolak.
    http_response_code(403); // 403 Forbidden
    echo "Forbidden";
}
?>