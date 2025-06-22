
/*
======================================================
| File: src/routes/index.js (Router Utama)           |
| Deskripsi: Menggabungkan semua file rute menjadi   |
| satu router utama untuk diekspor ke app.js.        |
======================================================
*/
const express = require('express');
const router = express.Router();

// Impor semua file rute
const authRoutes = require('./authRoutes');
const recipeRoutes = require('./recipeRoutes');
const userRoutes = require('./userRoutes');
const reviewRoutes = require('./reviewRoutes');
const generalRoutes = require('./generalRoutes');

// Daftarkan setiap rute dengan prefixnya masing-masing
router.use('/auth', authRoutes);
router.use('/recipes', recipeRoutes);
router.use('/users', userRoutes); // Rute untuk profil, follow, dll.
router.use('/reviews', reviewRoutes);

// Untuk rute umum seperti /home, /search
router.use('/', generalRoutes);

module.exports = router;
