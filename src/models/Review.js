const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Review = sequelize.define('Review', {
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
    },
    recipe_id: { // Fix: Sesuaikan dengan database (recipe_id bukan resep_id)
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
            model: 'recipes',
            key: 'id',
        }
    },
    user_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        }
    },
    deskripsi: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    bintang: {
        type: DataTypes.TINYINT,
        allowNull: false,
        validate: {
            min: 1,
            max: 5
        }
    },
    foto: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'reviews',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    timestamps: true
});

Review.associate = (models) => {
    Review.belongsTo(models.Recipe, { 
        foreignKey: 'recipe_id',
        as: 'recipe'
    });
    Review.belongsTo(models.User, { 
        foreignKey: 'user_id',
        as: 'user'
    });
};

module.exports = Review;