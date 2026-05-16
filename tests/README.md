# SewNova Testing Framework

This directory contains comprehensive testing suite for the SewNova application, covering all aspects from unit tests to end-to-end user acceptance tests.

## 📁 Test Structure

```
tests/
├── setup.js                          # Global test setup and configuration
├── unit/                             # Unit tests for individual components
│   ├── designController.test.js      # Design management unit tests
│   ├── bookingController.test.js     # Booking system unit tests
│   └── paymentController.test.js     # Payment processing unit tests
├── integration/                      # Integration tests
│   ├── apiEndpoints.test.js          # API endpoint integration tests
│   └── serviceCommunication.test.js  # Inter-service communication tests
├── validation/                       # System validation tests
│   └── endToEndWorkflows.test.js    # End-to-end workflow tests
├── uat/                             # User Acceptance Tests
│   └── userJourneys.test.js         # Core user journey tests
├── automation/                       # Automated testing
│   └── ci-cd.test.js                 # CI/CD pipeline tests
├── selenium/                        # Selenium frontend tests
│   ├── frontendTests.js             # Frontend user interaction tests
│   ├── setup.js                     # Selenium environment setup
│   └── run-tests.js                 # Selenium test runner
└── README.md                        # This file
```

## 🧪 Test Categories

### 1. Unit Tests (5.2.1)
- **Purpose**: Test individual functions and components in isolation
- **Coverage**: Controllers, models, utilities, and business logic
- **Tools**: Jest, Supertest, MongoDB Memory Server
- **Files**: `tests/unit/*.test.js`

**Core Functionalities Tested:**
- Design Management (CRUD operations)
- Booking System (creation, updates, status changes)
- Payment Processing (order creation, verification)

### 2. Integration Tests (5.2.2)
- **Purpose**: Test interactions between different services and components
- **Coverage**: API endpoints, service communication, database operations
- **Tools**: Jest, Supertest, Axios mocking
- **Files**: `tests/integration/*.test.js`

**Key Integration Points:**
- Auth Service ↔ Customer Service
- Design Service ↔ Customer Service
- Payment Service ↔ Customer Service
- Cross-service data consistency

### 3. Validation/System Tests (5.2.3)
- **Purpose**: Test complete system workflows and business processes
- **Coverage**: End-to-end user workflows, data integrity, error handling
- **Tools**: Jest, Supertest, MongoDB Memory Server
- **Files**: `tests/validation/*.test.js`

**Critical Workflows:**
- Complete customer journey (registration → order → payment)
- Admin design management workflow
- Multi-user concurrent operations
- Error recovery scenarios

### 4. User Acceptance Tests (5.2.4)
- **Purpose**: Validate that the system meets user requirements and expectations
- **Coverage**: User journeys, business scenarios, usability
- **Tools**: Jest, Supertest, Realistic test data
- **Files**: `tests/uat/*.test.js`

**User Journeys:**
- First-time customer experience
- Returning customer workflow
- Admin management tasks
- Multi-user scenarios

### 5. Automation Tests (5.2.5)
- **Purpose**: Automated testing for CI/CD pipelines and deployment
- **Coverage**: Performance, security, deployment readiness
- **Tools**: Jest, Performance monitoring, Security scanning
- **Files**: `tests/automation/*.test.js`

**Automation Areas:**
- Smoke tests for critical paths
- Performance and load testing
- Security vulnerability scanning
- Data integrity validation
- Environment configuration testing

### 6. Selenium Tests (5.2.6)
- **Purpose**: Frontend user interaction testing with real browsers
- **Coverage**: UI interactions, responsive design, user flows
- **Tools**: Selenium WebDriver, Chrome/Firefox
- **Files**: `tests/selenium/*.js`

**Frontend Testing:**
- User authentication flows
- Design browsing and selection
- Order creation and management
- Payment integration
- Admin dashboard functionality
- Responsive design testing

## 🚀 Running Tests

### Prerequisites
```bash
# Install dependencies
npm install

# Install Selenium dependencies
npm install selenium-webdriver chromedriver geckodriver
```

### Test Commands

```bash
# Run all tests
npm test

# Run specific test categories
npm run test:unit              # Unit tests only
npm run test:integration       # Integration tests only
npm run test:validation       # System validation tests
npm run test:uat              # User acceptance tests
npm run test:automation       # Automation tests
npm run test:selenium         # Selenium frontend tests

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch

# Run for CI/CD
npm run test:ci
```

