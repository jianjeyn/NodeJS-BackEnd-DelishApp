/*
======================================================
| File: src/routes/reviewRoutes.js                   |
| Deskripsi: Rute untuk ulasan resep.                |
======================================================
*/
const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const authMiddleware = require('../middleware/authMiddleware');

// Mendapatkan semua review untuk resep tertentu (publik)
router.get('/recipe/:resep_id', reviewController.index);

// Menambahkan review baru (memerlukan login)
router.post('/', authMiddleware, reviewController.store);

module.exports = router;
