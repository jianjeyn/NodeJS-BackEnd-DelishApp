// middleware/auth.js
const jwt = require('jsonwebtoken');

// Middleware untuk verifikasi token
module.exports = function (req, res, next) {
  // Ambil token dari header Authorization
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: Bearer token

  if (!token) {
    return res.status(401).json({ message: 'Token tidak ditemukan' });
  }

  try {
    const secret = process.env.JWT_SECRET;
    const decoded = jwt.verify(token, secret);
    req.user = decoded; // Simpan data user yang sudah di-decode ke request
    next(); // Lanjut ke controller
  } catch (err) {
    return res.status(403).json({ message: 'Token tidak valid' });
  }
};
