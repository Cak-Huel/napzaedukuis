const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Konfigurasi Multer untuk upload gambar soal
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = 'img_' + Date.now() + '_' + Math.round(Math.random() * 1e9) + ext;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Max 5MB
  fileFilter: function (req, file, cb) {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipe file gambar tidak diizinkan. Hanya JPG, PNG, GIF.'));
    }
  },
});

/**
 * GET /api/questions?id_room=...
 * Ambil daftar pertanyaan untuk room tertentu
 */
router.get('/', async (req, res) => {
  try {
    const id_room = parseInt(req.query.id_room);
    if (!id_room) {
      return res.status(400).json({ success: false, message: 'Parameter id_room wajib diisi.' });
    }

    const [questions] = await db.query(
      'SELECT * FROM soal_mlt WHERE id_room = ? ORDER BY id_soalmlt ASC',
      [id_room]
    );

    return res.json({ success: true, questions });
  } catch (error) {
    console.error('Get questions error:', error);
    return res.status(500).json({ success: false, message: 'Gagal mengambil data pertanyaan.' });
  }
});

/**
 * GET /api/questions/next?id_room=...&id_peserta=...
 * Ambil soal berikutnya yang belum dijawab oleh peserta
 * (Menggantikan get_question.php)
 * Keamanan: jwbn_benar TIDAK dikirim ke client
 */
router.get('/next', async (req, res) => {
  try {
    const id_room = parseInt(req.query.id_room);
    const id_peserta = parseInt(req.query.id_peserta);

    if (!id_room || !id_peserta) {
      return res.status(400).json({ success: false, message: 'Parameter id_room dan id_peserta wajib diisi.' });
    }

    // Ambil soal berikutnya yang belum dijawab oleh peserta ini
    const [questions] = await db.query(
      `SELECT sm.id_soalmlt, sm.pertanyaan, sm.gambar, sm.jwbn_a, sm.jwbn_b, sm.jwbn_c, sm.jwbn_d
       FROM soal_mlt sm
       WHERE sm.id_room = ?
       AND sm.id_soalmlt NOT IN (
         SELECT id_soalmlt FROM jawaban_room WHERE id_peserta = ?
       )
       ORDER BY sm.id_soalmlt ASC
       LIMIT 1`,
      [id_room, id_peserta]
    );

    // Hitung total soal dan soal yang sudah dijawab
    const [totalResult] = await db.query(
      'SELECT COUNT(*) as total FROM soal_mlt WHERE id_room = ?',
      [id_room]
    );
    const [answeredResult] = await db.query(
      `SELECT COUNT(*) as answered FROM jawaban_room jr
       INNER JOIN soal_mlt sm ON jr.id_soalmlt = sm.id_soalmlt
       WHERE sm.id_room = ? AND jr.id_peserta = ?`,
      [id_room, id_peserta]
    );

    const totalSoal = totalResult[0]?.total || 0;
    const answeredCount = answeredResult[0]?.answered || 0;

    if (questions.length > 0) {
      return res.json({
        success: true,
        question: questions[0],
        total_soal: totalSoal,
        answered_count: answeredCount,
      });
    } else {
      return res.json({
        success: true,
        question: null,
        total_soal: totalSoal,
        answered_count: answeredCount,
        message: 'Tidak ada soal lagi.',
      });
    }
  } catch (error) {
    console.error('Get next question error:', error);
    return res.status(500).json({ success: false, message: 'Gagal mengambil soal berikutnya.' });
  }
});

/**
 * POST /api/questions/submit
 * Submit jawaban peserta, validasi, update skor, return next question
 * (Menggantikan submit_answer.php)
 */
