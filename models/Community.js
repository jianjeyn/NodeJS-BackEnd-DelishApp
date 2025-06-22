const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Community = sequelize.define('Community', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nama: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'community', // Explicit table name as in Laravel
    timestamps: true
});

Community.associate = (models) => {
    Community.belongsToMany(models.User, { through: models.CommunityUser, foreignKey: 'community_id', otherKey: 'user_id' });
    // The hasManyThrough relationship needs careful reconstruction in Sequelize.
    // For now, it's often handled by querying through the pivot model explicitly.
    // A direct hasManyThrough equivalent to your Laravel setup would look like this:
    /*
    Community.hasManyThrough(
        models.Recipe,
        models.CommunityUser,
        {
            through: 'community_id', // Foreign key in CommunityUser
            foreignKey: 'user_id',   // Foreign key in Recipe pointing to User
            sourceKey: 'id',         // Local key in Community
            targetKey: 'user_id'     // Local key in CommunityUser pointing to User
        }
    );
    */
    // For simplicity and common practice, you might instead query:
    // Community.getUsers().then(users => users.getRecipes())
};

module.exports = Community;