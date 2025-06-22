const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Follower = sequelize.define('Follower', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    from_user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users', // refers to table name
            key: 'id',
        }
    },
    to_user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users', // refers to table name
            key: 'id',
        }
    }
}, {
    tableName: 'followers',
    timestamps: true // Laravel's default for pivot tables with withTimestamps()
});

Follower.associate = (models) => {
    Follower.belongsTo(models.User, { as: 'FromUser', foreignKey: 'from_user_id' });
    Follower.belongsTo(models.User, { as: 'ToUser', foreignKey: 'to_user_id' });
};

module.exports = Follower;