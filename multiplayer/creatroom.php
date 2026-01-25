<?php
session_start();
$current_lang = $_SESSION['lang'] ?? 'id'; // Tentukan bahasa, default 'id'
include '../sekret.php';

$error_key = ''; // Gunakan kunci untuk pesan error yang bisa diterjemahkan
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nama_room = trim($_POST['nama_room'] ?? '');

    // Validasi input
    if ($nama_room === '') {
        $error_key = 'error_room_name_required';
    } else {
        // Generate kode_room unik
        do {
            $kode_room = substr(str_shuffle('ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'), 0, 6);
            $cek = mysqli_query($conn, "SELECT 1 FROM room WHERE kode_room='$kode_room'");
        } while(mysqli_num_rows($cek) > 0);

        $nama_room_sql = mysqli_real_escape_string($conn, $nama_room);
        $kode_room_sql = mysqli_real_escape_string($conn, $kode_room);

        $sql = "INSERT INTO room (kode_room, nama_room) VALUES ('$kode_room_sql', '$nama_room_sql')";
        if (mysqli_query($conn, $sql)) {
            $_SESSION['id_room'] = mysqli_insert_id($conn);
            header("Location: quest.php");
            exit();
        } else {
            $error_key = 'error_room_creation_failed';
        }
    }
}
?>
<!DOCTYPE html>
<html lang="<?= $current_lang ?>">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Quicksand:wght@300..700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="creatroom.css">
    <link rel="icon" type="image/x-icon" href="../aset/logo1.png" />
    <title data-key="create_room_title">Buat Room</title>
</head>
<body>
    <h2 data-key="create_new_room_heading">Buat Room Baru</h2>
    <div id="error-message" style="color:red; margin-bottom:10px; display:none;"></div>
    <form action="creatroom.php" method="post">
        <label for="nama_room" data-key="room_name_label">Nama Room:</label>
        <input type="text" id="nama_room" name="nama_room" required>
        <br><br>
        <button type="submit" data-key="create_button">Buat Room</button>
        <a href="selection.php"><button type="button" data-key="back_button">Kembali</button></a>
    </form>

    <script src="../user/translations.js"></script>
    <script src="../user/profil.js"></script>
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const errorKey = '<?= $error_key ?>';
            const lang = document.documentElement.lang || 'id';
            if (errorKey && translations[lang] && translations[lang][errorKey]) {
                const errorDiv = document.getElementById('error-message');
                errorDiv.textContent = translations[lang][errorKey];
                errorDiv.style.display = 'block';
            }
        });
    </script>
</body>
</html>