router.post('/submit', async (req, res) => {
  try {
    const { id_room, id_peserta, id_soalmlt, jawaban, waktu_jawab } = req.body;

    if (!id_peserta || !id_soalmlt) {
      return res.status(400).json({ success: false, message: 'Data tidak lengkap.' });
    }

    const parsedIdPeserta = parseInt(id_peserta);
    const parsedIdSoalmlt = parseInt(id_soalmlt);
    const parsedIdRoom = parseInt(id_room);
    const parsedWaktuJawab = parseInt(waktu_jawab) || 30;

    // 1. Cek apakah soal sudah pernah dijawab (prevent double submit)
    const [existingAnswer] = await db.query(
      'SELECT 1 FROM jawaban_room WHERE id_peserta = ? AND id_soalmlt = ?',
      [parsedIdPeserta, parsedIdSoalmlt]
    );
    if (existingAnswer.length > 0) {
      return res.status(409).json({ success: false, message: 'Soal ini sudah dijawab sebelumnya.' });
    }

    // 2. Ambil soal untuk validasi jawaban dan skor
    const [soalRows] = await db.query(
      'SELECT jwbn_benar, skor FROM soal_mlt WHERE id_soalmlt = ?',
      [parsedIdSoalmlt]
    );

    if (soalRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Soal tidak ditemukan.' });
    }

    const soal = soalRows[0];
    const isCorrect = jawaban !== null && jawaban !== undefined &&
      jawaban.toString().trim().toUpperCase() === soal.jwbn_benar.trim().toUpperCase();
    const skorDidapat = isCorrect ? parseInt(soal.skor) || 0 : 0;

    // 3. Simpan jawaban ke jawaban_room
    const benarVal = isCorrect ? 1 : 0;
    await db.query(
      'INSERT INTO jawaban_room (id_peserta, id_soalmlt, jawaban, benar, waktu_jawab) VALUES (?, ?, ?, ?, ?)',
      [parsedIdPeserta, parsedIdSoalmlt, jawaban || null, benarVal, parsedWaktuJawab]
    );

    // 4. Update skor pemain jika benar
    if (isCorrect) {
      await db.query(
        'UPDATE room_player SET skor = skor + ? WHERE id_peserta = ?',
        [skorDidapat, parsedIdPeserta]
      );
    }

    // 5. Ambil skor terbaru
    const [skorRows] = await db.query(
      'SELECT skor FROM room_player WHERE id_peserta = ?',
      [parsedIdPeserta]
    );
    const newScore = skorRows[0]?.skor || 0;

    // 6. Ambil soal berikutnya (tanpa jwbn_benar)
    let nextQuestion = null;
    if (parsedIdRoom) {
      const [nextRows] = await db.query(
        `SELECT id_soalmlt, pertanyaan, gambar, jwbn_a, jwbn_b, jwbn_c, jwbn_d
         FROM soal_mlt
         WHERE id_room = ?
         AND id_soalmlt NOT IN (
           SELECT id_soalmlt FROM jawaban_room WHERE id_peserta = ?
         )
         ORDER BY id_soalmlt ASC
         LIMIT 1`,
        [parsedIdRoom, parsedIdPeserta]
      );
      nextQuestion = nextRows.length > 0 ? nextRows[0] : null;
    }

    // 7. Hitung progress
    const [totalResult] = await db.query(
      'SELECT COUNT(*) as total FROM soal_mlt WHERE id_room = ?',
      [parsedIdRoom]
    );
    const [answeredResult] = await db.query(
      `SELECT COUNT(*) as answered FROM jawaban_room jr
       INNER JOIN soal_mlt sm ON jr.id_soalmlt = sm.id_soalmlt
       WHERE sm.id_room = ? AND jr.id_peserta = ?`,
      [parsedIdRoom, parsedIdPeserta]
    );

    return res.json({
      success: true,
      is_correct: isCorrect,
      correct_answer: soal.jwbn_benar,
      new_score: newScore,
      next_question: nextQuestion,
      total_soal: totalResult[0]?.total || 0,
      answered_count: answeredResult[0]?.answered || 0,
    });
  } catch (error) {
    console.error('Submit answer error:', error);
    return res.status(500).json({ success: false, message: 'Gagal mengirim jawaban.' });
  }
});

const verifyAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ success: false, message: 'Akses ditolak. Khusus untuk Admin.' });
  }
};

