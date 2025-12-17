# Deployment Guide for Render

This guide will help you deploy both the backend (server) and frontend (client) together in a single Render service.

## Prerequisites

1. GitHub repository: https://github.com/Shubhamkumarpatel70/gymbsf.git
2. MongoDB Atlas account (or any MongoDB cloud service)
3. Render account (free tier available)

## Single Service Deployment (Recommended)

Deploy both server and client together in one Web Service on Render.

### Step 1: Deploy Combined Service

1. **Go to Render Dashboard** → Click "New +" → Select "Web Service"

2. **Connect Repository**:
   - Connect your GitHub account
   - Select repository: `gymbsf`
   - Click "Connect"

3. **Configure Service**:
   - **Name**: `gym-app` (or your preferred name)
   - **Root Directory**: `server` (leave as is)
   - **Environment**: `Node`
   - **Build Command**: `cd ../client && npm install && npm run build && cd ../server && npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (or choose paid plan)
   
   **Note**: The build command:
   - Changes to client directory
   - Installs client dependencies
   - Builds the React app (creates `client/build` folder)
   - Changes to server directory
   - Installs server dependencies

4. **Add Environment Variables**:
   Click "Add Environment Variable" and add:
   ```
   NODE_ENV = production
   MONGODB_URI = your_mongodb_atlas_connection_string
   JWT_SECRET = your_random_secret_key_here
   PORT = 10000
   ```
   
   **Note**: 
   - `NODE_ENV=production` is important - it tells the server to serve static files
   - Render will automatically assign a PORT, but you can set it to 10000
   - The server code uses `process.env.PORT || 5000`

5. **Click "Create Web Service"**
   - Render will start building and deploying your application
   - Wait for deployment to complete (usually 5-10 minutes)
   - Note the URL: `https://gym-app.onrender.com` (or your custom domain)

### How It Works

- The build command installs client dependencies, builds the React app, then installs server dependencies
- The server serves the built React app from `client/build` directory
- All API calls use relative URLs (no CORS issues)
- Single URL for both frontend and backend

## Alternative: Separate Deployments

If you prefer to deploy server and client separately, follow the steps below.

### Step 1: Deploy Backend (Server)

1. **Go to Render Dashboard** → Click "New +" → Select "Web Service"

2. **Connect Repository**:
   - Connect your GitHub account
   - Select repository: `gymbsf`
   - Click "Connect"

3. **Configure Backend Service**:
   - **Name**: `gym-server` (or your preferred name)
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (or choose paid plan)

4. **Add Environment Variables**:
   ```
   MONGODB_URI = your_mongodb_atlas_connection_string
   JWT_SECRET = your_random_secret_key_here
   PORT = 10000
   ```

5. **Click "Create Web Service"**
   - Note the URL: `https://gym-server.onrender.com`

### Step 2: Deploy Frontend (Client)

1. **Go to Render Dashboard** → Click "New +" → Select "Static Site"

2. **Connect Repository**:
   - Connect your GitHub account
   - Select repository: `gymbsf`
   - Click "Connect"

3. **Configure Frontend Service**:
   - **Name**: `gym-client` (or your preferred name)
   - **Root Directory**: `client`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `client/build`
   - **Environment**: `Node`

4. **Add Environment Variables**:
   ```
   REACT_APP_API_URL = https://gym-server.onrender.com
   ```
   
   **Important**: Replace `gym-server.onrender.com` with your actual backend URL.

5. **Click "Create Static Site"**
   - Note the URL: `https://gym-client.onrender.com`

## Step 4: MongoDB Atlas Setup

1. **Create MongoDB Atlas Account**: https://www.mongodb.com/cloud/atlas

2. **Create a Cluster**:
   - Choose free tier (M0)
   - Select your preferred region
   - Create cluster

3. **Create Database User**:
   - Go to "Database Access"
   - Add new database user
   - Save username and password

4. **Whitelist IP Addresses**:
   - Go to "Network Access"
   - Add IP Address: `0.0.0.0/0` (allows all IPs - for production, restrict this)
   - Or add Render's IP ranges

5. **Get Connection String**:
   - Go to "Database" → "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with `gymdb` or your preferred database name
   - Example: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/gymdb?retryWrites=true&w=majority`

6. **Add to Render Environment Variables**:
   - Use this connection string as `MONGODB_URI` in your backend service

## Step 5: Verify Deployment

1. **Test Backend**:
   - Visit: `https://gym-server.onrender.com/api/plans`
   - Should return JSON data (or empty array if no plans)

2. **Test Frontend**:
   - Visit: `https://gym-client.onrender.com`
   - Should load the homepage
   - Try registering a new user
   - Check if API calls work

## Troubleshooting

### Backend Issues:

1. **Build Fails**:
   - Check build logs in Render dashboard
   - Ensure `package.json` has correct scripts
   - Verify all dependencies are listed

2. **Server Crashes**:
   - Check logs in Render dashboard
   - Verify MongoDB connection string is correct
   - Ensure environment variables are set

3. **CORS Errors**:
   - Update CORS settings in `server/server.js` to allow your frontend URL

### Frontend Issues:

1. **Build Fails**:
   - Check build logs
   - Ensure all dependencies are in `package.json`
   - Check for TypeScript/ESLint errors

2. **API Calls Fail**:
   - Verify `REACT_APP_API_URL` is set correctly
   - Check browser console for errors
   - Ensure backend is running and accessible

3. **Blank Page**:
   - Check browser console for errors
   - Verify build completed successfully
   - Check if API URL is correct

## Custom Domains

You can add custom domains in Render:
1. Go to your service settings
2. Click "Custom Domains"
3. Add your domain
4. Follow DNS configuration instructions

## Auto-Deploy

Render automatically deploys when you push to the `main` branch. To disable:
1. Go to service settings
2. Click "Manual Deploy" or configure branch settings

## Cost

- **Free Tier**: 
  - Web Services: Sleeps after 15 minutes of inactivity
  - Static Sites: Always on, free
  - Limited build minutes per month

- **Paid Plans**: 
  - Always-on services
  - More build minutes
  - Better performance

## Support

For issues:
- Render Documentation: https://render.com/docs
- Render Community: https://community.render.com
- MongoDB Atlas Docs: https://docs.atlas.mongodb.com

