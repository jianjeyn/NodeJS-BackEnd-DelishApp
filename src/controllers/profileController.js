const { executeQuery } = require('../../config/database');
const { validationResult } = require('express-validator');
const path = require('path');
const fs = require('fs');

console.log('🔍 Loading profileController...');

// Display user profile with recipes and favorites - sesuai dengan PHP: ProfileController::index
const index = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('👤 Getting profile data for user ID:', userId);

    // Get user data - sesuai dengan PHP: Auth::user()
    const getUserQuery = `
      SELECT id, name, email, username, no_hp, tanggal_lahir, gender, foto, presentation, add_link, created_at, updated_at
      FROM users 
      WHERE id = ?
    `;
    
    const userResult = await executeQuery(getUserQuery, [userId]);
    
    if (!userResult || userResult.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'User tidak ditemukan'
      });
    }

    const user = userResult[0];

    // Get user's recipes - sesuai dengan PHP: Recipe::where('user_id', $user->id)->withAvg('reviews', 'bintang')
    const userRecipesQuery = `
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
    
    const userRecipes = await executeQuery(userRecipesQuery, [userId]);

    // Get user's favorite recipes - sesuai dengan PHP: $user->favoriteRecipes()
    const favoriteRecipesQuery = `
      SELECT 
        r.*,
        u.name as user_name,
        u.username,
        u.foto as user_foto,
        AVG(rv.bintang) as reviews_avg_bintang,
        COUNT(rv.id) as reviews_count
      FROM recipes r
      INNER JOIN favorites f ON r.id = f.recipe_id
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN reviews rv ON r.id = rv.recipe_id
      WHERE f.user_id = ?
      GROUP BY r.id
      ORDER BY r.created_at DESC
    `;
    
    const favoriteRecipes = await executeQuery(favoriteRecipesQuery, [userId]);

    // Get statistics - sesuai dengan PHP stats calculation
    const statsQueries = await Promise.all([
      // Total followers
      executeQuery(`
        SELECT COUNT(*) as count 
        FROM followers 
        WHERE to_user_id = ?
      `, [userId]),
      
      // Total following
      executeQuery(`
        SELECT COUNT(*) as count 
        FROM followers 
        WHERE from_user_id = ?
      `, [userId])
    ]);

    const stats = {
      total_recipes: userRecipes.length,
      total_followers: statsQueries[0][0].count,
      total_following: statsQueries[1][0].count,
      total_favorites: favoriteRecipes.length
    };

    // Format recipes dengan reviews stats
    const formattedUserRecipes = userRecipes.map(recipe => ({
      ...recipe,
      reviews_avg_bintang: parseFloat(recipe.reviews_avg_bintang) || null,
      reviews_count: parseInt(recipe.reviews_count) || 0
    }));

    const formattedFavoriteRecipes = favoriteRecipes.map(recipe => ({
      ...recipe,
      reviews_avg_bintang: parseFloat(recipe.reviews_avg_bintang) || null,
      reviews_count: parseInt(recipe.reviews_count) || 0,
      user: {
        name: recipe.user_name,
        username: recipe.username,
        foto: recipe.user_foto
      }
    }));

    console.log(`✅ Profile data retrieved for user ${user.name} (${stats.total_recipes} recipes, ${stats.total_favorites} favorites)`);

    res.json({
      status: 'success',
      message: 'Profile data retrieved successfully',
      data: {
        user: user,
        stats: stats,
        recipes: formattedUserRecipes,
        favorites: formattedFavoriteRecipes
      }
    });

  } catch (error) {
    console.error('❌ Get profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan server',
      error: error.message
    });
  }
};

// Display followers list - sesuai dengan PHP: ProfileController::followers
const followers = async (req, res) => {
  try {
    const userId = req.user.id;
    const search = req.query.search;
    console.log(`👥 Getting followers for user ID: ${userId}`, search ? `(search: ${search})` : '');

    // Get user data
    const getUserQuery = `
      SELECT id, name, email, username, foto
      FROM users 
      WHERE id = ?
    `;
    
    const userResult = await executeQuery(getUserQuery, [userId]);
    const user = userResult[0];

    // Build followers query with optional search - sesuai dengan PHP when() clause
    let followersQuery = `
      SELECT 
        u.id,
        u.name,
        u.email,
        u.username,
        u.foto,
        f.created_at as followed_at
      FROM followers f
      INNER JOIN users u ON f.from_user_id = u.id
      WHERE f.to_user_id = ?
    `;
    
    const params = [userId];

    if (search) {
      followersQuery += ` AND (u.name LIKE ? OR u.email LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    followersQuery += ` ORDER BY f.created_at DESC`;

    const followersResult = await executeQuery(followersQuery, params);

    // Get stats
    const statsQueries = await Promise.all([
      executeQuery(`SELECT COUNT(*) as count FROM followers WHERE to_user_id = ?`, [userId]),
      executeQuery(`SELECT COUNT(*) as count FROM followers WHERE from_user_id = ?`, [userId])
    ]);

    const stats = {
      total_followers: statsQueries[0][0].count,
      total_following: statsQueries[1][0].count
    };

    console.log(`✅ Found ${followersResult.length} followers for user ${userId}`);

    res.json({
      status: 'success',
      message: 'Followers retrieved successfully',
      data: {
        user: user,
        stats: stats,
        followers: followersResult
      }
    });

  } catch (error) {
    console.error('❌ Get followers error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan server',
      error: error.message
    });
  }
};

