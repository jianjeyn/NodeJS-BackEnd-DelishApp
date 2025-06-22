const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database'); // Assuming your database connection is in config/database.js

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Name is required'
            }
        }
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: {
                msg: 'Please provide a valid email'
            }
        }
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false, // Based on Laravel model, it's not explicitly marked as required
        unique: true
    },
    no_hp: {
        type: DataTypes.STRING,
        allowNull: true
    },
    tanggal_lahir: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: {
                args: [6, 100],
                msg: 'Password must be at least 6 characters long'
            }
        }
    },
    gender: {
        type: DataTypes.STRING,
        allowNull: true
    },
    foto: {
        type: DataTypes.STRING,
        allowNull: true
    },
    community_id: {
        type: DataTypes.INTEGER,
        allowNull: true // Assuming it can be null if a user is not in a community
    }
}, {
    tableName: 'users',
    timestamps: true,
    hooks: {
        beforeCreate: async (user) => {
            if (user.password) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            }
        },
        beforeUpdate: async (user) => {
            if (user.changed('password')) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            }
        }
    }
});

User.prototype.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Associations (will be defined after all models are defined)
User.associate = (models) => {
    User.belongsTo(models.Community, { foreignKey: 'community_id' });
    User.hasMany(models.Recipe, { foreignKey: 'user_id' });
    User.hasMany(models.Review, { foreignKey: 'user_id' });
    User.belongsToMany(models.Community, { through: models.CommunityUser, foreignKey: 'user_id', otherKey: 'community_id' });
    User.belongsToMany(models.User, { as: 'Followers', through: models.Follower, foreignKey: 'to_user_id', otherKey: 'from_user_id' });
    User.belongsToMany(models.User, { as: 'Following', through: models.Follower, foreignKey: 'from_user_id', otherKey: 'to_user_id' });
    User.belongsToMany(models.Recipe, { through: models.Favorite, foreignKey: 'user_id', otherKey: 'recipe_id' });
};

module.exports = User;