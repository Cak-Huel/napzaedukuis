<?php
session_start();
$current_lang = $_SESSION['lang'] ?? 'id'; // Tentukan bahasa, default 'id'
?>

<!DOCTYPE html>
<html lang="<?= $current_lang ?>">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
     <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Comic+Neue:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700&display=swap" rel="stylesheet">
    <link rel="icon" type="image/x-icon" href="../aset/logo1.png" />
    <title data-key="waiting_room_title">Ruang Tunggu</title>
    <style>
        body { font-family: "Comic Neue"; font-weight: 700; font-style: normal; background: #f0f0f0; }
        .container { max-width: 400px; margin: 50px auto; background: #fff; padding: 24px; border-radius: 8px; box-shadow: 0 2px 8px #ccc; }
        h2 { text-align: center; }
        ul { list-style: none; padding: 0; }
        li { padding: 8px 0; border-bottom: 1px solid #eee; }
        .start-btn { display: block; width: 100%; padding: 10px; background: #28a745; color: #fff; border: none; border-radius: 4px; font-size: 16px; cursor: pointer; margin-top: 20px; }
        .start-btn:disabled { background: #aaa; }
    </style>
</head>
<body>
    <div class="container">
        <h2 data-key="waiting_room_heading">Ruang Tunggu</h2>
        <p data-key="waiting_for_host_start">Menunggu guru memulai...</p>
        <ul id="player-list">
            <!-- Daftar pemain akan diisi oleh JS -->
        </ul>
    </div>
    <!-- Pusher JS -->
    <script src="https://js.pusher.com/8.2.0/pusher.min.js"></script>
    <script src="waiting_room.js"></script>
      <!-- Skrip Terjemahan -->
  <script src="../user/translations.js"></script>
  <script src="../user/profil.js"></script>
</body>
</html>