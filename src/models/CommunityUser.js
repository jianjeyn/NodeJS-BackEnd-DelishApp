const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const CommunityUser = sequelize.define('CommunityUser', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    community_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'community',
            key: 'id'
        }
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    }
}, {
    tableName: 'community_user',
    timestamps: false
});

CommunityUser.associate = (models) => {
    CommunityUser.belongsTo(models.Community, {
        foreignKey: 'community_id',
        as: 'community'
    });
    
    CommunityUser.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
    });
};

module.exports = CommunityUser;