const { executeQuery } = require('../../config/database');

console.log('🔍 Loading notificationController...');

module.exports = {
  // GET: /api/notifications - Ambil semua notifikasi untuk user yang sedang login
  async index(req, res) {
    try {
      console.log('🔔 Getting notifications for user:', req.user.id);
      
      const userId = req.user.id;

      // Query sesuai dengan PHP: NotificationUser::with('notification')->where('user_id', Auth::id())
      const query = `
        SELECT 
          nu.notification_id,
          nu.user_id,
          nu.read_at,
          n.id as notification_id_detail,
          n.judul,
          n.deskripsi,
          n.created_at,
          n.updated_at
        FROM notification_users nu
        INNER JOIN notifications n ON nu.notification_id = n.id
        WHERE nu.user_id = ?
        ORDER BY n.created_at DESC
      `;

      const notifications = await executeQuery(query, [userId]);

      // Format response sesuai dengan PHP structure
      const formattedNotifications = notifications.map(notif => ({
        notification_id: notif.notification_id,
        user_id: notif.user_id,
        read_at: notif.read_at,
        notification: {
          id: notif.notification_id_detail,
          judul: notif.judul,
          deskripsi: notif.deskripsi,
          created_at: notif.created_at,
          updated_at: notif.updated_at
        }
      }));

      console.log(`✅ Found ${notifications.length} notifications for user ${userId}`);

      res.json(formattedNotifications);

    } catch (error) {
      console.error('❌ Get Notifications Error:', error);
      res.status(500).json({ 
        message: 'Gagal mengambil notifikasi.',
        error: error.message 
      });
    }
  },

  // Internal function - Kirim notifikasi ke semua followers
  async sendToFollowers(sender, judul, deskripsi) {
    try {
      console.log(`📤 Sending notification to followers of user ${sender.id || sender.user_id}`);
      
      const senderId = sender.id || sender.user_id;

      // Buat notifikasi baru - sesuai dengan PHP: Notification::create()
      const createNotificationQuery = `
        INSERT INTO notifications (judul, deskripsi, created_at, updated_at)
        VALUES (?, ?, NOW(), NOW())
      `;

      const notificationResult = await executeQuery(createNotificationQuery, [judul, deskripsi]);
      const notificationId = notificationResult.insertId;

      // Ambil semua follower dari sender - sesuai dengan PHP: $sender->followers
      const getFollowersQuery = `
        SELECT to_user_id as follower_id
        FROM followers
        WHERE from_user_id = ?
      `;

      const followers = await executeQuery(getFollowersQuery, [senderId]);

      if (followers.length === 0) {
        console.log('📭 No followers found for user', senderId);
        return true;
      }

      // Insert ke NotificationUser untuk setiap follower - sesuai dengan PHP: NotificationUser::create()
      const insertNotificationUsersQuery = `
        INSERT INTO notification_users (notification_id, user_id)
        VALUES ?
      `;

      const notificationUsersData = followers.map(follower => [
        notificationId,
        follower.follower_id
      ]);

      await executeQuery(insertNotificationUsersQuery, [notificationUsersData]);

      console.log(`✅ Notification sent to ${followers.length} followers`);
      return true;

    } catch (error) {
      console.error('❌ Send Notification Error:', error);
      return false;
    }
  },

  // PUT: /api/notifications/:notificationUserId/read - Tandai satu notifikasi sebagai dibaca
  async markAsRead(req, res) {
    try {
      const userId = req.user.id;
      const { notificationUserId } = req.params;

      console.log(`📖 Marking notification ${notificationUserId} as read for user ${userId}`);

      // Cari notifikasi user - sesuai dengan PHP: NotificationUser::where()->firstOrFail()
      const findNotifQuery = `
        SELECT notification_id, user_id, read_at
        FROM notification_users
        WHERE notification_id = ? AND user_id = ?
      `;

      const notifUser = await executeQuery(findNotifQuery, [notificationUserId, userId]);

      if (!notifUser || notifUser.length === 0) {
        return res.status(404).json({ 
          message: 'Notifikasi tidak ditemukan.' 
        });
      }

      // Update read_at - sesuai dengan PHP: $notifUser->update(['read_at' => now()])
      const updateQuery = `
        UPDATE notification_users 
        SET read_at = NOW()
        WHERE notification_id = ? AND user_id = ?
      `;

      await executeQuery(updateQuery, [notificationUserId, userId]);

      console.log(`✅ Notification ${notificationUserId} marked as read`);

      res.json({ 
        message: 'Notifikasi ditandai sebagai dibaca.' 
      });

    } catch (error) {
      console.error('❌ Mark Read Error:', error);
      res.status(500).json({ 
        message: 'Gagal menandai sebagai dibaca.',
        error: error.message 
      });
    }
  },

  // GET: /api/notifications/unread-count - Hitung notifikasi yang belum dibaca
  async getUnreadCount(req, res) {
    try {
      const userId = req.user.id;

      console.log(`🔢 Getting unread count for user ${userId}`);

      const query = `
        SELECT COUNT(*) as unread_count
        FROM notification_users
        WHERE user_id = ? AND read_at IS NULL
      `;

      const result = await executeQuery(query, [userId]);
      const unreadCount = result[0].unread_count || 0;

      console.log(`✅ User ${userId} has ${unreadCount} unread notifications`);

      res.json({ 
        unread_count: unreadCount 
      });

    } catch (error) {
      console.error('❌ Get Unread Count Error:', error);
      res.status(500).json({ 
        message: 'Gagal mengambil jumlah notifikasi belum dibaca.',
        error: error.message 
      });
    }
  },

  // PUT: /api/notifications/mark-all-read - Tandai semua notifikasi sebagai dibaca
  async markAllAsRead(req, res) {
    try {
      const userId = req.user.id;

      console.log(`📖 Marking all notifications as read for user ${userId}`);

      const query = `
        UPDATE notification_users 
        SET read_at = NOW()
        WHERE user_id = ? AND read_at IS NULL
      `;

      const result = await executeQuery(query, [userId]);
      const affectedRows = result.affectedRows || 0;

      console.log(`✅ Marked ${affectedRows} notifications as read for user ${userId}`);

      res.json({ 
        message: `${affectedRows} notifikasi ditandai sebagai dibaca.`,
        count: affectedRows
      });

    } catch (error) {
      console.error('❌ Mark All Read Error:', error);
      res.status(500).json({ 
        message: 'Gagal menandai semua notifikasi sebagai dibaca.',
        error: error.message 
      });
    }
  }
};

console.log('✅ notificationController functions defined');