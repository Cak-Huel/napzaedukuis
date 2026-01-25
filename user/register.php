<?php
session_start();
$current_lang = $_SESSION['lang'] ?? 'id'; // Tentukan bahasa, default 'id'
$alert_message_key = ''; // Variabel untuk menyimpan kunci pesan alert
include '../sekret.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
  $nama = $_POST['nama'];
  $email = $_POST['email'];
  $password = password_hash($_POST['password'], PASSWORD_DEFAULT);

  // $conn dari sekret.php
  $stmt = $conn->prepare("INSERT INTO orang (nama, email, password) VALUES (?, ?, ?)");
  $stmt->bind_param("sss", $nama, $email, $password);

  if ($stmt->execute()) {
    // Set session flash message untuk ditampilkan di halaman login
    $_SESSION['flash_message'] = 'alert_registration_success';
    header("Location: login.php");
    exit();
  } else {
    $alert_message_key = 'alert_registration_failed';
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
    <link rel="stylesheet" href="register.css" />
    <link rel="icon" type="image/x-icon" href="../aset/logo1.png" />
    <title>Registrasi - Napza Edu Card</title>
  </head>
  <body>
    <div class="container">
      <h2 data-key="register_title">Daftar</h2>
      <form action="#" method="POST">
        <input type="text" name="nama" data-key-placeholder="full_name_placeholder" placeholder="Nama Lengkap" required />
        <input type="email" name="email" data-key-placeholder="email_placeholder" placeholder="Email" required />
        <input type="password" name="password" data-key-placeholder="password_placeholder" placeholder="Password" required />
        <button type="submit" data-key="register_button">Daftar</button>
      </form>
      <div class="link"><span data-key="already_have_account_text">Sudah punya akun?</span> <a href="login.php" data-key="login_link">Login</a></div>
    </div>
  </body>
  <script src="translations.js"></script>
  <script src="profil.js"></script>
  <script>
    document.addEventListener('DOMContentLoaded', function() {
      const alertKey = '<?= $alert_message_key ?>';
      const lang = document.documentElement.lang || 'id';
      if (alertKey && translations[lang] && translations[lang][alertKey]) {
        alert(translations[lang][alertKey]);
      }
    });
  </script>
</html>