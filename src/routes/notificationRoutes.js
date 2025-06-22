const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const auth = require('../middleware/auth'); // Gunakan auth.js yang sudah ada

console.log('🔗 Setting up notification routes...');

// Debug: Check if controller functions exist
console.log('🔍 Checking notificationController functions:');
console.log('   - index:', typeof notificationController.index);
console.log('   - markAsRead:', typeof notificationController.markAsRead);

// Semua rute notifikasi memerlukan login
router.use(auth);

// GET /api/notifications - Get all notifications
if (typeof notificationController.index === 'function') {
  router.get('/', notificationController.index);
  console.log('✅ GET / notification route setup successful');
} else {
  console.error('❌ notificationController.index is not a function');
  // Fallback route
  router.get('/', (req, res) => {
    res.json({
      status: 'success',
      message: 'Notifications endpoint - under development',
      data: { notifications: [] }
    });
  });
}

// PATCH /api/notifications/:id/read - Mark as read
if (typeof notificationController.markAsRead === 'function') {
  router.patch('/:id/read', notificationController.markAsRead);
  console.log('✅ PATCH /:id/read notification route setup successful');
} else {
  console.error('❌ notificationController.markAsRead is not a function');
  // Fallback route
  router.patch('/:id/read', (req, res) => {
    res.json({
      status: 'success',
      message: 'Mark as read endpoint - under development'
    });
  });
}

console.log('✅ Notification routes setup complete');

module.exports = router;