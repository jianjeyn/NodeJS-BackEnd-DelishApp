const { User } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const nodemailer = require('nodemailer');

// Ganti ini dengan secret token kamu
// const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const JWT_SECRET = process.env.JWT_SECRET;

exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email: email.toLowerCase() } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Gagal' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1d' });

    res.status(200).json({
      message: 'Successfully logged in',
      data: {
        user,
        token
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getUser = async (req, res) => {
  res.json({ data: { user: req.user } });
};

exports.logout = async (req, res) => {
  // Jika menggunakan JWT stateless, logout dilakukan di sisi client (hapus token)
  res.json({ message: 'Logout berhasil (hapus token di client)' });
};
