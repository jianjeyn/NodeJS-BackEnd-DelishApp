const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Community = sequelize.define('Community', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nama: {
        type: DataTypes.STRING,
        allowNull: false
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW
    },
    updated_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'communities', // Fix: Gunakan nama tabel yang benar
    timestamps: false // Karena kita handle timestamps manual
});

Community.associate = (models) => {
    // Many-to-many relationship dengan User melalui CommunityUser
    Community.belongsToMany(models.User, { 
        through: models.CommunityUser, 
        foreignKey: 'community_id', 
        otherKey: 'user_id',
        as: 'members'
    });
    
    // HasMany relationship dengan CommunityUser
    Community.hasMany(models.CommunityUser, {
        foreignKey: 'community_id',
        as: 'communityUsers'
    });
};

module.exports = Community;