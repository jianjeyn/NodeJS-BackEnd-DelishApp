const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Review = sequelize.define('Review', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    resep_id: { // 'resep_id' from Laravel model
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'recipes', // refers to table name
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
    },
    foto: {
        type: DataTypes.STRING,
        allowNull: true
    },
    deskripsi: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    bintang: { // 'bintang' from Laravel model
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
            min: 1,
            max: 5
        }
    }
}, {
    tableName: 'reviews',
    timestamps: true
});

Review.associate = (models) => {
    Review.belongsTo(models.Recipe, { foreignKey: 'resep_id' });
    Review.belongsTo(models.User, { foreignKey: 'user_id' });
};

module.exports = Review;