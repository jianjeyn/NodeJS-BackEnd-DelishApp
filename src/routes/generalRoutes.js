/*
======================================================
| File: src/routes/generalRoutes.js                  |
| Deskripsi: Rute umum untuk homepage, search, dll.  |
======================================================
*/
const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homePage.controller');
const searchController = require('../controllers/searchController');
const trendingController = require('../controllers/trendingController');
const authMiddleware = require('../middleware/authMiddleware');

// Menggunakan authMiddleware agar bisa mendapatkan 'your_recipes'
router.get('/home', authMiddleware, homeController.index);

// Rute search, bisa diakses publik tapi beberapa data (seperti rekomendasi) lebih baik dengan auth
router.get('/search', authMiddleware, searchController.searchPage);

// Rute untuk trending
router.get('/trending', trendingController.index);

module.exports = router;