const express = require('express');
const { Op } = require('sequelize');
const { User, Store, Rating } = require('../models');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { validateUser, validateStore } = require('../middleware/validation');

const router = express.Router();

// Apply authentication and admin role check to all routes
router.use(authenticateToken, requireAdmin);

// Dashboard statistics
router.get('/dashboard', async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalStores = await Store.count();
    const totalRatings = await Rating.count();

    res.json({
      totalUsers,
      totalStores,
      totalRatings
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard data' });
  }
});

// Get all stores with pagination, sorting, and filtering
router.get('/stores', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      search = '',
      filterBy = 'all'
    } = req.query;

    const offset = (page - 1) * limit;
    const order = [[sortBy, sortOrder.toUpperCase()]];

    let whereClause = {};
    if (search) {
      whereClause = {
        [Op.or]: [
          { name: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
          { address: { [Op.like]: `%${search}%` } }
        ]
      };
    }

    const { count, rows: stores } = await Store.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Rating,
          as: 'ratings',
          attributes: ['rating']
        }
      ],
      order,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Calculate average rating for each store
    const storesWithRating = stores.map(store => {
      const ratings = store.ratings || [];
      const averageRating = ratings.length > 0 
        ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(2)
        : 0;

      return {
        ...store.toJSON(),
        averageRating: parseFloat(averageRating),
        totalRatings: ratings.length
      };
    });

    res.json({
      stores: storesWithRating,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Stores fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch stores' });
  }
});

// Get all users with pagination, sorting, and filtering
router.get('/users', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      search = '',
      role = 'all'
    } = req.query;

    const offset = (page - 1) * limit;
    const order = [[sortBy, sortOrder.toUpperCase()]];

    let whereClause = {};
    if (search) {
      whereClause = {
        [Op.or]: [
          { name: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
          { address: { [Op.like]: `%${search}%` } }
        ]
      };
    }

    if (role !== 'all') {
      whereClause.role = role;
    }

    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Store,
          as: 'stores',
          attributes: ['id', 'name'],
          include: [
            {
              model: Rating,
              as: 'ratings',
              attributes: ['rating']
            }
          ]
        }
      ],
      order,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Calculate average rating for store owners
    const usersWithRating = users.map(user => {
      if (user.role === 'store_owner' && user.stores.length > 0) {
        const allRatings = user.stores.flatMap(store => store.ratings || []);
        const averageRating = allRatings.length > 0 
          ? (allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length).toFixed(2)
          : 0;

        return {
          ...user.toJSON(),
          averageRating: parseFloat(averageRating),
          totalRatings: allRatings.length
        };
      }
      return user.toJSON();
    });

    res.json({
      users: usersWithRating,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Users fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// Get user details by ID
router.get('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Store,
          as: 'stores',
          include: [
            {
              model: Rating,
              as: 'ratings',
              attributes: ['rating', 'comment', 'createdAt'],
              include: [
                {
                  model: User,
                  as: 'user',
                  attributes: ['name', 'email']
                }
              ]
            }
          ]
        }
      ]
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Calculate average rating for store owners
    let userData = user.toJSON();
    if (user.role === 'store_owner' && user.stores.length > 0) {
      const allRatings = user.stores.flatMap(store => store.ratings || []);
      const averageRating = allRatings.length > 0 
        ? (allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length).toFixed(2)
        : 0;

      userData.averageRating = parseFloat(averageRating);
      userData.totalRatings = allRatings.length;
    }

    res.json({ user: userData });
  } catch (error) {
    console.error('User details error:', error);
    res.status(500).json({ message: 'Failed to fetch user details' });
  }
});

// Create new store
router.post('/stores', validateStore, async (req, res) => {
  try {
    const { name, email, address, ownerId } = req.body;

    // Verify owner exists and is a store owner
    const owner = await User.findByPk(ownerId);
    if (!owner || owner.role !== 'store_owner') {
      return res.status(400).json({ message: 'Invalid store owner' });
    }

    // Check if store email already exists
    const existingStore = await Store.findOne({ where: { email } });
    if (existingStore) {
      return res.status(400).json({ message: 'Store with this email already exists' });
    }

    const store = await Store.create({
      name,
      email,
      address,
      ownerId
    });

    res.status(201).json({
      message: 'Store created successfully',
      store
    });
  } catch (error) {
    console.error('Store creation error:', error);
    res.status(500).json({ message: 'Failed to create store' });
  }
});

