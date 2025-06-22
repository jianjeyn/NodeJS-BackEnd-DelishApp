const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const { body } = require('express-validator');

console.log('🔗 Setting up profile routes...');

// Try to load optionalAuth, fallback if not available
let optionalAuth;
try {
  optionalAuth = require('../middleware/optionalAuth');
  console.log('✅ optionalAuth middleware loaded');
} catch (error) {
  console.log('⚠️ optionalAuth middleware not found, creating fallback');
  // Fallback optionalAuth middleware
  optionalAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const jwt = require('jsonwebtoken');
      const token = authHeader.substring(7);
      
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
      } catch (error) {
        req.user = null;
      }
    } else {
      req.user = null;
    }
    
    next();
  };
}

// Setup multer untuk upload foto profile
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/user_foto/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Error: Only image files (jpg, jpeg, png) are allowed!');
    }
  }
});

// Validation middleware untuk update profile
const updateProfileValidation = [
  body('name')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Name maksimal 255 karakter'),
    
  body('username')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Username maksimal 50 karakter')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username hanya boleh berisi huruf, angka, dan underscore'),
    
  body('presentation')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Presentation maksimal 500 karakter'),
    
  body('add_link')
    .optional()
    .isURL()
    .withMessage('Add link harus berupa URL yang valid')
    .isLength({ max: 255 })
    .withMessage('Add link maksimal 255 karakter')
];

// Debug: Check functions before using
console.log('🔍 Checking profileController functions:');
console.log('   - index:', typeof profileController.index);
console.log('   - update:', typeof profileController.update);
console.log('   - followers:', typeof profileController.followers);
console.log('   - following:', typeof profileController.following);
console.log('   - followUser:', typeof profileController.followUser);
console.log('   - unfollowUser:', typeof profileController.unfollowUser);
console.log('   - getPublicProfile:', typeof profileController.getPublicProfile);

// Public endpoints (tidak perlu auth)
if (typeof profileController.generateQRCode === 'function') {
  router.get('/qr/:id', profileController.generateQRCode);
  console.log('✅ GET /qr/:id route setup successful');
}

// Public profile dengan optional auth untuk cek following status
if (typeof profileController.getPublicProfile === 'function') {
  router.get('/public/:id', optionalAuth, profileController.getPublicProfile);
  console.log('✅ GET /public/:id route setup successful');
} else {
  console.error('❌ profileController.getPublicProfile is not a function');
}

// API search endpoints - Public dengan pagination
if (typeof profileController.apiSearchFollowers === 'function') {
  router.get('/api/search-followers/:username', profileController.apiSearchFollowers);
  console.log('✅ GET /api/search-followers/:username route setup successful');
}

if (typeof profileController.apiSearchFollowing === 'function') {
  router.get('/api/search-following/:username', profileController.apiSearchFollowing);
  console.log('✅ GET /api/search-following/:username route setup successful');
}

// Protected endpoints (perlu auth)
router.use(auth);

// GET /api/profile - Display user profile with recipes and favorites
if (typeof profileController.index === 'function') {
  router.get('/', profileController.index);
  console.log('✅ GET / route setup successful');
} else {
  console.error('❌ profileController.index is not a function');
}

// GET /api/profile/share - Get profile share data
if (typeof profileController.shareProfile === 'function') {
  router.get('/share', profileController.shareProfile);
  console.log('✅ GET /share route setup successful');
}

// GET /api/profile/followers - Display followers list
if (typeof profileController.followers === 'function') {
  router.get('/followers', profileController.followers);
  console.log('✅ GET /followers route setup successful');
} else {
  console.error('❌ profileController.followers is not a function');
}

// GET /api/profile/following - Display following list  
if (typeof profileController.following === 'function') {
  router.get('/following', profileController.following);
  console.log('✅ GET /following route setup successful');
} else {
  console.error('❌ profileController.following is not a function');
}

// PUT /api/profile - Update user profile
if (typeof profileController.update === 'function') {
  router.put('/', upload.single('foto'), updateProfileValidation, profileController.update);
  console.log('✅ PUT / route setup successful');
} else {
  console.error('❌ profileController.update is not a function');
}

// POST /api/profile/follow/:userId - Follow user
if (typeof profileController.followUser === 'function') {
  router.post('/follow/:userId', profileController.followUser);
  console.log('✅ POST /follow/:userId route setup successful');
} else {
  console.error('❌ profileController.followUser is not a function');
}

// DELETE /api/profile/unfollow/:userId - Unfollow user
if (typeof profileController.unfollowUser === 'function') {
  router.delete('/unfollow/:userId', profileController.unfollowUser);
  console.log('✅ DELETE /unfollow/:userId route setup successful');
} else {
  console.error('❌ profileController.unfollowUser is not a function');
}

// POST /api/profile/toggle-follow/:userId - Toggle follow status
if (typeof profileController.toggleFollow === 'function') {
  router.post('/toggle-follow/:userId', profileController.toggleFollow);
  console.log('✅ POST /toggle-follow/:userId route setup successful');
}

// POST /api/profile/favorites/:recipeId - Add recipe to favorites
if (typeof profileController.addToFavorites === 'function') {
  router.post('/favorites/:recipeId', profileController.addToFavorites);
  console.log('✅ POST /favorites/:recipeId route setup successful');
}

// DELETE /api/profile/favorites/:recipeId - Remove recipe from favorites
if (typeof profileController.removeFromFavorites === 'function') {
  router.delete('/favorites/:recipeId', profileController.removeFromFavorites);
  console.log('✅ DELETE /favorites/:recipeId route setup successful');
}

// POST /api/profile/toggle-favorite/:recipeId - Toggle favorite status
if (typeof profileController.toggleFavorite === 'function') {
  router.post('/toggle-favorite/:recipeId', profileController.toggleFavorite);
  console.log('✅ POST /toggle-favorite/:recipeId route setup successful');
}

console.log('✅ Profile routes setup complete');

module.exports = router;