/*
==================================================
| File: src/middleware/authMiddleware.js         |
| Deskripsi: Middleware untuk memverifikasi JWT  |
| dan melindungi rute.                           |
==================================================
*/
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    // Mengambil token dari header 'Authorization'
    const authHeader = req.header('Authorization');

    // Cek jika header atau format token tidak ada
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Akses ditolak. Token tidak disediakan atau format salah.' });
    }

    // Ekstrak token dari header (setelah "Bearer ")
    const token = authHeader.split(' ')[1];

    try {
        // Verifikasi token menggunakan secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Menambahkan payload (data user) dari token ke object request
        req.user = decoded;
        next(); // Lanjutkan ke controller/middleware berikutnya
    } catch (ex) {
        // Jika token tidak valid atau kedaluwarsa
        res.status(400).json({ message: 'Token tidak valid.' });
    }
};

module.exports = authMiddleware;

