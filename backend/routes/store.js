const express = require('express');
const { Store, User, Rating } = require('../models');
const { authenticateToken, requireStoreOwner } = require('../middleware/auth');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken, requireStoreOwner);

// Get store owner's dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const stores = await Store.findAll({
      where: { ownerId: req.user.id },
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
    });

    // Calculate statistics for each store
    const storesWithStats = stores.map(store => {
      const ratings = store.ratings || [];
      const averageRating = ratings.length > 0 
        ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(2)
        : 0;

      return {
        ...store.toJSON(),
        averageRating: parseFloat(averageRating),
        totalRatings: ratings.length,
        recentRatings: ratings.slice(-5) // Last 5 ratings
      };
    });

    // Overall statistics
    const allRatings = stores.flatMap(store => store.ratings || []);
    const overallAverageRating = allRatings.length > 0 
      ? (allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length).toFixed(2)
      : 0;

    res.json({
      stores: storesWithStats,
      overallStats: {
        totalStores: stores.length,
        totalRatings: allRatings.length,
        averageRating: parseFloat(overallAverageRating)
      }
    });
  } catch (error) {
    console.error('Store owner dashboard error:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard data' });
  }
});

// Get store owner's stores
router.get('/my-stores', async (req, res) => {
  try {
    const stores = await Store.findAll({
      where: { ownerId: req.user.id },
      include: [
        {
          model: Rating,
          as: 'ratings',
          attributes: ['rating']
        }
      ]
    });

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

    res.json({ stores: storesWithRating });
  } catch (error) {
    console.error('My stores fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch stores' });
  }
});

// Get detailed ratings for a specific store
router.get('/stores/:id/ratings', async (req, res) => {
  try {
    const { id } = req.params;

    const store = await Store.findOne({
      where: { 
        id,
        ownerId: req.user.id 
      },
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
    });

    if (!store) {
      return res.status(404).json({ message: 'Store not found or access denied' });
    }

    const ratings = store.ratings || [];
    const averageRating = ratings.length > 0 
      ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(2)
      : 0;

    res.json({
      store: {
        id: store.id,
        name: store.name,
        averageRating: parseFloat(averageRating),
        totalRatings: ratings.length
      },
      ratings: ratings
    });
  } catch (error) {
    console.error('Store ratings fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch store ratings' });
  }
});

module.exports = router;
