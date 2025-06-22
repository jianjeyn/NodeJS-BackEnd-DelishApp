const express = require('express');
const router = express.Router();
const authController = require('../controllers/authControllers');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

console.log('🔗 Setting up auth routes...');

// Setup multer untuk upload foto
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

// Import validators
const { registerRules, loginRules, changePasswordRules } = require('../validators/authValidator');

// Debug: Check if controller functions exist
console.log('🔍 Checking authController functions:');
console.log('   - register:', typeof authController.register);
console.log('   - login:', typeof authController.login);
console.log('   - getUser:', typeof authController.getUser);
console.log('   - logout:', typeof authController.logout);
console.log('   - changePassword:', typeof authController.changePassword);

// =========================
// PUBLIC ROUTES (NO AUTH REQUIRED)
// =========================

// Test route untuk debugging - HARUS SEBELUM PROTECTED ROUTES
router.get('/test', (req, res) => {
  res.json({
    status: 'success',
    message: 'Auth routes are working!',
    timestamp: new Date().toISOString(),
    available_endpoints: {
      public: [
        'GET /api/auth/test',
        'POST /api/auth/register',
        'POST /api/auth/login'
      ],
      protected: [
        'GET /api/auth/user',
        'POST /api/auth/logout',
        'PUT /api/auth/change-password'
      ]
    }
  });
});

// Tambahkan route untuk root /api/auth
router.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'DelishApp Auth API',
    version: '1.0.0',
    endpoints: {
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      user: 'GET /api/auth/user (requires token)',
      logout: 'POST /api/auth/logout (requires token)',
      changePassword: 'PUT /api/auth/change-password (requires token)'
    }
  });
});

// POST /api/auth/register
if (typeof authController.register === 'function') {
  router.post('/register', upload.single('foto'), registerRules, authController.register);
  console.log('✅ POST /register route setup successful');
} else {
  console.error('❌ authController.register is not a function');
}

// POST /api/auth/login
if (typeof authController.login === 'function') {
  router.post('/login', loginRules, authController.login);
  console.log('✅ POST /login route setup successful');
} else {
  console.error('❌ authController.login is not a function');
}

// =========================
// PROTECTED ROUTES (AUTH REQUIRED)
// =========================
router.use(auth);

// GET /api/auth/user
if (typeof authController.getUser === 'function') {
  router.get('/user', authController.getUser);
  console.log('✅ GET /user route setup successful');
} else {
  console.error('❌ authController.getUser is not a function');
}

// POST /api/auth/logout
if (typeof authController.logout === 'function') {
  router.post('/logout', authController.logout);
  console.log('✅ POST /logout route setup successful');
} else {
  console.error('❌ authController.logout is not a function');
}

// PUT /api/auth/change-password
if (typeof authController.changePassword === 'function') {
  router.put('/change-password', changePasswordRules, authController.changePassword);
  console.log('✅ PUT /change-password route setup successful');
} else {
  console.error('❌ authController.changePassword is not a function');
}

// POST /api/auth/forgot-password (placeholder)
if (typeof authController.forgotPassword === 'function') {
  router.post('/forgot-password', authController.forgotPassword);
}

// POST /api/auth/reset-password (placeholder)
if (typeof authController.resetPassword === 'function') {
  router.post('/reset-password', authController.resetPassword);
}

console.log('✅ Auth routes setup complete');

module.exports = router;