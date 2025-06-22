const { body } = require('express-validator');

console.log('🔍 Loading authValidator...');

const registerRules = [
  body('name')
    .notEmpty()
    .withMessage('Nama wajib diisi')
    .isLength({ min: 2 })
    .withMessage('Nama minimal 2 karakter'),
  
  body('email')
    .isEmail()
    .withMessage('Format email tidak valid')
    .normalizeEmail(),
  
  body('username')
    .notEmpty()
    .withMessage('Username wajib diisi')
    .isLength({ min: 3 })
    .withMessage('Username minimal 3 karakter')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username hanya boleh mengandung huruf, angka, dan underscore'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password minimal 6 karakter')
];

const loginRules = [
  body('email')
    .isEmail()
    .withMessage('Format email tidak valid')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password wajib diisi')
];

const changePasswordRules = [
  body('oldPassword')
    .notEmpty()
    .withMessage('Password lama wajib diisi'),
  
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('Password baru minimal 6 karakter')
];

console.log('✅ Validators defined:', {
  registerRules: Array.isArray(registerRules),
  loginRules: Array.isArray(loginRules),
  changePasswordRules: Array.isArray(changePasswordRules)
});

module.exports = {
  registerRules,
  loginRules,
  changePasswordRules
};