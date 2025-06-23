const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { connectDB, disconnectDB, executeQuery, sequelize } = require('./config/database');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files untuk uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import main router yang sudah menggabungkan semua routes
const apiRoutes = require('./src/routes/index');

// Basic routes
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to DelishApp API',
    status: 'Server is running',
    endpoints: {
      auth: '/api/auth',
      recipes: '/api/recipes',
      users: '/api/users', 
      profile: '/api/profile',
      communities: '/api/communities',
      notifications: '/api/notifications',
      reviews: '/api/reviews',
      home: '/api/home',
      search: '/api/search',
      trending: '/api/trending',
      review: '/api/reviews',
    }
  });
});

// Health check route
app.get('/health', async (req, res) => {
  try {
    // Test MySQL2
    const result = await executeQuery('SELECT 1 as status');
    // Test Sequelize
    await sequelize.authenticate();
    
    res.json({
      status: 'OK',
      database: {
        mysql2: 'Connected',
        sequelize: 'Connected'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'Error',
      database: 'Disconnected',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Use main API router dengan prefix /api
app.use('/api', apiRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found'
  });
});

// Static files untuk uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Start server
async function startServer() {
  try {
    const connected = await connectDB();
    if (!connected) {
      console.error('Failed to connect to database');
      process.exit(1);
    }
    
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
      console.log(`📚 API Documentation available at:`);
      console.log(`   - Auth: http://localhost:${PORT}/api/auth`);
      console.log(`   - Recipes: http://localhost:${PORT}/api/recipes`);
      console.log(`   - Profile: http://localhost:${PORT}/api/profile`);
      console.log(`   - Communities: http://localhost:${PORT}/api/communities`);
      console.log(`   - Notifications: http://localhost:${PORT}/api/notifications`);
      console.log(`   - Reviews: http://localhost:${PORT}/api/reviews`);
      console.log(`   - Home: http://localhost:${PORT}/api/home`);
      console.log(`   - Search: http://localhost:${PORT}/api/search`);
      console.log(`   - Trending: http://localhost:${PORT}/api/trending`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await disconnectDB();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await disconnectDB();
  process.exit(0);
});

startServer();