<?php
    session_start();
    require '../sekret.php';

    // 1. Ambil level dari URL, default ke 1 jika tidak ada
    $current_level = isset($_GET['level']) ? intval($_GET['level']) : 1;

    // 2. Ambil 5 soal dari database untuk level saat ini
    // Menggunakan prepared statement untuk keamanan
    $stmt = $conn->prepare("SELECT id_soal as id, pertanyaan as question, gambar as image, jwbn_a, jwbn_b, jwbn_c, jwbn_d, jwbn_bnr as correctAnswer FROM soal WHERE lvl = ? LIMIT 5");
    $stmt->bind_param("i", $current_level);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $quizData = [];
    while ($row = $result->fetch_assoc()) {
        // Buat array opsi untuk JSON
        $row['options'] = [$row['jwbn_a'], $row['jwbn_b'], $row['jwbn_c'], $row['jwbn_d']];
        // Hapus kunci yang tidak diperlukan di frontend
        unset($row['jwbn_a'], $row['jwbn_b'], $row['jwbn_c'], $row['jwbn_d']);
        $quizData[] = $row;
    }
    $stmt->close();

    // 3. Cek apakah ada soal untuk level berikutnya
    $next_level_to_check = $current_level + 1;
    $stmt_next = $conn->prepare("SELECT id_soal FROM soal WHERE lvl = ? LIMIT 1");
    $stmt_next->bind_param("i", $next_level_to_check);
    $stmt_next->execute();
    $stmt_next->store_result();
    $hasNextLevel = $stmt_next->num_rows > 0;
    $stmt_next->close();
    $conn->close(); // Tutup koneksi setelah semua query selesai
?>

<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Quicksand:wght@300..700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="levelgame.css">
    <link rel="icon" type="image/x-icon" href="../aset/logo1.png" />
    <title>Level <?= htmlspecialchars($current_level) ?> - Napza Edu Card</title>
</head>
<body>

    <nav class="navbar">
        <div class="logo">
        <img src="../aset/logo.png" alt="logo" title="Napza Edu Card" />
        <h1>NAPZA EDU CARD</h1>
        </div>

        <button class="hamburger-menu" id="hamburger-btn">
        &#9776; </button>

        <ul class="menu">
            <li><a href="#panduan">Panduan</a></li>
            <li><a href="#tentang">Tentang</a></li>
            
            <?php if(isset($_SESSION['id_user'])): ?>
                <button class="nav-button" onclick="window.location.href='../user/profil.php'">Profil</button>
            <?php else: ?>
                <button class="nav-button" onclick="window.location.href='../user/login.php'">Login</button>
            <?php endif; ?>
        </ul>
    </nav>

    <div class="sub-nav">
        <a href="solo.php" class="back-button">&larr; Kembali</a>
        <div class="level-display">Level: <span id="level"><?= htmlspecialchars($current_level) ?></span></div>
        <div class="game-stats">
            <span>Points: <span id="points">0</span></span>
            <span>Time: <span id="timer">00:40</span></span>
        </div>
    </div>

    <main class="game-board">
        <?php foreach ($quizData as $index => $soal): ?>
            <div class="card" data-id="<?= htmlspecialchars($soal['id']) ?>">
                <div class="card-inner">
                    <div class="card-front"><div class="card-status-icon"></div></div>
                    <div class="card-back"></div>
                </div>
            </div>
        <?php endforeach; ?>
    </main>

    <div class="modal-overlay" id="completion-modal-overlay">
        <div class="modal">
            <h2>Level Selesai!</h2>
            <p>Skor kamu: <span id="modal-score">0</span></p>
            <div class="modal-actions">
                <?php if ($hasNextLevel): ?>
                    <button class="modal-button" onclick="window.location.href='solo.php'">Kembali ke Menu</button>
                    <button id="next-level-btn" class="modal-button primary" data-next-level="<?= $current_level + 1 ?>">Level Berikutnya</button>
                <?php else: ?>
                    <p class="all-levels-complete">Selamat! Anda telah menyelesaikan semua level.</p>
                    <button class="modal-button" onclick="window.location.href='solo.php'">Kembali ke Menu</button>
                <?php endif; ?>
            </div>
        </div>
    </div>

    <div class="overlay" id="page-overlay"></div>

    <!-- Modal Dialog -->
     <div id="modal-overlay" style="display:none;">
        <div id="modal-dialog">
            <span id="modal-close">&times;</span>
            <h2 id="modal-title">Judul Modal</h2>
            <h4 id="modal-subtitle">Sub Judul</h4>
            <div id="modal-content">Isi modal di sini.</div>
        </div>
    </div>
</div>
<!-- End Modal Dialog -->

    <script id="quiz-data" type="application/json"><?php echo json_encode($quizData); ?></script>
    <script src="game.js"></script>
    <script src="../modal.js"></script>
</body>
</html>