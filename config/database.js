const { Sequelize } = require('sequelize');
require('dotenv').config();

// Buat koneksi Sequelize ke MySQL
const sequelize = new Sequelize(
  process.env.DB_NAME || 'provis_resep',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false, // set true kalau mau lihat log query di terminal
    define: {
      freezeTableName: true, // agar nama tabel tidak diubah jadi jamak
      timestamps: true       // tambahkan createdAt & updatedAt otomatis
    }
  }
);

// Test koneksi database
async function connectDB() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully (via Sequelize)');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error.message);
  }
}

// Disconnect database (optional untuk shutdown)
async function disconnectDB() {
  try {
    await sequelize.close();
    console.log('🔌 Database connection closed.');
  } catch (error) {
    console.error('Error while closing DB:', error.message);
  }
}

module.exports = {
  sequelize,
  connectDB,
  disconnectDB
};
