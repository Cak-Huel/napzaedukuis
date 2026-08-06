const jwt = require('jsonwebtoken');

/**
 * Middleware: verifikasi JWT token dari header Authorization.
 * Menyimpan data user di req.user jika valid.
 */
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer <token>"

  if (!token) {
    return res.status(401).json({ success: false, message: 'Token tidak ditemukan. Silakan login.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id_user, nama, role, iat, exp }
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: 'Token tidak valid atau sudah kadaluarsa.' });
  }
}

/**
 * Middleware: hanya izinkan admin.
 * Harus dipanggil SETELAH verifyToken.
 */
function requireAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ success: false, message: 'Akses ditolak. Hanya admin yang diizinkan.' });
  }
}

module.exports = { verifyToken, requireAdmin };
