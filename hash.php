<?php
$password_plain = "Sandiku1jt";
$password_hashed = password_hash($password_plain, PASSWORD_DEFAULT);
echo $password_hashed;
?>