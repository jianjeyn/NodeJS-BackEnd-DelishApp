const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Recipe = sequelize.define('Recipe', {
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        }
    },
    nama: {
        type: DataTypes.STRING,
        allowNull: false
    },
    foto: {
        type: DataTypes.STRING,
        allowNull: true
    },
    detail: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    durasi: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    kategori: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    jenis_hidangan: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    estimasi_waktu: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    tingkat_kesulitan: {
        type: DataTypes.STRING(50),
        allowNull: true
    }
}, {
    tableName: 'recipes',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    timestamps: true
});

Recipe.associate = (models) => {
    // Recipe belongs to User
    Recipe.belongsTo(models.User, { 
        foreignKey: 'user_id',
        as: 'user'
    });
    
    // Recipe has many Steps
    Recipe.hasMany(models.Step, { 
        foreignKey: 'recipe_id',
        as: 'steps'
    });
    
    // Recipe has many Reviews
    Recipe.hasMany(models.Review, { 
        foreignKey: 'recipe_id',
        as: 'reviews'
    });
    
    // Recipe has many Ingredients
    Recipe.hasMany(models.Ingredient, { 
        foreignKey: 'recipe_id',
        as: 'ingredients'
    });
    
    // Recipe belongs to many Users through Favorites
    Recipe.belongsToMany(models.User, { 
        through: models.Favorite, 
        foreignKey: 'recipe_id', 
        otherKey: 'user_id',
        as: 'favoriteUsers'
    });
};

module.exports = Recipe;