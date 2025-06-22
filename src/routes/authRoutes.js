const express = require('express');
const router = express.Router();

// Debug: Test import
console.log('🔍 Loading authController...');
const authController = require('../controllers/authControllers');
console.log('✅ authController loaded, available methods:', Object.keys(authController));

console.log('🔍 Loading authMiddleware...');
const authMiddleware = require('../middleware/authMiddleware');
console.log('✅ authMiddleware loaded, type:', typeof authMiddleware);

console.log('🔍 Loading validators...');
try {
  const validators = require('../validators/authValidator');
  console.log('✅ Validators module loaded:', Object.keys(validators));
  
  const { registerRules, loginRules, changePasswordRules } = validators;
  console.log('✅ Validators destructured:');
  console.log('   - registerRules:', Array.isArray(registerRules) ? 'Array' : typeof registerRules);
  console.log('   - loginRules:', Array.isArray(loginRules) ? 'Array' : typeof loginRules);
  console.log('   - changePasswordRules:', Array.isArray(changePasswordRules) ? 'Array' : typeof changePasswordRules);

  // Test apakah function ada
  console.log('🔍 Checking authController functions:');
  console.log('   - register:', typeof authController.register);
  console.log('   - login:', typeof authController.login);
  console.log('   - getUser:', typeof authController.getUser);
  console.log('   - logout:', typeof authController.logout);
  console.log('   - changePassword:', typeof authController.changePassword);
  console.log('   - forgotPassword:', typeof authController.forgotPassword);
  console.log('   - resetPassword:', typeof authController.resetPassword);

  // Rute Publik (tidak perlu login)
  console.log('🔗 Setting up public routes...');
  
  // Register route
  if (Array.isArray(registerRules) && typeof authController.register === 'function') {
    router.post('/register', registerRules, authController.register);
    console.log('✅ Register route setup successful');
  } else {
    console.error('❌ Register route setup failed - registerRules or authController.register invalid');
  }
  
  // Login route
  if (Array.isArray(loginRules) && typeof authController.login === 'function') {
    router.post('/login', loginRules, authController.login);
    console.log('✅ Login route setup successful');
  } else {
    console.error('❌ Login route setup failed - loginRules or authController.login invalid');
  }

  // Rute yang memerlukan otentikasi (dilindungi oleh authMiddleware)
  console.log('🔗 Setting up protected routes...');
  router.get('/me', authMiddleware, authController.getUser);
  router.post('/logout', authMiddleware, authController.logout);
  router.post('/change-password', authMiddleware, changePasswordRules, authController.changePassword);

  // Rute untuk lupa/reset password
  console.log('🔗 Setting up password reset routes...');
  router.post('/forgot-password', authController.forgotPassword);
  router.post('/reset-password', authController.resetPassword);

  console.log('✅ All auth routes setup complete');

} catch (error) {
  console.error('❌ Error loading validators:', error.message);
  
  // Fallback tanpa validators
  console.log('🔄 Setting up routes without validators...');
  router.post('/register', authController.register);
  router.post('/login', authController.login);
  router.get('/me', authMiddleware, authController.getUser);
  router.post('/logout', authMiddleware, authController.logout);
  router.post('/change-password', authMiddleware, authController.changePassword);
  router.post('/forgot-password', authController.forgotPassword);
  router.post('/reset-password', authController.resetPassword);
}

module.exports = router;