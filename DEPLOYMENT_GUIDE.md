# SewNova Deployment Guide

This guide will help you deploy your SewNova application with the backend on Render and frontend on Vercel.

## Prerequisites

- GitHub repository with your SewNova code
- MongoDB Atlas account (for database)
- Render account (for backend hosting)
- Vercel account (for frontend hosting)
- Google Cloud Console account (for OAuth)
- Razorpay account (for payments)
- Cloudinary account (for image storage)

## Backend Deployment on Render

### Step 1: Prepare Your Repository

1. Make sure all your backend services are in the `backend/` directory
2. Ensure you have the following files in your repository:
   - `render.yaml` (Render configuration)
   - `backend/package.json` (Backend dependencies)
   - `backend/start-production.js` (Production startup script)

### Step 2: Deploy to Render

1. **Login to Render Dashboard**
   - Go to [render.com](https://render.com)
   - Sign up/Login with your GitHub account

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select your SewNova repository

3. **Configure Service Settings**
   ```
   Name: sewnova-backend
   Environment: Node
   Build Command: cd backend && npm install
   Start Command: cd backend && node start-production.js
   ```

4. **Set Environment Variables**
   In the Render dashboard, go to Environment tab and add:
   ```
   NODE_ENV=production
   MONGODB_URI=your-mongodb-connection-string
   JWT_SECRET=your-jwt-secret
   JWT_REFRESH_SECRET=your-refresh-secret
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   RAZORPAY_KEY_ID=your-razorpay-key-id
   RAZORPAY_KEY_SECRET=your-razorpay-key-secret
   CLOUDINARY_CLOUD_NAME=your-cloudinary-name
   CLOUDINARY_API_KEY=your-cloudinary-key
   CLOUDINARY_API_SECRET=your-cloudinary-secret
   EMAIL_SERVICE_API_KEY=your-email-api-key
   EMAIL_FROM=noreply@sewnova.com
   CORS_ORIGIN=https://your-frontend-domain.vercel.app
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Note your backend URL (e.g., `https://sewnova-backend.onrender.com`)

## Frontend Deployment on Vercel

### Step 1: Prepare Frontend

1. Make sure your frontend is in the `frontend/` directory
2. Ensure you have `vercel.json` configuration file
3. Update your API endpoints to point to your Render backend URL

### Step 2: Deploy to Vercel

1. **Login to Vercel Dashboard**
   - Go to [vercel.com](https://vercel.com)
   - Sign up/Login with your GitHub account

2. **Import Project**
   - Click "New Project"
   - Import your GitHub repository
   - Select the `frontend` folder as the root directory

3. **Configure Build Settings**
   ```
   Framework Preset: Vite
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

4. **Set Environment Variables**
   In the Vercel dashboard, go to Settings → Environment Variables:
   ```
   VITE_API_BASE_URL=https://your-backend-app.onrender.com
   VITE_GOOGLE_CLIENT_ID=your-google-client-id
   VITE_RAZORPAY_KEY_ID=your-razorpay-key-id
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Note your frontend URL (e.g., `https://sewnova.vercel.app`)

## Environment Variables Setup

### Backend Environment Variables (Render)

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/sewnova` |
| `JWT_SECRET` | JWT signing secret | `your-super-secure-secret` |
| `JWT_REFRESH_SECRET` | JWT refresh secret | `your-refresh-secret` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | `123456789.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | `your-google-secret` |
| `RAZORPAY_KEY_ID` | Razorpay key ID | `rzp_test_123456789` |
| `RAZORPAY_KEY_SECRET` | Razorpay key secret | `your-razorpay-secret` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `your-cloud-name` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `123456789012345` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `your-cloudinary-secret` |
| `EMAIL_SERVICE_API_KEY` | Email service API key | `your-email-api-key` |
| `EMAIL_FROM` | From email address | `noreply@sewnova.com` |
| `CORS_ORIGIN` | Frontend URL for CORS | `https://sewnova.vercel.app` |

### Frontend Environment Variables (Vercel)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API URL | `https://sewnova-backend.onrender.com` |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID | `123456789.apps.googleusercontent.com` |
| `VITE_RAZORPAY_KEY_ID` | Razorpay key ID | `rzp_test_123456789` |

## Post-Deployment Configuration

### 1. Update CORS Settings
After deploying both services, update the `CORS_ORIGIN` environment variable in Render with your actual Vercel frontend URL.

### 2. Update Frontend API URLs
Update your frontend environment variables in Vercel with your actual Render backend URL.

### 3. Test the Deployment
1. Visit your Vercel frontend URL
2. Test user registration/login
3. Test payment integration
4. Test file uploads (if applicable)

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure `CORS_ORIGIN` in Render matches your Vercel URL exactly
   - Check that your backend is properly handling CORS

2. **Environment Variables Not Loading**
   - Verify all environment variables are set correctly
   - Check for typos in variable names
   - Ensure variables are set in the correct service (Render vs Vercel)

3. **Database Connection Issues**
   - Verify MongoDB URI is correct
   - Check if your MongoDB Atlas cluster allows connections from Render's IPs
   - Ensure database user has proper permissions

4. **Payment Integration Issues**
   - Verify Razorpay keys are correct
   - Check if you're using test/live keys appropriately
   - Ensure webhook URLs are configured correctly

### Monitoring

1. **Render Dashboard**
   - Monitor service health
   - Check logs for errors
   - Monitor resource usage

2. **Vercel Dashboard**
   - Monitor build status
   - Check function logs
   - Monitor performance

## Security Considerations

1. **Environment Variables**
   - Never commit `.env` files to version control
   - Use strong, unique secrets for JWT and other sensitive data
   - Rotate secrets regularly

2. **CORS Configuration**
   - Only allow your frontend domain in CORS settings
   - Avoid using wildcard (*) in production

3. **Database Security**
   - Use strong database passwords
   - Enable IP whitelisting in MongoDB Atlas
   - Use connection string with SSL

## Scaling Considerations

1. **Render**
   - Consider upgrading to paid plans for better performance
   - Monitor resource usage and scale accordingly

2. **Vercel**
   - Vercel automatically handles scaling
   - Consider upgrading for custom domains and advanced features

## Support

If you encounter issues:
1. Check the logs in both Render and Vercel dashboards
2. Verify all environment variables are set correctly
3. Test API endpoints directly using tools like Postman
4. Check the browser console for frontend errors

## Next Steps

After successful deployment:
1. Set up custom domains (optional)
2. Configure SSL certificates (usually automatic)
3. Set up monitoring and alerting
4. Implement CI/CD for automatic deployments
5. Set up backup strategies for your database
