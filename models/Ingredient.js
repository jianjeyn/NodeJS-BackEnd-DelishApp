const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Ingredient = sequelize.define('Ingredient', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    recipe_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'recipes',
            key: 'id',
        }
    },
    bahan: { // 'bahan' from Laravel model
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'ingredients',
    timestamps: true
});

Ingredient.associate = (models) => {
    Ingredient.belongsTo(models.Recipe, { foreignKey: 'recipe_id' });
};

module.exports = Ingredient;