<?php
session_start();
include '../sekret.php';

// Proses hapus soal
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['hapus_id'])) {
    $hapus_id = intval($_POST['hapus_id']);
    $id_room = $_SESSION['id_room'] ?? null;
    if ($id_room && $hapus_id) {
        $del = mysqli_query($conn, "DELETE FROM soal_mlt WHERE id_soalmlt='$hapus_id' AND id_room='$id_room'");
    }
}

// Ambil id_room dari session
$id_room = $_SESSION['id_room'] ?? null;
$questions = [];

if ($id_room) {
    $sql = "SELECT * FROM soal_mlt WHERE id_room='$id_room' ORDER BY id_soalmlt ASC";
    $result = mysqli_query($conn, $sql);
    while ($row = mysqli_fetch_assoc($result)) {
        $questions[] = $row;
    }
}
?>
<!DOCTYPE html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" href="quest.css" />
    <link rel="icon" type="image/x-icon" href="../aset/logo1.png" />
    <title>NAPZA EDU CARD - Pertanyaan</title>
    <style>
      .option { padding: 6px 12px; border-radius: 6px; margin-bottom: 6px; }
      .option.correct { background: #d4f8e8; color: #219653; font-weight: bold; }
      .question-block { margin-bottom: 24px; }
      .kunci { font-size: 13px; color: #219653; margin-left: 8px; }
      .tools { margin-top: 8px; }
      .tools form, .tools a { display: inline-block; }
      .hapus, .ubah { background: #ef233c; color: #fff; border: none; padding: 6px 16px; border-radius: 6px; cursor: pointer; margin-right: 6px; }
      .ubah { background: #3a86ff; }
      .hapus:hover { background: #d90429; }
      .ubah:hover { background: #00509e; }
    </style>
  </head>
  <body>
    <header class="navbar">
      <div class="icon">
        <img src="../aset/logo.png" alt="logo" title="Napza Edu Card" />
        <h1>NAPZA EDU CARD</h1>
      </div>
      <nav class="nav-links">
        <!--<a href="selection.php">Beranda</a>-->
        <a href="#">Panduan</a>
        <a href="#">Tentang</a>
        <a href="#" class="profil">login</a>
      </nav>
    </header>
    <main class="container">
      <div class="box">
        <div class="box-header">
          <span class="judul"><?php echo count($questions); ?> Pertanyaan</span>
          <div class="actions">
            <button class="tambah" onclick="window.location.href='create.php'">Tambah Pertanyaan</button>
            <button class="mulai" onclick="window.location.href = 'participant.php?id_room=<?php echo $id_room; ?>'">Mulai</button>
          </div>
        </div>
        <?php if (!$questions): ?>
          <div style="text-align:center; margin:32px 0;">Belum ada pertanyaan.</div>
        <?php else: ?>
          <?php foreach ($questions as $q): ?>
            <div class="question-block">
              <p class="question"><?php echo htmlspecialchars($q['pertanyaan']); ?></p>
              <div class="options">
                <?php
                  $jawaban = [
                    'A' => $q['jwbn_a'],
                    'B' => $q['jwbn_b'],
                    'C' => $q['jwbn_c'],
                    'D' => $q['jwbn_d']
                  ];
                  foreach ($jawaban as $key => $val):
                    $isCorrect = ($key == $q['jwbn_benar']);
                ?>
                  <div class="option<?php echo $isCorrect ? ' correct' : ''; ?>">
                    <?php echo $key . '. ' . htmlspecialchars($val); ?>
                    <?php if ($isCorrect): ?>
                      <span class="kunci">Kunci Jawaban</span>
                    <?php endif; ?>
                  </div>
                <?php endforeach; ?>
              </div>
              <div class="tools">
                <form method="post" onsubmit="return confirm('Yakin ingin menghapus soal ini?');" style="display:inline;">
                  <input type="hidden" name="hapus_id" value="<?php echo $q['id_soalmlt']; ?>">
                  <button type="submit" class="hapus"><i class="icon">🗑️</i>Hapus</button>
                </form>
                <a href="editsoal.php?id=<?php echo $q['id_soalmlt']; ?>">
                  <button type="button" class="ubah"><i class="icon">✏️</i>Ubah</button>
                </a>
              </div>
            </div>
          <?php endforeach; ?>
        <?php endif; ?>
      </div>
    </main>
  </body>
</html>
