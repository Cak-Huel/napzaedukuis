<?php
$file = __DIR__ . "/aset/materi.pdf"; // sesuaikan path

if (file_exists($file)) {
    header("Content-Type: application/pdf");
    header("Content-Disposition: inline; filename=materi.pdf");
    header("Content-Length: " . filesize($file));
    readfile($file);
    exit;
} else {
    echo "File tidak ditemukan.";
}
?>