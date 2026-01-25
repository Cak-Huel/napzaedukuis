<?php
session_start();

// Hanya izinkan metode POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Method Not Allowed
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed.']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$lang = $input['lang'] ?? null;

// Validasi bahasa yang diizinkan
if ($lang === 'id' || $lang === 'en') {
    $_SESSION['lang'] = $lang;
    echo json_encode(['status' => 'success', 'message' => 'Language updated to ' . $lang]);
} else {
    http_response_code(400); // Bad Request
    echo json_encode(['status' => 'error', 'message' => 'Invalid language selected.']);
}
?>