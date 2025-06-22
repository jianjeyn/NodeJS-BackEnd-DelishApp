const { executeQuery } = require('../../config/database');
const { validationResult } = require('express-validator');
const path = require('path');
const fs = require('fs');

console.log('🔍 Loading reviewController...');

module.exports = {
  // GET /api/recipes/:recipeId/reviews - Ambil semua review untuk resep tertentu
  async index(req, res) {
    try {
      const { recipeId } = req.params; // Ubah dari recipe_id ke recipeId
      console.log(`📋 Getting reviews for recipe ID: ${recipeId}`);

      // Query untuk mengambil reviews dengan informasi user (sesuai database)
      const query = `
        SELECT 
          r.*,
          u.id as user_id,
          u.name as user_name,
          u.username,
          u.foto as user_foto
        FROM reviews r
        LEFT JOIN users u ON r.user_id = u.id
        WHERE r.recipe_id = ?
        ORDER BY r.created_at DESC
      `;

      const reviews = await executeQuery(query, [recipeId]);

      // Query untuk mendapatkan statistik review
      const statsQuery = `
        SELECT 
          AVG(bintang) as avg_rating,
          COUNT(*) as total_reviews,
          SUM(CASE WHEN bintang = 1 THEN 1 ELSE 0 END) as rating_1,
          SUM(CASE WHEN bintang = 2 THEN 1 ELSE 0 END) as rating_2,
          SUM(CASE WHEN bintang = 3 THEN 1 ELSE 0 END) as rating_3,
          SUM(CASE WHEN bintang = 4 THEN 1 ELSE 0 END) as rating_4,
          SUM(CASE WHEN bintang = 5 THEN 1 ELSE 0 END) as rating_5
        FROM reviews 
        WHERE recipe_id = ?
      `;

      const stats = await executeQuery(statsQuery, [recipeId]);
      const reviewStats = stats[0] || {
        avg_rating: 0,
        total_reviews: 0,
        rating_1: 0,
        rating_2: 0,
        rating_3: 0,
        rating_4: 0,
        rating_5: 0
      };

      console.log(`✅ Found ${reviews.length} reviews for recipe ${recipeId}`);

      // Format response sesuai dengan PHP version
      return res.json({
        reviews: reviews.map(review => ({
          id: review.id,
          recipe_id: review.recipe_id,
          user_id: review.user_id,
          deskripsi: review.deskripsi,
          bintang: parseInt(review.bintang) || 0,
          foto: review.foto,
          created_at: review.created_at,
          updated_at: review.updated_at,
          user: {
            id: review.user_id,
            name: review.user_name,
            username: review.username,
            foto: review.user_foto
          }
        })),
        statistics: {
          avg_rating: parseFloat(reviewStats.avg_rating) || 0,
          total_reviews: parseInt(reviewStats.total_reviews) || 0,
          rating_breakdown: {
            "1": parseInt(reviewStats.rating_1) || 0,
            "2": parseInt(reviewStats.rating_2) || 0,
            "3": parseInt(reviewStats.rating_3) || 0,
            "4": parseInt(reviewStats.rating_4) || 0,
            "5": parseInt(reviewStats.rating_5) || 0
          }
        }
      });

    } catch (error) {
      console.error('❌ Error getting reviews:', error);
      return res.status(500).json({ 
        message: 'Server error',
        error: error.message 
      });
    }
  },

  // POST /api/recipes/:recipeId/reviews - Buat review baru
  async store(req, res) {
    try {
      console.log('📝 Creating new review...');
      
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ 
          message: 'Validation failed',
          errors: errors.array() 
        });
      }

      const { recipeId } = req.params; // Dari URL parameter
      const { deskripsi, bintang } = req.body;
      const user_id = req.user.id;

      // Validasi user sudah login
      if (!user_id) {
        return res.status(401).json({
          message: 'Authentication required'
        });
      }

      // Validasi recipe exists
      const recipeExists = await executeQuery(
        'SELECT id FROM recipes WHERE id = ?',
        [recipeId]
      );

      if (!recipeExists || recipeExists.length === 0) {
        return res.status(404).json({
          message: 'Recipe not found'
        });
      }

      // Cek apakah user sudah pernah review recipe ini
      const existingReview = await executeQuery(
        'SELECT id FROM reviews WHERE recipe_id = ? AND user_id = ?',
        [recipeId, user_id]
      );

      if (existingReview && existingReview.length > 0) {
        return res.status(400).json({
          message: 'You have already reviewed this recipe'
        });
      }

      // Handle foto upload
      let fotoPath = null;
      if (req.file) {
        fotoPath = `/uploads/reviews/${req.file.filename}`;
      }

      // Insert review ke database
      const result = await executeQuery(`
        INSERT INTO reviews (recipe_id, user_id, deskripsi, bintang, foto, created_at, updated_at) 
        VALUES (?, ?, ?, ?, ?, NOW(), NOW())
      `, [recipeId, user_id, deskripsi, bintang, fotoPath]);

      // Ambil review yang baru dibuat dengan informasi user
      const newReviewQuery = `
        SELECT 
          r.*,
          u.name as user_name,
          u.username,
          u.foto as user_foto
        FROM reviews r
        LEFT JOIN users u ON r.user_id = u.id
        WHERE r.id = ?
      `;

      const newReview = await executeQuery(newReviewQuery, [result.insertId]);
      const reviewData = newReview[0];

      console.log(`✅ Review created successfully for recipe ${recipeId} by user ${user_id}`);

      // Format response sesuai dengan PHP version
      return res.status(201).json({
        message: 'Review berhasil ditambahkan',
        data: {
          id: reviewData.id,
          recipe_id: reviewData.recipe_id,
          user_id: reviewData.user_id,
          deskripsi: reviewData.deskripsi,
          bintang: parseInt(reviewData.bintang) || 0,
          foto: reviewData.foto,
          created_at: reviewData.created_at,
          updated_at: reviewData.updated_at,
          user: {
            id: reviewData.user_id,
            name: reviewData.user_name,
            username: reviewData.username,
            foto: reviewData.user_foto
          }
        }
      });

    } catch (error) {
      console.error('❌ Error creating review:', error);
      return res.status(500).json({ 
        message: 'Gagal menyimpan review',
        error: error.message 
      });
    }
  },

  // PUT /api/reviews/:id - Update review (legacy endpoint)
  async update(req, res) {
    try {
      const { id } = req.params;
      console.log(`📝 Updating review ID: ${id}`);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ 
          message: 'Validation failed',
          errors: errors.array() 
        });
      }

      // Check if review exists and user owns it
      const existingReview = await executeQuery(
        'SELECT * FROM reviews WHERE id = ?',
        [id]
      );

      if (!existingReview || existingReview.length === 0) {
        return res.status(404).json({
          message: 'Review not found'
        });
      }

      // Check ownership
      if (existingReview[0].user_id !== req.user.id) {
        return res.status(403).json({
          message: 'Not authorized to update this review'
        });
      }

      const { deskripsi, bintang } = req.body;

      // Handle foto upload
      let fotoPath = existingReview[0].foto;
      if (req.file) {
        fotoPath = `/uploads/reviews/${req.file.filename}`;
        
        // Delete old photo if exists
        if (existingReview[0].foto) {
          const oldPhotoPath = path.join(__dirname, '../../uploads/reviews', path.basename(existingReview[0].foto));
          if (fs.existsSync(oldPhotoPath)) {
            fs.unlinkSync(oldPhotoPath);
          }
        }
      }

      // Update review
      await executeQuery(`
        UPDATE reviews 
        SET deskripsi = ?, bintang = ?, foto = ?, updated_at = NOW()
        WHERE id = ?
      `, [deskripsi, bintang, fotoPath, id]);

      // Get updated review
      const updatedReviewQuery = `
        SELECT 
          r.*,
          u.name as user_name,
          u.username,
          u.foto as user_foto
        FROM reviews r
        LEFT JOIN users u ON r.user_id = u.id
        WHERE r.id = ?
      `;

      const updatedReview = await executeQuery(updatedReviewQuery, [id]);
      const reviewData = updatedReview[0];

      console.log(`✅ Review updated successfully: ID ${id}`);

      return res.json({
        message: 'Review berhasil diperbarui',
        data: {
          id: reviewData.id,
          recipe_id: reviewData.recipe_id,
          user_id: reviewData.user_id,
          deskripsi: reviewData.deskripsi,
          bintang: parseInt(reviewData.bintang) || 0,
          foto: reviewData.foto,
          created_at: reviewData.created_at,
          updated_at: reviewData.updated_at,
          user: {
            id: reviewData.user_id,
            name: reviewData.user_name,
            username: reviewData.username,
            foto: reviewData.user_foto
          }
        }
      });

    } catch (error) {
      console.error('❌ Error updating review:', error);
      return res.status(500).json({ 
        message: 'Gagal memperbarui review',
        error: error.message 
      });
    }
  },

  // DELETE /api/reviews/:id - Hapus review (legacy endpoint)
  async destroy(req, res) {
    try {
      const { id } = req.params;
      console.log(`🗑️ Deleting review ID: ${id}`);

      // Check if review exists and user owns it
      const existingReview = await executeQuery(
        'SELECT * FROM reviews WHERE id = ?',
        [id]
      );

      if (!existingReview || existingReview.length === 0) {
        return res.status(404).json({
          message: 'Review not found'
        });
      }

      // Check ownership
      if (existingReview[0].user_id !== req.user.id) {
        return res.status(403).json({
          message: 'Not authorized to delete this review'
        });
      }

      // Delete photo if exists
      if (existingReview[0].foto) {
        const photoPath = path.join(__dirname, '../../uploads/reviews', path.basename(existingReview[0].foto));
        if (fs.existsSync(photoPath)) {
          fs.unlinkSync(photoPath);
        }
      }

      // Delete review
      await executeQuery('DELETE FROM reviews WHERE id = ?', [id]);

      console.log(`✅ Review deleted successfully: ID ${id}`);

      return res.json({
        message: 'Review berhasil dihapus'
      });

    } catch (error) {
      console.error('❌ Error deleting review:', error);
      return res.status(500).json({ 
        message: 'Gagal menghapus review',
        error: error.message 
      });
    }
  }
};

console.log('✅ reviewController functions defined');