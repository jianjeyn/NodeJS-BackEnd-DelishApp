const { executeQuery } = require('../../config/database');

console.log('🔍 Loading trendingController...');

module.exports = {
  // GET: /api/trending?limit=10&kategori=...
  async index(req, res) {
    try {
      console.log('📈 Getting trending recipes...');

      const limit = parseInt(req.query.limit) || 10;
      const kategori = req.query.kategori;

      let trendingQuery;
      let params;

      if (kategori) {
        trendingQuery = `
          SELECT 
            r.*, u.id AS user_id, u.name AS user_name, u.username, u.foto AS user_foto,
            agg.reviews_avg_bintang, agg.reviews_count
          FROM recipes r
          LEFT JOIN users u ON r.user_id = u.id
          LEFT JOIN (
            SELECT recipe_id, AVG(bintang) AS reviews_avg_bintang, COUNT(id) AS reviews_count
            FROM reviews
            GROUP BY recipe_id
          ) agg ON r.id = agg.recipe_id
          WHERE r.kategori = ? AND agg.reviews_avg_bintang IS NOT NULL
          ORDER BY agg.reviews_avg_bintang DESC, r.id DESC
          LIMIT ${limit}
        `;
        params = [kategori];
      } else {
        trendingQuery = `
          SELECT 
            r.*, u.id AS user_id, u.name AS user_name, u.username, u.foto AS user_foto,
            agg.reviews_avg_bintang, agg.reviews_count
          FROM recipes r
          LEFT JOIN users u ON r.user_id = u.id
          LEFT JOIN (
            SELECT recipe_id, AVG(bintang) AS reviews_avg_bintang, COUNT(id) AS reviews_count
            FROM reviews
            GROUP BY recipe_id
          ) agg ON r.id = agg.recipe_id
          WHERE agg.reviews_avg_bintang IS NOT NULL
          ORDER BY agg.reviews_avg_bintang DESC, r.id DESC
          LIMIT ${limit}
        `;
        params = [];
      }

      const trending = await executeQuery(trendingQuery, params);

      const today = new Date().toISOString().split('T')[0];
      const mostViewedTodayQuery = `
        SELECT 
          r.*, u.id AS user_id, u.name AS user_name, u.username, u.foto AS user_foto,
          agg.reviews_avg_bintang, agg.reviews_count
        FROM recipes r
        LEFT JOIN users u ON r.user_id = u.id
        LEFT JOIN (
          SELECT recipe_id, AVG(bintang) AS reviews_avg_bintang, COUNT(id) AS reviews_count
          FROM reviews
          GROUP BY recipe_id
        ) agg ON r.id = agg.recipe_id
        WHERE DATE(r.created_at) = ? AND agg.reviews_avg_bintang IS NOT NULL
        ORDER BY agg.reviews_avg_bintang DESC
        LIMIT 1
      `;
      const mostViewedTodayResult = await executeQuery(mostViewedTodayQuery, [today]);
      const mostViewedToday = mostViewedTodayResult[0] || null;

      const formatRecipe = (recipe) => ({
        ...recipe,
        reviews_avg_bintang: parseFloat(recipe.reviews_avg_bintang) || 0,
        reviews_count: parseInt(recipe.reviews_count) || 0,
        user: {
          id: recipe.user_id,
          name: recipe.user_name,
          username: recipe.username,
          foto: recipe.user_foto
        }
      });

      const formattedTrending = trending.map(formatRecipe);
      const formattedMostViewed = mostViewedToday ? formatRecipe(mostViewedToday) : null;

      res.json({
        status: 'success',
        message: 'Trending recipes retrieved successfully',
        data: {
          most_viewed_today: formattedMostViewed,
          trending_recipes: formattedTrending,
          total: trending.length
        }
      });

    } catch (error) {
      console.error('❌ Error in trending index:', error);
      res.status(500).json({
        status: 'error',
        message: error.message || 'Internal Server Error'
      });
    }
  },

  // GET: /api/trending/:id
  async show(req, res) {
    try {
      const { id } = req.params;
      console.log(`📋 Getting trending recipe detail for ID: ${id}`);

      const recipeQuery = `
        SELECT 
          r.*,
          u.id AS user_id,
          u.name AS user_name,
          u.username,
          u.foto AS user_foto,
          AVG(rv.bintang) AS reviews_avg_bintang,
          COUNT(rv.id) AS reviews_count
        FROM recipes r
        LEFT JOIN users u ON r.user_id = u.id
        LEFT JOIN reviews rv ON r.id = rv.recipe_id
        WHERE r.id = ?
        GROUP BY r.id
      `;

      const recipeResult = await executeQuery(recipeQuery, [id]);

      if (!recipeResult || recipeResult.length === 0) {
        return res.status(404).json({
          status: 'fail',
          message: 'Recipe not found'
        });
      }

      const recipe = recipeResult[0];

      const stepsQuery = `
        SELECT *
        FROM steps
        WHERE recipe_id = ?
        ORDER BY step_number ASC
      `;
      const steps = await executeQuery(stepsQuery, [id]);

      let ingredients = [];
      try {
        ingredients = recipe.ingredients ? JSON.parse(recipe.ingredients) : [];
      } catch (err) {
        console.warn('⚠️ Failed to parse ingredients JSON:', err.message);
      }

      const formattedRecipe = {
        ...recipe,
        reviews_avg_bintang: parseFloat(recipe.reviews_avg_bintang) || 0,
        reviews_count: parseInt(recipe.reviews_count) || 0,
        user: {
          id: recipe.user_id,
          name: recipe.user_name,
          username: recipe.username,
          foto: recipe.user_foto
        }
      };

      res.json({
        status: 'success',
        message: 'Recipe details retrieved successfully',
        data: {
          recipe: formattedRecipe,
          ingredients,
          steps,
          rating: formattedRecipe.reviews_avg_bintang,
          total_reviews: formattedRecipe.reviews_count,
          chef: formattedRecipe.user
        }
      });

    } catch (error) {
      console.error('❌ Error in trending show:', error);
      res.status(500).json({
        status: 'error',
        message: 'Internal Server Error',
        error: error.message
      });
    }
  }
};

console.log('✅ trendingController functions defined');
