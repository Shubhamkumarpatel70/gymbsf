const express = require('express');
const User = require('../models/User');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get all users (Admin only)
router.get('/', adminAuth, async (req, res) => {
  try {
    const users = await User.find().select('-password').populate('subscription.planId');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('subscription.planId');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Users can only view their own profile unless admin
    if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update user
router.put('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Users can only update their own profile unless admin
    if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { name, email, phone, address, gender, membershipId } = req.body;
    
    // Only admins can update email and membershipId
    if (req.user.role === 'admin') {
      if (email) user.email = email;
      if (membershipId !== undefined) {
        // Check if membership ID is unique (if provided and different from current)
        if (membershipId && membershipId !== user.membershipId) {
          const existingUser = await User.findOne({ membershipId });
          if (existingUser && existingUser._id.toString() !== user._id.toString()) {
            return res.status(400).json({ message: 'Membership ID already exists' });
          }
        }
        user.membershipId = membershipId || null;
      }
    }
    
    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;
    if (gender !== undefined) user.gender = gender;

    await user.save();
    const updatedUser = await User.findById(user._id).select('-password').populate('subscription.planId');
    res.json({ message: 'User updated successfully', user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Subscribe to a plan
router.post('/:id/subscribe', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Prevent multiple active subscriptions
    if (user.subscription?.isActive && req.user.role !== 'admin') {
      return res.status(400).json({ message: 'You already have an active subscription' });
    }

    const { planId, startDate, endDate } = req.body;
    const plan = await require('../models/Plan').findById(planId);
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    // Calculate dates if not provided
    const subStartDate = startDate ? new Date(startDate) : new Date();
    const subEndDate = endDate ? new Date(endDate) : (() => {
      const end = new Date(subStartDate);
      end.setMonth(end.getMonth() + plan.duration);
      return end;
    })();

    user.subscription = {
      planId,
      startDate: subStartDate,
      endDate: subEndDate,
      isActive: false, // Set to false initially, will be activated when payment is approved
      status: 'pending',
      requestedAt: new Date()
    };

    await user.save();
    const populatedUser = await User.findById(user._id).populate('subscription.planId').select('-password');
    res.json({ message: 'Subscription requested successfully', user: populatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Terminate subscription (Admin only)
router.post('/:id/terminate-subscription', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.subscription || !user.subscription.isActive) {
      return res.status(400).json({ message: 'User does not have an active subscription to terminate' });
    }

    user.subscription.isActive = false;
    user.subscription.terminatedAt = new Date();
    user.subscription.terminationReason = req.body.reason || 'Admin termination';
    await user.save();
    
    const populatedUser = await User.findById(user._id).populate('subscription.planId').select('-password');
    res.json({ message: 'Subscription terminated successfully', user: populatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Un-terminate subscription (Admin only)
router.post('/:id/unterminate-subscription', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.subscription || user.subscription.isActive) {
      return res.status(400).json({ message: 'User does not have a terminated subscription to reactivate' });
    }

    // Check if subscription end date is still valid
    const endDate = new Date(user.subscription.endDate);
    const today = new Date();
    
    if (endDate < today) {
      return res.status(400).json({ message: 'Subscription end date has passed. Please extend the subscription first.' });
    }

    user.subscription.isActive = true;
    user.subscription.status = 'active';
    user.subscription.terminatedAt = null;
    user.subscription.terminationReason = null;
    await user.save();
    
    const populatedUser = await User.findById(user._id).populate('subscription.planId').select('-password');
    res.json({ message: 'Subscription reactivated successfully', user: populatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Approve subscription (Admin only)
router.post('/:id/approve-subscription', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.subscription || user.subscription.status !== 'pending') {
      return res.status(400).json({ message: 'User does not have a pending subscription to approve' });
    }

    // Update subscription status to approved
    user.subscription.isActive = true;
    user.subscription.status = 'approved';
    await user.save();
    
    // Ensure all related payments remain as 'pending' status
    // Payment status should only change when admin explicitly updates it in Payments tab
    const Payment = require('../models/Payment');
    await Payment.updateMany(
      { 
        userId: user._id, 
        planId: user.subscription.planId,
        status: { $ne: 'completed' } // Only update if not already completed
      },
      { 
        $set: { status: 'pending' } // Explicitly set to pending
      }
    );
    
    const populatedUser = await User.findById(user._id).populate('subscription.planId').select('-password');
    res.json({ message: 'Subscription approved successfully', user: populatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Reject subscription (Admin only)
router.post('/:id/reject-subscription', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.subscription || user.subscription.status !== 'pending') {
      return res.status(400).json({ message: 'User does not have a pending subscription to reject' });
    }

    const { reason } = req.body;
    if (!reason) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }

    user.subscription.isActive = false;
    user.subscription.status = 'rejected';
    user.subscription.rejectionReason = reason;
    await user.save();
    
    const populatedUser = await User.findById(user._id).populate('subscription.planId').select('-password');
    res.json({ message: 'Subscription rejected successfully', user: populatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Generate membership IDs for users without one (Admin only)
router.post('/generate-membership-ids', adminAuth, async (req, res) => {
  try {
    const usersWithoutMembershipId = await User.find({ 
      $or: [
        { membershipId: { $exists: false } },
        { membershipId: null },
        { membershipId: '' }
      ]
    });

    let generated = 0;
    for (const user of usersWithoutMembershipId) {
      try {
        user.membershipId = await User.generateUniqueMembershipId();
        await user.save();
        generated++;
      } catch (error) {
        console.error(`Error generating membership ID for user ${user._id}:`, error);
      }
    }

    res.json({ 
      message: `Generated ${generated} membership IDs`,
      generated 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

