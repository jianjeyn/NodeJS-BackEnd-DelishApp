// const express = require('express');
// const router = express.Router();

// // Import controllers
// const authController = require('../controllers/authControllers');
// const recipeController = require('../controllers/recipeController');
// const searchController = require('../controllers/searchController');
// const reviewController = require('../controllers/reviewController');
// const communityController = require('../controllers/communityController');
// const homePageController = require('../controllers/homePageController');
// const profileController = require('../controllers/profileController');
// const notificationController = require('../controllers/notificationController');
// const userController = require('../controllers/userController');
// const trendingController = require('../controllers/trendingController');

// // Import middleware
// const verifyToken = require('../middleware/auth');

// /*
// |--------------------------------------------------------------------------
// | Public Routes (No Authentication Required)
// |--------------------------------------------------------------------------
// */

// // Authentication
// router.post('/login', authController.login);
// router.post('/forgot-password', authController.forgotPassword);
// router.post('/reset-password', authController.resetPassword);
// router.post('/register', userController.register);

// // Home
// router.get('/home', homePageController.index);

// // Search
// router.get('/search', searchController.searchPage);

// // Recipes (Public)
// router.get('/recipes', recipeController.index);
// router.get('/recipes/:id', recipeController.show);
// router.post('/recipes', recipeController.store);
// router.put('/recipes/:id', recipeController.update);
// router.delete('/recipes/:id', recipeController.destroy);

// // Reviews
// router.post('/recipes/:recipeId/reviews', reviewController.store);
// router.get('/recipes/:recipeId/reviews', reviewController.index);

// // Communities (Public)
// router.get('/communities', communityController.index);
// router.get('/communities/:id', communityController.show);

// // Trending recipes
// router.get('/trending', trendingController.index);
// router.get('/trending/:id', trendingController.show);

// /*
// |--------------------------------------------------------------------------
// | Protected Routes (Authentication Required)
// |--------------------------------------------------------------------------
// */

// // Authentication (Protected)
// router.post('/logout', verifyToken, authController.logout);

// // Communities (Protected)
// router.post('/communities/:id/add-user', verifyToken, communityController.addUser);
// router.post('/communities/:id/remove-user', verifyToken, communityController.removeUser);

// // User Profile
// router.get('/profile', verifyToken, profileController.index);
// router.put('/profile', verifyToken, profileController.update);
// router.get('/profile/followers', verifyToken, profileController.followers);
// router.get('/profile/following', verifyToken, profileController.following);
// router.post('/profile/follow/:userId', verifyToken, profileController.followUser);
// router.get('/profile/share', verifyToken, profileController.shareProfile);

// // Profile Search API
// router.get('/profile/:username/followers/search', verifyToken, profileController.apiSearchFollowers);
// router.get('/profile/:username/following/search', verifyToken, profileController.apiSearchFollowing);

// // Notifications
// router.get('/notifications', verifyToken, notificationController.index);
// router.patch('/notifications/:id/read', verifyToken, notificationController.markAsRead);

// // Optional features (commented out in Laravel)
// // router.patch('/profile/notifications/:userId', verifyToken, profileController.manageNotifications);
// // router.patch('/profile/block/:userId', verifyToken, profileController.blockUser);
// // router.patch('/profile/unblock/:userId', verifyToken, profileController.unblockUser);
// // router.post('/profile/report/:userId', verifyToken, profileController.reportUser);

// module.exports = router;