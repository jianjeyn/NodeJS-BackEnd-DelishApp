const { Notification, NotificationUser, User, Follow } = require('../models');
const { Op } = require('sequelize');

// Ambil semua notifikasi untuk user yang sedang login
exports.getAllNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const notifications = await NotificationUser.findAll({
      where: { user_id: userId },
      include: [{ model: Notification }],
      order: [['created_at', 'DESC']],
    });

    res.json(notifications);
  } catch (error) {
    console.error('Get Notifications Error:', error);
    res.status(500).json({ message: 'Gagal mengambil notifikasi.' });
  }
};

// Kirim notifikasi ke semua followers
exports.sendToFollowers = async (sender, judul, deskripsi) => {
  try {
    // Buat notifikasi baru
    const notification = await Notification.create({
      judul,
      deskripsi
    });

    // Ambil semua follower dari sender
    const followers = await Follow.findAll({
      where: {
        followed_user_id: sender.id
      },
      include: [{ model: User, as: 'follower' }]
    });

    // Insert ke NotificationUser
    const insertData = followers.map(f => ({
      notification_id: notification.id,
      user_id: f.user_id,
      created_at: new Date()
    }));

    await NotificationUser.bulkCreate(insertData);

    return true;
  } catch (error) {
    console.error('Send Notification Error:', error);
    return false;
  }
};

// Tandai notifikasi sebagai dibaca
exports.markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { notificationUserId } = req.params;

    const notifUser = await NotificationUser.findOne({
      where: {
        id: notificationUserId,
        user_id: userId
      }
    });

    if (!notifUser) {
      return res.status(404).json({ message: 'Notifikasi tidak ditemukan.' });
    }

    notifUser.read_at = new Date();
    await notifUser.save();

    res.json({ message: 'Notifikasi ditandai sebagai dibaca.' });
  } catch (error) {
    console.error('Mark Read Error:', error);
    res.status(500).json({ message: 'Gagal menandai sebagai dibaca.' });
  }
};
