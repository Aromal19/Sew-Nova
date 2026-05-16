# Environment Variables Setup for Vercel

## Current Setup: Frontend Only (Backend Not Yet Deployed)

Since your backend is not yet deployed on Render, use these localhost URLs for now:

### API Configuration (Localhost - Backend Not Deployed Yet)
```
VITE_API_BASE_URL=http://localhost:3001
VITE_AUTH_SERVICE_URL=http://localhost:3001
VITE_CUSTOMER_SERVICE_URL=http://localhost:3002
VITE_ADMIN_SERVICE_URL=http://localhost:3003
VITE_DESIGN_SERVICE_URL=http://localhost:3004
VITE_TAILOR_SERVICE_URL=http://localhost:3003
VITE_VENDOR_SERVICE_URL=http://localhost:3006
VITE_PAYMENT_SERVICE_URL=http://localhost:3007
VITE_MEASUREMENT_SERVICE_URL=http://localhost:8001
```

### Authentication
```
VITE_GOOGLE_CLIENT_ID=648036319844-qp2nk1cg25ukh0j9ritk0mtbslbbccqk.apps.googleusercontent.com
```

### Payment
```
VITE_RAZORPAY_KEY_ID=rzp_test_1234567890
```

### Image Upload
```
VITE_CLOUDINARY_CLOUD_NAME=dshizq6va
VITE_CLOUDINARY_API_KEY=593971394352412
VITE_CLOUDINARY_URL=https://api.cloudinary.com/
```

### App Configuration
```
VITE_APP_NAME=SewNova
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=development
VITE_CORS_ORIGIN=http://localhost:5173
```

## How to Add Environment Variables in Vercel

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add each variable with its value
5. Make sure to set it for "Production" environment
6. Redeploy your project

## Important Notes

- **Current Setup**: Using localhost URLs since backend is not yet deployed
- **After Backend Deployment**: Update URLs to your Render backend URLs
- All variables must start with `VITE_` to be accessible in the frontend
- Don't use secrets for these values - they're client-side variables

## Next Steps After Backend Deployment

Once you deploy your backend on Render, update these URLs:
- Replace `http://localhost:3001` with `https://your-backend-app.onrender.com:3001`
- Replace `http://localhost:3002` with `https://your-backend-app.onrender.com:3002`
- And so on for all services...
