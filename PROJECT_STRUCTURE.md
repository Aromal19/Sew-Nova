# SewNova Project Structure

## 📁 Complete Folder Tree Structure

```
SewNova/
├── 📁 backend/                          # Backend Microservices
│   ├── 📁 admin-service/                # Admin Management Service
│   │   ├── 📁 controllers/
│   │   │   ├── adminController.js
│   │   │   ├── analyticsController.js
│   │   │   ├── designController.js
│   │   │   ├── designControllerNew.js
│   │   │   └── userController.js
│   │   ├── 📁 data/
│   │   │   └── globalMeasurements.js
│   │   ├── 📁 middleware/
│   │   │   └── authMiddleware.js
│   │   ├── 📁 models/
│   │   │   ├── admin.js
│   │   │   └── Design.js
│   │   ├── 📁 routes/
│   │   │   ├── adminRoutes.js
│   │   │   ├── analyticsRoutes.js
│   │   │   ├── designRoutes.js
│   │   │   ├── designRoutesDirect.js
│   │   │   ├── designRoutesNew.js
│   │   │   ├── measurementRoutes.js
│   │   │   └── userRoutes.js
│   │   ├── 📁 services/
│   │   ├── 📁 utils/
│   │   ├── 📄 Dockerfile                # Docker configuration
│   │   ├── 📄 package.json
│   │   ├── 📄 server.js
│   │   └── 📄 start-admin-service.js
│   │
│   ├── 📁 auth-service/                # Authentication Service
│   │   ├── 📁 config/
│   │   │   └── validateEnv.js
│   │   ├── 📁 controllers/
│   │   │   ├── authController.js
│   │   │   ├── customerController.js
│   │   │   ├── emailVerificationController.js
│   │   │   ├── sellerController.js
│   │   │   └── tailorController.js
│   │   ├── 📁 middlewares/
│   │   │   ├── auth.js
│   │   │   └── authMiddleware.js
│   │   ├── 📁 models/
│   │   │   ├── admin.js
│   │   │   ├── customer.js
│   │   │   ├── refreshToken.js
│   │   │   ├── seller.js
│   │   │   └── tailor.js
│   │   ├── 📁 routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── customerRoutes.js
│   │   │   ├── sellerRoutes.js
│   │   │   └── tailorRoutes.js
│   │   ├── 📁 utils/
│   │   │   ├── emailService.js
│   │   │   ├── emailValidation.js
│   │   │   ├── orderEmailService.js
│   │   │   └── tokenService.js
│   │   ├── 📄 Dockerfile               # Docker configuration
│   │   ├── 📄 package.json
│   │   └── 📄 server.js
│   │
│   ├── 📁 customer-service/            # Customer Management Service
│   │   ├── 📁 controllers/
│   │   │   ├── addressController.js
│   │   │   ├── bookingController.js
│   │   │   ├── customerController.js
│   │   │   ├── measurementController.js
│   │   │   ├── orderController.js
│   │   │   ├── sizeController.js
│   │   │   └── tailorBookingController.js
│   │   ├── 📁 middleware/
│   │   │   └── authMiddleware.js
│   │   ├── 📁 models/
│   │   │   ├── address.js
│   │   │   ├── booking.js
│   │   │   ├── customer.js
│   │   │   ├── measurement.js
│   │   │   ├── order.js
│   │   │   └── size.js
│   │   ├── 📁 routes/
│   │   │   ├── addressRoutes.js
│   │   │   ├── authenticatedOrderRoutes.js
│   │   │   ├── bookingRoutes.js
│   │   │   ├── customerRoutes.js
│   │   │   ├── measurementRoutes.js
│   │   │   ├── orderRoutes.js
│   │   │   ├── paymentBookingRoutes.js
│   │   │   ├── sizeRoutes.js
│   │   │   └── tailorBookingRoutes.js
│   │   ├── 📄 Dockerfile               # Docker configuration
│   │   ├── 📄 package.json
│   │   └── 📄 server.js
│   │
│   ├── 📁 design-service/              # Design Management Service
│   │   ├── 📁 controllers/
│   │   │   ├── designController.js
│   │   │   ├── measurementController.js
│   │   │   └── sizingController.js
│   │   ├── 📁 data/
│   │   │   ├── globalMeasurements.js
│   │   │   └── globalSizing.js
│   │   ├── 📁 models/
│   │   │   └── design.js
│   │   ├── 📁 routes/
│   │   │   ├── designRoutes.js
│   │   │   ├── measurementRoutes.js
│   │   │   └── sizingRoutes.js
│   │   ├── 📁 utils/
│   │   │   └── cloudinary.js
│   │   ├── 📄 Dockerfile               # Docker configuration
│   │   ├── 📄 package.json
│   │   └── 📄 server.js
│   │
│   ├── 📁 measurement-service/         # AI Measurement Service (Python)
│   │   ├── 📁 __pycache__/
│   │   ├── 📄 Dockerfile               # Docker configuration
│   │   ├── 📄 app.py
│   │   ├── 📄 measurement_utils.py
│   │   ├── 📄 requirements.txt
│   │   ├── 📄 simple_ai_app.py
│   │   ├── 📄 sizeStandardsService.js
│   │   └── 📄 start_ai_service.py
│   │
│   ├── 📁 payment-service/             # Payment Processing Service
│   │   ├── 📁 config/
│   │   │   └── razorpay.js
│   │   ├── 📁 controllers/
│   │   ├── 📁 middleware/
│   │   ├── 📁 models/
│   │   ├── 📁 routes/
│   │   ├── 📁 utils/
│   │   ├── 📄 Dockerfile               # Docker configuration
│   │   ├── 📄 package.json
│   │   └── 📄 server.js
│   │
│   ├── 📁 tailor-service/              # Tailor Management Service
│   │   ├── 📁 src/
│   │   │   ├── 📄 tailorController.js
│   │   │   ├── 📄 tailorRoutes.js
│   │   │   ├── 📄 tailorService.js
│   │   │   ├── 📄 tailorModel.js
│   │   │   ├── 📄 tailorAuth.js
│   │   │   ├── 📄 tailorValidation.js
│   │   │   ├── 📄 tailorUtils.js
│   │   │   ├── 📄 tailorMiddleware.js
│   │   │   └── 📄 tailorConstants.js
│   │   ├── 📄 Dockerfile               # Docker configuration
│   │   ├── 📄 package.json
│   │   └── 📄 server.js
│   │
│   ├── 📁 vendor-service/              # Vendor Management Service
│   │   ├── 📁 src/
│   │   │   ├── 📄 vendorController.js
│   │   │   ├── 📄 vendorRoutes.js
│   │   │   ├── 📄 vendorService.js
│   │   │   ├── 📄 vendorModel.js
│   │   │   ├── 📄 vendorAuth.js
│   │   │   ├── 📄 vendorValidation.js
│   │   │   ├── 📄 vendorUtils.js
│   │   │   ├── 📄 vendorMiddleware.js
│   │   │   ├── 📄 vendorConstants.js
│   │   │   ├── 📄 vendorInventory.js
│   │   │   └── 📄 vendorOrders.js
│   │   ├── 📄 Dockerfile               # Docker configuration
│   │   ├── 📄 package.json
│   │   └── 📄 server.js
│   │
│   ├── 📄 package.json                 # Backend root package.json
│   └── 📄 start-production.js          # Production startup script
│
├── 📁 frontend/                        # React Frontend Application
│   ├── 📁 dist/                        # Built application
│   │   ├── 📁 assets/
│   │   │   ├── 📄 Header-BWHLUA46.png
│   │   │   ├── 📄 index-D2W8RV4-.css
│   │   │   └── 📄 index-QjcaUexa.js
│   │   ├── 📄 index.html
│   │   └── 📄 vite.svg
│   │
│   ├── 📁 public/
│   │   └── 📄 vite.svg
│   │
│   ├── 📁 src/
│   │   ├── 📁 components/              # React Components
│   │   │   ├── 📁 admin/              # Admin Components
│   │   │   │   ├── 📁 dashboard/
│   │   │   │   │   ├── 📄 AnalyticsWidgets.jsx
│   │   │   │   │   ├── 📄 DeliveriesTable.jsx
│   │   │   │   │   ├── 📄 FabricSellersTable.jsx
│   │   │   │   │   ├── 📄 OrdersTable.jsx
│   │   │   │   │   ├── 📄 Settings.jsx
│   │   │   │   │   ├── 📄 TailorsTable.jsx
│   │   │   │   │   ├── 📄 UsersTable.jsx
│   │   │   │   │   └── 📄 WasteManagementTable.jsx
│   │   │   │   ├── 📄 AdminStatsWidget.jsx
│   │   │   │   └── 📄 AdminUsersTable.jsx
│   │   │   ├── 📁 customer/            # Customer Components
│   │   │   │   ├── 📄 AddressManagement.jsx
│   │   │   │   ├── 📄 CustomerOrdersTable.jsx
│   │   │   │   ├── 📄 CustomerProfileCard.jsx
│   │   │   │   ├── 📄 CustomerWishlist.jsx
│   │   │   │   ├── 📄 MeasurementForm.jsx
│   │   │   │   ├── 📄 SellersList.jsx
│   │   │   │   └── 📄 TrackingWidget.jsx
│   │   │   ├── 📁 seller/              # Seller Components
│   │   │   │   ├── 📄 SellerOrdersTable.jsx
│   │   │   │   ├── 📄 SellerProductsTable.jsx
│   │   │   │   ├── 📄 SellerProfileCard.jsx
│   │   │   │   └── 📄 SellerStatsWidget.jsx
│   │   │   ├── 📁 tailor/              # Tailor Components
│   │   │   │   ├── 📄 TailorOrdersTable.jsx
│   │   │   │   ├── 📄 TailorProfileCard.jsx
│   │   │   │   └── 📄 TailorStatsWidget.jsx
│   │   │   ├── 📁 charts/               # Chart Components
│   │   │   │   └── 📄 SimpleChart.jsx
│   │   │   ├── 📄 AdminProtectedRoute.jsx
│   │   │   ├── 📄 AIMeasurementCapture.jsx
│   │   │   ├── 📄 DesignDebugInfo.jsx
│   │   │   ├── 📄 DesignSelection.jsx
│   │   │   ├── 📄 EmailVerificationPending.jsx
│   │   │   ├── 📄 EnhancedAIMeasurement.jsx
│   │   │   ├── 📄 EnhancedMeasurementForm.jsx
│   │   │   ├── 📄 GoogleOAuthTest.jsx
│   │   │   ├── 📄 MeasurementForm.jsx
│   │   │   ├── 📄 Modal.jsx
│   │   │   ├── 📄 Navbar.jsx
│   │   │   ├── 📄 PhoneNumberInput.jsx
│   │   │   ├── 📄 ProtectedRoute.jsx
│   │   │   ├── 📄 ResumeBookingNotification.jsx
│   │   │   ├── 📄 Sidebar.jsx
│   │   │   └── 📄 SidebarDemo.jsx
│   │   │
│   │   ├── 📁 pages/                   # Page Components
│   │   │   ├── 📁 admin/               # Admin Pages
│   │   │   │   ├── 📄 AdminDashboard.jsx
│   │   │   │   ├── 📄 AdminInsights.jsx
│   │   │   │   ├── 📄 AdminLogin.jsx
│   │   │   │   ├── 📄 AdminSettings.jsx
│   │   │   │   ├── 📄 AdminUserDashboard.jsx
│   │   │   │   ├── 📄 DesignManagement.jsx
│   │   │   │   ├── 📄 DesignManagementBackup.jsx
│   │   │   │   ├── 📄 DesignManagementEnhanced.jsx
│   │   │   │   ├── 📄 ManageUsers.jsx
│   │   │   │   └── 📄 Signup.jsx
│   │   │   ├── 📁 customer/            # Customer Pages
│   │   │   │   ├── 📄 BookingFlow.jsx
│   │   │   │   ├── 📄 Cart.jsx
│   │   │   │   ├── 📄 Checkout.jsx
│   │   │   │   ├── 📄 CustomerAddresses.jsx
│   │   │   │   ├── 📄 CustomerBookings.jsx
│   │   │   │   ├── 📄 CustomerDashboard.jsx
│   │   │   │   ├── 📄 CustomerMeasurements.jsx
│   │   │   │   ├── 📄 CustomerOrders.jsx
│   │   │   │   ├── 📄 CustomerProfile.jsx
│   │   │   │   ├── 📄 CustomerSignup.jsx
│   │   │   │   ├── 📄 FabricBrowse.jsx
│   │   │   │   ├── 📄 ProductDetail.jsx
│   │   │   │   ├── 📄 TailorBrowse.jsx
│   │   │   │   └── 📄 TailorDetail.jsx
│   │   │   ├── 📁 seller/              # Seller Pages
│   │   │   │   ├── 📄 AddFabric.jsx
│   │   │   │   ├── 📄 Fabrics.jsx
│   │   │   │   ├── 📄 Inventory.jsx
│   │   │   │   ├── 📄 SellerDashboard.jsx
│   │   │   │   ├── 📄 SellerProfile.jsx
│   │   │   │   └── 📄 SellerSignup.jsx
│   │   │   ├── 📁 tailor/              # Tailor Pages
│   │   │   │   ├── 📄 ActiveOrders.jsx
│   │   │   │   ├── 📄 TailorDashboard.jsx
│   │   │   │   ├── 📄 TailorProfile.jsx
│   │   │   │   └── 📄 TailorSignup.jsx
│   │   │   ├── 📄 CustomerLandingPage.jsx
│   │   │   ├── 📄 DesignPage.jsx
│   │   │   ├── 📄 EmailVerification.jsx
│   │   │   ├── 📄 LandingPage.jsx
│   │   │   ├── 📄 Login.jsx
│   │   │   ├── 📄 Logout.jsx
│   │   │   └── 📄 SignupSelection.jsx
│   │   │
│   │   ├── 📁 services/                # API Services
│   │   │   ├── 📄 adminApiService.js
│   │   │   ├── 📄 adminAuthService.js
│   │   │   ├── 📄 adminService.js
│   │   │   └── 📄 measurementService.js
│   │   │
│   │   ├── 📁 utils/                   # Utility Functions
│   │   │   ├── 📄 api.js
│   │   │   ├── 📄 apiTest.js
│   │   │   ├── 📄 bookingApi.js
│   │   │   ├── 📄 bookingCache.js
│   │   │   ├── 📄 errorHandler.js
│   │   │   ├── 📄 razorpay.js
│   │   │   └── 📄 sizeStandardsScraper.js
│   │   │
│   │   ├── 📁 config/                  # Configuration
│   │   │   ├── 📄 api-test.js
│   │   │   ├── 📄 api.js
│   │   │   └── 📄 googleOAuth.js
│   │   │
│   │   ├── 📁 context/                 # React Context
│   │   │   ├── 📄 BookingContext.jsx
│   │   │   └── 📄 CartContext.jsx
│   │   │
│   │   ├── 📁 hooks/                   # Custom Hooks
│   │   ├── 📁 assets/                  # Static Assets
│   │   │   ├── 📄 Header.png
│   │   │   └── 📄 react.svg
│   │   ├── 📄 App.css
│   │   ├── 📄 App.jsx
│   │   ├── 📄 index.css
│   │   ├── 📄 main.jsx
│   │   └── 📄 test-design-api.js
│   │
│   ├── 📄 Dockerfile                   # Docker configuration
│   ├── 📄 nginx.conf                   # Nginx configuration
│   ├── 📄 package.json
│   ├── 📄 vite.config.js
│   ├── 📄 tailwind.config.js
│   ├── 📄 postcss.config.cjs
│   ├── 📄 eslint.config.js
│   └── 📄 index.html
│
├── 📁 node_modules/                    # Dependencies (excluded from tree)
│
├── 📄 docker-compose.yml               # Docker Compose Configuration
├── 📄 nginx.conf                       # Main Nginx Configuration
├── 📄 package.json                     # Root package.json
├── 📄 package-lock.json               # Lock file
├── 📄 start-all-services.js           # Development startup script
│
├── 📄 Docker Management Scripts
├── 📄 docker-start.ps1                 # PowerShell start script
├── 📄 docker-stop.ps1                  # PowerShell stop script
├── 📄 docker-logs.ps1                  # PowerShell logs script
├── 📄 docker-rebuild.ps1               # PowerShell rebuild script
├── 📄 docker-start.sh                  # Bash start script
├── 📄 docker-stop.sh                   # Bash stop script
├── 📄 docker-logs.sh                   # Bash logs script
├── 📄 docker-rebuild.sh                # Bash rebuild script
│
├── 📄 Environment & Configuration
├── 📄 env.docker.example               # Docker environment template
├── 📄 render.yaml                      # Render deployment config
│
├── 📄 Documentation
├── 📄 DEPLOYMENT_GUIDE.md              # Render/Vercel deployment guide
├── 📄 DOCKER_DEPLOYMENT_GUIDE.md       # Docker deployment guide
├── 📄 DEPLOYMENT_CHECKLIST.md          # Deployment checklist
├── 📄 GOOGLE_OAUTH_SETUP.md            # OAuth setup guide
├── 📄 PROJECT_STRUCTURE.md             # This file
│
└── 📄 Legacy Files (to be removed)
    ├── 📄 START_SERVICES_POWERSHELL.ps1
    └── 📄 start-all-services.js
```

