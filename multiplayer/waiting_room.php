<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="icon" type="image/x-icon" href="../aset/logo1.png" />
    <title>Ruang Tunggu</title>
    <style>
        body { font-family: Arial, sans-serif; background: #f0f0f0; }
        .container { max-width: 400px; margin: 50px auto; background: #fff; padding: 24px; border-radius: 8px; box-shadow: 0 2px 8px #ccc; }
        h2 { text-align: center; }
        ul { list-style: none; padding: 0; }
        li { padding: 8px 0; border-bottom: 1px solid #eee; }
        .start-btn { display: block; width: 100%; padding: 10px; background: #28a745; color: #fff; border: none; border-radius: 4px; font-size: 16px; cursor: pointer; margin-top: 20px; }
        .start-btn:disabled { background: #aaa; }
    </style>
    <script src="http://localhost:3000/socket.io/socket.io.js"></script>
    <script src="waiting_room.js"></script>
</head>
<body>
    <div class="container">
        <h2>Ruang Tunggu</h2>
        <p>Menunggu guru memulai...</p>
        <ul id="player-list">
            <!-- Daftar pemain akan diisi oleh JS -->
        </ul>
    </div>
</body>
</html>