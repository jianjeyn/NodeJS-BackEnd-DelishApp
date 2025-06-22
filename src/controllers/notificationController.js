// User.js
User.associate = models => {
  User.belongsToMany(models.User, {
    as: 'Followers',
    through: 'follows',
    foreignKey: 'following_id',
    otherKey: 'follower_id',
  });

  User.belongsToMany(models.User, {
    as: 'Followings',
    through: 'follows',
    foreignKey: 'follower_id',
    otherKey: 'following_id',
  });

  User.hasMany(models.NotificationUser, { foreignKey: 'user_id' });
};

// Notification.js
Notification.associate = models => {
  Notification.hasMany(models.NotificationUser, { foreignKey: 'notification_id' });
};

// NotificationUser.js
NotificationUser.associate = models => {
  NotificationUser.belongsTo(models.Notification, { foreignKey: 'notification_id' });
  NotificationUser.belongsTo(models.User, { foreignKey: 'user_id' });
};
