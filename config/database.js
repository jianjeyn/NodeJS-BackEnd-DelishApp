const mysql = require('mysql2/promise');
const { Sequelize } = require('sequelize');

console.log('🔍 Loading database configuration...');
console.log('Environment variables:');
console.log('- DB_HOST:', process.env.DB_HOST || 'localhost');
console.log('- DB_USER:', process.env.DB_USER || 'root');
console.log('- DB_NAME:', process.env.DB_NAME || 'provis_resep');
console.log('- DB_PORT:', process.env.DB_PORT || 3306);

// MySQL2 Pool Configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'provis_resep',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create MySQL2 connection pool
const pool = mysql.createPool(dbConfig);

// Sequelize instance untuk models
const sequelize = new Sequelize(
  process.env.DB_NAME || 'provis_resep',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Test database connection
async function connectDB() {
  try {
    console.log('🔍 Testing MySQL2 connection...');
    
    // Test MySQL2 connection
    const connection = await pool.getConnection();
    console.log('✅ MySQL2 Database connected successfully');
    
    // Test query
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('✅ MySQL2 Database test query successful');
    connection.release();

    console.log('🔍 Testing Sequelize connection...');
    
    // Test Sequelize connection
    await sequelize.authenticate();
    console.log('✅ Sequelize Database connected successfully');
    
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Error details:', error);
    
    // Coba koneksi tanpa database (untuk membuat database jika belum ada)
    try {
      console.log('🔄 Trying to connect without database...');
      const tempPool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        port: process.env.DB_PORT || 3306
      });
      
      const tempConnection = await tempPool.getConnection();
      console.log('✅ Connected to MySQL server (without database)');
      
      // Coba buat database jika belum ada
      const dbName = process.env.DB_NAME || 'provis_resep';
      await tempConnection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
      console.log(`✅ Database '${dbName}' created or already exists`);
      
      tempConnection.release();
      await tempPool.end();
      
      // Coba koneksi lagi dengan database
      const newConnection = await pool.getConnection();
      console.log('✅ Connected to database after creation');
      newConnection.release();
      
      return true;
    } catch (createError) {
      console.error('❌ Failed to create database:', createError.message);
      return false;
    }
  }
}

// Execute query (untuk MySQL2)
async function executeQuery(query, params = []) {
  try {
    const [rows] = await pool.execute(query, params);
    return rows;
  } catch (error) {
    console.error('Query execution error:', error);
    throw error;
  }
}

// Close all connections
async function disconnectDB() {
  try {
    await pool.end();
    await sequelize.close();
    console.log('🔌 Database disconnected');
  } catch (error) {
    console.error('Error disconnecting database:', error);
  }
}

module.exports = {
  pool,
  sequelize,
  connectDB,
  disconnectDB,
  executeQuery
};