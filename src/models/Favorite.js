const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Favorite = sequelize.define('Favorite', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        }
    },
    recipe_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'recipes',
            key: 'id',
        }
    }
}, {
    tableName: 'favorites',
    timestamps: true // Laravel's default for pivot tables with withTimestamps()
});

Favorite.associate = (models) => {
    Favorite.belongsTo(models.User, { foreignKey: 'user_id' });
    Favorite.belongsTo(models.Recipe, { foreignKey: 'recipe_id' });
};

module.exports = Favorite;