<?php
include '../sekret.php';
$lvl = intval($_GET['lvl']);
$query = "SELECT id_soal as id, pertanyaan as question FROM soal WHERE lvl = ? LIMIT 5";
$stmt = $conn->prepare($query);
$stmt->bind_param("i", $lvl);
$stmt->execute();
echo json_encode($stmt->get_result()->fetch_all(MYSQLI_ASSOC));
?>