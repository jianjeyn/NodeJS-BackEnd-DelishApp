const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Recipe = sequelize.define('Recipe', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
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
        type: DataTypes.STRING, // Assuming string like "30 menit"
        allowNull: true
    },
    kategori: {
        type: DataTypes.STRING,
        allowNull: true
    },
    jenis_hidangan: {
        type: DataTypes.STRING,
        allowNull: true
    },
    estimasi_waktu: { // 'estimasi_waktu' from Laravel model
        type: DataTypes.STRING,
        allowNull: true
    },
    tingkat_kesulitan: { // 'tingkat_kesulitan' from Laravel model
        type: DataTypes.STRING,
        allowNull: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        }
    }
}, {
    tableName: 'recipes',
    timestamps: true
});

Recipe.associate = (models) => {
    Recipe.hasMany(models.Step, { foreignKey: 'resep_id' });
    Recipe.hasMany(models.Review, { foreignKey: 'resep_id' });
    Recipe.belongsToMany(models.User, { through: models.Favorite, foreignKey: 'recipe_id', otherKey: 'user_id' });
    Recipe.belongsTo(models.User, { foreignKey: 'user_id' });
    Recipe.hasMany(models.Ingredient, { foreignKey: 'recipe_id' });
};

module.exports = Recipe;