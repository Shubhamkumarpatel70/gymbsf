const express = require('express');
const Goal = require('../models/Goal');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all goals for a user
router.get('/', auth, async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.user._id })
      .sort({ createdAt: -1 });
    res.json(goals);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get goal statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.user._id });
    const totalGoals = goals.length;
    const achievedGoals = goals.filter(g => g.status === 'achieved').length;
    
    res.json({
      totalGoals,
      achievedGoals
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create a new goal
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, targetValue, currentValue, unit, targetDate, category } = req.body;
    
    const goal = new Goal({
      userId: req.user._id,
      title,
      description: description || '',
      targetValue,
      currentValue: currentValue || 0,
      unit: unit || '',
      targetDate: targetDate ? new Date(targetDate) : null,
      category: category || 'workout',
      status: 'active'
    });
    
    await goal.save();
    res.status(201).json(goal);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update a goal
router.put('/:id', auth, async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);
    
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }
    
    // Users can only update their own goals
    if (goal.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const { title, description, targetValue, currentValue, unit, targetDate, category, status } = req.body;
    
    if (title) goal.title = title;
    if (description !== undefined) goal.description = description;
    if (targetValue !== undefined) goal.targetValue = targetValue;
    if (currentValue !== undefined) {
      goal.currentValue = currentValue;
      // Auto-update status if goal is achieved
      if (currentValue >= goal.targetValue && goal.status === 'active') {
        goal.status = 'achieved';
        goal.achievedAt = new Date();
      }
    }
    if (unit !== undefined) goal.unit = unit;
    if (targetDate !== undefined) goal.targetDate = targetDate ? new Date(targetDate) : null;
    if (category) goal.category = category;
    if (status) goal.status = status;
    
    await goal.save();
    res.json(goal);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete a goal
router.delete('/:id', auth, async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);
    
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }
    
    // Users can only delete their own goals
    if (goal.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    await goal.deleteOne();
    res.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