/**
 * GET /api/questions/bank/all
 * Ambil semua daftar soal dari Bank Soal (tabel soal) untuk admin panel
 */
router.get('/bank/all', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const lvl = req.query.lvl ? parseInt(req.query.lvl) : null;
    let query = 'SELECT id_soal as id, lvl, pertanyaan, gambar, jwbn_a, jwbn_b, jwbn_c, jwbn_d, jwbn_bnr FROM soal';
    const params = [];

    if (lvl) {
      query += ' WHERE lvl = ?';
      params.push(lvl);
    }
    query += ' ORDER BY lvl ASC, id_soal ASC';

    const [rows] = await db.query(query, params);
    return res.json({ success: true, questions: rows });
  } catch (error) {
    console.error('Get all bank questions error:', error);
    return res.status(500).json({ success: false, message: 'Gagal mengambil data bank soal.' });
  }
});

/**
 * POST /api/questions/bank
 * Tambah soal baru ke Bank Soal (tabel soal)
 */
router.post('/bank', verifyToken, verifyAdmin, upload.single('gambar'), async (req, res) => {
  try {
    const { pertanyaan, jwbn_a, jwbn_b, jwbn_c, jwbn_d, jwbn_bnr, lvl } = req.body;

    if (!pertanyaan || !jwbn_a || !jwbn_b || !jwbn_c || !jwbn_d || !jwbn_bnr || !lvl) {
      return res.status(400).json({ success: false, message: 'Semua bidang wajib diisi.' });
    }

    let gambar_path = null;
    if (req.file) {
      gambar_path = 'uploads/' + req.file.filename;
    }

    const [result] = await db.query(
      `INSERT INTO soal (pertanyaan, jwbn_a, jwbn_b, jwbn_c, jwbn_d, jwbn_bnr, lvl, gambar) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        pertanyaan.trim(),
        jwbn_a.trim(),
        jwbn_b.trim(),
        jwbn_c.trim(),
        jwbn_d.trim(),
        jwbn_bnr.toUpperCase(),
        parseInt(lvl),
        gambar_path,
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Soal berhasil ditambahkan ke Bank Soal.',
      id: result.insertId,
    });
  } catch (error) {
    console.error('Create bank question error:', error);
    return res.status(500).json({ success: false, message: 'Gagal menyimpan soal ke Bank Soal.' });
  }
});

/**
 * PUT /api/questions/bank/:id
 * Edit soal di Bank Soal (tabel soal)
 */
router.put('/bank/:id', verifyToken, verifyAdmin, upload.single('gambar'), async (req, res) => {
  try {
    const id_soal = parseInt(req.params.id);
    const { pertanyaan, jwbn_a, jwbn_b, jwbn_c, jwbn_d, jwbn_bnr, lvl, hapus_gambar } = req.body;

    const [existing] = await db.query('SELECT * FROM soal WHERE id_soal = ?', [id_soal]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Soal tidak ditemukan.' });
    }

    const oldSoal = existing[0];
    let gambar_path_update = oldSoal.gambar;

    if (hapus_gambar === '1' || hapus_gambar === true || hapus_gambar === 'true') {
      if (oldSoal.gambar) {
        const fullPath = path.join(__dirname, '../../', oldSoal.gambar);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      }
      gambar_path_update = null;
    }

    if (req.file) {
      if (oldSoal.gambar) {
        const fullPath = path.join(__dirname, '../../', oldSoal.gambar);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      }
      gambar_path_update = 'uploads/' + req.file.filename;
    }

    await db.query(
      `UPDATE soal SET 
       pertanyaan = ?, jwbn_a = ?, jwbn_b = ?, jwbn_c = ?, jwbn_d = ?, jwbn_bnr = ?, lvl = ?, gambar = ? 
       WHERE id_soal = ?`,
      [
        pertanyaan.trim(),
        jwbn_a.trim(),
        jwbn_b.trim(),
        jwbn_c.trim(),
        jwbn_d.trim(),
        jwbn_bnr.toUpperCase(),
        parseInt(lvl),
        gambar_path_update,
        id_soal,
      ]
    );

    return res.json({ success: true, message: 'Soal berhasil diperbarui.' });
  } catch (error) {
    console.error('Update bank question error:', error);
    return res.status(500).json({ success: false, message: 'Gagal memperbarui soal.' });
  }
});

/**
 * DELETE /api/questions/bank/:id
 * Hapus soal dari Bank Soal (tabel soal)
 */
router.delete('/bank/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const id_soal = parseInt(req.params.id);

    const [existing] = await db.query('SELECT gambar FROM soal WHERE id_soal = ?', [id_soal]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Soal tidak ditemukan.' });
    }

    const row = existing[0];
    if (row.gambar) {
      const fullPath = path.join(__dirname, '../../', row.gambar);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }

    await db.query('DELETE FROM soal WHERE id_soal = ?', [id_soal]);
    return res.json({ success: true, message: 'Soal berhasil dihapus dari Bank Soal.' });
  } catch (error) {
    console.error('Delete bank question error:', error);
    return res.status(500).json({ success: false, message: 'Gagal menghapus soal.' });
  }
});

/**
 * GET /api/questions/bank?lvl=...
 * Ambil daftar soal dari Bank Soal (tabel soal) berdasarkan level
 */
router.get('/bank', async (req, res) => {
  try {
    const lvl = parseInt(req.query.lvl) || 1;
    const [questions] = await db.query(
      'SELECT id_soal as id, pertanyaan as question, gambar, jwbn_a, jwbn_b, jwbn_c, jwbn_d, jwbn_bnr FROM soal WHERE lvl = ? LIMIT 10',
      [lvl]
    );

    return res.json({ success: true, questions });
  } catch (error) {
    console.error('Get bank questions error:', error);
    return res.status(500).json({ success: false, message: 'Gagal mengambil bank soal.' });
  }
});

/**
 * POST /api/questions/import-bank
 * Import beberapa soal pilihan dari Bank Soal ke room
 */
router.post('/import-bank', verifyToken, async (req, res) => {
  try {
    const { id_room, selected_soal } = req.body;
    if (!id_room || !Array.isArray(selected_soal) || selected_soal.length === 0) {
      return res.status(400).json({ success: false, message: 'id_room dan daftar soal wajib diisi.' });
    }

    let importedCount = 0;
    for (const id_solo of selected_soal) {
      const [rows] = await db.query(
        'SELECT pertanyaan, gambar, jwbn_a, jwbn_b, jwbn_c, jwbn_d, jwbn_bnr FROM soal WHERE id_soal = ?',
        [id_solo]
      );
      if (rows.length > 0) {
        const data = rows[0];
        await db.query(
          `INSERT INTO soal_mlt 
          (id_room, pertanyaan, gambar, jwbn_a, jwbn_b, jwbn_c, jwbn_d, jwbn_benar, skor, sumber_soal, id_soal_solo) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, 10, 'bank', ?)`,
          [
            id_room,
            data.pertanyaan,
            data.gambar,
            data.jwbn_a,
            data.jwbn_b,
            data.jwbn_c,
            data.jwbn_d,
            data.jwbn_bnr,
            id_solo,
          ]
        );
        importedCount++;
      }
    }

    return res.json({
      success: true,
      message: `${importedCount} soal dari bank berhasil ditambahkan ke room.`,
    });
  } catch (error) {
    console.error('Import bank error:', error);
    return res.status(500).json({ success: false, message: 'Gagal mengimpor dari bank soal.' });
  }
});

/**
 * POST /api/questions
 * Tambah pertanyaan custom baru
 */
router.post('/', verifyToken, upload.single('gambar'), async (req, res) => {
  try {
    const { id_room, pertanyaan, jwbn_a, jwbn_b, jwbn_c, jwbn_d, jwbn_benar, skor } = req.body;

    if (!id_room || !pertanyaan || !jwbn_a || !jwbn_b || !jwbn_c || !jwbn_d || !jwbn_benar) {
      return res.status(400).json({ success: false, message: 'Semua bidang pertanyaan & jawaban wajib diisi.' });
    }

    let gambar_path = null;
    if (req.file) {
      gambar_path = 'uploads/' + req.file.filename;
    }

    const [result] = await db.query(
      `INSERT INTO soal_mlt 
      (id_room, pertanyaan, jwbn_a, jwbn_b, jwbn_c, jwbn_d, jwbn_benar, skor, gambar, sumber_soal) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'custom')`,
      [
        parseInt(id_room),
        pertanyaan.trim(),
        jwbn_a.trim(),
        jwbn_b.trim(),
        jwbn_c.trim(),
        jwbn_d.trim(),
        jwbn_benar.toUpperCase(),
        parseInt(skor) || 1,
        gambar_path,
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Pertanyaan berhasil ditambahkan.',
      id_soalmlt: result.insertId,
    });
  } catch (error) {
    console.error('Create question error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Gagal menyimpan pertanyaan.' });
  }
});

/**
 * PUT /api/questions/:id
 * Edit pertanyaan
 */
router.put('/:id', verifyToken, upload.single('gambar'), async (req, res) => {
  try {
    const id_soalmlt = parseInt(req.params.id);
    const { pertanyaan, jwbn_a, jwbn_b, jwbn_c, jwbn_d, jwbn_benar, skor, hapus_gambar } = req.body;

    // Ambil data lama
    const [existing] = await db.query('SELECT * FROM soal_mlt WHERE id_soalmlt = ?', [id_soalmlt]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Pertanyaan tidak ditemukan.' });
    }

    const oldSoal = existing[0];
    let gambar_path_update = oldSoal.gambar;

    // Logika hapus gambar lama jika diminta
    if (hapus_gambar === '1' || hapus_gambar === true) {
      if (oldSoal.gambar) {
        const fullPath = path.join(__dirname, '../../', oldSoal.gambar);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      }
      gambar_path_update = null;
    }

    // Logika gambar baru jika diunggah
    if (req.file) {
      if (oldSoal.gambar) {
        const fullPath = path.join(__dirname, '../../', oldSoal.gambar);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      }
      gambar_path_update = 'uploads/' + req.file.filename;
    }

    await db.query(
      `UPDATE soal_mlt SET 
      pertanyaan = ?, jwbn_a = ?, jwbn_b = ?, jwbn_c = ?, jwbn_d = ?, jwbn_benar = ?, skor = ?, gambar = ? 
      WHERE id_soalmlt = ?`,
      [
        pertanyaan.trim(),
        jwbn_a.trim(),
        jwbn_b.trim(),
        jwbn_c.trim(),
        jwbn_d.trim(),
        jwbn_benar.toUpperCase(),
        parseInt(skor) || 1,
        gambar_path_update,
        id_soalmlt,
      ]
    );

    return res.json({ success: true, message: 'Pertanyaan berhasil diperbarui.' });
  } catch (error) {
    console.error('Update question error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Gagal memperbarui pertanyaan.' });
  }
});

/**
 * DELETE /api/questions/:id
 * Hapus pertanyaan
 */
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const id_soalmlt = parseInt(req.params.id);

    // Ambil data gambar terlebih dahulu
    const [existing] = await db.query('SELECT gambar FROM soal_mlt WHERE id_soalmlt = ?', [id_soalmlt]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Pertanyaan tidak ditemukan.' });
    }

    const row = existing[0];
    if (row.gambar) {
      const fullPath = path.join(__dirname, '../../', row.gambar);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }

    await db.query('DELETE FROM soal_mlt WHERE id_soalmlt = ?', [id_soalmlt]);

    return res.json({ success: true, message: 'Pertanyaan berhasil dihapus.' });
  } catch (error) {
    console.error('Delete question error:', error);
    return res.status(500).json({ success: false, message: 'Gagal menghapus pertanyaan.' });
  }
});

module.exports = router;
