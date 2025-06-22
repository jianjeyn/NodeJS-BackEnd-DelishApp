const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const { body } = require('express-validator');

console.log('🔗 Setting up review routes...');

// Setup multer untuk upload foto review
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/reviews/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Error: Only image files are allowed!');
    }
  }
});

// Validation rules sesuai dengan PHP version
const reviewValidation = [
  body('deskripsi').optional().isString().withMessage('Description must be a string'),
  body('bintang').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5')
];

// Test route untuk debug
router.get('/test', (req, res) => {
  console.log('🧪 Review routes test endpoint hit');
  res.json({ 
    message: 'Review routes are working',
    available_routes: [
      'POST /recipes/:recipeId/reviews - Create review',
      'GET /recipes/:recipeId/reviews - Get reviews for recipe',
      'PUT /reviews/:id - Update review (legacy)',
      'DELETE /reviews/:id - Delete review (legacy)'
    ]
  });
});

// Routes sesuai dengan pattern PHP Laravel
// POST /api/recipes/:recipeId/reviews - Buat review baru (butuh auth)
router.post('/recipes/:recipeId/reviews', auth, upload.single('foto'), reviewValidation, (req, res, next) => {
  console.log(`📝 Create review route hit for recipe: ${req.params.recipeId}`);
  reviewController.store(req, res, next);
});

// GET /api/recipes/:recipeId/reviews - Ambil review untuk resep tertentu (publik)
router.get('/recipes/:recipeId/reviews', (req, res, next) => {
  console.log(`📋 Get reviews route hit for recipe: ${req.params.recipeId}`);
  reviewController.index(req, res, next);
});

// Legacy routes (untuk backward compatibility)
// PUT /api/reviews/:id - Update review (butuh auth)
router.put('/reviews/:id', auth, upload.single('foto'), reviewValidation, (req, res, next) => {
  console.log(`📝 Update review route hit: ${req.params.id}`);
  reviewController.update(req, res, next);
});

// DELETE /api/reviews/:id - Hapus review (butuh auth)
router.delete('/reviews/:id', auth, (req, res, next) => {
  console.log(`🗑️ Delete review route hit: ${req.params.id}`);
  reviewController.destroy(req, res, next);
});

console.log('✅ Review routes setup complete');

module.exports = router;