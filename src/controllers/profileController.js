// controllers/ProfileController.js

const { User, Follow } = require('../models'); // pastikan path benar
const { Op } = require('sequelize');

exports.followUser = async (req, res) => {
  try {
    const userId = req.user.id; // asumsi auth middleware sudah menetapkan req.user
    const followedUserId = parseInt(req.params.userId, 10);

    if (userId === followedUserId) {
      return res.status(400).json({
        status: 'error',
        message: 'You cannot follow yourself.'
      });
    }

    // Cek apakah user yang diikuti ada
    const targetUser = await User.findByPk(followedUserId);
    if (!targetUser) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found.'
      });
    }

    // Cek apakah sudah follow
    const alreadyFollowed = await Follow.findOne({
      where: {
        user_id: userId,
        followed_user_id: followedUserId
      }
    });

    if (alreadyFollowed) {
      return res.status(400).json({
        status: 'error',
        message: 'You are already following this user.'
      });
    }

    // Insert follow
    await Follow.create({
      user_id: userId,
      followed_user_id: followedUserId,
      notifications_enabled: true,
      is_blocked: false,
      created_at: new Date()
    });

    return res.status(200).json({
      status: 'success',
      message: 'User followed successfully.',
      data: {
        followed_user: {
          id: targetUser.id,
          name: targetUser.name,
          username: targetUser.username
        }
      }
    });

  } catch (error) {
    console.error('Follow User Error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'An error occurred while trying to follow the user.'
    });
  }
};
