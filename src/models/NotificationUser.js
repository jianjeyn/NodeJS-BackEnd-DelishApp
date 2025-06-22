const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const NotificationUser = sequelize.define('NotificationUser', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    notification_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'notifications', // refers to table name
            key: 'id',
        }
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users', // refers to table name
            key: 'id',
        }
    }
}, {
    tableName: 'notification_user', // Explicit table name as in Laravel
    timestamps: true // Assuming timestamps for pivot table for creation/update tracking
});

NotificationUser.associate = (models) => {
    // Relasi: Belongs to Notification
    NotificationUser.belongsTo(models.Notification, { foreignKey: 'notification_id' });
    // Relasi: Belongs to User
    NotificationUser.belongsTo(models.User, { foreignKey: 'user_id' });
};

module.exports = NotificationUser;