const { Review, User } = require('../models');
const { validationResult } = require('express-validator');
const path = require('path');
const fs = require('fs');

module.exports = {
  // GET /api/reviews/:resep_id
  async index(req, res) {
    try {
      const { resep_id } = req.params;

      const reviews = await Review.findAll({
        where: { resep_id },
        include: {
          model: User,
          attributes: ['id', 'name', 'email']
        },
        order: [['createdAt', 'DESC']]
      });

      return res.json({ reviews });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error' });
    }
  },

  // POST /api/reviews
  async store(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
      }

      const { resep_id, deskripsi, bintang } = req.body;
      const user_id = req.user.id; // Diasumsikan middleware auth sudah set req.user

      let fotoPath = null;
      if (req.file) {
        fotoPath = req.file.path;
      }

      const review = await Review.create({
        resep_id,
        deskripsi,
        bintang,
        user_id,
        foto: fotoPath
      });

      return res.status(201).json({
        message: 'Review berhasil ditambahkan',
        data: review
      });

    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Gagal menyimpan review' });
    }
  }
};
