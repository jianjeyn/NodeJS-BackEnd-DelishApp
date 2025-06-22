/*
================================================================
|          FILE 7: Router Utama (Titik Pusat)                  |
================================================================
| Lokasi: src/routes/index.js                                  |
| Deskripsi: Menggabungkan semua file rute menjadi satu.       |
================================================================
*/
const express = require('express');
const router = express.Router();

// Import semua router
const authRoutes = require('./authRoutes');
const recipeRoutes = require('./recipeRoutes');
const profileRoutes = require('./profileRoutes');
const communityRoutes = require('./communityRoutes');
const notificationRoutes = require('./notificationRoutes');
const homePageController = require('../controllers/homePage.controller');
const searchController = require('../controllers/searchController');
const trendingController = require('../controllers/trendingController');
const verifyToken = require('../middleware/verifyToken');


// Gunakan router berdasarkan prefix URL
router.use('/auth', authRoutes);
router.use('/recipes', recipeRoutes);
router.use('/profile', profileRoutes);
router.use('/communities', communityRoutes);
router.use('/notifications', notificationRoutes);

// Rute-rute umum
router.get('/home', verifyToken, homePageController.index); // Memerlukan auth untuk 'your_recipes'
router.get('/search', searchController.searchPage);
router.get('/trending', trendingController.index);
router.get('/trending/:id', trendingController.show);


module.exports = router;
