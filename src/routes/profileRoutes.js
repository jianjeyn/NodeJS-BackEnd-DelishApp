/*
================================================================
|                 FILE 4: Rute Profil & User                   |
================================================================
| Lokasi: src/routes/profileRoutes.js                          |
| Deskripsi: Mengelola profil, follow, dan interaksi user.     |
================================================================
*/
const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const verifyToken = require('../middleware/verifyToken');

// Semua rute di sini memerlukan login, jadi kita gunakan middleware di awal
router.use(verifyToken);

router.get('/', profileController.index);
router.put('/', profileController.update);
router.get('/followers', profileController.followers);
router.get('/following', profileController.following);
router.post('/follow/:userId', profileController.followUser);
router.get('/share', profileController.shareProfile);
router.get('/:username/followers/search', profileController.apiSearchFollowers);
router.get('/:username/following/search', profileController.apiSearchFollowing);

module.exports = router;
