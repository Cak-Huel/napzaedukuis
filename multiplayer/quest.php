<?php
session_start();
// Tambahkan header anti-cache agar data selalu fresh saat di-refresh
header("Cache-Control: no-cache, no-store, must-revalidate");
header("Pragma: no-cache");
header("Expires: 0");
include '../sekret.php';

$current_lang = $_SESSION['lang'] ?? 'id'; // Tentukan bahasa, default 'id'

// Proses hapus soal
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['hapus_id'])) {
    $hapus_id = intval($_POST['hapus_id']);
    $id_room = $_SESSION['id_room'] ?? null;
    
    if ($id_room && $hapus_id) {
        // 1. Ambil path gambar sebelum menghapus record dari DB
        $stmt_get_img = $conn->prepare("SELECT gambar FROM soal_mlt WHERE id_soalmlt = ? AND id_room = ?");
        $stmt_get_img->bind_param("ii", $hapus_id, $id_room);
        $stmt_get_img->execute();
        $result_img = $stmt_get_img->get_result();
        if ($row_img = $result_img->fetch_assoc()) {
            // 2. Hapus file gambar jika ada
            if (!empty($row_img['gambar']) && file_exists('../' . $row_img['gambar'])) {
                unlink('../' . $row_img['gambar']);
            }
        }
        $stmt_get_img->close();

        // 3. Hapus record soal dari database menggunakan prepared statement
        $stmt_del = $conn->prepare("DELETE FROM soal_mlt WHERE id_soalmlt = ? AND id_room = ?");
        $stmt_del->bind_param("ii", $hapus_id, $id_room);
        $stmt_del->execute();
        $stmt_del->close();

        // Redirect untuk mencegah re-submit form saat refresh
        header("Location: quest.php");
        exit();
    }
}

// Ambil id_room dari session
$id_room = $_SESSION['id_room'] ?? null;

// Validasi: Jika session id_room hilang, kembalikan ke halaman buat room
if (!$id_room) {
    header("Location: creatroom.php");
    exit();
}

$questions = [];

if ($id_room) {
    $sql = "SELECT * FROM soal_mlt WHERE id_room = ? ORDER BY id_soalmlt ASC";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $id_room);
    $stmt->execute();
    $result = $stmt->get_result();
    while ($row = $result->fetch_assoc()) {
        $questions[] = $row;
    }
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
    <link rel="stylesheet" href="quest.css" />
    <link rel="icon" type="image/x-icon" href="../aset/logo1.png" />
    <title data-key="quest_page_title">NAPZA EDU CARD - Pertanyaan</title>
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
        <a href="#panduan" data-key="guidance_menu">Panduan</a>
        <a href="#tentang" data-key="about_menu">Tentang</a>
      </nav>

    </header>
    <main class="container">
      <div class="box">
        <div class="box-header">
          <span class="judul"><?php echo count($questions); ?> <span data-key="question_count_label">Pertanyaan</span></span>
          <div class="actions">
            <button class="tambah" onclick="bukaModalBank()" data-key="bank_soal_button">Bank Soal</button>
            <button class="tambah" onclick="window.location.href='create.php'" data-key="add_question_button">Tambah Pertanyaan</button>
            <button class="mulai" onclick="window.location.href = 'participant.php?id_room=<?php echo $id_room; ?>'" data-key="start_button">Mulai</button>
          </div>
        </div>
        <?php if (!$questions): ?>
          <div style="text-align:center; margin:32px 0;" data-key="no_questions_yet">Belum ada pertanyaan.</div>
        <?php else: ?>
          <?php foreach ($questions as $q): ?>
            <div class="question-block">
              <p class="question"><?php echo htmlspecialchars($q['pertanyaan']); ?></p>
              <?php if (!empty($q['gambar'])): ?>
                <img src="../<?php echo htmlspecialchars($q['gambar']); ?>" alt="Gambar Soal" style="max-width: 200px; display: block; margin: 10px 0; border-radius: 8px;">
              <?php endif; ?>
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
                      <span class="kunci" data-key="answer_key_label">Kunci Jawaban</span>
                    <?php endif; ?>
                  </div>
                <?php endforeach; ?>
              </div>
              <div class="tools">
                <form method="post" onsubmit="return confirm('Yakin ingin menghapus soal ini?');" style="display:inline;"> <!-- Confirm text cannot be translated with data-key -->
                  <input type="hidden" name="hapus_id" value="<?php echo $q['id_soalmlt']; ?>">
                  <button type="submit" class="hapus" data-key="delete_button_icon"><i class="icon">🗑️</i>Hapus</button>
                </form>
                <a href="editsoal.php?id=<?php echo $q['id_soalmlt']; ?>">
                  <button type="button" class="ubah" data-key="edit_button_icon"><i class="icon">✏️</i>Ubah</button>
                </a>
              </div>
            </div>
          <?php endforeach; ?>
        <?php endif; ?>
      </div>
    </main>

     <!-- Modal Dialog -->
<div id="modal-overlay" style="display:none;">
  <div id="modal-dialog">
    <span id="modal-close">&times;</span>
    <h2 id="modal-title">Judul Modal</h2>
    <h4 id="modal-subtitle">Sub Judul</h4>
    <div id="modal-content">Isi modal di sini.</div>
  </div>
</div>

<div id="modal-bank-overlay" style="display:none;">
  <div id="modal-bank-dialog">
    <span id="modal-bank-close">&times;</span>
    <h2 id="modal-bank-title">Bank Soal</h2>
    <h4 id="modal-bank-subtitle">Pilih level untuk menampilkan soal</h4>
    <div id="modal-bank-content"></div>
  </div>
</div>
<!-- End Modal Dialog -->

<script src="../modal.js"></script>
  <script src="../user/translations.js"></script>
  <script src="quest.js"></script>
  </body>
</html>
