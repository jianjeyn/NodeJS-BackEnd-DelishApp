const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database'); // Assuming your database connection is in config/database.js

const Notification = sequelize.define('Notification', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    judul: { // 'judul' from Laravel model
        type: DataTypes.STRING,
        allowNull: false
    },
    deskripsi: { // 'deskripsi' from Laravel model
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'notifications', // Explicit table name as in Laravel
    timestamps: true
});

Notification.associate = (models) => {
    // Relasi: One notification has many notification_users (one to many)
    Notification.hasMany(models.NotificationUser, { foreignKey: 'notification_id' });

    // If you want to access users through notification_users (hasManyThrough)
    // This is the Sequelize equivalent of your Laravel hasManyThrough:
    Notification.belongsToMany(models.User, {
        through: models.NotificationUser, // Pivot model
        foreignKey: 'notification_id',   // Foreign key in NotificationUser pointing to Notification
        otherKey: 'user_id'              // Foreign key in NotificationUser pointing to User
    });
};

module.exports = Notification;