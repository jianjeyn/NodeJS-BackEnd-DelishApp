const { executeQuery } = require('../../config/database');

console.log('🔍 Loading trendingController...');

module.exports = {
  // GET: /api/trending?limit=10&kategori=...
  async index(req, res) {
    try {
      console.log('📈 Getting trending recipes...');
      
      const limit = parseInt(req.query.limit) || 10;
      const kategori = req.query.kategori;

      // Build WHERE condition for kategori
      let whereCondition = '';
      const params = [];
      
      if (kategori) {
        whereCondition = 'WHERE r.kategori = ?';
        params.push(kategori);
      }

      // Get trending recipes based on average rating - sesuai dengan PHP
      const trendingQuery = `
        SELECT 
          r.*,
          u.id as user_id,
          u.name as user_name,
          u.username,
          u.foto as user_foto,
          AVG(rv.bintang) as reviews_avg_bintang,
          COUNT(rv.id) as reviews_count
        FROM recipes r
        LEFT JOIN users u ON r.user_id = u.id
        LEFT JOIN reviews rv ON r.id = rv.recipe_id
        ${whereCondition}
        GROUP BY r.id
        HAVING reviews_avg_bintang IS NOT NULL
        ORDER BY reviews_avg_bintang DESC, r.id DESC
        LIMIT ?
      `;

      params.push(limit);
      const trending = await executeQuery(trendingQuery, params);

      // Most viewed today - sesuai dengan PHP: whereDate('created_at', today())
      const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
      
      const mostViewedTodayQuery = `
        SELECT 
          r.*,
          u.id as user_id,
          u.name as user_name,
          u.username,
          u.foto as user_foto,
          AVG(rv.bintang) as reviews_avg_bintang,
          COUNT(rv.id) as reviews_count
        FROM recipes r
        LEFT JOIN users u ON r.user_id = u.id
        LEFT JOIN reviews rv ON r.id = rv.recipe_id
        WHERE DATE(r.created_at) = ?
        GROUP BY r.id
        HAVING reviews_avg_bintang IS NOT NULL
        ORDER BY reviews_avg_bintang DESC
        LIMIT 1
      `;

      const mostViewedTodayResult = await executeQuery(mostViewedTodayQuery, [today]);
      const mostViewedToday = mostViewedTodayResult[0] || null;

      // Format response sama persis dengan PHP
      const formattedTrending = trending.map(recipe => ({
        ...recipe,
        reviews_avg_bintang: parseFloat(recipe.reviews_avg_bintang) || null,
        reviews_count: parseInt(recipe.reviews_count) || 0,
        user: {
          id: recipe.user_id,
          name: recipe.user_name,
          username: recipe.username,
          foto: recipe.user_foto
        }
      }));

      const formattedMostViewed = mostViewedToday ? {
        ...mostViewedToday,
        reviews_avg_bintang: parseFloat(mostViewedToday.reviews_avg_bintang) || null,
        reviews_count: parseInt(mostViewedToday.reviews_count) || 0,
        user: {
          id: mostViewedToday.user_id,
          name: mostViewedToday.user_name,
          username: mostViewedToday.username,
          foto: mostViewedToday.user_foto
        }
      } : null;

      console.log(`✅ Found ${trending.length} trending recipes`);
      console.log(`✅ Most viewed today: ${mostViewedToday ? 'Found' : 'Not found'}`);

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
        message: 'Internal Server Error',
        error: error.message 
      });
    }
  },

  // GET: /api/trending/:id
  async show(req, res) {
    try {
      const { id } = req.params;
      console.log(`📋 Getting trending recipe detail for ID: ${id}`);

      // Get recipe with steps, user, and review stats - sesuai dengan PHP
      const recipeQuery = `
        SELECT 
          r.*,
          u.id as user_id,
          u.name as user_name,
          u.username,
          u.foto as user_foto,
          AVG(rv.bintang) as reviews_avg_bintang,
          COUNT(rv.id) as reviews_count
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

      // Get steps for this recipe
      const stepsQuery = `
        SELECT *
        FROM steps
        WHERE recipe_id = ?
        ORDER BY step_number ASC
      `;

      const steps = await executeQuery(stepsQuery, [id]);

      // Parse ingredients JSON
      let ingredients = [];
      try {
        ingredients = recipe.ingredients ? JSON.parse(recipe.ingredients) : [];
      } catch (error) {
        console.warn('Failed to parse ingredients JSON:', error);
        ingredients = [];
      }

      // Format response sama persis dengan PHP
      const formattedRecipe = {
        ...recipe,
        reviews_avg_bintang: parseFloat(recipe.reviews_avg_bintang) || null,
        reviews_count: parseInt(recipe.reviews_count) || 0,
        user: {
          id: recipe.user_id,
          name: recipe.user_name,
          username: recipe.username,
          foto: recipe.user_foto
        }
      };

      console.log(`✅ Recipe detail retrieved: ${recipe.nama}`);

      res.json({
        status: 'success',
        message: 'Recipe details retrieved successfully',
        data: {
          recipe: formattedRecipe,
          ingredients: ingredients,
          steps: steps,
          rating: parseFloat(recipe.reviews_avg_bintang) || 0,
          total_reviews: parseInt(recipe.reviews_count) || 0,
          chef: {
            id: recipe.user_id,
            name: recipe.user_name,
            username: recipe.username,
            foto: recipe.user_foto
          }
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
  },

  // // GET: /api/trending/category/:kategori (optional method for future use)
  // async byCategory(req, res) {
  //   try {
  //     const { kategori } = req.params;
  //     console.log(`📈 Getting trending recipes for category: ${kategori}`);

  //     const query = `
  //       SELECT 
  //         r.*,
  //         u.id as user_id,
  //         u.name as user_name,
  //         u.username,
  //         u.foto as user_foto,
  //         AVG(rv.bintang) as reviews_avg_bintang,
  //         COUNT(rv.id) as reviews_count
  //       FROM recipes r
  //       LEFT JOIN users u ON r.user_id = u.id
  //       LEFT JOIN reviews rv ON r.id = rv.recipe_id
  //       WHERE r.kategori = ?
  //       GROUP BY r.id
  //       HAVING reviews_avg_bintang IS NOT NULL
  //       ORDER BY reviews_avg_bintang DESC
  //       LIMIT 10
  //     `;

  //     const trending = await executeQuery(query, [kategori]);

  //     const formattedTrending = trending.map(recipe => ({
  //       ...recipe,
  //       reviews_avg_bintang: parseFloat(recipe.reviews_avg_bintang) || null,
  //       reviews_count: parseInt(recipe.reviews_count) || 0,
  //       user: {
  //         id: recipe.user_id,
  //         name: recipe.user_name,
  //         username: recipe.username,
  //         foto: recipe.user_foto
  //       }
  //     }));

  //     res.json({
  //       status: 'success',
  //       message: `Trending ${kategori} recipes retrieved successfully`,
  //       data: formattedTrending,
  //       category: kategori
  //     });

  //   } catch (error) {
  //     console.error('❌ Error in trending by category:', error);
  //     res.status(500).json({ 
  //       status: 'error', 
  //       message: 'Internal Server Error',
  //       error: error.message 
  //     });
  //   }
  // },

  // // GET: /api/trending/most-viewed-today (optional method for future use)
  // async mostViewedToday(req, res) {
  //   try {
  //     console.log('📈 Getting most viewed recipe today...');

  //     const today = new Date().toISOString().split('T')[0];
      
  //     const query = `
  //       SELECT 
  //         r.*,
  //         u.id as user_id,
  //         u.name as user_name,
  //         u.username,
  //         u.foto as user_foto,
  //         AVG(rv.bintang) as reviews_avg_bintang,
  //         COUNT(rv.id) as reviews_count
  //       FROM recipes r
  //       LEFT JOIN users u ON r.user_id = u.id
  //       LEFT JOIN reviews rv ON r.id = rv.recipe_id
  //       WHERE DATE(r.created_at) = ?
  //       GROUP BY r.id
  //       HAVING reviews_avg_bintang IS NOT NULL
  //       ORDER BY reviews_avg_bintang DESC
  //       LIMIT 1
  //     `;

  //     const result = await executeQuery(query, [today]);
  //     const recipe = result[0] || null;

  //     const formattedRecipe = recipe ? {
  //       ...recipe,
  //       reviews_avg_bintang: parseFloat(recipe.reviews_avg_bintang) || null,
  //       reviews_count: parseInt(recipe.reviews_count) || 0,
  //       user: {
  //         id: recipe.user_id,
  //         name: recipe.user_name,
  //         username: recipe.username,
  //         foto: recipe.user_foto
  //       }
  //     } : null;

  //     res.json({
  //       status: 'success',
  //       message: 'Most viewed recipe today retrieved successfully',
  //       data: formattedRecipe
  //     });

  //   } catch (error) {
  //     console.error('❌ Error in most viewed today:', error);
  //     res.status(500).json({ 
  //       status: 'error', 
  //       message: 'Internal Server Error',
  //       error: error.message 
  //     });
  //   }
  // }
};

console.log('✅ trendingController functions defined');