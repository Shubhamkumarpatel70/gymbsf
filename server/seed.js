const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Plan = require('./models/Plan');

dotenv.config();

const plans = [
  {
    name: 'Basic Plan',
    description: 'Perfect for beginners starting their fitness journey',
    price: 29.99,
    duration: 1,
    features: [
      'Access to all gym equipment',
      'Locker room access',
      'Free fitness assessment',
      'Basic workout plans',
    ],
  },
  {
    name: 'Premium Plan',
    description: 'Most popular plan with additional benefits',
    price: 49.99,
    duration: 1,
    features: [
      'Everything in Basic Plan',
      'Personal trainer consultation (1x/month)',
      'Nutrition guidance',
      'Priority class booking',
      '24/7 gym access',
    ],
  },
  {
    name: 'Elite Plan',
    description: 'Ultimate fitness experience with premium features',
    price: 79.99,
    duration: 1,
    features: [
      'Everything in Premium Plan',
      'Unlimited personal training sessions',
      'Custom meal plans',
      'Body composition analysis',
      'VIP lounge access',
      'Guest passes (2/month)',
    ],
  },
];

const seedPlans = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gymdb', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Clear existing plans
    await Plan.deleteMany({});
    console.log('Cleared existing plans');

    // Insert new plans
    await Plan.insertMany(plans);
    console.log('Seeded plans successfully');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding plans:', error);
    process.exit(1);
  }
};

seedPlans();

