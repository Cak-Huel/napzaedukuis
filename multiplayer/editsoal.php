<?php
session_start();
include '../sekret.php';

$current_lang = $_SESSION['lang'] ?? 'id'; // Tentukan bahasa, default 'id'

// Pastikan user memiliki akses ke room ini
if (!isset($_SESSION['id_room'])) {
    header("Location: creatroom.php");
    exit();
}
$id_room = $_SESSION['id_room'];

// Ambil ID soal dari URL. Jika tidak ada, proses tidak bisa lanjut.
$id_soalmlt = isset($_GET['id']) ? (int)$_GET['id'] : 0;
if ($_SERVER['REQUEST_METHOD'] === 'GET' && $id_soalmlt === 0) {
    exit("Error: ID Soal tidak valid atau tidak disediakan.");
}

// PROSES UPDATE DATA (saat form di-submit)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id_soalmlt_post = (int)$_POST['id_soalmlt'];
    $pertanyaan = $_POST['pertanyaan'];
    $jwbn_a = $_POST['jwbn_a'];
    $jwbn_b = $_POST['jwbn_b'];
    $jwbn_c = $_POST['jwbn_c'];
    $jwbn_d = $_POST['jwbn_d'];
    $jwbn_benar = $_POST['jwbn_benar'];
    $skor = (int)$_POST['skor'];
    $gambar_path_lama = $_POST['gambar_lama'];
    $hapus_gambar = isset($_POST['hapus_gambar']) ? 1 : 0;

    $gambar_path_update = $gambar_path_lama; // Defaultnya, path gambar tidak berubah

    // 1. Logika untuk menghapus gambar
    if ($hapus_gambar && !empty($gambar_path_lama)) {
        if (file_exists('../' . $gambar_path_lama)) {
            unlink('../' . $gambar_path_lama);
        }
        $gambar_path_update = null; // Set path jadi null di DB
    }

    // 2. Logika untuk unggah gambar baru (menggantikan yang lama)
    if (isset($_FILES['gambar']) && $_FILES['gambar']['error'] === UPLOAD_ERR_OK) {
        // Hapus gambar lama jika ada gambar baru yang diunggah
        if (!empty($gambar_path_lama) && file_exists('../' . $gambar_path_lama)) {
            unlink('../' . $gambar_path_lama);
        }

        // Proses unggah file baru (sama seperti di create.php)
        $upload_dir = '../uploads/';
        $file_info = pathinfo($_FILES['gambar']['name']);
        $file_extension = strtolower($file_info['extension']);
        $allowed_extensions = ['jpg', 'jpeg', 'png', 'gif'];

        if (in_array($file_extension, $allowed_extensions)) {
            $new_file_name = uniqid('img_', true) . '.' . $file_extension;
            $dest_path = $upload_dir . $new_file_name;

            if (move_uploaded_file($_FILES['gambar']['tmp_name'], $dest_path)) {
                $gambar_path_update = 'uploads/' . $new_file_name;
            } else {
                exit("Gagal memindahkan file baru yang diunggah.");
            }
        } else {
            exit("Tipe file gambar tidak valid.");
        }
    }

    // 3. Update data di database menggunakan prepared statement
    $sql = "UPDATE soal_mlt SET pertanyaan=?, jwbn_a=?, jwbn_b=?, jwbn_c=?, jwbn_d=?, jwbn_benar=?, skor=?, gambar=? WHERE id_soalmlt=? AND id_room=?";
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "ssssssisii", $pertanyaan, $jwbn_a, $jwbn_b, $jwbn_c, $jwbn_d, $jwbn_benar, $skor, $gambar_path_update, $id_soalmlt_post, $id_room);

    if (mysqli_stmt_execute($stmt)) {
        header("Location: quest.php");
        exit();
    } else {
        exit("Gagal memperbarui data: " . mysqli_error($conn));
    }
}

// PROSES PENGAMBILAN DATA (saat halaman dimuat pertama kali)
$stmt = $conn->prepare("SELECT * FROM soal_mlt WHERE id_soalmlt = ? AND id_room = ?");
$stmt->bind_param("ii", $id_soalmlt, $id_room);
$stmt->execute();
$result = $stmt->get_result();
$soal = $result->fetch_assoc();

