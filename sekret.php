<?php
$host = "";
$user = "";
$pass = "";
$db   = "";

$conn = new mysqli($host, $user, $pass, $db);

// Cek error saat file lain menyertakan DB.php
if ($conn->connect_error) {
    // Security: Jangan tampilkan detail error teknis ke pengguna
    error_log("Database Connection Error: " . $conn->connect_error);
    die("Maaf, sedang terjadi gangguan koneksi ke server. Silakan coba beberapa saat lagi.");
}
?>