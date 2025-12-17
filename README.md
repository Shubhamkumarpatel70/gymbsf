# Elite Fitness Gym Management System

A comprehensive gym management system with user subscriptions, payment processing, workout tracking, and admin dashboard.

## Features

- **User Management**: Registration, authentication, and profile management
- **Subscription Plans**: Multiple subscription plans with discount support
- **Payment Processing**: UPI payments with QR code generation, transaction tracking
- **Admin Dashboard**: Complete admin panel for managing users, plans, payments, and subscriptions
- **User Dashboard**: Personal dashboard with subscription status, transaction history, and workout tracking
- **Workout Tracking**: Log workouts, track streaks, and set fitness goals
- **Coupon System**: Discount coupons with usage limits and validation
- **Membership IDs**: Unique alphanumeric membership IDs for all users

## Tech Stack

### Frontend
- React 18
- React Router DOM
- Tailwind CSS
- Axios
- React Icons
- QR Code React

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Bcrypt for password hashing

## Project Structure

```
GYM/
├── client/          # React frontend application
├── server/          # Node.js/Express backend
│   ├── models/      # MongoDB models
│   ├── routes/      # API routes
│   └── middleware/ # Authentication middleware
└── README.md
```

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Setup

1. Clone the repository:
```bash
git clone https://github.com/Shubhamkumarpatel70/gymbsf.git
cd gymbsf
```

2. Install server dependencies:
```bash
cd server
npm install
```

3. Install client dependencies:
```bash
cd ../client
npm install
```

4. Create environment files:

**server/.env**
```env
MONGODB_URI=your_mongodb_connection_string
PORT=5000
JWT_SECRET=your_jwt_secret_key
```

5. Start the development server:
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm start
```

## Deployment on Render

### Backend Deployment

1. Create a new **Web Service** on Render
2. Connect your GitHub repository
3. Configure:
   - **Name**: gym-server (or your preferred name)
   - **Root Directory**: server
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment Variables**:
     - `MONGODB_URI`: Your MongoDB connection string
     - `JWT_SECRET`: Your JWT secret key
     - `PORT`: 10000 (or let Render assign)

### Frontend Deployment

1. Create a new **Static Site** on Render
2. Connect your GitHub repository
3. Configure:
   - **Name**: gym-client (or your preferred name)
   - **Root Directory**: client
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: client/build
   - **Environment Variables**:
     - `REACT_APP_API_URL`: Your backend Render URL (e.g., `https://gym-server.onrender.com`)

### Update API URLs

After deployment, update the API URLs in the client:

**client/src/context/AuthContext.js** and other files:
- Replace `http://localhost:5000` with your Render backend URL

Or use environment variable:
```javascript
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `POST /api/users/:id/subscribe` - Subscribe to plan
- `POST /api/users/:id/approve-subscription` - Approve subscription (Admin)
- `POST /api/users/:id/reject-subscription` - Reject subscription (Admin)

### Payments
- `GET /api/payments` - Get all payments (Admin)
- `GET /api/payments/user/:userId` - Get user payments
- `POST /api/payments` - Create payment
- `PUT /api/payments/:id/status` - Update payment status (Admin)
- `PUT /api/payments/:id/transaction` - Update transaction ID

### Plans
- `GET /api/plans` - Get all plans
- `POST /api/plans` - Create plan (Admin)
- `PUT /api/plans/:id` - Update plan (Admin)
- `DELETE /api/plans/:id` - Delete plan (Admin)

### Workouts
- `GET /api/workouts` - Get user workouts
- `GET /api/workouts/stats` - Get workout statistics
- `POST /api/workouts` - Log workout
- `PUT /api/workouts/:id` - Update workout
- `DELETE /api/workouts/:id` - Delete workout

### Goals
- `GET /api/goals` - Get user goals
- `GET /api/goals/stats` - Get goal statistics
- `POST /api/goals` - Create goal
- `PUT /api/goals/:id` - Update goal
- `DELETE /api/goals/:id` - Delete goal

## Default Admin Account

Create an admin user by updating the role in MongoDB or through the registration endpoint and manually changing the role.

## License

This project is private and proprietary.

## Author

Shubham Kumar Patel
