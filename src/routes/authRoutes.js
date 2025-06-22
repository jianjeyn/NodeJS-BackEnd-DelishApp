/*
======================================================
| File: src/routes/authRoutes.js                     |
| Deskripsi: Rute untuk autentikasi (login,         |
| register, dll.).                                   |
======================================================
*/
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authControllers'); // Sesuaikan nama file controller Anda
const authMiddleware = require('../middleware/authMiddleware');
const { registerRules, loginRules, changePasswordRules } = require('../validators/authValidator');

// Rute Publik (tidak perlu login)
router.post('/register', registerRules, authController.register);
router.post('/login', loginRules, authController.login);

// Rute yang memerlukan otentikasi (dilindungi oleh authMiddleware)
router.get('/me', authMiddleware, authController.getUser); // Mengambil data user yang login
router.post('/logout', authMiddleware, authController.logout);
router.post('/change-password', authMiddleware, changePasswordRules, authController.changePassword);

// Rute untuk lupa/reset password (implementasi lanjutan)
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

module.exports = router;