<?php
include '../sekret.php';

$mode = 'tambah';
$current_soal = null;

if (isset($_GET['id']) && $conn) {
    $id_soal_edit = intval($_GET['id']);
    $result = mysqli_query($conn, "SELECT * FROM soal WHERE id_soal = $id_soal_edit");
    
    if ($result && mysqli_num_rows($result) > 0) {
        $current_soal = mysqli_fetch_assoc($result);
        $mode = 'edit';
    }
}

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
     <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Comic+Neue:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../soal/form.css" />
    <link rel="icon" type="image/x-icon" href="aset/logo1.png" />
    <title>Form Soal - Solo Mode</title>
  </head>
  <body>
    <div class="container">
      <h1 class="h1"><?= $mode === 'edit' ? 'Edit Soal Lvl: ' . $current_soal['lvl'] : 'Input Soal Baru' ?> - Mode Solo</h1>

      <form action="<?= $mode === 'edit' ? '../soal/update_soal.php' : '../soal/proses_soal.php' ?>" method="POST" enctype="multipart/form-data">

          <?php if ($mode === 'edit'): ?>
              <input type="hidden" name="id" value="<?= $current_soal['id_soal'] ?>">
          <?php endif; ?>

          <label for="question">Pertanyaan</label>
          <textarea
              id="question"
              name="pertanyaan"
              placeholder="Tulis pertanyaan di sini..."
              required
          ><?= $mode === 'edit' ? htmlspecialchars($current_soal['pertanyaan']) : '' ?></textarea>

        <label for="image">Gambar (opsional)</label>
        <input type="file" id="image" name="gambar" accept="image/*" class="input-file" />

        <div class="answers">
          <div class="answer-item">
            <label for="optionA">Jawaban A</label>
            <input
              type="text"
              id="optionA"
              name="jwbn_a"
              placeholder="Masukkan jawaban A"
              required
              value="<?= $mode === 'edit' ? htmlspecialchars($current_soal['jwbn_a']) : '' ?>"
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
              value="<?= $mode === 'edit' ? htmlspecialchars($current_soal['jwbn_b']) : '' ?>"
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
              value="<?= $mode === 'edit' ? htmlspecialchars($current_soal['jwbn_c']) : '' ?>"
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
              value="<?= $mode === 'edit' ? htmlspecialchars($current_soal['jwbn_d']) : '' ?>"
            />
          </div>
        </div>

        <label for="correct">Jawaban Benar</label>
        <select id="correct" name="jwbn_bnr" required>
            <option value="">-- Pilih Jawaban Benar --</option>
            <?php 
            $selected_jwbn = $mode === 'edit' ? $current_soal['jwbn_bnr'] : '';
            foreach (['A', 'B', 'C', 'D'] as $opt): ?>
                <option value="<?= $opt ?>" <?= ($opt === $selected_jwbn) ? 'selected' : '' ?>><?= $opt ?></option>
            <?php endforeach; ?>
        </select>

        <label for="level">Level</label>
        <select id="level" name="lvl" required>
            <option value="">-- Pilih Level --</option>
            <?php 
            for ($i = 1; $i <= $total_level; $i++):
                $jumlah = isset($level_soal[$i]) ? $level_soal[$i] : 0;
                
                // --- LOGIKA BARU DIMULAI DI SINI ---
                
                // 1. Cek kondisi disabled
                $is_disabled = false;
                if ($jumlah >= $maxQuestions) {
                    // Level penuh, tapi apakah kita sedang edit dan ini level aslinya?
                    if ($mode === 'edit' && $current_soal['lvl'] == $i) {
                        $is_disabled = false; // Jika ya, JANGAN disable
                    } else {
                        $is_disabled = true; // Jika tidak, disable
                    }
                }

                // 2. Cek kondisi selected
                $is_selected = ($mode === 'edit' && $current_soal['lvl'] == $i);

                // 3. Siapkan atribut untuk HTML
                $disabled_attr = $is_disabled ? 'disabled' : '';
                $selected_attr = $is_selected ? 'selected' : '';
                $label = "Level $i" . ($is_disabled ? " (Penuh)" : " ($jumlah/$maxQuestions)");
            ?>
                <option value="<?= $i ?>" <?= $disabled_attr ?> <?= $selected_attr ?>>
                    <?= $label ?>
                </option>
            <?php endfor; ?>
        </select>

        <button type="submit">Simpan</button>
      </form>
    </div>
  </body>
</html>
