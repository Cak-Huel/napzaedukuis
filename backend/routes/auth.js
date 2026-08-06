const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

const crypto = require('crypto');
const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');

// Rate limiters for DDoS and Spam protection
const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 registrations per 15 minutes
  message: { success: false, message: 'Terlalu banyak permintaan registrasi dari IP ini. Silakan coba lagi nanti.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const resendLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Limit each IP to 3 resends per 15 minutes
  message: { success: false, message: 'Terlalu banyak permintaan kirim ulang verifikasi. Silakan coba lagi nanti.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Helper to get nodemailer transporter
async function getMailTransporter() {
  // If SMTP configs are defined in env, use them
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Fallback to auto-created Ethereal developer test account
  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
}

// Helper to send verification email
async function sendVerificationEmail(email, name, token) {
  const transporter = await getMailTransporter();
  const baseUrl = process.env.APP_URL || 'http://localhost:5000';
  const verifyUrl = `${baseUrl}/api/auth/verify-email?token=${token}`;

  const mailOptions = {
    from: process.env.SMTP_FROM || '"Napza Edu Card" <noreply@napzaeducard.com>',
    to: email,
    subject: 'Verifikasi Email Akun Napza Edu Card',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #1f8dff; text-align: center;">Napza Edu Card</h2>
        <p>Halo <strong>${name}</strong>,</p>
        <p>Terima kasih telah mendaftar di Napza Edu Card. Untuk mengaktifkan akun Anda, silakan klik tombol verifikasi di bawah ini:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verifyUrl}" style="background-color: #1f8dff; color: white; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 5px; display: inline-block;">Verifikasi Email</a>
        </div>
        <p>Tautan ini akan kedaluwarsa dalam 24 jam.</p>
        <p>Jika tombol di atas tidak berfungsi, Anda juga dapat membuka link berikut di browser Anda:</p>
        <p><a href="${verifyUrl}">${verifyUrl}</a></p>
        <hr style="border: 0; border-top: 1px solid #eee; margin-top: 30px;">
        <p style="font-size: 12px; color: #888; text-align: center;">Ini adalah email otomatis, mohon tidak membalas email ini.</p>
      </div>
    `,
  };

  const info = await transporter.sendMail(mailOptions);
  
  // If using Ethereal, log the preview URL
  if (nodemailer.getTestMessageUrl(info)) {
    console.log(`✉️ Ethereal Email Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    return nodemailer.getTestMessageUrl(info);
  }
  return null;
}

/**
 * POST /api/auth/register
 * Body: { nama, email, password }
 */
router.post('/register', registerLimiter, async (req, res) => {
  try {
    const { nama, email, password } = req.body;

    if (!nama || !email || !password) {
      return res.status(400).json({ success: false, message: 'Semua bidang wajib diisi.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Format email tidak valid.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password minimal 6 karakter.' });
    }

    // Cek apakah email sudah terdaftar
    const [existing] = await pool.execute('SELECT id_user FROM orang WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'Email sudah terdaftar.' });
    }

    // Hash password & generate verification token
    const passwordHash = await bcrypt.hash(password, 10);
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date();
    expires.setHours(expires.getHours() + 24); // Expires in 24 hours

    // Insert user as unverified
    await pool.execute(
      'INSERT INTO orang (nama, email, password, is_verified, verification_token, verification_expires) VALUES (?, ?, ?, 0, ?, ?)',
      [nama.trim(), email.trim(), passwordHash, token, expires]
    );

    // Send email
    const previewUrl = await sendVerificationEmail(email, nama, token);

    return res.status(201).json({
      success: true,
      message: 'Registrasi berhasil! Silakan cek email Anda untuk melakukan verifikasi.',
      preview_url: previewUrl // Dikirim ke client untuk testing jika memakai Ethereal
    });

  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
});

/**
 * GET /api/auth/verify-email
 * Query: token
 */
router.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).send('<h2>Token verifikasi tidak ditemukan.</h2>');
    }

    // Cari user dengan token yang valid dan belum kedaluwarsa
    const [rows] = await pool.execute(
      'SELECT id_user FROM orang WHERE verification_token = ? AND verification_expires > NOW()',
      [token]
    );

    if (rows.length === 0) {
      return res.status(400).send('<h2>Tautan verifikasi tidak valid atau telah kedaluwarsa.</h2>');
    }

    const userId = rows[0].id_user;

    // Verifikasi user dan hapus token
    await pool.execute(
      'UPDATE orang SET is_verified = 1, verification_token = NULL, verification_expires = NULL WHERE id_user = ?',
      [userId]
    );

    const frontendUrl = process.env.FRONTEND_URL || (process.env.APP_URL ? process.env.APP_URL : 'http://localhost:5173');
    // Tampilkan halaman sukses sederhana (bisa diredirect ke frontend login page nantinya)
    return res.send(`
      <div style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
        <h2 style="color: #4CAF50;">Email Berhasil Diverifikasi!</h2>
        <p>Akun Napza Edu Card Anda sekarang sudah aktif.</p>
        <p>Silakan kembali ke aplikasi dan login.</p>
        <a href="${frontendUrl}/login" style="background-color: #1f8dff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Ke Halaman Login</a>
      </div>
    `);

  } catch (error) {
    console.error('Email verification error:', error);
    return res.status(500).send('<h2>Terjadi kesalahan server saat verifikasi email.</h2>');
  }
});

/**
 * POST /api/auth/resend-verification
 * Body: { email }
 */
router.post('/resend-verification', resendLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email harus diisi.' });
    }

    // Cari user
    const [rows] = await pool.execute(
      'SELECT id_user, nama, is_verified FROM orang WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Email tidak ditemukan.' });
    }

    const user = rows[0];

    if (user.is_verified) {
      return res.status(400).json({ success: false, message: 'Akun ini sudah diverifikasi.' });
    }

    // Generate token baru
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date();
    expires.setHours(expires.getHours() + 24);

    await pool.execute(
      'UPDATE orang SET verification_token = ?, verification_expires = ? WHERE id_user = ?',
      [token, expires, user.id_user]
    );

    const previewUrl = await sendVerificationEmail(email, user.nama, token);

    return res.json({
      success: true,
      message: 'Email verifikasi baru berhasil dikirim!',
      preview_url: previewUrl
    });

  } catch (error) {
    console.error('Resend verification error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
});

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
      'SELECT id_user, password, nama, role, is_verified FROM orang WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Email tidak ditemukan.',
      });
    }

    const user = rows[0];

    // Cek verifikasi email
    if (user.is_verified === 0 || !user.is_verified) {
      return res.status(403).json({
        success: false,
        requiresVerification: true,
        email: email,
        message: 'Akun Anda belum terverifikasi. Silakan cek email Anda atau kirim ulang tautan verifikasi.',
      });
    }

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

/**
 * PUT /api/auth/profile/password
 * Header: Authorization: Bearer <token>
 * Body: { oldPassword, newPassword }
 */
router.put('/profile/password', verifyToken, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Password lama dan baru wajib diisi.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password baru minimal 6 karakter.' });
    }

    const [rows] = await pool.execute(
      'SELECT password FROM orang WHERE id_user = ?',
      [req.user.id_user]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan.' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Password lama salah.' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.execute(
      'UPDATE orang SET password = ? WHERE id_user = ?',
      [hashed, req.user.id_user]
    );

    res.json({ success: true, message: 'Password berhasil diperbarui.' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: 'Gagal memperbarui password.' });
  }
});

module.exports = router;
