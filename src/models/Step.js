const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Step = sequelize.define('Step', {
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
    no: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    deskripsi: {
        type: DataTypes.TEXT,
        allowNull: false
    }
}, {
    tableName: 'steps',
    timestamps: true
});

Step.associate = (models) => {
    Step.belongsTo(models.Recipe, { foreignKey: 'resep_id' });
};

module.exports = Step;