const { executeQuery } = require('../../config/database');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const path = require('path');

const JWT_SECRET = process.env.JWT_SECRET;

console.log('🔍 Loading authControllers...');

// Register function - sesuai dengan PHP: UserController::register
const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      status: 'fail',
      errors: errors.array()
    });
  }

  try {
    const {
      name,
      email,
      no_hp,
      tanggal_lahir,
      password,
      gender,
    } = req.body;

    console.log('📝 Registering new user:', { name, email });

    // Check if user already exists - sesuai dengan validasi PHP: unique:users,email dan unique:users,no_hp
    const existingUserQuery = `
      SELECT id, email, no_hp 
      FROM users 
      WHERE email = ? OR no_hp = ?
    `;
    
    const existingUser = await executeQuery(existingUserQuery, [email.toLowerCase(), no_hp]);

    if (existingUser && existingUser.length > 0) {
      const user = existingUser[0];
      let message = '';
      if (user.email === email.toLowerCase()) {
        message = 'Email sudah terdaftar';
      } else if (user.no_hp === no_hp) {
        message = 'Nomor HP sudah terdaftar';
      }
      
      return res.status(422).json({
        status: 'fail',
        message: message
      });
    }

    // Handle foto upload - sesuai dengan PHP: store('user_foto', 'public')
    let fotoPath = null;
    if (req.file) {
      fotoPath = `/uploads/user_foto/${req.file.filename}`;
    }

    // Hash password - sesuai dengan PHP: Hash::make($request->password)
    const hashedPassword = await bcryptjs.hash(password, 12);

    // Convert gender - sesuai dengan PHP validation: in:male,female
    const genderCode = gender === 'male' ? 'L' : gender === 'female' ? 'P' : gender;

    // Insert user ke database - sesuai dengan PHP: User::create()
    const insertUserQuery = `
      INSERT INTO users (
        name, 
        email, 
        no_hp, 
        tanggal_lahir, 
        password, 
        gender, 
        foto, 
        created_at, 
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;

    const result = await executeQuery(insertUserQuery, [
      name,
      email.toLowerCase(),
      no_hp,
      tanggal_lahir,
      hashedPassword,
      genderCode,
      fotoPath,
    ]);

    // Get created user
    const getUserQuery = `
      SELECT id, name, email, no_hp, tanggal_lahir, gender, foto, created_at, updated_at
      FROM users 
      WHERE id = ?
    `;
    
    const newUser = await executeQuery(getUserQuery, [result.insertId]);
    const user = newUser[0];

    // Generate token (opsional, sesuaikan dengan kebutuhan)
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log(`✅ User registered successfully: ${user.name} (ID: ${user.id})`);

    // Response format sama persis dengan PHP
    res.status(201).json({
      status: 'success',
      message: 'Registrasi berhasil',
      data: {
        user: user,
        token: token // Optional, bisa dihilangkan jika tidak diperlukan
      }
    });

  } catch (error) {
    console.error('❌ Registration error:', error);
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
    return res.status(422).json({ 
      status: 'fail',
      errors: errors.array() 
    });
  }

  const { email, password } = req.body;

  try {
    console.log('🔐 Login attempt for email:', email);

    // Find user by email
    const getUserQuery = `
      SELECT id, name, email, no_hp, tanggal_lahir, gender, foto, password, created_at, updated_at
      FROM users 
      WHERE email = ?
    `;
    
    const userResult = await executeQuery(getUserQuery, [email.toLowerCase()]);

    if (!userResult || userResult.length === 0) {
      return res.status(401).json({ 
        status: 'fail',
        message: 'Email atau password salah' 
      });
    }

    const user = userResult[0];

    // Verify password
    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        status: 'fail',
        message: 'Email atau password salah' 
      });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Remove password from response
    delete user.password;

    console.log(`✅ User logged in successfully: ${user.name} (ID: ${user.id})`);

    res.status(200).json({
      status: 'success',
      message: 'Login berhasil',
      data: {
        user: user,
        token: token
      }
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Terjadi kesalahan server', 
      error: error.message 
    });
  }
};

// Get User function
const getUser = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('👤 Getting user data for ID:', userId);

    const getUserQuery = `
      SELECT id, name, email, no_hp, tanggal_lahir, gender, foto, created_at, updated_at
      FROM users 
      WHERE id = ?
    `;
    
    const userResult = await executeQuery(getUserQuery, [userId]);

    if (!userResult || userResult.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'User tidak ditemukan'
      });
    }

    const user = userResult[0];

    res.json({ 
      status: 'success',
      data: { user } 
    });

  } catch (error) {
    console.error('❌ Get user error:', error);
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
    return res.status(422).json({
      status: 'fail',
      errors: errors.array()
    });
  }

  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;

    console.log('🔑 Changing password for user ID:', userId);

    // Get user with password
    const getUserQuery = `
      SELECT id, password 
      FROM users 
      WHERE id = ?
    `;
    
    const userResult = await executeQuery(getUserQuery, [userId]);

    if (!userResult || userResult.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'User tidak ditemukan'
      });
    }

    const user = userResult[0];

    // Verify old password
    const isMatch = await bcryptjs.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        status: 'fail',
        message: 'Password lama tidak sesuai'
      });
    }

    // Hash new password
    const hashedNewPassword = await bcryptjs.hash(newPassword, 12);

    // Update password
    const updatePasswordQuery = `
      UPDATE users 
      SET password = ?, updated_at = NOW() 
      WHERE id = ?
    `;
    
    await executeQuery(updatePasswordQuery, [hashedNewPassword, userId]);

    console.log(`✅ Password changed successfully for user ID: ${userId}`);

    res.json({
      status: 'success',
      message: 'Password berhasil diubah'
    });

  } catch (error) {
    console.error('❌ Change password error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan server',
      error: error.message
    });
  }
};

// Forgot Password function (placeholder)
const forgotPassword = async (req, res) => {
  res.json({ 
    status: 'success',
    message: 'Fitur forgot password belum diimplementasi' 
  });
};

// Reset Password function (placeholder)
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

console.log('✅ authControllers functions defined');