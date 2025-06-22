const { Recipe, Step, Review, User, Ingredient } = require('../models');
const { validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');

module.exports = {
  // 1. Ambil semua resep (dengan filter kategori)
  async index(req, res) {
    try {
      const { kategori } = req.query;

      const recipes = await Recipe.findAll({
        where: kategori ? { kategori } : {},
        include: [
          {
            model: Review,
            attributes: [],
          },
        ],
        attributes: {
          include: [
            [
              // rata-rata bintang
              Recipe.sequelize.fn('AVG', Recipe.sequelize.col('reviews.bintang')),
              'reviews_avg_bintang',
            ],
            [
              // jumlah review
              Recipe.sequelize.fn('COUNT', Recipe.sequelize.col('reviews.id')),
              'reviews_count',
            ],
          ],
        },
        group: ['Recipe.id'],
      });

      res.json(recipes);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // 2. Tampilkan detail satu resep
  async show(req, res) {
    try {
      const { id } = req.params;

      const recipe = await Recipe.findByPk(id, {
        include: [
          { model: Step },
          { model: Ingredient },
          {
            model: Review,
            include: [{ model: User }],
          },
          { model: User }, // pemilik resep
        ],
      });

      if (!recipe) {
        return res.status(404).json({ message: 'Resep tidak ditemukan' });
      }

      const reviewStats = await Review.findAll({
        where: { resep_id: id },
        attributes: [
          [Review.sequelize.fn('AVG', Review.sequelize.col('bintang')), 'avg_bintang'],
          [Review.sequelize.fn('COUNT', '*'), 'count_bintang'],
        ],
        raw: true,
      });

      res.json({
        ...recipe.toJSON(),
        reviews_avg_bintang: parseFloat(reviewStats[0].avg_bintang || 0),
        reviews_count: parseInt(reviewStats[0].count_bintang || 0),
        steps_count: recipe.steps.length,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // 3. Simpan resep baru
  async store(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
      }

      const {
        nama,
        detail,
        ingredients,
        durasi,
        kategori,
        jenis_hidangan,
        estimasi_waktu,
        tingkat_kesulitan,
      } = req.body;

      const foto = req.file ? req.file.path : null;

      const recipe = await Recipe.create({
        nama,
        detail,
        ingredients,
        durasi,
        kategori,
        jenis_hidangan,
        estimasi_waktu,
        tingkat_kesulitan,
        user_id: req.user.id, // diasumsikan auth middleware mengisi req.user
        foto,
      });

      // kirim notifikasi ke followers (dummy)
      const judulNotif = `${req.user.name} mengunggah resep baru!`;
      const deskripsiNotif = `Lihat resep: ${recipe.nama}`;
      // Implementasikan notifController.sendToFollowers jika dibutuhkan

      res.status(201).json({
        message: 'Resep berhasil ditambahkan',
        data: recipe,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Gagal menambahkan resep' });
    }
  },

  // 4. Update resep
  async update(req, res) {
    try {
      const { id } = req.params;

      const recipe = await Recipe.findByPk(id);
      if (!recipe) {
        return res.status(404).json({ message: 'Resep tidak ditemukan' });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
      }

      const {
        nama,
        detail,
        ingredients,
        durasi,
        kategori,
        jenis_hidangan,
        estimasi_waktu,
        tingkat_kesulitan,
      } = req.body;

      const foto = req.file ? req.file.path : recipe.foto;

      await recipe.update({
        nama,
        detail,
        ingredients,
        durasi,
        kategori,
        jenis_hidangan,
        estimasi_waktu,
        tingkat_kesulitan,
        foto,
      });

      res.json({
        message: 'Resep berhasil diperbarui',
        data: recipe,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Gagal memperbarui resep' });
    }
  },

  // 5. Hapus resep
  async destroy(req, res) {
    try {
      const { id } = req.params;

      const recipe = await Recipe.findByPk(id);
      if (!recipe) {
        return res.status(404).json({ message: 'Resep tidak ditemukan' });
      }

      await recipe.destroy();

      res.json({ message: 'Resep berhasil dihapus' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Gagal menghapus resep' });
    }
  },
};
