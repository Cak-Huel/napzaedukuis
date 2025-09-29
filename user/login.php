<?php
session_start();
include '../sekret.php'; // pastikan path sudah benar

if ($_SERVER["REQUEST_METHOD"] == "POST") {
  $email = $_POST['email'];
  $password = $_POST['password'];

  // Ambil juga kolom role
  $stmt = $conn->prepare("SELECT id_user, password, nama, role FROM orang WHERE email = ?");
  $stmt->bind_param("s", $email);
  $stmt->execute();
  $stmt->store_result();

  if ($stmt->num_rows > 0) {
    $stmt->bind_result($id_user, $hashed_password, $nama, $role);
    $stmt->fetch();
    if (password_verify($password, $hashed_password)) {
      $_SESSION['id_user'] = $id_user;
      $_SESSION['nama'] = $nama;
      $_SESSION['role'] = $role;
      if ($role === 'admin') {
        echo "<script>alert('Selamat datang, $nama!'); window.location='admin.php';</script>";
      } else {
        echo "<script>alert('Selamat datang, $nama!'); window.location='../index.php';</script>";
      }
    } else {
      echo "<script>alert('Password salah!');</script>";
    }
  } else {
    echo "<script>alert('Email tidak ditemukan!');</script>";
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
     <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Comic+Neue:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="login.css" />
    <link rel="icon" type="image/x-icon" href="../aset/logo1.png" />
    <title>Login - Napza Edu Card</title>
  </head>
  <body>
    <div class="container">
      <button class="btn-back" onclick="window.location.href='../index.php'">
        ←
      </button>
      <h2>Login</h2>
      <form action="#" method="POST">
        <input type="email" name="email" placeholder="Email" required />
        <input type="password" name="password" placeholder="Password" required />
        <button class="masuk" type="submit">Masuk</button>
      </form>
      <div class="link">
        Belum punya akun? <a href="register.php">Daftar</a>
      </div>
    </div>
    <script>
      if (window.history.replaceState) {
        window.history.replaceState(null, null, window.location.href);
      }
    </script>
  </body>
</html>