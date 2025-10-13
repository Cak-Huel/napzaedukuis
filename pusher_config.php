<?php
// Pastikan path ke autoload.php benar
require __DIR__ . '/vendor/autoload.php'; 

// Ganti dengan kredensial Pusher Anda
$options = array(
    'cluster' => 'ap1', // ganti dengan cluster Anda, misal: 'ap1', 'eu', 'us2'
    'useTLS' => true
);

$pusher = new Pusher\Pusher(
    'bhjbknjnnnk545121bj',      // Ganti dengan App Key Anda
    '2121kmkmkmnj',   // Ganti dengan App Secret Anda
    '0000505050',       // Ganti dengan App ID Anda
    $options
);

