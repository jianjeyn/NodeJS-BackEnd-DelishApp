/*
================================================================
|               FILE 6: Rute Notifikasi                        |
================================================================
| Lokasi: src/routes/notificationRoutes.js                     |
| Deskripsi: Rute untuk notifikasi pengguna.                   |
================================================================
*/
const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const verifyToken = require('../middleware/verifyToken');

// Semua rute notifikasi memerlukan login
router.use(verifyToken);

router.get('/', notificationController.getAllNotifications); // Sesuaikan nama fungsi jika berbeda
router.patch('/:id/read', notificationController.markAsRead);

module.exports = router;