// Create new user (admin only)
router.post('/users', validateUser, async (req, res) => {
  try {
    const { name, email, address, password, role = 'user' } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const user = await User.create({
      name,
      email,
      address,
      password,
      role
    });

    res.status(201).json({
      message: 'User created successfully',
      user: user.toJSON()
    });
  } catch (error) {
    console.error('User creation error:', error);
    res.status(500).json({ message: 'Failed to create user' });
  }
});

// Get store ratings for admin view
router.get('/stores/:id/ratings', async (req, res) => {
  try {
    const { id } = req.params;

    const ratings = await Rating.findAll({
      where: { storeId: id },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: 20
    });

    res.json({
      ratings: ratings.map(rating => ({
        id: rating.id,
        rating: rating.rating,
        comment: rating.comment,
        createdAt: rating.createdAt,
        user: rating.user
      }))
    });
  } catch (error) {
    console.error('Store ratings error:', error);
    res.status(500).json({ message: 'Failed to fetch store ratings' });
  }
});

// Get user ratings for admin view
router.get('/users/:id/ratings', async (req, res) => {
  try {
    const { id } = req.params;

    const ratings = await Rating.findAll({
      where: { userId: id },
      include: [
        {
          model: Store,
          as: 'store',
          attributes: ['id', 'name']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: 20
    });

    res.json({
      ratings: ratings.map(rating => ({
        id: rating.id,
        rating: rating.rating,
        comment: rating.comment,
        createdAt: rating.createdAt,
        store: rating.store
      }))
    });
  } catch (error) {
    console.error('User ratings error:', error);
    res.status(500).json({ message: 'Failed to fetch user ratings' });
  }
});

// Update store
router.put('/stores/:id', validateStore, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, address, ownerId, isActive } = req.body;

    const store = await Store.findByPk(id);
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    // Check if owner exists
    const owner = await User.findByPk(ownerId);
    if (!owner || owner.role !== 'store_owner') {
      return res.status(400).json({ message: 'Invalid store owner' });
    }

    await store.update({
      name,
      email,
      address,
      ownerId,
      isActive: isActive !== undefined ? isActive : store.isActive
    });

    res.json({ message: 'Store updated successfully', store });
  } catch (error) {
    console.error('Store update error:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      res.status(400).json({ message: 'Email already exists' });
    } else {
      res.status(500).json({ message: 'Failed to update store' });
    }
  }
});

// Delete store
router.delete('/stores/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const store = await Store.findByPk(id);
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    // Check if store has ratings
    const ratingCount = await Rating.count({ where: { storeId: id } });
    if (ratingCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete store. It has ${ratingCount} rating(s). Please delete ratings first.` 
      });
    }

    await store.destroy();
    res.json({ message: 'Store deleted successfully' });
  } catch (error) {
    console.error('Store deletion error:', error);
    res.status(500).json({ message: 'Failed to delete store' });
  }
});

// Update user
router.put('/users/:id', validateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, address, role, isActive } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.update({
      name,
      email,
      address,
      role,
      isActive: isActive !== undefined ? isActive : user.isActive
    });

    res.json({ message: 'User updated successfully', user });
  } catch (error) {
    console.error('User update error:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      res.status(400).json({ message: 'Email already exists' });
    } else {
      res.status(500).json({ message: 'Failed to update user' });
    }
  }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user has ratings
    const ratingCount = await Rating.count({ where: { userId: id } });
    if (ratingCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete user. They have ${ratingCount} rating(s). Please delete ratings first.` 
      });
    }

    // Check if user owns stores
    const storeCount = await Store.count({ where: { ownerId: id } });
    if (storeCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete user. They own ${storeCount} store(s). Please transfer or delete stores first.` 
      });
    }

    await user.destroy();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('User deletion error:', error);
    res.status(500).json({ message: 'Failed to delete user' });
  }
});

module.exports = router;