// Display following list - sesuai dengan PHP: ProfileController::following
const following = async (req, res) => {
  try {
    const userId = req.user.id;
    const search = req.query.search;
    console.log(`👥 Getting following for user ID: ${userId}`, search ? `(search: ${search})` : '');

    // Get user data
    const getUserQuery = `
      SELECT id, name, email, username, foto
      FROM users 
      WHERE id = ?
    `;
    
    const userResult = await executeQuery(getUserQuery, [userId]);
    const user = userResult[0];

    // Build following query with optional search - sesuai dengan PHP when() clause
    let followingQuery = `
      SELECT 
        u.id,
        u.name,
        u.username,
        u.foto,
        f.created_at as followed_at
      FROM followers f
      INNER JOIN users u ON f.to_user_id = u.id
      WHERE f.from_user_id = ?
    `;
    
    const params = [userId];

    if (search) {
      followingQuery += ` AND (u.name LIKE ? OR u.username LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    followingQuery += ` ORDER BY f.created_at DESC`;

    const followingResult = await executeQuery(followingQuery, params);

    // Get stats
    const statsQueries = await Promise.all([
      executeQuery(`SELECT COUNT(*) as count FROM followers WHERE from_user_id = ?`, [userId]),
      executeQuery(`SELECT COUNT(*) as count FROM followers WHERE to_user_id = ?`, [userId])
    ]);

    const stats = {
      total_following: statsQueries[0][0].count,
      total_followers: statsQueries[1][0].count
    };

    // Format response sesuai dengan PHP map function
    const formattedFollowing = followingResult.map(followedUser => ({
      id: followedUser.id,
      name: followedUser.name,
      username: followedUser.username,
      foto_url: followedUser.foto ? `/uploads/user_foto/${path.basename(followedUser.foto)}` : null,
      followed_at: followedUser.followed_at,
      notifications_enabled: true, // Default value
      is_blocked: false // Default value
    }));

    console.log(`✅ Found ${followingResult.length} following for user ${userId}`);

    res.json({
      status: 'success',
      message: 'Following list retrieved successfully',
      data: {
        user: user,
        stats: stats,
        following: formattedFollowing
      }
    });

  } catch (error) {
    console.error('❌ Get following error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan server',
      error: error.message
    });
  }
};

// ...existing code...

// Update user profile - sesuai dengan PHP: ProfileController::update
const update = async (req, res) => {
  try {
    const { name, username, presentation, add_link } = req.body;
    const userId = req.user.id;
    
    console.log(`📝 Updating profile for user ID: ${userId}`);

    // Get current user data first
    const getCurrentUserQuery = `
      SELECT id, name, email, username, foto, presentation, add_link
      FROM users 
      WHERE id = ?
    `;
    
    const currentUserResult = await executeQuery(getCurrentUserQuery, [userId]);
    const currentUser = currentUserResult[0];

    if (!currentUser) {
      return res.status(404).json({
        status: 'fail',
        message: 'User tidak ditemukan'
      });
    }

    // Validasi username unique - sesuai dengan PHP: unique:users,username,' . $user->id
    if (username && username !== currentUser.username) {
      const checkUsernameQuery = `
        SELECT id FROM users 
        WHERE username = ? AND id != ?
      `;
      
      const existingUsername = await executeQuery(checkUsernameQuery, [username, userId]);
      
      if (existingUsername && existingUsername.length > 0) {
        return res.status(422).json({
          status: 'fail',
          message: 'Username sudah digunakan'
        });
      }
    }

    // Handle foto upload - sesuai dengan PHP foto handling
    let fotoPath = currentUser.foto; // Keep existing foto if no new upload
    
    if (req.file) {
      // Delete old photo if exists
      if (currentUser.foto) {
        const oldPhotoPath = path.join(__dirname, '../../uploads/user_foto', path.basename(currentUser.foto));
        if (fs.existsSync(oldPhotoPath)) {
          fs.unlinkSync(oldPhotoPath);
        }
      }
      
      fotoPath = `/uploads/user_foto/${req.file.filename}`;
    }

    // Build update query - hanya update field yang dikirim (sometimes validation)
    let updateFields = [];
    let params = [];

    if (name !== undefined) {
      updateFields.push('name = ?');
      params.push(name);
    }

    if (username !== undefined) {
      updateFields.push('username = ?');
      params.push(username);
    }

    if (presentation !== undefined) {
      updateFields.push('presentation = ?');
      params.push(presentation);
    }

    if (add_link !== undefined) {
      updateFields.push('add_link = ?');
      params.push(add_link);
    }

    if (req.file) {
      updateFields.push('foto = ?');
      params.push(fotoPath);
    }

    updateFields.push('updated_at = NOW()');
    params.push(userId);

    const updateQuery = `
      UPDATE users 
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `;

    await executeQuery(updateQuery, params);

    // Get updated user data
    const getUserQuery = `
      SELECT id, name, email, username, no_hp, tanggal_lahir, gender, foto, presentation, add_link, created_at, updated_at
      FROM users 
      WHERE id = ?
    `;
    
    const updatedUserResult = await executeQuery(getUserQuery, [userId]);
    const updatedUser = updatedUserResult[0];

    console.log(`✅ Profile updated successfully for user ${updatedUser.name}`);

    // Response format sama persis dengan PHP
    res.json({
      status: 'success',
      message: 'Profile updated successfully',
      data: {
        user: updatedUser,
        updated_fields: {
          name: updatedUser.name,
          username: updatedUser.username,
          presentation: updatedUser.presentation,
          add_link: updatedUser.add_link,
          foto: updatedUser.foto ? `${process.env.BASE_URL || 'http://localhost:3000'}/uploads/user_foto/${path.basename(updatedUser.foto)}` : null
        }
      }
    });

  } catch (error) {
    console.error('❌ Update profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan server',
      error: error.message
    });
  }
};

// Get profile share data - sesuai dengan PHP: ProfileController::shareProfile
const shareProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(`🔗 Getting share profile data for user ID: ${userId}`);

    // Get user data
    const getUserQuery = `
      SELECT id, name, username
      FROM users 
      WHERE id = ?
    `;
    
    const userResult = await executeQuery(getUserQuery, [userId]);
    const user = userResult[0];

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User tidak ditemukan'
      });
    }

    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    
    // Share data sesuai dengan PHP structure
    const shareData = {
      user_id: user.id,
      username: user.username || user.name,
      profile_url: `${baseUrl}/profile/${user.id}`,
      qr_code_url: `${baseUrl}/api/profile/qr/${user.id}`,
      share_text: `Check out ${user.name}'s delicious recipes on DelishApp!`
    };

    console.log(`✅ Share profile data retrieved for user ${user.name}`);

    res.json({
      status: 'success',
      message: 'Share profile data retrieved successfully',
      data: shareData
    });

  } catch (error) {
    console.error('❌ Get share profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan server',
      error: error.message
    });
  }
};

