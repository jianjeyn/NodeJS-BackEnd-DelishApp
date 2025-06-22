const { User } = require('../models');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

const JWT_SECRET = process.env.JWT_SECRET;

// Register function
const register = async (req, res) => {
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'fail',
      errors: errors.array()
    });
  }

  try {
    const {
      name,
      email,
      username,
      no_hp,
      tanggal_lahir,
      password,
      gender,
      presentation,
      add_link
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ 
      where: { 
        [require('sequelize').Op.or]: [
          { email: email.toLowerCase() },
          { username }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({
        status: 'fail',
        message: 'Email atau username sudah terdaftar'
      });
    }

    // Handle foto upload
    let fotoPath = null;
    if (req.file) {
      fotoPath = `/uploads/avatars/${req.file.filename}`;
    }

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      username,
      no_hp,
      tanggal_lahir,
      password,
      gender,
      foto: fotoPath,
      presentation,
      add_link
    });

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Remove password from response
    const userResponse = { ...user.toJSON() };
    delete userResponse.password;

    res.status(201).json({
      status: 'success',
      message: 'Registrasi berhasil',
      data: {
        user: userResponse,
        token
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan saat registrasi',
      error: error.message
    });
  }
};

// Login function
const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      status: 'fail',
      errors: errors.array() 
    });
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ 
      where: { email: email.toLowerCase() } 
    });

    if (!user) {
      return res.status(401).json({ 
        status: 'fail',
        message: 'Email atau password salah' 
      });
    }

    // Use the comparePassword method from User model
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ 
        status: 'fail',
        message: 'Email atau password salah' 
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Remove password from response
    const userResponse = { ...user.toJSON() };
    delete userResponse.password;

    res.status(200).json({
      status: 'success',
      message: 'Login berhasil',
      data: {
        user: userResponse,
        token
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ 
      status: 'error',
      message: 'Terjadi kesalahan server', 
      error: err.message 
    });
  }
};

// Get User function
const getUser = async (req, res) => {
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
    console.error('Get user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan server',
      error: error.message
    });
  }
};

// Logout function
const logout = async (req, res) => {
  res.json({ 
    status: 'success',
    message: 'Logout berhasil (hapus token di client)' 
  });
};

// Change Password function
const changePassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'fail',
      errors: errors.array()
    });
  }

  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User tidak ditemukan'
      });
    }

    // Verify old password
    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      return res.status(400).json({
        status: 'fail',
        message: 'Password lama tidak sesuai'
      });
    }

    // Update password
    await user.update({ password: newPassword });

    res.json({
      status: 'success',
      message: 'Password berhasil diubah'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan server',
      error: error.message
    });
  }
};

// Forgot Password function
const forgotPassword = async (req, res) => {
  res.json({ 
    status: 'success',
    message: 'Fitur forgot password belum diimplementasi' 
  });
};

// Reset Password function
const resetPassword = async (req, res) => {
  res.json({ 
    status: 'success',
    message: 'Fitur reset password belum diimplementasi' 
  });
};

// PASTIKAN EXPORT SEMUA FUNCTIONS
module.exports = {
  register,
  login,
  getUser,
  logout,
  changePassword,
  forgotPassword,
  resetPassword
};