### Selenium Setup
```bash
# Setup Selenium environment
npm run selenium:setup

# Run Selenium tests
npm run selenium:test
```

## 🔧 Configuration

### Environment Variables
```bash
# Database
MONGODB_URI=mongodb://localhost:27017/sewnova_test

# Authentication
JWT_SECRET=test_jwt_secret
JWT_REFRESH_SECRET=test_refresh_secret

# External Services
CLOUDINARY_CLOUD_NAME=test_cloud
CLOUDINARY_API_KEY=test_key
CLOUDINARY_API_SECRET=test_secret
RAZORPAY_KEY_ID=rzp_test_123
RAZORPAY_KEY_SECRET=test_secret

# Frontend Testing
FRONTEND_URL=http://localhost:3000
API_URL=http://localhost:3001
BROWSER=chrome
HEADLESS=true
```

### Jest Configuration
The testing framework uses Jest with the following configuration:
- **Test Environment**: Node.js
- **Timeout**: 30 seconds
- **Coverage**: HTML and LCOV reports
- **Setup**: Global test utilities and database setup
- **Mocking**: External services and APIs

## 📊 Test Coverage

### Core Functionalities Coverage

#### 1. Design Management
- ✅ Design CRUD operations
- ✅ Image upload handling
- ✅ Category filtering and search
- ✅ Measurement requirements validation
- ✅ Admin design management

#### 2. Booking System
- ✅ Booking creation and validation
- ✅ Order status management
- ✅ Customer booking history
- ✅ Payment integration
- ✅ Email notifications

#### 3. Payment Processing
- ✅ Payment order creation
- ✅ Payment verification
- ✅ Razorpay integration
- ✅ Error handling and recovery
- ✅ Webhook processing

## 🎯 Test Scenarios

### Critical User Paths
1. **New Customer Journey**
   - Registration → Design Browse → Order Creation → Payment → Order Tracking

2. **Returning Customer Journey**
   - Login → Order History → New Order → Quick Payment

3. **Admin Workflow**
   - Admin Login → Design Management → Order Monitoring → Analytics

### Edge Cases
- Invalid input handling
- Network error recovery
- Concurrent user operations
- Payment failure scenarios
- Data consistency validation

### Performance Scenarios
- Load testing with multiple concurrent users
- Database performance with large datasets
- Frontend responsiveness across devices
- API response time validation

## 🔍 Quality Assurance

### Test Metrics
- **Unit Test Coverage**: >90%
- **Integration Test Coverage**: >85%
- **End-to-End Coverage**: >80%
- **Performance Benchmarks**: <2s response time
- **Security**: No critical vulnerabilities

### Continuous Integration
- Automated test execution on every commit
- Multi-browser Selenium testing
- Performance regression detection
- Security vulnerability scanning
- Deployment readiness validation

## 🛠️ Troubleshooting

### Common Issues

1. **MongoDB Connection Issues**
   ```bash
   # Ensure MongoDB is running
   mongod --dbpath ./data/db
   ```

2. **Selenium Driver Issues**
   ```bash
   # Update ChromeDriver
   npm install -g chromedriver
   
   # Update GeckoDriver
   npm install -g geckodriver
   ```

3. **Port Conflicts**
   ```bash
   # Check for port usage
   lsof -i :3000
   lsof -i :3001
   ```

4. **Environment Variables**
   ```bash
   # Copy environment template
   cp .env.example .env
   # Edit with your configuration
   ```

## 📈 Reporting

### Test Reports
- **Coverage Reports**: `./coverage/`
- **Selenium Screenshots**: `./test-screenshots/`
- **Test Results**: `./test-reports/`
- **CI/CD Logs**: GitHub Actions

### Metrics Dashboard
- Test execution time
- Pass/fail rates
- Coverage trends
- Performance metrics
- Security scan results

## 🤝 Contributing

### Adding New Tests
1. Follow the existing test structure
2. Use descriptive test names
3. Include proper setup and teardown
4. Add appropriate assertions
5. Update documentation

### Test Guidelines
- Write tests that are independent and isolated
- Use realistic test data
- Mock external dependencies
- Include both positive and negative test cases
- Maintain test performance

## 📚 Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Selenium WebDriver](https://selenium-python.readthedocs.io/)
- [MongoDB Memory Server](https://github.com/nodkz/mongodb-memory-server)

---

**Note**: This testing framework is designed to ensure the reliability, performance, and security of the SewNova application across all user scenarios and system components.