// Follow user - sesuai dengan PHP: ProfileController::followUser
const followUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const followerId = req.user.id;

    console.log(`👥 User ${followerId} attempting to follow user ${userId}`);

    if (userId == followerId) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot follow yourself'
      });
    }

    // Check if target user exists - sesuai dengan PHP: User::findOrFail($userId)
    const targetUserQuery = `SELECT id, name, username FROM users WHERE id = ?`;
    const targetUserResult = await executeQuery(targetUserQuery, [userId]);
    
    if (!targetUserResult || targetUserResult.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    const targetUser = targetUserResult[0];

    // Check if already following - sesuai dengan PHP: exists() check
    const existingFollowQuery = `
      SELECT from_user_id 
      FROM followers 
      WHERE from_user_id = ? AND to_user_id = ?
    `;
    
    const existingFollow = await executeQuery(existingFollowQuery, [followerId, userId]);

    if (existingFollow && existingFollow.length > 0) {
      return res.status(409).json({
        status: 'error',
        message: 'Already following this user'
      });
    }

    // Create follow relationship - sesuai dengan PHP: attach($userId)
    const followQuery = `
      INSERT INTO followers (from_user_id, to_user_id, created_at)
      VALUES (?, ?, NOW())
    `;
    
    await executeQuery(followQuery, [followerId, userId]);

    console.log(`✅ User ${followerId} successfully followed user ${userId}`);

    res.json({
      status: 'success',
      message: 'User followed successfully',
      data: {
        followed_user: {
          id: targetUser.id,
          name: targetUser.name,
          username: targetUser.username
        }
      }
    });

  } catch (error) {
    console.error('❌ Follow user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan server',
      error: error.message
    });
  }
};

