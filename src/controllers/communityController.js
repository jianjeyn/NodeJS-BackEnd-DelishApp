const { Community, User, Recipe } = require('../models');

exports.index = async (req, res) => {
  try {
    const communities = await Community.findAll({
      include: [
        {
          model: User,
          attributes: [],
          through: { attributes: [] }
        }
      ],
      attributes: {
        include: [
          [Sequelize.fn('COUNT', Sequelize.col('users.id')), 'usersCount']
        ]
      },
      group: ['Community.id']
    });

    res.json(communities);
  } catch (error) {
    console.error('Error in index:', error);
    res.status(500).json({ error: 'Gagal mengambil data komunitas' });
  }
};

exports.show = async (req, res) => {
  const { id } = req.params;

  try {
    const community = await Community.findByPk(id, {
      include: {
        model: User,
        include: [Recipe],
        through: { attributes: [] }
      }
    });

    if (!community) return res.status(404).json({ error: 'Komunitas tidak ditemukan' });

    const recipes = community.Users.flatMap(user => user.Recipes || []);
    const users = community.Users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email
    }));

    res.json({
      community: {
        id: community.id,
        nama: community.nama
      },
      users,
      recipes
    });
  } catch (error) {
    console.error('Error in show:', error);
    res.status(500).json({ error: 'Gagal mengambil detail komunitas' });
  }
};

exports.addUser = async (req, res) => {
  const { user_id } = req.body;
  const { id } = req.params;

  if (!user_id) return res.status(400).json({ error: 'user_id diperlukan' });

  try {
    const community = await Community.findByPk(id);
    const user = await User.findByPk(user_id);

    if (!community || !user)
      return res.status(404).json({ error: 'Komunitas atau user tidak ditemukan' });

    await community.addUser(user); // Tidak menimpa relasi lainnya

    res.json({ message: 'User berhasil ditambahkan ke komunitas' });
  } catch (error) {
    console.error('Error in addUser:', error);
    res.status(500).json({ error: 'Gagal menambahkan user ke komunitas' });
  }
};

exports.removeUser = async (req, res) => {
  const { user_id } = req.body;
  const { id } = req.params;

  if (!user_id) return res.status(400).json({ error: 'user_id diperlukan' });

  try {
    const community = await Community.findByPk(id);
    const user = await User.findByPk(user_id);

    if (!community || !user)
      return res.status(404).json({ error: 'Komunitas atau user tidak ditemukan' });

    await community.removeUser(user);

    res.json({ message: 'User berhasil dihapus dari komunitas' });
  } catch (error) {
    console.error('Error in removeUser:', error);
    res.status(500).json({ error: 'Gagal menghapus user dari komunitas' });
  }
};
