const { Recipe, User, Review, Ingredient, sequelize } = require('../models');
const { Op } = require('sequelize');

module.exports = {
  // GET: /api/search-page
  async searchPage(req, res) {
    try {
      const user = req.user; // Diasumsikan sudah diisi oleh middleware autentikasi

      const [trending, recommended, recentlyAdded, yourRecipes, results] = await Promise.all([
        this.getTrendingRecipes(),
        this.recommendedRecipes(user),
        this.getRecentlyAddedRecipes(),
        user ? Recipe.findAll({ where: { userId: user.id } }) : [],
        this.getSearchResults(req)
      ]);

      res.json({
        trending,
        recommended,
        recently_added: recentlyAdded,
        your_recipes: yourRecipes,
        results
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  },

  // Trending recipes berdasarkan review dan bintang
  async getTrendingRecipes() {
    return await Recipe.findAll({
      include: [{
        model: Review,
        attributes: []
      }],
      attributes: {
        include: [
          [sequelize.fn('AVG', sequelize.col('reviews.bintang')), 'avg_bintang'],
          [sequelize.fn('COUNT', sequelize.col('reviews.id')), 'review_count']
        ]
      },
      group: ['Recipe.id'],
      order: [
        [sequelize.literal('avg_bintang'), 'DESC'],
        [sequelize.literal('review_count'), 'DESC']
      ],
      limit: 10
    });
  },

  // Rekomendasi berdasarkan kategori favorit user
  async recommendedRecipes(user) {
    if (!user) {
      return await Recipe.findAll({
        order: sequelize.random(),
        limit: 5
      });
    }

    const [favKategoriResult] = await sequelize.query(`
      SELECT kategori
      FROM Recipes r
      INNER JOIN UserFavorites uf ON uf.recipeId = r.id
      WHERE uf.userId = :userId
      GROUP BY kategori
      ORDER BY COUNT(*) DESC
      LIMIT 1
    `, {
      replacements: { userId: user.id },
      type: sequelize.QueryTypes.SELECT
    });

    const kategori = favKategoriResult?.kategori;

    if (!kategori) {
      return await Recipe.findAll({
        order: sequelize.random(),
        limit: 5
      });
    }

    return await Recipe.findAll({
      where: { kategori },
      order: sequelize.random(),
      limit: 5
    });
  },

  // Recently added recipes
  async getRecentlyAddedRecipes() {
    return await Recipe.findAll({
      include: [{
        model: Review,
        attributes: []
      }],
      attributes: {
        include: [
          [sequelize.fn('AVG', sequelize.col('reviews.bintang')), 'avg_bintang'],
          [sequelize.fn('COUNT', sequelize.col('reviews.id')), 'review_count']
        ]
      },
      group: ['Recipe.id'],
      order: [['createdAt', 'DESC']],
      limit: 10
    });
  },

  // Search results
  async getSearchResults(req) {
    const {
      keyword,
      jenis_hidangan,
      estimasi_waktu,
      tingkat_kesulitan,
      bahan,
      page = 1
    } = req.query;

    const whereClause = {};

    if (keyword) {
      whereClause.nama = { [Op.like]: `%${keyword}%` };
    }

    if (jenis_hidangan) {
      whereClause.jenis_hidangan = jenis_hidangan;
    }

    if (tingkat_kesulitan) {
      whereClause.tingkat_kesulitan = tingkat_kesulitan;
    }

    if (estimasi_waktu) {
      const options = {
        '<30 Min': ['<15 Min', '<30 Min'],
        '<1 Hour': ['<15 Min', '<30 Min', '<1 Hour']
      };
      whereClause.estimasi_waktu = options[estimasi_waktu] || estimasi_waktu;
    }

    const include = [];

    if (bahan) {
      include.push({
        model: Ingredient,
        where: {
          nama: { [Op.like]: `%${bahan}%` }
        }
      });
    }

    return await Recipe.findAndCountAll({
      where: whereClause,
      include,
      limit: 10,
      offset: (page - 1) * 10,
      order: [['createdAt', 'DESC']]
    });
  }
};