// Unfollow user - sesuai dengan PHP: ProfileController::unfollowUser
const unfollowUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const followerId = req.user.id;

    console.log(`👥 User ${followerId} attempting to unfollow user ${userId}`);

    // Delete follow relationship - sesuai dengan PHP: detach($userId)
    const unfollowQuery = `
      DELETE FROM followers 
      WHERE from_user_id = ? AND to_user_id = ?
    `;
    
    const result = await executeQuery(unfollowQuery, [followerId, userId]);

    // Get updated following count
    const followingCountQuery = `
      SELECT COUNT(*) as count 
      FROM followers 
      WHERE from_user_id = ?
    `;
    
    const followingCountResult = await executeQuery(followingCountQuery, [followerId]);
    const followingCount = followingCountResult[0].count;

    console.log(`✅ User ${followerId} successfully unfollowed user ${userId}`);

    res.json({
      status: 'success',
      message: 'Successfully unfollowed user',
      data: {
        following_count: followingCount
      }
    });

  } catch (error) {
    console.error('❌ Unfollow user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan server',
      error: error.message
    });
  }
};

// Toggle follow status - sesuai dengan PHP: ProfileController::toggleFollow
const toggleFollow = async (req, res) => {
  try {
    const { userId } = req.params;
    const followerId = req.user.id;

    console.log(`🔄 User ${followerId} attempting to toggle follow for user ${userId}`);

    if (userId == followerId) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot follow yourself'
      });
    }

    // Check if target user exists
    const targetUserQuery = `SELECT id, name, username FROM users WHERE id = ?`;
    const targetUserResult = await executeQuery(targetUserQuery, [userId]);
    
    if (!targetUserResult || targetUserResult.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    const targetUser = targetUserResult[0];

    // Check if already following
    const existingFollowQuery = `
      SELECT from_user_id 
      FROM followers 
      WHERE from_user_id = ? AND to_user_id = ?
    `;
    
    const existingFollow = await executeQuery(existingFollowQuery, [followerId, userId]);

    let message, following;

    if (existingFollow && existingFollow.length > 0) {
      // Unfollow - sesuai dengan PHP: detach($userId)
      const unfollowQuery = `
        DELETE FROM followers 
        WHERE from_user_id = ? AND to_user_id = ?
      `;
      
      await executeQuery(unfollowQuery, [followerId, userId]);
      message = 'Successfully unfollowed user';
      following = false;
    } else {
      // Follow - sesuai dengan PHP: attach($userId)
      const followQuery = `
        INSERT INTO followers (from_user_id, to_user_id, created_at)
        VALUES (?, ?, NOW())
      `;
      
      await executeQuery(followQuery, [followerId, userId]);
      message = 'Successfully followed user';
      following = true;
    }

    // Get updated following count
    const followingCountQuery = `
      SELECT COUNT(*) as count 
      FROM followers 
      WHERE from_user_id = ?
    `;
    
    const followingCountResult = await executeQuery(followingCountQuery, [followerId]);
    const followingCount = followingCountResult[0].count;

    console.log(`✅ User ${followerId} toggle follow result: ${following ? 'followed' : 'unfollowed'} user ${userId}`);

    res.json({
      status: 'success',
      message: message,
      data: {
        following: following,
        following_count: followingCount,
        target_user: targetUser
      }
    });

  } catch (error) {
    console.error('❌ Toggle follow error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan server',
      error: error.message
    });
  }
};

