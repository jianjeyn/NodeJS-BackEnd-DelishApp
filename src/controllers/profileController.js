const { User, Follower } = require('../models');
const { validationResult } = require('express-validator');

console.log('🔍 Loading profileController...');

// Show user profile
const show = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User tidak ditemukan'
      });
    }

    res.json({ 
      status: 'success',
      data: { user } 
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan server',
      error: error.message
    });
  }
};

// Update user profile
const update = async (req, res) => {
  try {
    const { name, no_hp, tanggal_lahir, gender, presentation, add_link } = req.body;
    
    // Handle foto upload
    let fotoPath = null;
    if (req.file) {
      fotoPath = `/uploads/avatars/${req.file.filename}`;
    }

    const updateData = { name, no_hp, tanggal_lahir, gender, presentation, add_link };
    if (fotoPath) {
      updateData.foto = fotoPath;
    }

    await User.update(updateData, {
      where: { id: req.user.id }
    });

    const updatedUser = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    res.json({
      status: 'success',
      message: 'Profile berhasil diperbarui',
      data: { user: updatedUser }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan server',
      error: error.message
    });
  }
};

// Get user followers
const getFollowers = async (req, res) => {
  try {
    const followers = await Follower.findAll({
      where: { following_id: req.user.id },
      include: [{
        model: User,
        as: 'follower',
        attributes: ['id', 'name', 'username', 'foto']
      }]
    });

    res.json({
      status: 'success',
      data: { followers }
    });
  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan server',
      error: error.message
    });
  }
};

// Get user following
const getFollowing = async (req, res) => {
  try {
    const following = await Follower.findAll({
      where: { follower_id: req.user.id },
      include: [{
        model: User,
        as: 'following',
        attributes: ['id', 'name', 'username', 'foto']
      }]
    });

    res.json({
      status: 'success',
      data: { following }
    });
  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan server',
      error: error.message
    });
  }
};

// Follow user
const followUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (userId == req.user.id) {
      return res.status(400).json({
        status: 'fail',
        message: 'Tidak dapat follow diri sendiri'
      });
    }

    // Check if already following
    const existingFollow = await Follower.findOne({
      where: {
        follower_id: req.user.id,
        following_id: userId
      }
    });

    if (existingFollow) {
      return res.status(400).json({
        status: 'fail',
        message: 'Sudah mengikuti user ini'
      });
    }

    await Follower.create({
      follower_id: req.user.id,
      following_id: userId
    });

    res.json({
      status: 'success',
      message: 'Berhasil mengikuti user'
    });

  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan server',
      error: error.message
    });
  }
};

// Unfollow user
const unfollowUser = async (req, res) => {
  try {
    const { userId } = req.params;

    await Follower.destroy({
      where: {
        follower_id: req.user.id,
        following_id: userId
      }
    });

    res.json({
      status: 'success',
      message: 'Berhasil unfollow user'
    });

  } catch (error) {
    console.error('Unfollow user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan server',
      error: error.message
    });
  }
};

// Get public profile
const getPublicProfile = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password', 'email'] }
    });

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User tidak ditemukan'
      });
    }

    res.json({
      status: 'success',
      data: { user }
    });

  } catch (error) {
    console.error('Get public profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan server',
      error: error.message
    });
  }
};

console.log('✅ profileController functions defined');

// PASTIKAN EXPORT SEMUA FUNCTIONS
const profileController = {
  show,
  update,
  getFollowers,
  getFollowing,
  followUser,
  unfollowUser,
  getPublicProfile
};

console.log('✅ profileController exports:', Object.keys(profileController));

module.exports = profileController;