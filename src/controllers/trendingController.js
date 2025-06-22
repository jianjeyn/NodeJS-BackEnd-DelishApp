const { Recipe, User, Step, Review, sequelize } = require('../models');
const { Op } = require('sequelize');

module.exports = {
  // GET: /api/trending?limit=10&kategori=...
  async index(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const kategori = req.query.kategori;

      // Trending berdasarkan rating rata-rata (kategori opsional)
      const trending = await Recipe.findAll({
        include: [{ model: User, attributes: ['id', 'name', 'email'] }],
        attributes: {
          include: [
            [sequelize.fn('AVG', sequelize.col('reviews.bintang')), 'avg_bintang']
          ]
        },
        include: [
          {
            model: Review,
            attributes: []
          },
          { model: User, attributes: ['id', 'name'] }
        ],
        where: kategori ? { kategori } : undefined,
        group: ['Recipe.id', 'User.id'],
        order: [
          [sequelize.literal('avg_bintang'), 'DESC'],
          ['id', 'DESC']
        ],
        limit
      });

      // Resep dengan rating tertinggi hari ini (create_at hari ini)
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const mostViewedToday = await Recipe.findOne({
        include: [
          {
            model: Review,
            attributes: []
          },
          {
            model: User,
            attributes: ['id', 'name']
          }
        ],
        attributes: {
          include: [
            [sequelize.fn('AVG', sequelize.col('reviews.bintang')), 'avg_bintang']
          ]
        },
        where: {
          createdAt: {
            [Op.gte]: today
          }
        },
        group: ['Recipe.id', 'User.id'],
        order: [[sequelize.literal('avg_bintang'), 'DESC']],
      });

      res.json({
        status: 'success',
        message: 'Trending recipes retrieved successfully',
        data: {
          most_viewed_today: mostViewedToday,
          trending_recipes: trending,
          total: trending.length
        }
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
  },

  // GET: /api/trending/:id
  async show(req, res) {
    try {
      const id = req.params.id;
      const recipe = await Recipe.findByPk(id, {
        include: [
          { model: Step },
          { model: User, attributes: ['id', 'name'] },
          { model: Review, attributes: [] }
        ],
        attributes: {
          include: [
            [sequelize.fn('AVG', sequelize.col('reviews.bintang')), 'avg_bintang'],
            [sequelize.fn('COUNT', sequelize.col('reviews.id')), 'reviews_count']
          ]
        },
        group: ['Recipe.id', 'Steps.id', 'User.id']
      });

      if (!recipe) {
        return res.status(404).json({ status: 'fail', message: 'Recipe not found' });
      }

      const ingredients = JSON.parse(recipe.ingredients || '[]');

      res.json({
        status: 'success',
        message: 'Recipe details retrieved successfully',
        data: {
          recipe,
          ingredients,
          steps: recipe.Steps,
          rating: parseFloat(recipe.get('avg_bintang')) || 0,
          total_reviews: parseInt(recipe.get('reviews_count')) || 0,
          chef: recipe.User
        }
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
  }
};