// ...existing code...

// Get public profile - untuk melihat profile user lain
const getPublicProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user?.id; // Optional auth untuk cek following status
    
    console.log(`👤 Getting public profile for user ID: ${id}`);

    // Get user data (exclude sensitive info) - sesuai dengan public profile
    const getUserQuery = `
      SELECT id, name, username, foto, presentation, add_link, created_at
      FROM users 
      WHERE id = ?
    `;
    
    const userResult = await executeQuery(getUserQuery, [id]);

    if (!userResult || userResult.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'User tidak ditemukan'
      });
    }

    const user = userResult[0];

    // Get user's public recipes dengan review stats
    const recipesQuery = `
      SELECT 
        r.*,
        AVG(rv.bintang) as reviews_avg_bintang,
        COUNT(rv.id) as reviews_count
      FROM recipes r
      LEFT JOIN reviews rv ON r.id = rv.recipe_id
      WHERE r.user_id = ?
      GROUP BY r.id
      ORDER BY r.created_at DESC
      LIMIT 10
    `;
    
    const recipes = await executeQuery(recipesQuery, [id]);

    // Get stats
    const statsQueries = await Promise.all([
      executeQuery(`SELECT COUNT(*) as count FROM recipes WHERE user_id = ?`, [id]),
      executeQuery(`SELECT COUNT(*) as count FROM followers WHERE to_user_id = ?`, [id]),
      executeQuery(`SELECT COUNT(*) as count FROM followers WHERE from_user_id = ?`, [id])
    ]);

    const stats = {
      total_recipes: statsQueries[0][0].count,
      total_followers: statsQueries[1][0].count,
      total_following: statsQueries[2][0].count
    };

    // Check if current user is following this profile (jika ada current user)
    let isFollowing = false;
    if (currentUserId && currentUserId != id) {
      const followingCheckQuery = `
        SELECT from_user_id 
        FROM followers 
        WHERE from_user_id = ? AND to_user_id = ?
      `;
      
      const followingCheck = await executeQuery(followingCheckQuery, [currentUserId, id]);
      isFollowing = followingCheck && followingCheck.length > 0;
    }

    const formattedRecipes = recipes.map(recipe => ({
      ...recipe,
      reviews_avg_bintang: parseFloat(recipe.reviews_avg_bintang) || null,
      reviews_count: parseInt(recipe.reviews_count) || 0
    }));

    console.log(`✅ Public profile retrieved for user ${user.name}`);

    res.json({
      status: 'success',
      message: 'Public profile retrieved successfully',
      data: { 
        user: user,
        stats: stats,
        recipes: formattedRecipes,
        is_following: isFollowing,
        can_follow: currentUserId && currentUserId != id // Bisa follow jika bukan diri sendiri
      }
    });

  } catch (error) {
    console.error('❌ Get public profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan server',
      error: error.message
    });
  }
};

