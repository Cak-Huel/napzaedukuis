<?php
include '../sekret.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
  $nama = $_POST['nama'];
  $email = $_POST['email'];
  $password = password_hash($_POST['password'], PASSWORD_DEFAULT);

  // $conn dari sekret.php
  $stmt = $conn->prepare("INSERT INTO orang (nama, email, password) VALUES (?, ?, ?)");
  $stmt->bind_param("sss", $nama, $email, $password);

  if ($stmt->execute()) {
    echo "<script>alert('Registrasi berhasil!'); window.location='login.php';</script>";
  } else {
    echo "<script>alert('Registrasi gagal!');</script>";
  }

  $stmt->close();
  $conn->close();
}
?>
<!DOCTYPE html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" href="register.css" />
    <link rel="icon" type="image/x-icon" href="../aset/logo1.png" />
    <title>Registrasi - Napza Edu Card</title>
  </head>
  <body>
    <div class="container">
      <h2>Daftar</h2>
      <form action="#" method="POST">
        <input type="text" name="nama" placeholder="Nama Lengkap" required />
        <input type="email" name="email" placeholder="Email" required />
        <input type="password" name="password" placeholder="Password" required />
        <button type="submit">Daftar</button>
        <?php
        if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($stmt) && $stmt->execute()) {
            header("Location: login.php");
            exit();
        }
        ?>
      </form>
      <div class="link">Sudah punya akun? <a href="login.php">Login</a></div>
    </div>
  </body>
</html>