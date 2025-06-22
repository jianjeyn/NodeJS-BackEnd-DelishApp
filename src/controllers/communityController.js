const { executeQuery } = require('../../config/database');

console.log('🔍 Loading communityController...');

const index = async (req, res) => {
  try {
    console.log('📋 Getting all communities...');
    
    // Fix: Gunakan nama tabel yang benar 'communities' bukan 'community'
    const query = `
      SELECT 
        c.*,
        COUNT(cu.user_id) as member_count
      FROM communities c
      LEFT JOIN community_users cu ON c.id = cu.community_id
      GROUP BY c.id
      ORDER BY member_count DESC, c.nama ASC
    `;

    const communities = await executeQuery(query);
    
    console.log(`✅ Found ${communities.length} communities`);
    
    res.json({ 
      status: 'success', 
      message: 'Communities retrieved successfully',
      data: { 
        communities: communities.map(community => ({
          ...community,
          member_count: parseInt(community.member_count) || 0
        }))
      }
    });
    
  } catch (error) {
    console.error('❌ Error getting communities:', error);
    res.status(500).json({
      status: 'error',
      message: 'Gagal mengambil data komunitas',
      error: error.message
    });
  }
};

const show = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`📋 Getting community detail for ID: ${id}`);
    
    // Fix: Gunakan nama tabel yang benar
    const communityQuery = `
      SELECT 
        c.*,
        COUNT(cu.user_id) as member_count
      FROM communities c
      LEFT JOIN community_users cu ON c.id = cu.community_id
      WHERE c.id = ?
      GROUP BY c.id
    `;

    const community = await executeQuery(communityQuery, [id]);
    
    if (!community || community.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'Komunitas tidak ditemukan'
      });
    }

    // Get community members
    const membersQuery = `
      SELECT 
        u.id,
        u.name,
        u.username,
        u.foto
      FROM users u
      INNER JOIN community_users cu ON u.id = cu.user_id
      WHERE cu.community_id = ?
      ORDER BY u.name ASC
      LIMIT 20
    `;

    const members = await executeQuery(membersQuery, [id]);

    const communityData = {
      ...community[0],
      member_count: parseInt(community[0].member_count) || 0,
      members: members
    };
    
    console.log(`✅ Community detail retrieved: ${communityData.nama}`);
    
    res.json({ 
      status: 'success', 
      message: 'Community detail retrieved successfully',
      data: { community: communityData }
    });
    
  } catch (error) {
    console.error('❌ Error getting community detail:', error);
    res.status(500).json({
      status: 'error',
      message: 'Gagal mengambil detail komunitas',
      error: error.message
    });
  }
};

const addUser = async (req, res) => {
  try {
    const { id } = req.params; // community_id
    const userId = req.user.id;
    
    console.log(`👥 User ${userId} joining community ${id}`);
    
    // Fix: Gunakan nama tabel yang benar
    const existingMember = await executeQuery(
      'SELECT community_id FROM community_users WHERE community_id = ? AND user_id = ?',
      [id, userId]
    );

    if (existingMember.length > 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Anda sudah bergabung dengan komunitas ini'
      });
    }

    // Add user to community
    await executeQuery(
      'INSERT INTO community_users (community_id, user_id) VALUES (?, ?)',
      [id, userId]
    );

    console.log(`✅ User ${userId} successfully joined community ${id}`);
    
    res.json({
      status: 'success',
      message: 'Berhasil bergabung dengan komunitas'
    });

  } catch (error) {
    console.error('❌ Error joining community:', error);
    res.status(500).json({
      status: 'error',
      message: 'Gagal bergabung dengan komunitas',
      error: error.message
    });
  }
};

const removeUser = async (req, res) => {
  try {
    const { id } = req.params; // community_id
    const userId = req.user.id;
    
    console.log(`👥 User ${userId} leaving community ${id}`);
    
    // Fix: Gunakan nama tabel yang benar
    const result = await executeQuery(
      'DELETE FROM community_users WHERE community_id = ? AND user_id = ?',
      [id, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Anda belum bergabung dengan komunitas ini'
      });
    }

    console.log(`✅ User ${userId} successfully left community ${id}`);
    
    res.json({
      status: 'success',
      message: 'Berhasil keluar dari komunitas'
    });

  } catch (error) {
    console.error('❌ Error leaving community:', error);
    res.status(500).json({
      status: 'error',
      message: 'Gagal keluar dari komunitas',
      error: error.message
    });
  }
};

console.log('✅ communityController functions defined');

module.exports = { index, show, addUser, removeUser };