// ...existing code...

// Add recipe to favorites - sesuai dengan PHP: ProfileController::addToFavorites
const addToFavorites = async (req, res) => {
  try {
    const { recipeId } = req.params;
    const userId = req.user.id;

    console.log(`❤️ User ${userId} attempting to add recipe ${recipeId} to favorites`);

    // Check if recipe exists
    const recipeQuery = `SELECT id, nama FROM recipes WHERE id = ?`;
    const recipeResult = await executeQuery(recipeQuery, [recipeId]);
    
    if (!recipeResult || recipeResult.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Recipe not found'
      });
    }

    const recipe = recipeResult[0];

    // Check if already favorited - sesuai dengan PHP: exists() check
    const existingFavoriteQuery = `
      SELECT user_id 
      FROM favorites 
      WHERE user_id = ? AND recipe_id = ?
    `;
    
    const existingFavorite = await executeQuery(existingFavoriteQuery, [userId, recipeId]);

    if (existingFavorite && existingFavorite.length > 0) {
      return res.status(409).json({
        status: 'error',
        message: 'Recipe already in favorites'
      });
    }

    // Add to favorites - sesuai dengan PHP: attach($recipeId)
    const addFavoriteQuery = `
      INSERT INTO favorites (user_id, recipe_id, created_at)
      VALUES (?, ?, NOW())
    `;
    
    await executeQuery(addFavoriteQuery, [userId, recipeId]);

    console.log(`✅ Recipe ${recipe.nama} added to favorites for user ${userId}`);

    res.json({
      status: 'success',
      message: 'Recipe added to favorites successfully'
    });

  } catch (error) {
    console.error('❌ Add to favorites error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan server',
      error: error.message
    });
  }
};

// Remove recipe from favorites - sesuai dengan PHP: ProfileController::removeFromFavorites
const removeFromFavorites = async (req, res) => {
  try {
    const { recipeId } = req.params;
    const userId = req.user.id;

    console.log(`💔 User ${userId} attempting to remove recipe ${recipeId} from favorites`);

    // Remove from favorites - sesuai dengan PHP: detach($recipeId)
    const removeFavoriteQuery = `
      DELETE FROM favorites 
      WHERE user_id = ? AND recipe_id = ?
    `;
    
    const result = await executeQuery(removeFavoriteQuery, [userId, recipeId]);

    console.log(`✅ Recipe ${recipeId} removed from favorites for user ${userId}`);

    res.json({
      status: 'success',
      message: 'Recipe removed from favorites successfully'
    });

  } catch (error) {
    console.error('❌ Remove from favorites error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan server',
      error: error.message
    });
  }
};

