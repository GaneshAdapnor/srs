const express = require('express');
const { Op } = require('sequelize');
const { User, Store, Rating } = require('../models');
const { authenticateToken, requireUser } = require('../middleware/auth');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken, requireUser);

// Get all stores with search functionality
router.get('/stores', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'name',
      sortOrder = 'ASC',
      search = ''
    } = req.query;

    const offset = (page - 1) * limit;
    
    // Handle sorting - if sorting by averageRating, we'll sort after calculation
    let order = [];
    if (sortBy === 'averageRating') {
      order = [['createdAt', 'DESC']]; // Default order, will sort by rating later
    } else {
      order = [[sortBy, sortOrder.toUpperCase()]];
    }

    let whereClause = {};
    if (search) {
      whereClause = {
        [Op.or]: [
          { name: { [Op.like]: `%${search}%` } },
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
          attributes: ['name']
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

    // Get user's ratings for these stores
    const storeIds = stores.map(store => store.id);
    const userRatings = await Rating.findAll({
      where: {
        userId: req.user.id,
        storeId: { [Op.in]: storeIds }
      },
      attributes: ['storeId', 'rating']
    });

    const userRatingMap = {};
    userRatings.forEach(rating => {
      userRatingMap[rating.storeId] = rating.rating;
    });

    // Calculate average rating and add user's rating
    let storesWithRating = stores.map(store => {
      const ratings = store.ratings || [];
      const averageRating = ratings.length > 0 
        ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(2)
        : 0;

      return {
        ...store.toJSON(),
        averageRating: parseFloat(averageRating),
        totalRatings: ratings.length,
        userRating: userRatingMap[store.id] || null
      };
    });

    // Sort by average rating if requested
    if (sortBy === 'averageRating') {
      storesWithRating.sort((a, b) => {
        if (sortOrder.toUpperCase() === 'ASC') {
          return a.averageRating - b.averageRating;
        } else {
          return b.averageRating - a.averageRating;
        }
      });
    }

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

// Get store details
router.get('/stores/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const store = await Store.findByPk(id, {
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['name', 'email']
        },
        {
          model: Rating,
          as: 'ratings',
          attributes: ['rating', 'comment', 'createdAt'],
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['name']
            }
          ]
        }
      ]
    });

    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    // Get user's rating for this store
    const userRating = await Rating.findOne({
      where: {
        userId: req.user.id,
        storeId: id
      }
    });

    // Calculate average rating
    const ratings = store.ratings || [];
    const averageRating = ratings.length > 0 
      ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(2)
      : 0;

    const storeData = {
      ...store.toJSON(),
      averageRating: parseFloat(averageRating),
      totalRatings: ratings.length,
      userRating: userRating ? userRating.rating : null
    };

    res.json({ store: storeData });
  } catch (error) {
    console.error('Store details error:', error);
    res.status(500).json({ message: 'Failed to fetch store details' });
  }
});

// Get user's profile
router.get('/profile', async (req, res) => {
  try {
    res.json({ user: req.user.toJSON() });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
});

// Update user profile
router.put('/profile', async (req, res) => {
  try {
    const { name, address } = req.body;
    const allowedUpdates = {};

    if (name !== undefined) {
      if (name.length < 20 || name.length > 60) {
        return res.status(400).json({ message: 'Name must be between 20 and 60 characters' });
      }
      allowedUpdates.name = name;
    }

    if (address !== undefined) {
      if (address.length > 400) {
        return res.status(400).json({ message: 'Address must not exceed 400 characters' });
      }
      allowedUpdates.address = address;
    }

    if (Object.keys(allowedUpdates).length === 0) {
      return res.status(400).json({ message: 'No valid fields to update' });
    }

    await req.user.update(allowedUpdates);

    res.json({
      message: 'Profile updated successfully',
      user: req.user.toJSON()
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

module.exports = router;
