// models/index.js
const Sequelize = require('sequelize');
const { sequelize } = require('../config/database'); // Your Sequelize instance

const models = {
    User: require('./User'),
    Follower: require('./Follower'),
    Favorite: require('./Favorite'),
    Ingredient: require('./Ingredient'),
    CommunityUser: require('./CommunityUser'),
    Review: require('./Review'),
    Step: require('./Step'),
    Recipe: require('./Recipe'),
    Community: require('./Community'),
    Notification: require('./Notification'),
    NotificationUser: require('./NotificationUser'),
};

Object.keys(models).forEach(modelName => {
    if (models[modelName].associate) {
        console.log(`Associating model: ${modelName}`);
        models[modelName].associate(models);
    }
});

models.sequelize = sequelize;
models.Sequelize = Sequelize;

module.exports = models;