// Toggle favorite status - sesuai dengan PHP: ProfileController::toggleFavorite
const toggleFavorite = async (req, res) => {
  try {
    const { recipeId } = req.params;
    const userId = req.user.id;

    console.log(`🔄 User ${userId} attempting to toggle favorite for recipe ${recipeId}`);

    // Check if recipe exists
    const recipeQuery = `SELECT id, nama FROM recipes WHERE id = ?`;
    const recipeResult = await executeQuery(recipeQuery, [recipeId]);
    
    if (!recipeResult || recipeResult.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Recipe not found'
      });
    }

    const recipe = recipeResult[0];

    // Check if already favorited
    const existingFavoriteQuery = `
      SELECT user_id 
      FROM favorites 
      WHERE user_id = ? AND recipe_id = ?
    `;
    
    const existingFavorite = await executeQuery(existingFavoriteQuery, [userId, recipeId]);

    let message, favorited;

    if (existingFavorite && existingFavorite.length > 0) {
      // Remove from favorites - sesuai dengan PHP: detach($recipeId)
      const removeFavoriteQuery = `
        DELETE FROM favorites 
        WHERE user_id = ? AND recipe_id = ?
      `;
      
      await executeQuery(removeFavoriteQuery, [userId, recipeId]);
      message = 'Recipe removed from favorites';
      favorited = false;
    } else {
      // Add to favorites - sesuai dengan PHP: attach($recipeId)
      const addFavoriteQuery = `
        INSERT INTO favorites (user_id, recipe_id, created_at)
        VALUES (?, ?, NOW())
      `;
      
      await executeQuery(addFavoriteQuery, [userId, recipeId]);
      message = 'Recipe added to favorites';
      favorited = true;
    }

    console.log(`✅ User ${userId} toggle favorite result: ${favorited ? 'added' : 'removed'} recipe ${recipe.nama}`);

    res.json({
      status: 'success',
      message: message,
      favorited: favorited
    });

  } catch (error) {
    console.error('❌ Toggle favorite error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan server',
      error: error.message
    });
  }
};

