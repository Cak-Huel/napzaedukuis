const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken } = require('../middleware/auth');
const Pusher = require('pusher');

// Inisialisasi Pusher jika kredensial ada di .env
let pusher = null;
if (process.env.PUSHER_APP_ID && process.env.PUSHER_KEY && process.env.PUSHER_SECRET) {
  pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID,
    key: process.env.PUSHER_KEY,
    secret: process.env.PUSHER_SECRET,
    cluster: process.env.PUSHER_CLUSTER || 'ap1',
    useTLS: true,
  });
}

// Helper untuk membuat kode room unik (6 karakter alfanumerik)
async function generateUniqueRoomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
  let isUnique = false;
  let code = '';

  while (!isUnique) {
    code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const [rows] = await db.query('SELECT 1 FROM room WHERE kode_room = ?', [code]);
    if (rows.length === 0) {
      isUnique = true;
    }
  }
  return code;
}

/**
 * POST /api/rooms/create
 * Buat room baru (butuh autentikasi / login sebagai Author)
 */
router.post('/create', verifyToken, async (req, res) => {
  try {
    const { nama_room } = req.body;
    if (!nama_room || !nama_room.trim()) {
      return res.status(400).json({ success: false, message: 'Nama room harus diisi.' });
    }

    const kode_room = await generateUniqueRoomCode();
    const id_pembuat = req.user ? req.user.id_user : null;

    const [result] = await db.query(
      'INSERT INTO room (kode_room, id_pembuat, nama_room, status) VALUES (?, ?, ?, "menunggu")',
      [kode_room, id_pembuat, nama_room.trim()]
    );

    return res.status(201).json({
      success: true,
      message: 'Room berhasil dibuat.',
      room: {
        id_room: result.insertId,
        kode_room,
        nama_room: nama_room.trim(),
        status: 'menunggu',
      },
    });
  } catch (error) {
    console.error('Create room error:', error);
    return res.status(500).json({ success: false, message: 'Gagal membuat room.' });
  }
});

/**
 * POST /api/rooms/join
 * Join ke room (Publik / Player)
 */
router.post('/join', async (req, res) => {
  try {
    const { kode_room, nama_guest } = req.body;

    const kode = (kode_room || '').trim().toUpperCase();
    const nama = (nama_guest || '').trim();

    if (!kode) {
      return res.status(400).json({ success: false, message: 'Kode room harus diisi.' });
    }
    if (!nama) {
      return res.status(400).json({ success: false, message: 'Nama peserta harus diisi.' });
    }

    // 1. Cari room aktif dengan kode & status 'menunggu'
    const [rooms] = await db.query(
      'SELECT id_room, nama_room, status FROM room WHERE kode_room = ? AND status = "menunggu"',
      [kode]
    );

    if (rooms.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Kode room tidak ditemukan atau permainan sudah dimulai.',
      });
    }

    const room = rooms[0];

    // 2. Tambahkan peserta ke room_player
    const [result] = await db.query(
      'INSERT INTO room_player (id_room, nama_guest, skor, waktu_masuk) VALUES (?, ?, 0, NOW())',
      [room.id_room, nama]
    );

    const id_peserta = result.insertId;

    // 3. Trigger Pusher event jika terkonfigurasi
    if (pusher) {
      try {
        await pusher.trigger(`private-quiz-${kode}`, 'participant-joined', {
          id_peserta,
          nama_guest: nama,
        });
      } catch (pusherErr) {
        console.error('Pusher trigger error:', pusherErr);
      }
    }

    return res.json({
      success: true,
      message: 'Berhasil bergabung dengan room.',
      id_room: room.id_room,
      id_peserta,
      kode_room: kode,
      nama_room: room.nama_room,
      nama_guest: nama,
    });
  } catch (error) {
    console.error('Join room error:', error);
    return res.status(500).json({ success: false, message: 'Gagal bergabung dengan room.' });
  }
});

/**
 * GET /api/rooms/details/:id_room
 * Ambil detail room dan daftar peserta bergabung
 */
