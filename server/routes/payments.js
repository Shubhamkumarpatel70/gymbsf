const express = require('express');
const Payment = require('../models/Payment');
const User = require('../models/User');
const Plan = require('../models/Plan');
const Coupon = require('../models/Coupon');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get all payments (Admin only)
router.get('/', adminAuth, async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('userId', 'name email')
      .populate('planId', 'name price duration')
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get payment by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('planId', 'name price duration');
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Users can only view their own payments unless admin
    if (req.user.role !== 'admin' && payment.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get payments by user ID
router.get('/user/:userId', auth, async (req, res) => {
  try {
    // Users can only view their own payments unless admin
    if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const payments = await Payment.find({ userId: req.params.userId })
      .populate('planId', 'name price duration')
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create payment
router.post('/', auth, async (req, res) => {
  try {
    const { userId, planId, amount, couponCode } = req.body;

    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    // Check if a pending payment already exists for this user and plan
    const existingPayment = await Payment.findOne({
      userId,
      planId,
      status: 'pending'
    }).sort({ createdAt: -1 });

    if (existingPayment) {
      // Return existing payment instead of creating a duplicate
      const populatedPayment = await Payment.findById(existingPayment._id)
        .populate('userId', 'name email')
        .populate('planId', 'name price duration');
      return res.json(populatedPayment);
    }

    let finalAmount = amount;
    let discountAmount = 0;
    let appliedCouponCode = '';

    // Apply coupon if provided
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (coupon) {
        const now = new Date();
        const validFrom = new Date(coupon.validFrom);
        const validUntil = new Date(coupon.validUntil);

        if (now >= validFrom && now <= validUntil) {
          if (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit) {
            if (amount >= coupon.minPurchase) {
              if (coupon.discountType === 'percentage') {
                discountAmount = (amount * coupon.discountValue) / 100;
                if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
                  discountAmount = coupon.maxDiscount;
                }
              } else {
                discountAmount = coupon.discountValue;
              }
              finalAmount = amount - discountAmount;
              appliedCouponCode = coupon.code;
              
              // Increment coupon usage
              coupon.usedCount += 1;
              await coupon.save();
            }
          }
        }
      }
    }

    const payment = new Payment({
      userId,
      planId,
      amount: finalAmount,
      originalAmount: amount,
      discountAmount,
      couponCode: appliedCouponCode,
      status: 'pending'
    });

    await payment.save();
    const populatedPayment = await Payment.findById(payment._id)
      .populate('userId', 'name email')
      .populate('planId', 'name price duration');
    
    res.status(201).json(populatedPayment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update transaction ID
router.put('/:id/transaction', auth, async (req, res) => {
  try {
    const { transactionId } = req.body;
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Users can only update their own payment transaction ID unless admin
    if (req.user.role !== 'admin' && payment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    payment.transactionId = transactionId;
    await payment.save();
    
    const populatedPayment = await Payment.findById(payment._id)
      .populate('userId', 'name email')
      .populate('planId', 'name price duration');
    
    res.json(populatedPayment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update payment status (Admin only)
router.put('/:id/status', adminAuth, async (req, res) => {
  try {
    const { status, transactionId } = req.body;
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    payment.status = status;
    if (transactionId) {
      payment.transactionId = transactionId;
    }
    if (status === 'completed') {
      payment.paidAt = new Date();
      
      // Activate subscription when payment is completed (only if not already approved)
      const user = await User.findById(payment.userId);
      if (user && (!user.subscription || user.subscription.status !== 'approved')) {
        const plan = await Plan.findById(payment.planId);
        if (plan) {
          const startDate = new Date();
          const endDate = new Date();
          endDate.setMonth(endDate.getMonth() + plan.duration);
          
          user.subscription = {
            planId: payment.planId,
            startDate,
            endDate,
            isActive: true,
            status: 'approved'
          };
          await user.save();
        }
      }
    }

    await payment.save();
    const populatedPayment = await Payment.findById(payment._id)
      .populate('userId', 'name email')
      .populate('planId', 'name price duration');
    
    res.json(populatedPayment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete payment (Admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    await Payment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Payment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

