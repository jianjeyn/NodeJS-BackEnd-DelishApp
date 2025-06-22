/*
======================================================
| File: src/routes/userRoutes.js                     |
| Deskripsi: Rute untuk profil dan data pengguna.    |
======================================================
*/
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController'); // Ubah ke nama file controller yang benar
const authMiddleware = require('../middleware/authMiddleware');

// Rute untuk mendapatkan data profil pengguna yang sedang login
router.get('/profile', authMiddleware, userController.getProfile);

// Rute untuk memperbarui profil pengguna
router.put('/profile', authMiddleware, userController.updateProfile);

// Rute untuk follow/unfollow
router.post('/follow/:userId', authMiddleware, userController.toggleFollow);

// Rute untuk mendapatkan daftar followers dan following
router.get('/followers', authMiddleware, userController.getFollowers);
router.get('/following', authMiddleware, userController.getFollowing);

// Rute untuk toggle favorit
router.post('/favorites/:recipeId', authMiddleware, userController.toggleFavorite);

module.exports = router;