router.get('/details/:id_room', async (req, res) => {
  try {
    const id_room = parseInt(req.params.id_room);
    if (!id_room) {
      return res.status(400).json({ success: false, message: 'ID room tidak valid.' });
    }

    const [rooms] = await db.query(
      'SELECT id_room, kode_room, nama_room, status FROM room WHERE id_room = ?',
      [id_room]
    );

    if (rooms.length === 0) {
      return res.status(404).json({ success: false, message: 'Room tidak ditemukan.' });
    }

    const room = rooms[0];

    const [players] = await db.query(
      'SELECT id_peserta, nama_guest, skor, waktu_masuk FROM room_player WHERE id_room = ? ORDER BY waktu_masuk ASC',
      [id_room]
    );

    const peserta = players.map(p => p.nama_guest);

    return res.json({
      success: true,
      id_room: room.id_room,
      kode_room: room.kode_room,
      nama_room: room.nama_room,
      status: room.status,
      peserta,
      players,
    });
  } catch (error) {
    console.error('Get room details error:', error);
    return res.status(500).json({ success: false, message: 'Gagal mengambil detail room.' });
  }
});

/**
 * POST /api/rooms/:id_room/start
 * Mulai permainan (Author / Host)
 */
router.post('/:id_room/start', verifyToken, async (req, res) => {
  try {
    const id_room = parseInt(req.params.id_room);
    if (!id_room) {
      return res.status(400).json({ success: false, message: 'ID room tidak valid.' });
    }

    const [rooms] = await db.query('SELECT kode_room FROM room WHERE id_room = ?', [id_room]);
    if (rooms.length === 0) {
      return res.status(404).json({ success: false, message: 'Room tidak ditemukan.' });
    }

    const kode_room = rooms[0].kode_room;

    await db.query('UPDATE room SET status = "mulai" WHERE id_room = ?', [id_room]);

    if (pusher) {
      try {
        await pusher.trigger(`private-quiz-${kode_room}`, 'game-started', {
          message: 'Permainan dimulai!',
          id_room,
          kode_room,
        });
      } catch (pusherErr) {
        console.error('Pusher trigger game-started error:', pusherErr);
      }
    }

    return res.json({ success: true, message: 'Permainan berhasil dimulai.' });
  } catch (error) {
    console.error('Start room error:', error);
    return res.status(500).json({ success: false, message: 'Gagal memulai permainan.' });
  }
});

/**
 * POST /api/rooms/:id_room/end
 * Akhiri permainan (Author / Host)
 */
router.post('/:id_room/end', verifyToken, async (req, res) => {
  try {
    const id_room = parseInt(req.params.id_room);
    if (!id_room) {
      return res.status(400).json({ success: false, message: 'ID room tidak valid.' });
    }

    const [rooms] = await db.query('SELECT kode_room FROM room WHERE id_room = ?', [id_room]);
    if (rooms.length === 0) {
      return res.status(404).json({ success: false, message: 'Room tidak ditemukan.' });
    }

    const kode_room = rooms[0].kode_room;

    await db.query('UPDATE room SET status = "selesai" WHERE id_room = ?', [id_room]);

    if (pusher) {
      try {
        await pusher.trigger(`private-quiz-${kode_room}`, 'game-finished', {
          message: 'Permainan diakhiri oleh host.',
          id_room,
        });
      } catch (pusherErr) {
        console.error('Pusher trigger game-finished error:', pusherErr);
      }
    }

    return res.json({ success: true, message: 'Permainan berhasil diakhiri.' });
  } catch (error) {
    console.error('End room error:', error);
    return res.status(500).json({ success: false, message: 'Gagal mengakhiri permainan.' });
  }
});

/**
 * GET /api/rooms/player/:id_peserta
 * Ambil data peserta (nama + skor) — Menggantikan get_player_state.php
 */
router.get('/player/:id_peserta', async (req, res) => {
  try {
    const id_peserta = parseInt(req.params.id_peserta);
    if (!id_peserta) {
      return res.status(400).json({ success: false, message: 'ID Peserta tidak valid.' });
    }

    const [rows] = await db.query(
      'SELECT nama_guest, skor FROM room_player WHERE id_peserta = ?',
      [id_peserta]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Peserta tidak ditemukan.' });
    }

    return res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Get player state error:', error);
    return res.status(500).json({ success: false, message: 'Gagal mengambil data peserta.' });
  }
});

