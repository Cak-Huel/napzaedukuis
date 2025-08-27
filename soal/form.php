<?php
include '../sekret.php';

// Ambil jumlah soal per level
$level_soal = [];
$query = mysqli_query($conn, "SELECT lvl, COUNT(*) as jumlah FROM soal GROUP BY lvl");
while ($row = mysqli_fetch_assoc($query)) {
    $level_soal[$row['lvl']] = $row['jumlah'];
}
$total_level = 10;
$maxQuestions = 5;
?>

<!DOCTYPE html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" href="../soal/form.css" />
    <link rel="icon" type="image/x-icon" href="aset/logo1.png" />
    <title>Form Soal - Solo Mode</title>
  </head>
  <body>
    <div class="container">
      <h1 class="h1">Input Soal - Mode Solo</h1>

      <form action="../soal/proses_soal.php" method="POST">
        <label for="question">Pertanyaan</label>
        <textarea
          id="question"
          name="pertanyaan"
          placeholder="Tulis pertanyaan di sini..."
          required
        ></textarea>

        <div class="answers">
          <div class="answer-item">
            <label for="optionA">Jawaban A</label>
            <input
              type="text"
              id="optionA"
              name="jwbn_a"
              placeholder="Masukkan jawaban A"
              required
            />
          </div>
          <div class="answer-item">
            <label for="optionB">Jawaban B</label>
            <input
              type="text"
              id="optionB"
              name="jwbn_b"
              placeholder="Masukkan jawaban B"
              required
            />
          </div>
          <div class="answer-item">
            <label for="optionC">Jawaban C</label>
            <input
              type="text"
              id="optionC"
              name="jwbn_c"
              placeholder="Masukkan jawaban C"
              required
            />
          </div>
          <div class="answer-item">
            <label for="optionD">Jawaban D</label>
            <input
              type="text"
              id="optionD"
              name="jwbn_d"
              placeholder="Masukkan jawaban D"
              required
            />
          </div>
        </div>

        <label for="correct">Jawaban Benar</label>
        <select id="correct" name="jwbn_bnr" required>
          <option value="">-- Pilih Jawaban Benar --</option>
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
          <option value="D">D</option>
        </select>

        <label for="level">Level</label>
        <select id="level" name="lvl" required>
          <option value="">-- Pilih Level --</option>
          <?php for ($i = 1; $i <= $total_level; $i++): 
            $jumlah = isset($level_soal[$i]) ? $level_soal[$i] : 0;
            $disabled = $jumlah >= $maxQuestions ? 'disabled' : '';
            $label = "Level $i" . ($disabled ? " (Penuh)" : "");
          ?>
            <option value="<?= $i ?>" <?= $disabled ?>><?= $label ?></option>
          <?php endfor; ?>
        </select>

        <button type="submit">Simpan</button>
      </form>
    </div>
  </body>
</html>
