const express = require('express');
const Workout = require('../models/Workout');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all workouts for a user
router.get('/', auth, async (req, res) => {
  try {
    const workouts = await Workout.find({ userId: req.user._id })
      .sort({ date: -1 });
    res.json(workouts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get workout statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const workouts = await Workout.find({ userId: req.user._id });
    
    const totalWorkouts = workouts.length;
    
    // Calculate streak
    let streak = 0;
    if (workouts.length > 0) {
      const sortedWorkouts = workouts
        .map(w => new Date(w.date).toDateString())
        .sort((a, b) => new Date(b) - new Date(a));
      
      const uniqueDates = [...new Set(sortedWorkouts)];
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      
      // Check if user worked out today or yesterday
      if (uniqueDates.includes(today) || uniqueDates.includes(yesterday)) {
        let currentStreak = 0;
        let checkDate = uniqueDates.includes(today) ? new Date() : new Date(Date.now() - 86400000);
        
        while (true) {
          const dateStr = checkDate.toDateString();
          if (uniqueDates.includes(dateStr)) {
            currentStreak++;
            checkDate = new Date(checkDate.getTime() - 86400000);
          } else {
            break;
          }
        }
        streak = currentStreak;
      }
    }
    
    res.json({
      totalWorkouts,
      streak
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create a new workout
router.post('/', auth, async (req, res) => {
  try {
    const { date, exercises, duration, notes } = req.body;
    
    const workout = new Workout({
      userId: req.user._id,
      date: date ? new Date(date) : new Date(),
      exercises: exercises || [],
      duration: duration || 0,
      notes: notes || ''
    });
    
    await workout.save();
    res.status(201).json(workout);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update a workout
router.put('/:id', auth, async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id);
    
    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }
    
    // Users can only update their own workouts
    if (workout.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const { date, exercises, duration, notes } = req.body;
    
    if (date) workout.date = new Date(date);
    if (exercises) workout.exercises = exercises;
    if (duration !== undefined) workout.duration = duration;
    if (notes !== undefined) workout.notes = notes;
    
    await workout.save();
    res.json(workout);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete a workout
router.delete('/:id', auth, async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id);
    
    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }
    
    // Users can only delete their own workouts
    if (workout.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    await workout.deleteOne();
    res.json({ message: 'Workout deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

