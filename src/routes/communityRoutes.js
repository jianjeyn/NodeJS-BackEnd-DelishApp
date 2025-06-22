/*
================================================================
|                  FILE 5: Rute Komunitas                      |
================================================================
| Lokasi: src/routes/communityRoutes.js                        |
| Deskripsi: Rute untuk data komunitas.                        |
================================================================
*/
const express = require('express');
const router = express.Router();
const communityController = require('../controllers/communityController');
const verifyToken = require('../middleware/verifyToken');

// Rute Publik
router.get('/', communityController.index);
router.get('/:id', communityController.show);

// Rute Terproteksi
router.post('/:id/add-user', verifyToken, communityController.addUser);
router.post('/:id/remove-user', verifyToken, communityController.removeUser);

module.exports = router;