// API: Search Followers - sesuai dengan PHP: ProfileController::apiSearchFollowers
const apiSearchFollowers = async (req, res) => {
  try {
    const { username } = req.params;
    const search = req.query.search;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    console.log(`🔍 Searching followers for username: ${username}`, search ? `(search: ${search})` : '');

    // Find user by username - sesuai dengan PHP: User::where('username', $username)->firstOrFail()
    const userQuery = `
      SELECT id, name, username
      FROM users 
      WHERE username = ?
    `;
    
    const userResult = await executeQuery(userQuery, [username]);

    if (!userResult || userResult.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    const user = userResult[0];

    // Build followers query with search and pagination
    let followersQuery = `
      SELECT 
        u.id,
        u.name,
        u.username,
        u.foto,
        f.created_at as followed_at
      FROM followers f
      INNER JOIN users u ON f.from_user_id = u.id
      WHERE f.to_user_id = ?
    `;
    
    let countQuery = `
      SELECT COUNT(*) as total
      FROM followers f
      INNER JOIN users u ON f.from_user_id = u.id
      WHERE f.to_user_id = ?
    `;

    const params = [user.id];
    const countParams = [user.id];

    if (search) {
      const searchCondition = ` AND (u.name LIKE ? OR u.username LIKE ?)`;
      followersQuery += searchCondition;
      countQuery += searchCondition;
      params.push(`%${search}%`, `%${search}%`);
      countParams.push(`%${search}%`, `%${search}%`);
    }

    followersQuery += ` ORDER BY f.created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    // Execute queries
    const [followersResult, countResult] = await Promise.all([
      executeQuery(followersQuery, params),
      executeQuery(countQuery, countParams)
    ]);

    const total = countResult[0].total;

    // Format pagination data
    const pagination = {
      current_page: page,
      per_page: limit,
      total: total,
      last_page: Math.ceil(total / limit),
      from: offset + 1,
      to: Math.min(offset + limit, total),
      data: followersResult
    };

    console.log(`✅ Found ${followersResult.length} followers for user ${username}`);

    res.json({
      user: {
        id: user.id,
        name: user.name,
        username: user.username
      },
      followers: pagination,
      search: search || null
    });

  } catch (error) {
    console.error('❌ API search followers error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan server',
      error: error.message
    });
  }
};

// API: Search Following - sesuai dengan PHP: ProfileController::apiSearchFollowing
const apiSearchFollowing = async (req, res) => {
  try {
    const { username } = req.params;
    const search = req.query.search;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    console.log(`🔍 Searching following for username: ${username}`, search ? `(search: ${search})` : '');

    // Find user by username
    const userQuery = `
      SELECT id, name, username
      FROM users 
      WHERE username = ?
    `;
    
    const userResult = await executeQuery(userQuery, [username]);

    if (!userResult || userResult.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    const user = userResult[0];

    // Build following query with search and pagination
    let followingQuery = `
      SELECT 
        u.id,
        u.name,
        u.username,
        u.foto,
        f.created_at as followed_at
      FROM followers f
      INNER JOIN users u ON f.to_user_id = u.id
      WHERE f.from_user_id = ?
    `;
    
    let countQuery = `
      SELECT COUNT(*) as total
      FROM followers f
      INNER JOIN users u ON f.to_user_id = u.id
      WHERE f.from_user_id = ?
    `;

    const params = [user.id];
    const countParams = [user.id];

    if (search) {
      const searchCondition = ` AND (u.name LIKE ? OR u.username LIKE ?)`;
      followingQuery += searchCondition;
      countQuery += searchCondition;
      params.push(`%${search}%`, `%${search}%`);
      countParams.push(`%${search}%`, `%${search}%`);
    }

    followingQuery += ` ORDER BY f.created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    // Execute queries
    const [followingResult, countResult] = await Promise.all([
      executeQuery(followingQuery, params),
      executeQuery(countQuery, countParams)
    ]);

    const total = countResult[0].total;

    // Format pagination data
    const pagination = {
      current_page: page,
      per_page: limit,
      total: total,
      last_page: Math.ceil(total / limit),
      from: offset + 1,
      to: Math.min(offset + limit, total),
      data: followingResult
    };

    console.log(`✅ Found ${followingResult.length} following for user ${username}`);

    res.json({
      user: {
        id: user.id,
        name: user.name,
        username: user.username
      },
      following: pagination,
      search: search || null
    });

  } catch (error) {
    console.error('❌ API search following error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan server',
      error: error.message
    });
  }
};

// Generate QR Code untuk profile (existing code)
const generateQRCode = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`🔲 Generating QR code for user ID: ${id}`);

    // Check if user exists
    const getUserQuery = `SELECT id, name, username FROM users WHERE id = ?`;
    const userResult = await executeQuery(getUserQuery, [id]);
    
    if (!userResult || userResult.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'User tidak ditemukan'
      });
    }

    const user = userResult[0];
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    const profileUrl = `${baseUrl}/profile/${user.id}`;

    // Simple QR code response (bisa integrate dengan library QR code)
    res.json({
      status: 'success',
      message: 'QR code data generated successfully',
      data: {
        user_id: user.id,
        username: user.username || user.name,
        profile_url: profileUrl,
        qr_text: profileUrl,
        // Bisa tambahkan actual QR code image URL jika sudah implement QR library
        qr_image_url: `${baseUrl}/api/profile/qr-image/${user.id}`
      }
    });

  } catch (error) {
    console.error('❌ Generate QR code error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan server',
      error: error.message
    });
  }
};

console.log('✅ profileController functions defined');

// UPDATE EXPORT dengan semua method baru
const profileController = {
  index,
  followers,
  following,
  update,
  shareProfile,
  followUser,
  unfollowUser,
  toggleFollow,
  getPublicProfile,
  addToFavorites,
  removeFromFavorites,
  toggleFavorite,
  apiSearchFollowers,
  apiSearchFollowing,
  generateQRCode
};

console.log('✅ profileController exports:', Object.keys(profileController));

module.exports = profileController;