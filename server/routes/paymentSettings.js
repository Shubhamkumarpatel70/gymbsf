const express = require('express');
const PaymentSettings = require('../models/PaymentSettings');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get payment settings
router.get('/', async (req, res) => {
  try {
    const settings = await PaymentSettings.getSettings();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update payment settings (Admin only)
router.put('/', adminAuth, async (req, res) => {
  try {
    const { upiId, bankName, accountNumber, ifscCode } = req.body;
    
    let settings = await PaymentSettings.findOne();
    if (!settings) {
      settings = new PaymentSettings();
    }

    if (upiId !== undefined) settings.upiId = upiId;
    if (bankName !== undefined) settings.bankName = bankName;
    if (accountNumber !== undefined) settings.accountNumber = accountNumber;
    if (ifscCode !== undefined) settings.ifscCode = ifscCode;
    settings.updatedAt = new Date();

    await settings.save();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

