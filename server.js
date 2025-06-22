require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// ============================================
// MIDDLEWARE SETUP
// ============================================
app.use(cors({
  origin: ['http://localhost:3000', 'http://10.0.2.2:3000'], // Flutter emulator & Web
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging (only in development)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
    next();
  });
}

// ============================================
// ROUTES SETUP
// ============================================
const indexRoutes = require('./src/routes/index'); // <= ini wajib!

app.use('/api', indexRoutes);

// ============================================
// ROOT ENDPOINT
// ============================================
app.get('/', (req, res) => {
  res.json({
    message: 'Flutter Backend API is running! 🚀',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: [
        'POST /api/auth/register',
        'POST /api/auth/login',
        'GET /api/auth/profile'
      ],
      profile: [
        'GET /api/profile',
        'PUT /api/profile'
      ],
      recipes: [
        'GET /api/recipes',
        'GET /api/recipes/:id',
        'POST /api/recipes',
        'PUT /api/recipes/:id',
        'DELETE /api/recipes/:id'
      ],
      communities: [
        'GET /api/communities',
        'GET /api/communities/:id'
      ],
      notifications: [
        'GET /api/notifications',
        'POST /api/notifications'
      ],
      home: [
        'GET /api/home'
      ],
      search: [
        'GET /api/search'
      ],
      trending: [
        'GET /api/trending',
        'GET /api/trending/:id'
      ]
    }
  });
});

// ============================================
// HEALTH CHECK
// ============================================
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// ============================================
// ERROR HANDLING
// ============================================
// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);

  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      message: 'Validation error',
      errors: err.errors.map(e => e.message)
    });
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      message: 'Data already exists',
      field: err.errors[0].path
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Invalid token' });
  }

  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ============================================
// SERVER STARTUP
// ============================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('=================================');
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Flutter can access: http://localhost:${PORT}`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log('=================================');
});

// ============================================
// GRACEFUL SHUTDOWN
// ============================================
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});
