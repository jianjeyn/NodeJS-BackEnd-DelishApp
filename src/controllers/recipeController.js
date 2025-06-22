const { executeQuery } = require('../../config/database');
const { validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');

console.log('🔍 Loading recipeController...');

module.exports = {
  // 1. Ambil semua resep (dengan filter kategori)
  async index(req, res) {
    try {
      console.log('📋 Getting all recipes...');
      const { kategori } = req.query;

      let query = `
        SELECT 
          r.*,
          u.name as user_name,
          u.username,
          u.foto as user_foto,
          AVG(rv.bintang) as reviews_avg_bintang,
          COUNT(rv.id) as reviews_count,
          COUNT(f.user_id) as favorites_count
        FROM recipes r
        LEFT JOIN users u ON r.user_id = u.id
        LEFT JOIN reviews rv ON r.id = rv.recipe_id
        LEFT JOIN favorites f ON r.id = f.recipe_id
      `;

      let params = [];
      if (kategori) {
        query += ' WHERE r.kategori = ?';
        params.push(kategori);
      }

      query += `
        GROUP BY r.id
        ORDER BY r.created_at DESC
      `;

      const recipes = await executeQuery(query, params);

      res.json({
        status: 'success',
        message: 'Recipes retrieved successfully',
        data: {
          recipes: recipes.map(recipe => ({
            ...recipe,
            reviews_avg_bintang: parseFloat(recipe.reviews_avg_bintang) || 0,
            reviews_count: parseInt(recipe.reviews_count) || 0,
            favorites_count: parseInt(recipe.favorites_count) || 0
          }))
        }
      });

    } catch (err) {
      console.error('❌ Error getting recipes:', err);
      res.status(500).json({ 
        status: 'error',
        message: 'Server error',
        error: err.message 
      });
    }
  },

  // 2. Tampilkan detail satu resep
  async show(req, res) {
    try {
      const { id } = req.params;
      console.log(`📋 Getting recipe detail for ID: ${id}`);

      // Get recipe with user info
      const recipeQuery = `
        SELECT 
          r.*,
          u.name as user_name,
          u.username,
          u.foto as user_foto
        FROM recipes r
        LEFT JOIN users u ON r.user_id = u.id
        WHERE r.id = ?
      `;

      const recipe = await executeQuery(recipeQuery, [id]);

      if (!recipe || recipe.length === 0) {
        return res.status(404).json({ 
          status: 'fail',
          message: 'Resep tidak ditemukan' 
        });
      }

      // Get ingredients
      const ingredients = await executeQuery(
        'SELECT * FROM ingredients WHERE recipe_id = ? ORDER BY id',
        [id]
      );

      // Get steps
      const steps = await executeQuery(
        'SELECT * FROM steps WHERE recipe_id = ? ORDER BY no',
        [id]
      );

      // Get reviews with user info
      const reviewsQuery = `
        SELECT 
          rv.*,
          u.name as user_name,
          u.username,
          u.foto as user_foto
        FROM reviews rv
        LEFT JOIN users u ON rv.user_id = u.id
        WHERE rv.recipe_id = ?
        ORDER BY rv.created_at DESC
      `;

      const reviews = await executeQuery(reviewsQuery, [id]);

      // Get review statistics
      const reviewStatsQuery = `
        SELECT 
          AVG(bintang) as avg_bintang,
          COUNT(*) as count_bintang
        FROM reviews 
        WHERE recipe_id = ?
      `;

      const reviewStats = await executeQuery(reviewStatsQuery, [id]);

      const recipeData = {
        ...recipe[0],
        ingredients,
        steps,
        reviews,
        reviews_avg_bintang: parseFloat(reviewStats[0]?.avg_bintang) || 0,
        reviews_count: parseInt(reviewStats[0]?.count_bintang) || 0,
        steps_count: steps.length,
        ingredients_count: ingredients.length
      };

      console.log(`✅ Recipe detail retrieved: ${recipeData.nama}`);

      res.json({
        status: 'success',
        message: 'Recipe detail retrieved successfully',
        data: { recipe: recipeData }
      });

    } catch (err) {
      console.error('❌ Error getting recipe detail:', err);
      res.status(500).json({ 
        status: 'error',
        message: 'Server error',
        error: err.message 
      });
    }
  },

  // 3. Simpan resep baru
  async store(req, res) {
    try {
      console.log('📝 Creating new recipe...');
      
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ 
          status: 'fail',
          errors: errors.array() 
        });
      }

      const {
        nama,
        detail,
        ingredients, // Array of ingredients
        steps, // Array of steps
        durasi,
        kategori,
        jenis_hidangan,
        estimasi_waktu,
        tingkat_kesulitan,
      } = req.body;

      const foto = req.file ? `/uploads/recipes/${req.file.filename}` : null;

      if (!req.user || !req.user.id) {
        return res.status(401).json({
          status: 'fail',
          message: 'Authentication required'
        });
      }

      // Insert recipe
      const recipeResult = await executeQuery(`
        INSERT INTO recipes (
          user_id, nama, foto, detail, durasi, kategori, 
          jenis_hidangan, estimasi_waktu, tingkat_kesulitan, 
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [
        req.user.id, nama, foto, detail, durasi, kategori,
        jenis_hidangan, estimasi_waktu, tingkat_kesulitan
      ]);

      const recipeId = recipeResult.insertId;

      // Insert ingredients
      if (ingredients && Array.isArray(ingredients)) {
        for (const ingredient of ingredients) {
          await executeQuery(
            'INSERT INTO ingredients (recipe_id, bahan) VALUES (?, ?)',
            [recipeId, ingredient.bahan || ingredient]
          );
        }
      }

      // Insert steps
      if (steps && Array.isArray(steps)) {
        for (let i = 0; i < steps.length; i++) {
          const step = steps[i];
          await executeQuery(
            'INSERT INTO steps (recipe_id, no, deskripsi) VALUES (?, ?, ?)',
            [recipeId, step.no || (i + 1), step.deskripsi || step]
          );
        }
      }

      // Get the created recipe
      const createdRecipe = await executeQuery(
        'SELECT * FROM recipes WHERE id = ?',
        [recipeId]
      );

      console.log(`✅ Recipe created successfully: ${nama}`);

      res.status(201).json({
        status: 'success',
        message: 'Resep berhasil ditambahkan',
        data: { recipe: createdRecipe[0] }
      });

    } catch (err) {
      console.error('❌ Error creating recipe:', err);
      res.status(500).json({ 
        status: 'error',
        message: 'Gagal menambahkan resep',
        error: err.message 
      });
    }
  },

  // 4. Update resep
  async update(req, res) {
    try {
      const { id } = req.params;
      console.log(`📝 Updating recipe ID: ${id}`);

      // Check if recipe exists and user owns it
      const existingRecipe = await executeQuery(
        'SELECT * FROM recipes WHERE id = ?',
        [id]
      );

      if (!existingRecipe || existingRecipe.length === 0) {
        return res.status(404).json({ 
          status: 'fail',
          message: 'Resep tidak ditemukan' 
        });
      }

      // Check ownership (optional - uncomment if needed)
      // if (existingRecipe[0].user_id !== req.user.id) {
      //   return res.status(403).json({ 
      //     status: 'fail',
      //     message: 'Tidak diizinkan mengubah resep orang lain' 
      //   });
      // }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ 
          status: 'fail',
          errors: errors.array() 
        });
      }

      const {
        nama,
        detail,
        ingredients,
        steps,
        durasi,
        kategori,
        jenis_hidangan,
        estimasi_waktu,
        tingkat_kesulitan,
      } = req.body;

      const foto = req.file ? `/uploads/recipes/${req.file.filename}` : existingRecipe[0].foto;

      // Update recipe
      await executeQuery(`
        UPDATE recipes SET 
          nama = ?, foto = ?, detail = ?, durasi = ?, kategori = ?,
          jenis_hidangan = ?, estimasi_waktu = ?, tingkat_kesulitan = ?,
          updated_at = NOW()
        WHERE id = ?
      `, [
        nama, foto, detail, durasi, kategori,
        jenis_hidangan, estimasi_waktu, tingkat_kesulitan, id
      ]);

      // Update ingredients (delete old, insert new)
      if (ingredients && Array.isArray(ingredients)) {
        await executeQuery('DELETE FROM ingredients WHERE recipe_id = ?', [id]);
        for (const ingredient of ingredients) {
          await executeQuery(
            'INSERT INTO ingredients (recipe_id, bahan) VALUES (?, ?)',
            [id, ingredient.bahan || ingredient]
          );
        }
      }

      // Update steps (delete old, insert new)
      if (steps && Array.isArray(steps)) {
        await executeQuery('DELETE FROM steps WHERE recipe_id = ?', [id]);
        for (let i = 0; i < steps.length; i++) {
          const step = steps[i];
          await executeQuery(
            'INSERT INTO steps (recipe_id, no, deskripsi) VALUES (?, ?, ?)',
            [id, step.no || (i + 1), step.deskripsi || step]
          );
        }
      }

      // Get updated recipe
      const updatedRecipe = await executeQuery(
        'SELECT * FROM recipes WHERE id = ?',
        [id]
      );

      console.log(`✅ Recipe updated successfully: ${nama}`);

      res.json({
        status: 'success',
        message: 'Resep berhasil diperbarui',
        data: { recipe: updatedRecipe[0] }
      });

    } catch (err) {
      console.error('❌ Error updating recipe:', err);
      res.status(500).json({ 
        status: 'error',
        message: 'Gagal memperbarui resep',
        error: err.message 
      });
    }
  },

  // 5. Hapus resep
  async destroy(req, res) {
    try {
      const { id } = req.params;
      console.log(`🗑️ Deleting recipe ID: ${id}`);

      // Check if recipe exists
      const existingRecipe = await executeQuery(
        'SELECT * FROM recipes WHERE id = ?',
        [id]
      );

      if (!existingRecipe || existingRecipe.length === 0) {
        return res.status(404).json({ 
          status: 'fail',
          message: 'Resep tidak ditemukan' 
        });
      }

      // Check ownership (optional - uncomment if needed)
      // if (existingRecipe[0].user_id !== req.user.id) {
      //   return res.status(403).json({ 
      //     status: 'fail',
      //     message: 'Tidak diizinkan menghapus resep orang lain' 
      //   });
      // }

      // Delete recipe (ingredients, steps, reviews, favorites will be deleted by CASCADE)
      await executeQuery('DELETE FROM recipes WHERE id = ?', [id]);

      console.log(`✅ Recipe deleted successfully: ${existingRecipe[0].nama}`);

      res.json({ 
        status: 'success',
        message: 'Resep berhasil dihapus' 
      });

    } catch (err) {
      console.error('❌ Error deleting recipe:', err);
      res.status(500).json({ 
        status: 'error',
        message: 'Gagal menghapus resep',
        error: err.message 
      });
    }
  },
};

console.log('✅ recipeController functions defined');