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
            model: 'community', // refers to table name
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
    tableName: 'community_user', // Explicit table name as in Laravel
    timestamps: false // Assuming no timestamps for pivot table unless explicitly handled
});

CommunityUser.associate = (models) => {
    CommunityUser.belongsTo(models.Community, { foreignKey: 'community_id' });
    CommunityUser.belongsTo(models.User, { foreignKey: 'user_id' });
};

module.exports = CommunityUser;