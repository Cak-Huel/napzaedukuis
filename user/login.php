<?php
session_start();
$current_lang = $_SESSION['lang'] ?? 'id'; // Tentukan bahasa, default 'id'
$alert_message_key = $_SESSION['flash_message'] ?? ''; // Ambil flash message
if (isset($_SESSION['flash_message'])) {
    unset($_SESSION['flash_message']); // Hapus setelah diambil
}
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
        echo "<script>alert('Selamat datang, $nama!'); window.location='/user/admin.php';</script>";
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
<html lang="<?= $current_lang ?>">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
     <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Quicksand:wght@300..700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/user/login.css" />
    <link rel="icon" type="image/x-icon" href="../aset/logo1.png" />
    <title>Login - Napza Edu Card</title>
  </head>
  <body>
    <div class="container">
      <button class="btn-back" onclick="window.location.href='../index.php'" data-key="back_arrow_button">
        ←
      </button>
      <h2 data-key="login_title">Login</h2>
      <form action="#" method="POST">
        <input type="email" name="email" data-key-placeholder="email_placeholder" placeholder="Email" required />
        <input type="password" name="password" data-key-placeholder="password_placeholder" placeholder="Password" required />
        <button class="masuk" type="submit" data-key="login_button">Masuk</button>
      </form>
    </div>
    <script>
      if (window.history.replaceState) {
        window.history.replaceState(null, null, window.location.href);
      }
    </script>
  </body>
  <script src="translations.js"></script>
  <script src="profil.js"></script>
  <script>
    document.addEventListener('DOMContentLoaded', function() {
      // Logika untuk menampilkan flash message dari registrasi
      const alertKey = '<?= $alert_message_key ?>';
      const lang = document.documentElement.lang || 'id';
      if (alertKey && translations[lang] && translations[lang][alertKey]) {
        alert(translations[lang][alertKey]);
      }
    });
  </script>
</html>