## 🏗️ Architecture Overview

### **Backend Microservices (8 Services)**
1. **Auth Service** (Port 3001) - Authentication & JWT
2. **Customer Service** (Port 3002) - Customer operations
3. **Admin Service** (Port 3003) - Admin dashboard
4. **Design Service** (Port 3004) - Design management
5. **Tailor Service** (Port 3005) - Tailor operations
6. **Vendor Service** (Port 3006) - Vendor management
7. **Payment Service** (Port 3007) - Razorpay integration
8. **Measurement Service** (Port 8001) - AI measurements (Python)

### **Frontend Application**
- **React + Vite** - Modern frontend framework
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Chart.js** - Analytics
- **SweetAlert2** - Notifications

### **Infrastructure**
- **MongoDB** - Database
- **Nginx** - Reverse proxy & load balancer
- **Docker** - Containerization
- **Docker Compose** - Orchestration

## 🚀 Deployment Options

### **Option 1: Docker (Recommended)**
- Complete containerized setup
- Easy local development
- Production-ready configuration
- All services orchestrated

### **Option 2: Cloud Deployment**
- **Backend**: Render.com
- **Frontend**: Vercel.com
- **Database**: MongoDB Atlas

## 📊 Key Features

✅ **Microservices Architecture** - Scalable and maintainable
✅ **Docker Containerization** - Consistent environments
✅ **Authentication System** - JWT + Google OAuth
✅ **Payment Integration** - Razorpay
✅ **AI Measurements** - Python-based ML service
✅ **Admin Dashboard** - Complete management interface
✅ **Multi-role Support** - Customer, Tailor, Seller, Admin
✅ **Real-time Features** - Live updates and notifications
✅ **Responsive Design** - Mobile-friendly interface
✅ **Production Ready** - Optimized for deployment

## 🔧 Development Commands

### **Docker Commands**
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild services
docker-compose up --build -d
```

### **PowerShell Scripts (Windows)**
```powershell
.\docker-start.ps1      # Start all services
.\docker-stop.ps1      # Stop all services
.\docker-logs.ps1      # View logs
.\docker-rebuild.ps1   # Rebuild and restart
```

### **Bash Scripts (Linux/Mac)**
```bash
./docker-start.sh      # Start all services
./docker-stop.sh       # Stop all services
./docker-logs.sh       # View logs
./docker-rebuild.sh    # Rebuild and restart
```

## 🌐 Access Points

- **Frontend**: http://localhost
- **API Gateway**: http://localhost/api
- **Database**: localhost:27017
- **Individual Services**: localhost:3001-3007, 8001

This structure provides a complete, production-ready SewNova application with microservices architecture, Docker containerization, and comprehensive deployment options.
