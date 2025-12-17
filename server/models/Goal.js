const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  targetValue: {
    type: Number,
    required: true
  },
  currentValue: {
    type: Number,
    default: 0
  },
  unit: {
    type: String,
    default: '' // e.g., 'workouts', 'days', 'kg', 'lbs'
  },
  targetDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['active', 'achieved', 'expired'],
    default: 'active'
  },
  category: {
    type: String,
    enum: ['workout', 'weight', 'strength', 'endurance', 'other'],
    default: 'workout'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  achievedAt: {
    type: Date
  }
});

// Index for efficient queries
goalSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('Goal', goalSchema);

