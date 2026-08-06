const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

/**
 * POST /api/auth/login
 * Body: { email, password }
 * Response: { success, token, user: { id_user, nama, role } }
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validasi input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email dan password harus diisi.',
      });
    }

    // Cari user berdasarkan email
    const [rows] = await pool.execute(
      'SELECT id_user, password, nama, role FROM orang WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Email tidak ditemukan.',
      });
    }

    const user = rows[0];

    // Verifikasi password (hash dari PHP password_hash)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Password salah.',
      });
    }

    // Buat JWT token
    const tokenPayload = {
      id_user: user.id_user,
      nama: user.nama,
      role: user.role || 'user',
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });

    // Kirim response sukses
    res.json({
      success: true,
      message: `Selamat datang, ${user.nama}!`,
      token,
      user: {
        id_user: user.id_user,
        nama: user.nama,
        role: user.role || 'user',
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server. Silakan coba lagi.',
    });
  }
});

/**
 * GET /api/auth/me
 * Header: Authorization: Bearer <token>
 * Response: { success, user: { id_user, nama, email, role } }
 */
router.get('/me', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id_user, nama, email, role FROM orang WHERE id_user = ?',
      [req.user.id_user]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan.',
      });
    }

    res.json({
      success: true,
      user: rows[0],
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server.',
    });
  }
});

module.exports = router;
