<?php
session_start();
include '../sekret.php';

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nama_room = trim($_POST['nama_room'] ?? '');

    // Validasi input
    if ($nama_room === '') {
        $error = 'Nama room harus diisi!';
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
            header("Location: create.php");
            exit();
        } else {
            $error = "Gagal membuat room: " . mysqli_error($conn);
        }
    }
}
?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
     <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Comic+Neue:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="creatroom.css">
    <link rel="icon" type="image/x-icon" href="../aset/logo1.png" />
    <title>Buat Room</title>
</head>
<body>
    <h2>Buat Room Baru</h2>
    <?php if ($error): ?>
        <div style="color:red; margin-bottom:10px;"><?php echo htmlspecialchars($error); ?></div>
    <?php endif; ?>
    <form action="creatroom.php" method="post">
        <label for="nama_room">Nama Room:</label>
        <input type="text" id="nama_room" name="nama_room" required>
        <br><br>
        <button type="submit">Buat</button>
        <a href="selection.php"><button type="button">Kembali</button></a>
    </form>
</body>
</html>