<?php
include '../sekret.php';
session_start();

if (!isset($_GET['level'])) {
  echo json_encode([]);
  exit;
}

$level = intval($_GET['level']);
$query = mysqli_query($conn, "SELECT * FROM soal WHERE lvl = $level LIMIT 5");

$soal = [];
while ($row = mysqli_fetch_assoc($query)) {
  $soal[] = [
    'id_soal' => $row['id_soal'],
    'pertanyaan' => $row['pertanyaan'],
    'a' => $row['jwbn_a'],
    'b' => $row['jwbn_b'],
    'c' => $row['jwbn_c'],
    'd' => $row['jwbn_d'],
    'jawaban' => $row['jwbn_bnr']
  ];
}

echo json_encode($soal);
?>