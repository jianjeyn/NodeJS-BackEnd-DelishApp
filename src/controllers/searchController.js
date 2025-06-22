const { executeQuery } = require('../../config/database');

console.log('🔍 Loading searchController...');

module.exports = {
  // GET: /api/search - sesuai dengan PHP: Route::get('/search', [SearchController::class, 'searchPage'])
  async searchPage(req, res) {
    try {
      console.log('🔍 Getting search page data...');
      
      const user = req.user; // Optional auth dari middleware

      // Jalankan semua query secara paralel
      const [trending, recommended, recentlyAdded, yourRecipes, results] = await Promise.all([
        this.getTrendingRecipes(),
        this.recommendedRecipes(user),
        this.getRecentlyAddedRecipes(),
        user ? this.getUserRecipes(user.id) : [],
        this.getSearchResults(req)
      ]);

      console.log(`✅ Search page data retrieved successfully`);

      // Response format sama persis dengan PHP
      res.json({
        trending,
        recommended,
        recently_added: recentlyAdded,
        your_recipes: yourRecipes,
        results
      });

    } catch (error) {
      console.error('❌ Error in SearchController:', error);
      res.status(500).json({ 
        message: 'Internal Server Error',
        error: error.message 
      });
    }
  },

  // Trending: berdasarkan review dan bintang - sesuai dengan PHP: Recipe::withCount('reviews')->withAvg('reviews', 'bintang')
  async getTrendingRecipes() {
    try {
      console.log('📈 Getting trending recipes...');
      
      const query = `
        SELECT 
          r.*,
          u.name as user_name,
          u.username,
          u.foto as user_foto,
          AVG(rv.bintang) as reviews_avg_bintang,
          COUNT(rv.id) as reviews_count
        FROM recipes r
        LEFT JOIN users u ON r.user_id = u.id
        LEFT JOIN reviews rv ON r.id = rv.recipe_id
        GROUP BY r.id
        HAVING reviews_avg_bintang IS NOT NULL
        ORDER BY reviews_avg_bintang DESC, reviews_count DESC
        LIMIT 10
      `;

      const trending = await executeQuery(query);

      return trending.map(recipe => ({
        ...recipe,
        reviews_avg_bintang: parseFloat(recipe.reviews_avg_bintang) || null,
        reviews_count: parseInt(recipe.reviews_count) || 0
      }));

    } catch (error) {
      console.error('❌ Error getting trending recipes:', error);
      return [];
    }
  },

  // Rekomendasi berdasarkan kategori favorit user
  async recommendedRecipes(user) {
    try {
      console.log('💡 Getting recommended recipes...');

      if (!user) {
        // Jika tidak ada user, return random recipes dengan review stats
        const query = `
          SELECT 
            r.*,
            u.name as user_name,
            u.username,
            u.foto as user_foto,
            AVG(rv.bintang) as reviews_avg_bintang,
            COUNT(rv.id) as reviews_count
          FROM recipes r
          LEFT JOIN users u ON r.user_id = u.id
          LEFT JOIN reviews rv ON r.id = rv.recipe_id
          GROUP BY r.id
          ORDER BY RAND()
          LIMIT 5
        `;

        const recipes = await executeQuery(query);
        return recipes.map(recipe => ({
          ...recipe,
          reviews_avg_bintang: parseFloat(recipe.reviews_avg_bintang) || null,
          reviews_count: parseInt(recipe.reviews_count) || 0
        }));
      }

      // Cari kategori favorit user berdasarkan favorites
      const favKategoriQuery = `
        SELECT r.kategori
        FROM recipes r
        INNER JOIN favorites f ON f.recipe_id = r.id
        WHERE f.user_id = ?
        GROUP BY r.kategori
        ORDER BY COUNT(*) DESC
        LIMIT 1
      `;

      const favKategoriResult = await executeQuery(favKategoriQuery, [user.id]);
      const favKategori = favKategoriResult[0]?.kategori;

      if (!favKategori) {
        // Jika tidak ada kategori favorit, return random dengan review stats
        const query = `
          SELECT 
            r.*,
            u.name as user_name,
            u.username,
            u.foto as user_foto,
            AVG(rv.bintang) as reviews_avg_bintang,
            COUNT(rv.id) as reviews_count
          FROM recipes r
          LEFT JOIN users u ON r.user_id = u.id
          LEFT JOIN reviews rv ON r.id = rv.recipe_id
          GROUP BY r.id
          ORDER BY RAND()
          LIMIT 5
        `;

        const recipes = await executeQuery(query);
        return recipes.map(recipe => ({
          ...recipe,
          reviews_avg_bintang: parseFloat(recipe.reviews_avg_bintang) || null,
          reviews_count: parseInt(recipe.reviews_count) || 0
        }));
      }

      // Return recipes dari kategori favorit
      const query = `
        SELECT 
          r.*,
          u.name as user_name,
          u.username,
          u.foto as user_foto,
          AVG(rv.bintang) as reviews_avg_bintang,
          COUNT(rv.id) as reviews_count
        FROM recipes r
        LEFT JOIN users u ON r.user_id = u.id
        LEFT JOIN reviews rv ON r.id = rv.recipe_id
        WHERE r.kategori = ?
        GROUP BY r.id
        ORDER BY RAND()
        LIMIT 5
      `;

      const recipes = await executeQuery(query, [favKategori]);
      return recipes.map(recipe => ({
        ...recipe,
        reviews_avg_bintang: parseFloat(recipe.reviews_avg_bintang) || null,
        reviews_count: parseInt(recipe.reviews_count) || 0
      }));

    } catch (error) {
      console.error('❌ Error getting recommended recipes:', error);
      return [];
    }
  },

  // Recently Added: recipe paling baru diupload dengan review count dan rating
  async getRecentlyAddedRecipes() {
    try {
      console.log('🆕 Getting recently added recipes...');
      
      const query = `
        SELECT 
          r.*,
          u.name as user_name,
          u.username,
          u.foto as user_foto,
          AVG(rv.bintang) as reviews_avg_bintang,
          COUNT(rv.id) as reviews_count
        FROM recipes r
        LEFT JOIN users u ON r.user_id = u.id
        LEFT JOIN reviews rv ON r.id = rv.recipe_id
        GROUP BY r.id
        ORDER BY r.created_at DESC
        LIMIT 10
      `;

      const recipes = await executeQuery(query);

      return recipes.map(recipe => ({
        ...recipe,
        reviews_avg_bintang: parseFloat(recipe.reviews_avg_bintang) || null,
        reviews_count: parseInt(recipe.reviews_count) || 0
      }));

    } catch (error) {
      console.error('❌ Error getting recently added recipes:', error);
      return [];
    }
  },

  // Get user's recipes - sesuai dengan PHP: Recipe::where('user_id', $user?->id)->get()
  async getUserRecipes(userId) {
    try {
      console.log(`👤 Getting recipes for user: ${userId}`);
      
      const query = `
        SELECT 
          r.*,
          AVG(rv.bintang) as reviews_avg_bintang,
          COUNT(rv.id) as reviews_count
        FROM recipes r
        LEFT JOIN reviews rv ON r.id = rv.recipe_id
        WHERE r.user_id = ?
        GROUP BY r.id
        ORDER BY r.created_at DESC
      `;

      const recipes = await executeQuery(query, [userId]);

      return recipes.map(recipe => ({
        ...recipe,
        reviews_avg_bintang: parseFloat(recipe.reviews_avg_bintang) || null,
        reviews_count: parseInt(recipe.reviews_count) || 0
      }));

    } catch (error) {
      console.error('❌ Error getting user recipes:', error);
      return [];
    }
  },

  // Fitur search + filter - sesuai dengan PHP getSearchResults
  async getSearchResults(req) {
    try {
      console.log('🔍 Processing search results...');
      
      const {
        keyword,
        jenis_hidangan,
        estimasi_waktu,
        tingkat_kesulitan,
        bahan,
        page = 1
      } = req.query;

      const limit = 10;
      const offset = (page - 1) * limit;

      // Build WHERE conditions
      const conditions = [];
      const params = [];

      if (keyword) {
        conditions.push('r.nama LIKE ?');
        params.push(`%${keyword}%`);
      }

      if (jenis_hidangan) {
        conditions.push('r.jenis_hidangan = ?');
        params.push(jenis_hidangan);
      }

      if (estimasi_waktu) {
        conditions.push('r.estimasi_waktu = ?');
        params.push(estimasi_waktu);
      }

      if (tingkat_kesulitan) {
        conditions.push('r.tingkat_kesulitan = ?');
        params.push(tingkat_kesulitan);
      }

      // Base query
      let query = `
        SELECT 
          r.*,
          u.name as user_name,
          u.username,
          u.foto as user_foto,
          AVG(rv.bintang) as reviews_avg_bintang,
          COUNT(rv.id) as reviews_count
        FROM recipes r
        LEFT JOIN users u ON r.user_id = u.id
        LEFT JOIN reviews rv ON r.id = rv.recipe_id
      `;

      // Add ingredient search if needed
      if (bahan) {
        query += ' INNER JOIN ingredients i ON r.id = i.recipe_id';
        conditions.push('i.bahan LIKE ?');
        params.push(`%${bahan}%`);
      }

      // Add WHERE clause
      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }

      query += ' GROUP BY r.id ORDER BY r.created_at DESC';

      // Count query for pagination
      let countQuery = 'SELECT COUNT(DISTINCT r.id) as total FROM recipes r';
      if (bahan) {
        countQuery += ' INNER JOIN ingredients i ON r.id = i.recipe_id';
      }
      if (conditions.length > 0) {
        countQuery += ' WHERE ' + conditions.join(' AND ');
      }

      // Execute count query
      const countResult = await executeQuery(countQuery, params);
      const total = countResult[0].total;

      // Add pagination to main query
      query += ' LIMIT ? OFFSET ?';
      params.push(limit, offset);

      // Execute main query
      const recipes = await executeQuery(query, params);

      // Format response sesuai dengan Laravel pagination
      return {
        data: recipes.map(recipe => ({
          ...recipe,
          reviews_avg_bintang: parseFloat(recipe.reviews_avg_bintang) || null,
          reviews_count: parseInt(recipe.reviews_count) || 0
        })),
        current_page: parseInt(page),
        per_page: limit,
        total: total,
        last_page: Math.ceil(total / limit),
        from: offset + 1,
        to: Math.min(offset + limit, total)
      };

    } catch (error) {
      console.error('❌ Error getting search results:', error);
      return {
        data: [],
        current_page: 1,
        per_page: 10,
        total: 0,
        last_page: 1,
        from: 0,
        to: 0
      };
    }
  }
};

console.log('✅ searchController functions defined');