/**
 * GET /api/rooms/player/:id_peserta/score-details?id_room=...
 * Ambil data ringkasan skor dan review kuis lengkap milik peserta
 * (Menggantikan get_score_detail.php)
 */
router.get('/player/:id_peserta/score-details', async (req, res) => {
  try {
    const id_peserta = parseInt(req.params.id_peserta);
    const id_room = parseInt(req.query.id_room);

    if (!id_peserta || !id_room) {
      return res.status(400).json({ success: false, message: 'ID Peserta dan ID Room wajib diisi.' });
    }

    // 1. Ambil nama guest dan skor
    const [players] = await db.query(
      'SELECT nama_guest, skor FROM room_player WHERE id_peserta = ?',
      [id_peserta]
    );
    if (players.length === 0) {
      return res.status(404).json({ success: false, message: 'Peserta tidak ditemukan.' });
    }
    const { nama_guest, skor } = players[0];

    // 2. Ambil total peserta dan hitung peringkat
    const [allPlayers] = await db.query(
      'SELECT id_peserta FROM room_player WHERE id_room = ? ORDER BY skor DESC, waktu_masuk ASC',
      [id_room]
    );
    const totalPeserta = allPlayers.length;
    const ranking = allPlayers.findIndex(p => p.id_peserta === id_peserta) + 1;

    // 3. Ambil jawaban peserta untuk perhitungan statistik
    const [answers] = await db.query(
      'SELECT benar, waktu_jawab FROM jawaban_room WHERE id_peserta = ? ORDER BY id_soalmlt ASC',
      [id_peserta]
    );

    let totalBenar = 0;
    let totalSalah = 0;
    let waktuTercepat = 30;
    let benarBeruntun = 0;
    let currentStreak = 0;

    for (const ans of answers) {
      if (ans.benar === 1) {
        totalBenar++;
        currentStreak++;
        if (ans.waktu_jawab < waktuTercepat) {
          waktuTercepat = ans.waktu_jawab;
        }
      } else {
        totalSalah++;
        currentStreak = 0;
      }
      if (currentStreak > benarBeruntun) {
        benarBeruntun = currentStreak;
      }
    }

    // Jika tidak ada jawaban benar sama sekali, jadikan waktu tercepat 0
    if (totalBenar === 0) {
      waktuTercepat = 0;
    }

    // 4. Ambil total soal dalam room
    const [soalCount] = await db.query(
      'SELECT COUNT(*) as total FROM soal_mlt WHERE id_room = ?',
      [id_room]
    );
    const totalSoal = soalCount[0]?.total || 0;

    // 5. Ambil data review soal lengkap
    const [reviewRows] = await db.query(
      `SELECT s.pertanyaan, s.jwbn_a, s.jwbn_b, s.jwbn_c, s.jwbn_d, 
              s.jwbn_benar AS kunci_jawaban, 
              j.jawaban AS jawaban_user, 
              j.benar AS benar_user 
       FROM soal_mlt s 
       LEFT JOIN jawaban_room j ON s.id_soalmlt = j.id_soalmlt AND j.id_peserta = ?
       WHERE s.id_room = ? 
       ORDER BY s.id_soalmlt ASC`,
      [id_peserta, id_room]
    );

    const reviewData = reviewRows.map(row => {
      const kunci = (row.kunci_jawaban || '').toString().trim().toUpperCase();
      const user = (row.jawaban_user || '').toString().trim().toUpperCase();
      const isBenar = (kunci === user && user !== '');

      return {
        pertanyaan: row.pertanyaan,
        jwbn_a: row.jwbn_a,
        jwbn_b: row.jwbn_b,
        jwbn_c: row.jwbn_c,
        jwbn_d: row.jwbn_d,
        kunci_jawaban: kunci,
        jawaban_user: user,
        benar_user: isBenar
      };
    });

    return res.json({
      success: true,
      nama_guest,
      skor,
      total_peserta: totalPeserta,
      ranking: ranking > 0 ? ranking : totalPeserta,
      total_benar: totalBenar,
      total_salah: totalSalah,
      waktu_tercepat: waktuTercepat,
      benar_beruntun: benarBeruntun,
      total_soal: totalSoal,
      review: reviewData
    });

  } catch (error) {
    console.error('Get player score details error:', error);
    return res.status(500).json({ success: false, message: 'Gagal mengambil detail skor.' });
  }
});

