const { executeQuery } = require('../../config/database');

console.log('🔍 Loading homePage.controller...');

exports.index = async (req, res) => {
  try {
    console.log('🏠 Getting homepage data...');

    // 1. Ambil kategori unik - sesuai dengan PHP: Recipe::select('kategori')->distinct()->pluck('kategori')
    const categoriesQuery = 'SELECT DISTINCT kategori FROM recipes WHERE kategori IS NOT NULL ORDER BY kategori';
    const categoriesData = await executeQuery(categoriesQuery);
    const categories = categoriesData.map(row => row.kategori);

    // 2. Semua resep (tanpa filter) - sesuai dengan PHP: Recipe::all()
    const filteredRecipesQuery = `
      SELECT 
        r.*,
        u.name as user_name,
        u.username,
        u.foto as user_foto
      FROM recipes r
      LEFT JOIN users u ON r.user_id = u.id
      ORDER BY r.created_at DESC
    `;
    const filteredRecipes = await executeQuery(filteredRecipesQuery);

    // 3. Trending - sesuai dengan PHP: Recipe::withAvg('reviews', 'bintang')->orderByDesc('reviews_avg_bintang')->take(5)
    const trendingQuery = `
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
      ORDER BY reviews_avg_bintang DESC
      LIMIT 5
    `;
    const trending = await executeQuery(trendingQuery);

    // 4. Your recipes - sesuai dengan PHP: Recipe::where('user_id', Auth::id())->take(5)
    let yourRecipes = [];
    if (req.user && req.user.id) {
      const yourRecipesQuery = `
        SELECT 
          r.*,
          AVG(rv.bintang) as reviews_avg_bintang,
          COUNT(rv.id) as reviews_count
        FROM recipes r
        LEFT JOIN reviews rv ON r.id = rv.recipe_id
        WHERE r.user_id = ?
        GROUP BY r.id
        ORDER BY r.created_at DESC
        LIMIT 5
      `;
      yourRecipes = await executeQuery(yourRecipesQuery, [req.user.id]);
    }

    // 5. Recently added - sesuai dengan PHP: Recipe::orderBy('created_at', 'desc')->take(5)
    const recentlyAddedQuery = `
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
      LIMIT 5
    `;
    const recentlyAdded = await executeQuery(recentlyAddedQuery);

    // Format data untuk response (sama seperti PHP)
    const formatRecipes = (recipes) => {
      return recipes.map(recipe => ({
        ...recipe,
        reviews_avg_bintang: parseFloat(recipe.reviews_avg_bintang) || null,
        reviews_count: parseInt(recipe.reviews_count) || 0
      }));
    };

    console.log(`✅ Homepage data retrieved successfully:`);
    console.log(`   - Categories: ${categories.length}`);
    console.log(`   - Filtered recipes: ${filteredRecipes.length}`);
    console.log(`   - Trending: ${trending.length}`);
    console.log(`   - Your recipes: ${yourRecipes.length}`);
    console.log(`   - Recently added: ${recentlyAdded.length}`);

    // Response format sama persis dengan PHP
    res.json({
      categories,
      filtered: formatRecipes(filteredRecipes),
      trending: formatRecipes(trending),
      your_recipes: formatRecipes(yourRecipes),
      recently_added: formatRecipes(recentlyAdded)
    });

  } catch (error) {
    console.error('❌ Error in HomeController:', error);
    res.status(500).json({ 
      error: 'Terjadi kesalahan saat mengambil data dashboard.',
      message: error.message 
    });
  }
};

console.log('✅ homePage.controller functions defined');