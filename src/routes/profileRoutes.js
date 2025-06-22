const express = require('express');
const router = express.Router();

console.log('🔍 Loading profileController...');
const profileController = require('../controllers/profileController');
console.log('✅ profileController loaded, methods:', Object.keys(profileController));

const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

console.log('🔗 Setting up profile routes...');

// Setup multer untuk upload foto profile
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/avatars/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
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

// Debug: Check functions before using
console.log('🔍 Checking profileController functions:');
console.log('   - show:', typeof profileController.show);
console.log('   - update:', typeof profileController.update);
console.log('   - getFollowers:', typeof profileController.getFollowers);
console.log('   - getFollowing:', typeof profileController.getFollowing);
console.log('   - followUser:', typeof profileController.followUser);
console.log('   - unfollowUser:', typeof profileController.unfollowUser);
console.log('   - getPublicProfile:', typeof profileController.getPublicProfile);

// Routes setup
if (typeof profileController.show === 'function') {
  router.get('/', auth, profileController.show);
  console.log('✅ GET / route setup successful');
} else {
  console.error('❌ profileController.show is not a function');
}

if (typeof profileController.update === 'function') {
  router.put('/', auth, upload.single('foto'), profileController.update);
  console.log('✅ PUT / route setup successful');
} else {
  console.error('❌ profileController.update is not a function');
}

if (typeof profileController.getFollowers === 'function') {
  router.get('/followers', auth, profileController.getFollowers);
  console.log('✅ GET /followers route setup successful');
} else {
  console.error('❌ profileController.getFollowers is not a function');
}

if (typeof profileController.getFollowing === 'function') {
  router.get('/following', auth, profileController.getFollowing);
  console.log('✅ GET /following route setup successful');
} else {
  console.error('❌ profileController.getFollowing is not a function');
}

if (typeof profileController.followUser === 'function') {
  router.post('/follow/:userId', auth, profileController.followUser);
  console.log('✅ POST /follow/:userId route setup successful');
} else {
  console.error('❌ profileController.followUser is not a function');
}

if (typeof profileController.unfollowUser === 'function') {
  router.delete('/unfollow/:userId', auth, profileController.unfollowUser);
  console.log('✅ DELETE /unfollow/:userId route setup successful');
} else {
  console.error('❌ profileController.unfollowUser is not a function');
}

if (typeof profileController.getPublicProfile === 'function') {
  router.get('/:id', profileController.getPublicProfile);
  console.log('✅ GET /:id route setup successful');
} else {
  console.error('❌ profileController.getPublicProfile is not a function');
}

console.log('✅ Profile routes setup complete');

module.exports = router;