/*
======================================================
| File: src/routes/recipeRoutes.js                   |
| Deskripsi: Rute untuk semua operasi terkait resep. |
======================================================
*/
const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');
const authMiddleware = require('../middleware/authMiddleware');

// Rute untuk mendapatkan semua resep (publik)
router.get('/', recipeController.index);

// Rute untuk mendapatkan detail satu resep (publik)
router.get('/:id', recipeController.show);

// Rute yang memerlukan otentikasi untuk membuat, update, dan hapus
router.post('/', authMiddleware, recipeController.store);
router.put('/:id', authMiddleware, recipeController.update); // Sebaiknya gunakan PUT untuk update
router.delete('/:id', authMiddleware, recipeController.destroy);

module.exports = router;