/**
 * GET /api/rooms/:id_room/scoreboard
 * Ambil data scoreboard: daftar peserta + skor + jawaban per soal
 * (Menggantikan get_scoreboard_data.php)
 */
router.get('/:id_room/scoreboard', async (req, res) => {
  try {
    const id_room = parseInt(req.params.id_room);
    if (!id_room) {
      return res.status(400).json({ success: false, message: 'ID Room tidak valid.' });
    }

    // 1. Ambil kode_room dan nama_room
    const [rooms] = await db.query(
      'SELECT kode_room, nama_room, status FROM room WHERE id_room = ?',
      [id_room]
    );

    if (rooms.length === 0) {
      return res.status(404).json({ success: false, message: 'Room tidak ditemukan.' });
    }

    const { kode_room, nama_room, status } = rooms[0];

    // 2. Ambil semua peserta, diurutkan berdasarkan skor (tertinggi dulu)
    const [players] = await db.query(
      'SELECT id_peserta, nama_guest, skor FROM room_player WHERE id_room = ? ORDER BY skor DESC, waktu_masuk ASC',
      [id_room]
    );

    // 3. Ambil semua jawaban untuk peserta-peserta di room ini
    if (players.length > 0) {
      const playerIds = players.map(p => p.id_peserta);
      const placeholders = playerIds.map(() => '?').join(',');

      const [answers] = await db.query(
        `SELECT id_peserta, benar FROM jawaban_room WHERE id_peserta IN (${placeholders}) ORDER BY id_soalmlt ASC`,
        playerIds
      );

      // Kelompokkan jawaban per peserta
      const answersByPlayer = {};
      for (const row of answers) {
        if (!answersByPlayer[row.id_peserta]) {
          answersByPlayer[row.id_peserta] = [];
        }
        answersByPlayer[row.id_peserta].push({ benar: !!row.benar });
      }

      // Gabungkan jawaban ke data peserta
      for (const player of players) {
        player.jawaban = answersByPlayer[player.id_peserta] || [];
      }
    }

    // 4. Hitung total soal di room
    const [soalCount] = await db.query(
      'SELECT COUNT(*) as total FROM soal_mlt WHERE id_room = ?',
      [id_room]
    );
    const totalSoal = soalCount[0]?.total || 0;

    return res.json({
      success: true,
      kode_room,
      nama_room,
      status,
      total_soal: totalSoal,
      peserta: players,
    });
  } catch (error) {
    console.error('Get scoreboard data error:', error);
    return res.status(500).json({ success: false, message: 'Gagal mengambil data scoreboard.' });
  }
});

/**
 * POST /api/rooms/pusher/auth
 * Endpoint untuk otorisasi Pusher private channel
 */
router.post('/pusher/auth', (req, res) => {
  try {
    const { socket_id, channel_name } = req.body;

    if (!socket_id || !channel_name) {
      return res.status(400).json({ success: false, message: 'socket_id dan channel_name diperlukan.' });
    }

    if (!pusher) {
      return res.status(500).json({ success: false, message: 'Pusher tidak terkonfigurasi.' });
    }

    const authResponse = pusher.authorizeChannel(socket_id, channel_name);
    return res.json(authResponse);
  } catch (error) {
    console.error('Pusher auth error:', error);
    return res.status(500).json({ success: false, message: 'Gagal mengotorisasi channel.' });
  }
});

/**
 * GET /api/rooms/:kode_room
 * Ambil detail room berdasarkan kode_room
 */
router.get('/:kode_room', async (req, res) => {
  try {
    const kode = req.params.kode_room.trim().toUpperCase();
    const [rooms] = await db.query(
      'SELECT id_room, kode_room, nama_room, status, id_pembuat FROM room WHERE kode_room = ?',
      [kode]
    );

    if (rooms.length === 0) {
      return res.status(404).json({ success: false, message: 'Room tidak ditemukan.' });
    }

    return res.json({ success: true, room: rooms[0] });
  } catch (error) {
    console.error('Get room error:', error);
    return res.status(500).json({ success: false, message: 'Gagal mengambil detail room.' });
  }
});

module.exports = router;
