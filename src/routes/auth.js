/*
================================================================
|                    IMPORTANT INSTRUCTIONS                    |
================================================================
| 1. Buat folder baru bernama 'routes' di dalam direktori 'src'.|
| 2. Buat folder baru bernama 'middleware' di dalam 'src'.     |
| 3. Buat folder baru bernama 'validators' di dalam 'src'.     |
| 4. Salin setiap file di bawah ini ke dalam folder yang       |
|    sesuai.                                                   |
| 5. Pastikan untuk menghubungkan router utama di 'app.js'.    |
================================================================
*/


/*
======================================================
| File: src/validators/authValidator.js              |
| Deskripsi: Aturan validasi untuk rute autentikasi. |
======================================================
*/
const { body } = require('express-validator');

exports.registerRules = [
    body('name', 'Nama lengkap tidak boleh kosong').notEmpty(),
    body('username', 'Username tidak boleh kosong').notEmpty(),
    body('email', 'Format email tidak valid').isEmail().normalizeEmail(),
    body('password', 'Password minimal harus 6 karakter').isLength({ min: 6 })
];

exports.loginRules = [
    body('email', 'Format email tidak valid').isEmail().normalizeEmail(),
    body('password', 'Password tidak boleh kosong').notEmpty()
];

exports.changePasswordRules = [
    body('current_password', 'Password saat ini tidak boleh kosong').notEmpty(),
    body('password', 'Password baru minimal harus 6 karakter').isLength({ min: 6 }),
    body('passwordConfirmation').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Konfirmasi password tidak cocok dengan password baru');
        }
        return true;
    })
];

