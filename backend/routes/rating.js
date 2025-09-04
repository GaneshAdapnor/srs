const express = require('express');
const { Rating, Store, User } = require('../models');
const { authenticateToken, requireUser } = require('../middleware/auth');
const { validateRating } = require('../middleware/validation');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken, requireUser);

// Submit or update rating
router.post('/', validateRating, async (req, res) => {
  try {
    const { storeId, rating, comment } = req.body;
    const userId = req.user.id;

    // Verify store exists
    const store = await Store.findByPk(storeId);
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    // Check if user already rated this store
    const existingRating = await Rating.findOne({
      where: { userId, storeId }
    });

    if (existingRating) {
      // Update existing rating
      await existingRating.update({ rating, comment });
      res.json({
        message: 'Rating updated successfully',
        rating: existingRating
      });
    } else {
      // Create new rating
      const newRating = await Rating.create({
        userId,
        storeId,
        rating,
        comment
      });

      res.status(201).json({
        message: 'Rating submitted successfully',
        rating: newRating
      });
    }
  } catch (error) {
    console.error('Rating submission error:', error);
    res.status(500).json({ message: 'Failed to submit rating' });
  }
});

// Get user's ratings
router.get('/my-ratings', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows: ratings } = await Rating.findAndCountAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Store,
          as: 'store',
          attributes: ['id', 'name', 'address']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      ratings,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('My ratings fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch ratings' });
  }
});

// Get rating for a specific store
router.get('/store/:storeId', async (req, res) => {
  try {
    const { storeId } = req.params;
    const userId = req.user.id;

    const rating = await Rating.findOne({
      where: { userId, storeId },
      include: [
        {
          model: Store,
          as: 'store',
          attributes: ['id', 'name']
        }
      ]
    });

    if (!rating) {
      return res.status(404).json({ message: 'Rating not found' });
    }

    res.json({ rating });
  } catch (error) {
    console.error('Rating fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch rating' });
  }
});

// Delete rating
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const rating = await Rating.findOne({
      where: { id, userId }
    });

    if (!rating) {
      return res.status(404).json({ message: 'Rating not found' });
    }

    await rating.destroy();

    res.json({ message: 'Rating deleted successfully' });
  } catch (error) {
    console.error('Rating deletion error:', error);
    res.status(500).json({ message: 'Failed to delete rating' });
  }
});

module.exports = router;
