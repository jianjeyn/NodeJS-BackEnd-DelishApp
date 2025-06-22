const { Recipe, Review } = require('../models');
const { Op, fn, col, literal } = require('sequelize');

exports.index = async (req, res) => {
  try {
    // Ambil kategori unik
    const categoriesData = await Recipe.findAll({
      attributes: [[fn('DISTINCT', col('kategori')), 'kategori']],
    });
    const categories = categoriesData.map(row => row.kategori);

    // Semua resep (tanpa filter)
    const filteredRecipes = await Recipe.findAll();

    // Trending (rata-rata bintang tertinggi dari relasi reviews)
    const trending = await Recipe.findAll({
      attributes: {
        include: [
          [fn('AVG', col('reviews.bintang')), 'avg_bintang']
        ]
      },
      include: [{
        model: Review,
        attributes: [],
      }],
      group: ['Recipe.id'],
      order: [[literal('avg_bintang'), 'DESC']],
      limit: 5,
    });

    // Resep user yang sedang login
    const yourRecipes = await Recipe.findAll({
      where: { user_id: req.user.id },
      limit: 5,
    });

    // Terbaru ditambahkan
    const recentlyAdded = await Recipe.findAll({
      order: [['created_at', 'DESC']],
      limit: 5,
    });

    res.json({
      categories,
      filtered: filteredRecipes,
      trending,
      your_recipes: yourRecipes,
      recently_added: recentlyAdded,
    });

  } catch (error) {
    console.error('Error in HomeController:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat mengambil data dashboard.' });
  }
};
