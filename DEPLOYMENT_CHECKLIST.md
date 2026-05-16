# SewNova Deployment Checklist

## Pre-Deployment Checklist

### Backend (Render) Preparation
- [ ] All backend services are in `backend/` directory
- [ ] `render.yaml` configuration file is created
- [ ] `backend/package.json` is created with dependencies
- [ ] `backend/start-production.js` is created
- [ ] All environment variables are documented
- [ ] Database connection string is ready
- [ ] JWT secrets are generated
- [ ] Google OAuth credentials are ready
- [ ] Razorpay credentials are ready
- [ ] Cloudinary credentials are ready
- [ ] Email service credentials are ready

### Frontend (Vercel) Preparation
- [ ] Frontend is in `frontend/` directory
- [ ] `vercel.json` configuration file is created
- [ ] `package.json` has `vercel-build` script
- [ ] All environment variables are documented
- [ ] API endpoints are configured for production
- [ ] Build process is tested locally

## Deployment Steps

### Backend Deployment (Render)
- [ ] Create Render account
- [ ] Connect GitHub repository
- [ ] Create new Web Service
- [ ] Configure build and start commands
- [ ] Set all environment variables
- [ ] Deploy and wait for completion
- [ ] Test backend endpoints
- [ ] Note backend URL for frontend configuration

### Frontend Deployment (Vercel)
- [ ] Create Vercel account
- [ ] Connect GitHub repository
- [ ] Import project (select frontend folder)
- [ ] Configure build settings
- [ ] Set environment variables
- [ ] Deploy and wait for completion
- [ ] Test frontend application
- [ ] Note frontend URL for CORS configuration

## Post-Deployment Configuration
- [ ] Update CORS_ORIGIN in Render with Vercel URL
- [ ] Update VITE_API_BASE_URL in Vercel with Render URL
- [ ] Test user registration/login
- [ ] Test payment integration
- [ ] Test file uploads
- [ ] Test all major features
- [ ] Monitor logs for errors

## Environment Variables Checklist

### Backend (Render)
- [ ] `NODE_ENV=production`
- [ ] `MONGODB_URI` - MongoDB connection string
- [ ] `JWT_SECRET` - JWT signing secret
- [ ] `JWT_REFRESH_SECRET` - JWT refresh secret
- [ ] `GOOGLE_CLIENT_ID` - Google OAuth client ID
- [ ] `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- [ ] `RAZORPAY_KEY_ID` - Razorpay key ID
- [ ] `RAZORPAY_KEY_SECRET` - Razorpay key secret
- [ ] `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
- [ ] `CLOUDINARY_API_KEY` - Cloudinary API key
- [ ] `CLOUDINARY_API_SECRET` - Cloudinary API secret
- [ ] `EMAIL_SERVICE_API_KEY` - Email service API key
- [ ] `EMAIL_FROM` - From email address
- [ ] `CORS_ORIGIN` - Frontend URL for CORS

### Frontend (Vercel)
- [ ] `VITE_API_BASE_URL` - Backend API URL
- [ ] `VITE_GOOGLE_CLIENT_ID` - Google OAuth client ID
- [ ] `VITE_RAZORPAY_KEY_ID` - Razorpay key ID

## Testing Checklist
- [ ] Backend API endpoints respond correctly
- [ ] Frontend loads without errors
- [ ] User registration works
- [ ] User login works
- [ ] Google OAuth works
- [ ] Payment integration works
- [ ] File uploads work
- [ ] All user roles work (customer, tailor, seller, admin)
- [ ] Database operations work
- [ ] Email notifications work

## Security Checklist
- [ ] All secrets are properly set in environment variables
- [ ] No sensitive data is in code
- [ ] CORS is properly configured
- [ ] Database access is restricted
- [ ] SSL/HTTPS is enabled (automatic on both platforms)

## Monitoring Setup
- [ ] Monitor Render service health
- [ ] Monitor Vercel deployment status
- [ ] Set up error tracking (optional)
- [ ] Monitor database performance
- [ ] Set up alerts for critical issues

## Final Verification
- [ ] Application is fully functional
- [ ] All features work as expected
- [ ] Performance is acceptable
- [ ] No critical errors in logs
- [ ] User experience is smooth
- [ ] Mobile responsiveness works
- [ ] Cross-browser compatibility works

## Rollback Plan
- [ ] Keep previous deployment versions available
- [ ] Document rollback procedures
- [ ] Test rollback process
- [ ] Have backup of working configuration

## Documentation
- [ ] Update README with production URLs
- [ ] Document deployment process
- [ ] Create troubleshooting guide
- [ ] Document environment variables
- [ ] Create maintenance procedures