if (!$soal) {
    exit("Soal tidak ditemukan atau Anda tidak memiliki akses ke soal ini.");
}
?>
<!DOCTYPE html>
<html lang="<?= $current_lang ?>">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Comic+Neue:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="create.css" /> <!-- Menggunakan CSS yang sama dengan create.php -->
    <link rel="icon" type="image/x-icon" href="../aset/logo1.png" />
    <title data-key="edit_question_page_title">Ubah Soal - Napza Edu Card</title>
</head>

<body class="bg-primary">
    <header class="topbar">
        <div class="icon">
            <img src="../aset/logo1.png" alt="logo" title="Napza Edu Card" />
            <h1 data-key="game_title">NAPZA EDU CARD</h1>
        </div>
        <nav>
            <a href="#panduan" data-key="guidance_menu">Panduan</a>
            <a href="#tentang" data-key="about_menu">Tentang</a>
        </nav>
    </header>

    <main class="container">
        <form method="POST" action="editsoal.php" class="question-section" enctype="multipart/form-data">
            <input type="hidden" name="id_soalmlt" value="<?php echo $soal['id_soalmlt']; ?>">
            <input type="hidden" name="gambar_lama" value="<?php echo htmlspecialchars($soal['gambar']); ?>">

            <div class="top-right">
                <div class="info-box">⏰ 30</div>
                <div class="info-box"><span data-key="score_label_create_form">Skor</span>
                    <input type="number" name="skor" value="<?php echo $soal['skor']; ?>" min="1" style="width:50px;" required>
                </div>
                <button class="btn-save" type="submit" data-key="update_button">Perbarui</button>
            </div>
            <textarea name="pertanyaan" data-key-placeholder="question_input_placeholder" placeholder="Masukkan Pertanyaan" required><?php echo htmlspecialchars($soal['pertanyaan']); ?></textarea>

            <div class="image-upload-container" style="margin: 15px 0; border: 1px solid #ddd; padding: 10px; border-radius: 8px;">
                <h4 data-key="image_section_title" style="margin-top:0;">Gambar Soal</h4>
                <?php if (!empty($soal['gambar'])): ?>
                    <div class="current-image" style="margin-bottom:15px;">
                        <p data-key="current_image_label">Gambar saat ini:</p>
                        <img src="../<?php echo htmlspecialchars($soal['gambar']); ?>" alt="Gambar Soal" style="max-width: 200px; border-radius: 8px; display:block; margin-bottom:10px;">
                        <label>
                            <input type="checkbox" name="hapus_gambar" value="1"> <span data-key="delete_image_checkbox">Hapus gambar ini</span>
                        </label>
                    </div>
                <?php endif; ?>
                <label for="gambar" data-key="change_image_label">Ubah/Unggah Gambar Baru (Opsional):</label>
                <input type="file" id="gambar" name="gambar" accept="image/*">
            </div>

            <div class="answers">
                <?php
                $options = ['A', 'B', 'C', 'D'];
                foreach ($options as $opt) {
                    $jwbn_key = 'jwbn_' . strtolower($opt);
                ?>
                    <div class="answer-card">
                        <input type="text" name="<?php echo $jwbn_key; ?>" value="<?php echo htmlspecialchars($soal[$jwbn_key]); ?>" data-key-placeholder="answer_input_placeholder" placeholder="Masukkan Jawaban" required />
                        <label style="display: flex; align-items: center; cursor: pointer;">
                            <input type="radio" name="jwbn_benar" value="<?php echo $opt; ?>" class="correct-radio" <?php echo ($soal['jwbn_benar'] == $opt) ? 'checked' : ''; ?> required /> <span data-key="correct_answer_radio_label" style="margin-left: 5px;">Benar</span>
                        </label>
                    </div>
                <?php } ?>
            </div>
        </form>
    </main>

    <script src="../modal.js"></script>
    <script src="../user/translations.js"></script>
    <script src="../user/profil.js"></script>
</body>

</html>