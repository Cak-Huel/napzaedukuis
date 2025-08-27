<?php
$host = "localhost";
$user = "root"; // default user XAMPP/Laragon
$pass = "";     // kosongkan jika belum ada password
$db   = "napzagame";

$conn = new mysqli($host, $user, $pass, $db);

// Cek error saat file lain menyertakan DB.php
if ($conn->connect_error) {
    die("Koneksi gagal: " . $conn->connect_error);
}
?>