const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  subscription: {
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plan'
    },
    startDate: Date,
    endDate: Date,
    isActive: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'active', 'terminated'],
      default: 'pending'
    },
    terminatedAt: Date,
    terminationReason: String,
    rejectionReason: String,
    requestedAt: {
      type: Date,
      default: Date.now
    }
  },
  phone: String,
  address: String,
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
  },
  membershipId: {
    type: String,
    unique: true,
    sparse: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Generate unique membership ID
const generateMembershipId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let membershipId = '';
  for (let i = 0; i < 8; i++) {
    membershipId += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return membershipId;
};

// Static method to generate unique membership ID
userSchema.statics.generateUniqueMembershipId = async function() {
  let isUnique = false;
  let membershipId;
  let attempts = 0;
  const maxAttempts = 100; // Prevent infinite loop
  
  while (!isUnique && attempts < maxAttempts) {
    membershipId = generateMembershipId();
    const existingUser = await this.findOne({ membershipId });
    if (!existingUser) {
      isUnique = true;
    }
    attempts++;
  }
  
  if (!isUnique) {
    throw new Error('Failed to generate unique membership ID after multiple attempts');
  }
  
  return membershipId;
};

userSchema.pre('save', async function(next) {
  try {
    // Generate membership ID for new users
    if (this.isNew && !this.membershipId) {
      const User = this.constructor;
      this.membershipId = await User.generateUniqueMembershipId();
    }

    // Hash password if it's been modified (or is new)
    if (this.isModified('password')) {
      this.password = await bcrypt.hash(this.password, 10);
    }
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

