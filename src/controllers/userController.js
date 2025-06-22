const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');
const User = require('../models/User'); // Sesuaikan dengan model yang kamu pakai (Sequelize atau Mongoose)

exports.register = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            status: 'fail',
            errors: errors.array()
        });
    }

    try {
        // Ambil data dari request
        const {
            name,
            email,
            no_hp,
            tanggal_lahir,
            password,
            gender,
            community_id
        } = req.body;

        // Simpan foto jika ada
        let fotoPath = null;
        if (req.file) {
            fotoPath = `/uploads/user_foto/${req.file.filename}`;
        }

        // Simpan user ke database
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            name,
            email,
            no_hp,
            tanggal_lahir,
            password: hashedPassword,
            gender,
            community_id: community_id || null,
            foto: fotoPath
        });

        return res.status(201).json({
            status: 'success',
            message: 'Registrasi berhasil',
            data: user
        });

    } catch (error) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
};
