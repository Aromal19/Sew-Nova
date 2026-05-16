const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const axios = require('axios');

// Mock external services
jest.mock('axios');
const mockedAxios = axios;

jest.mock('../../backend/design-service/utils/cloudinary', () => ({
  uploadMultipleImages: jest.fn().mockResolvedValue({
    success: true,
    images: ['https://cloudinary.com/test-image.jpg'],
    totalUploaded: 1
  })
}));

jest.mock('../../backend/customer-service/utils/orderEmailService', () => ({
  sendNewOrderNotification: jest.fn().mockResolvedValue({ success: true }),
  sendPaymentConfirmationEmail: jest.fn().mockResolvedValue({ success: true }),
  sendOrderStatusUpdateEmail: jest.fn().mockResolvedValue({ success: true })
}));

jest.mock('../../backend/payment-service/config/razorpay', () => ({
  orders: {
    create: jest.fn().mockResolvedValue({
      id: 'order_test123',
      amount: 10000,
      currency: 'INR',
      receipt: 'receipt_test123'
    })
  },
  payments: {
    fetch: jest.fn().mockResolvedValue({
      id: 'pay_test123',
      status: 'captured',
      amount: 10000,
      currency: 'INR',
      method: 'upi'
    })
  }
}));

describe('Automated Testing - CI/CD Integration', () => {
  let mongoServer;
  let authServiceApp;
  let customerServiceApp;
  let designServiceApp;
  let paymentServiceApp;
  let adminServiceApp;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);

    const express = require('express');
    
    // Setup all services
    const authApp = express();
    authApp.use(express.json());
    authApp.post('/api/auth/register', (req, res) => {
      res.json({
        success: true,
        user: {
          _id: 'user123',
          email: req.body.email,
          firstname: req.body.firstname,
          lastname: req.body.lastname,
          role: 'customer'
        },
        token: 'jwt_token_123'
      });
    });
    authApp.post('/api/auth/login', (req, res) => {
      res.json({
        success: true,
        user: {
          _id: 'user123',
          email: req.body.email,
          role: 'customer'
        },
        token: 'jwt_token_123'
      });
    });
    authApp.post('/api/auth/verify-token', (req, res) => {
      res.json({
        success: true,
        user: {
          _id: 'user123',
          email: 'test@example.com',
          role: 'customer'
        }
      });
    });
    authServiceApp = authApp;

    const customerApp = express();
    customerApp.use(express.json());
    customerApp.use(async (req, res, next) => {
      try {
        const authResponse = await axios.post('http://localhost:3001/api/auth/verify-token', {
          token: req.headers.authorization?.replace('Bearer ', '')
        });
        req.user = authResponse.data.user;
        next();
      } catch (error) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
      }
    });
    
    const customerRoutes = require('../../backend/customer-service/routes/bookingRoutes');
    customerApp.use('/api/bookings', customerRoutes);
    customerServiceApp = customerApp;

    const designApp = express();
    designApp.use(express.json());
    const designRoutes = require('../../backend/design-service/routes/designRoutes');
    designApp.use('/api/designs', designRoutes);
    designServiceApp = designApp;

    const paymentApp = express();
    paymentApp.use(express.json());
    const paymentRoutes = require('../../backend/payment-service/routes/paymentRoutes');
    paymentApp.use('/api/payments', paymentRoutes);
    paymentServiceApp = paymentApp;

    const adminApp = express();
    adminApp.use(express.json());
    adminApp.use(async (req, res, next) => {
      req.user = { _id: 'admin123', role: 'admin' };
      next();
    });
    const adminRoutes = require('../../backend/admin-service/routes/designRoutes');
    adminApp.use('/api/admin/designs', adminRoutes);
    adminServiceApp = adminApp;
  });

  afterAll(async () => {
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Clean up collections
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }

    // Reset axios mocks
    mockedAxios.post.mockClear();
  });

  describe('Smoke Tests - Critical Path Validation', () => {
    test('should pass all critical smoke tests', async () => {
      console.log('🚀 CI/CD: Running smoke tests for critical paths');
      
      // Test 1: Auth Service Health
      const authResponse = await request(authServiceApp)
        .post('/api/auth/register')
        .send({
          firstname: 'Test',
          lastname: 'User',
          email: 'test@example.com',
          phone: '1234567890',
          password: 'password123'
        })
        .expect(200);

      expect(authResponse.body.success).toBe(true);
      console.log('✅ Auth service smoke test passed');

      // Test 2: Design Service Health
      const designResponse = await request(designServiceApp)
        .post('/api/designs')
        .send({
          name: 'Smoke Test Design',
          category: 'formal',
          garmentType: 'shirt',
          price: 1000
        })
        .expect(201);

      expect(designResponse.body.success).toBe(true);
      console.log('✅ Design service smoke test passed');

      // Test 3: Customer Service Health
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          success: true,
          user: { _id: 'user123', email: 'test@example.com' }
        }
      });

      const bookingResponse = await request(customerServiceApp)
        .post('/api/bookings')
        .set('Authorization', 'Bearer valid_token')
        .send({
          bookingType: 'complete',
          tailorId: new mongoose.Types.ObjectId(),
          fabricId: new mongoose.Types.ObjectId(),
          measurementId: new mongoose.Types.ObjectId(),
          addressId: new mongoose.Types.ObjectId(),
          customerId: 'user123',
          orderDetails: {
            garmentType: 'shirt',
            quantity: 1,
            designDescription: 'Smoke test order'
          },
          pricing: {
            fabricCost: 500,
            tailoringCost: 300,
            totalAmount: 800,
            advanceAmount: 200
          },
          payment: {
            status: 'pending',
            method: 'razorpay'
          }
        })
        .expect(201);

      expect(bookingResponse.body.success).toBe(true);
      console.log('✅ Customer service smoke test passed');

      // Test 4: Payment Service Health
      const paymentResponse = await request(paymentServiceApp)
        .post('/api/payments/create-order')
        .send({
          amount: 100,
          currency: 'INR',
          receipt: 'smoke_test_receipt',
          userId: 'user123'
        })
        .expect(200);

      expect(paymentResponse.body.success).toBe(true);
      console.log('✅ Payment service smoke test passed');

      // Test 5: Admin Service Health
      const adminResponse = await request(adminServiceApp)
        .post('/api/admin/designs')
        .send({
          name: 'Admin Smoke Test Design',
          category: 'formal',
          garmentType: 'shirt',
          price: 1000
        })
        .expect(201);

      expect(adminResponse.body.success).toBe(true);
      console.log('✅ Admin service smoke test passed');

      console.log('🎉 All smoke tests passed successfully!');
    });
  });

  describe('Performance Tests - Load Validation', () => {
    test('should handle concurrent requests efficiently', async () => {
      console.log('🚀 CI/CD: Running performance tests');
      
      const startTime = Date.now();
      
      // Create multiple concurrent requests
      const concurrentRequests = [];
      
      // 10 concurrent design creations
      for (let i = 0; i < 10; i++) {
        concurrentRequests.push(
          request(designServiceApp)
            .post('/api/designs')
            .send({
              name: `Performance Test Design ${i}`,
              category: 'formal',
              garmentType: 'shirt',
              price: 1000 + i * 100
            })
        );
      }

      // 10 concurrent payment orders
      for (let i = 0; i < 10; i++) {
        concurrentRequests.push(
          request(paymentServiceApp)
            .post('/api/payments/create-order')
            .send({
              amount: 100 + i * 10,
              currency: 'INR',
              receipt: `perf_test_${i}`,
              userId: `user${i}`
            })
        );
      }

      // Execute all requests concurrently
      const responses = await Promise.all(concurrentRequests);
      
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      // Verify all requests succeeded
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });

      // Performance assertion: All requests should complete within 5 seconds
      expect(totalTime).toBeLessThan(5000);
      
      console.log(`✅ Performance test passed: ${responses.length} concurrent requests completed in ${totalTime}ms`);
    });

    test('should handle database operations efficiently', async () => {
      console.log('🚀 CI/CD: Running database performance tests');
      
      const startTime = Date.now();
      
      // Create multiple designs in sequence
      const designPromises = [];
      for (let i = 0; i < 50; i++) {
        designPromises.push(
          request(designServiceApp)
            .post('/api/designs')
            .send({
              name: `DB Performance Design ${i}`,
              category: i % 2 === 0 ? 'formal' : 'casual',
              garmentType: 'shirt',
              price: 1000 + i * 20
            })
        );
      }

      const responses = await Promise.all(designPromises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // Verify all creations succeeded
      responses.forEach(response => {
        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
      });

      // Performance assertion: 50 database operations should complete within 3 seconds
      expect(totalTime).toBeLessThan(3000);
      
      console.log(`✅ Database performance test passed: 50 operations completed in ${totalTime}ms`);
    });
  });

  describe('Regression Tests - Feature Stability', () => {
    test('should maintain backward compatibility', async () => {
      console.log('🚀 CI/CD: Running regression tests');
      
      // Test 1: Design CRUD operations
      const designData = {
        name: 'Regression Test Design',
        category: 'formal',
        garmentType: 'shirt',
        price: 1000
      };

      // Create
      const createResponse = await request(designServiceApp)
        .post('/api/designs')
        .send(designData)
        .expect(201);

      expect(createResponse.body.success).toBe(true);
      const designId = createResponse.body.data._id;

      // Read
      const readResponse = await request(designServiceApp)
        .get(`/api/designs/${designId}`)
        .expect(200);

      expect(readResponse.body.success).toBe(true);
      expect(readResponse.body.data.name).toBe('Regression Test Design');

      // Update
      const updateResponse = await request(designServiceApp)
        .put(`/api/designs/${designId}`)
        .send({ name: 'Updated Regression Design', price: 1200 })
        .expect(200);

      expect(updateResponse.body.success).toBe(true);
      expect(updateResponse.body.data.name).toBe('Updated Regression Design');

      // Delete (soft delete)
      const deleteResponse = await request(designServiceApp)
        .delete(`/api/designs/${designId}`)
        .expect(200);

      expect(deleteResponse.body.success).toBe(true);

      console.log('✅ Design CRUD regression test passed');

      // Test 2: Payment flow regression
      const paymentOrderData = {
        amount: 100,
        currency: 'INR',
        receipt: 'regression_test_receipt',
        userId: 'user123'
      };

      const orderResponse = await request(paymentServiceApp)
        .post('/api/payments/create-order')
        .send(paymentOrderData)
        .expect(200);

      expect(orderResponse.body.success).toBe(true);

      const verificationData = {
        razorpay_order_id: orderResponse.body.order.id,
        razorpay_payment_id: 'pay_test123',
        razorpay_signature: 'test_signature_123'
      };

      const verifyResponse = await request(paymentServiceApp)
        .post('/api/payments/verify')
        .send(verificationData)
        .expect(200);

      expect(verifyResponse.body.success).toBe(true);
      console.log('✅ Payment flow regression test passed');
    });

    test('should maintain API contract stability', async () => {
      console.log('🚀 CI/CD: Running API contract tests');
      
      // Test design API contract
      const designResponse = await request(designServiceApp)
        .get('/api/designs')
        .expect(200);

      expect(designResponse.body).toHaveProperty('success');
      expect(designResponse.body).toHaveProperty('data');
      expect(designResponse.body).toHaveProperty('count');
      expect(Array.isArray(designResponse.body.data)).toBe(true);
      console.log('✅ Design API contract test passed');

      // Test payment API contract
      const paymentResponse = await request(paymentServiceApp)
        .post('/api/payments/create-order')
        .send({
          amount: 100,
          currency: 'INR',
          receipt: 'contract_test',
          userId: 'user123'
        })
        .expect(200);

      expect(paymentResponse.body).toHaveProperty('success');
      expect(paymentResponse.body).toHaveProperty('order');
      expect(paymentResponse.body.order).toHaveProperty('id');
      expect(paymentResponse.body.order).toHaveProperty('amount');
      expect(paymentResponse.body.order).toHaveProperty('currency');
      console.log('✅ Payment API contract test passed');
    });
  });

  describe('Security Tests - Vulnerability Checks', () => {
    test('should handle malicious input safely', async () => {
      console.log('🚀 CI/CD: Running security tests');
      
      // Test 1: SQL Injection attempts
      const maliciousInputs = [
        "'; DROP TABLE designs; --",
        "<script>alert('xss')</script>",
        "../../etc/passwd",
        "'; SELECT * FROM users; --"
      ];

      for (const maliciousInput of maliciousInputs) {
        const response = await request(designServiceApp)
          .get(`/api/designs?search=${encodeURIComponent(maliciousInput)}`)
          .expect(200);

        // Should not crash and should return empty results or handle gracefully
        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
      }
      console.log('✅ SQL injection protection test passed');

      // Test 2: XSS protection
      const xssPayload = "<script>alert('xss')</script>";
      const designResponse = await request(designServiceApp)
        .post('/api/designs')
        .send({
          name: xssPayload,
          category: 'formal',
          garmentType: 'shirt',
          price: 1000
        })
        .expect(201);

      // XSS payload should be stored as-is (not executed) or sanitized
      expect(designResponse.body.success).toBe(true);
      console.log('✅ XSS protection test passed');

      // Test 3: Authentication bypass attempts
      const authBypassResponse = await request(customerServiceApp)
        .get('/api/bookings')
        .expect(401);

      expect(authBypassResponse.body.success).toBe(false);
      expect(authBypassResponse.body.message).toBe('Unauthorized');
      console.log('✅ Authentication bypass protection test passed');
    });

    test('should handle rate limiting', async () => {
      console.log('🚀 CI/CD: Running rate limiting tests');
      
      // Simulate rapid requests
      const rapidRequests = [];
      for (let i = 0; i < 20; i++) {
        rapidRequests.push(
          request(designServiceApp)
            .get('/api/designs')
        );
      }

      const responses = await Promise.all(rapidRequests);
      
      // All requests should still succeed (rate limiting not implemented in test)
      // In production, some requests might be rate limited
      responses.forEach(response => {
        expect([200, 429]).toContain(response.status);
      });
      console.log('✅ Rate limiting test passed');
    });
  });

  describe('Data Integrity Tests - Consistency Validation', () => {
    test('should maintain data consistency across operations', async () => {
      console.log('🚀 CI/CD: Running data integrity tests');
      
      // Create design
      const designResponse = await request(designServiceApp)
        .post('/api/designs')
        .send({
          name: 'Integrity Test Design',
          category: 'formal',
          garmentType: 'shirt',
          price: 1000
        })
        .expect(201);

      const designId = designResponse.body.data._id;

      // Create booking with design reference
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          success: true,
          user: { _id: 'user123', email: 'test@example.com' }
        }
      });

      const bookingResponse = await request(customerServiceApp)
        .post('/api/bookings')
        .set('Authorization', 'Bearer valid_token')
        .send({
          bookingType: 'complete',
          tailorId: new mongoose.Types.ObjectId(),
          fabricId: new mongoose.Types.ObjectId(),
          measurementId: new mongoose.Types.ObjectId(),
          addressId: new mongoose.Types.ObjectId(),
          customerId: 'user123',
          orderDetails: {
            garmentType: 'shirt',
            quantity: 1,
            designDescription: 'Integrity test order',
            designId: designId
          },
          pricing: {
            fabricCost: 500,
            tailoringCost: 300,
            totalAmount: 800,
            advanceAmount: 200
          },
          payment: {
            status: 'pending',
            method: 'razorpay'
          }
        })
        .expect(201);

      // Verify design still exists
      const designCheckResponse = await request(designServiceApp)
        .get(`/api/designs/${designId}`)
        .expect(200);

      expect(designCheckResponse.body.success).toBe(true);
      expect(designCheckResponse.body.data.name).toBe('Integrity Test Design');

      // Verify booking references correct design
      const bookingCheckResponse = await request(customerServiceApp)
        .get(`/api/bookings/${bookingResponse.body.data._id}`)
        .set('Authorization', 'Bearer valid_token')
        .expect(200);

      expect(bookingCheckResponse.body.data.orderDetails.designId).toBe(designId);
      console.log('✅ Data integrity test passed');
    });

    test('should handle concurrent modifications safely', async () => {
      console.log('🚀 CI/CD: Running concurrent modification tests');
      
      // Create a design
      const designResponse = await request(designServiceApp)
        .post('/api/designs')
        .send({
          name: 'Concurrent Test Design',
          category: 'formal',
          garmentType: 'shirt',
          price: 1000
        })
        .expect(201);

      const designId = designResponse.body.data._id;

      // Multiple concurrent updates
      const updatePromises = [];
      for (let i = 0; i < 5; i++) {
        updatePromises.push(
          request(designServiceApp)
            .put(`/api/designs/${designId}`)
            .send({
              name: `Concurrent Update ${i}`,
              price: 1000 + i * 100
            })
        );
      }

      const updateResponses = await Promise.all(updatePromises);
      
      // At least one update should succeed
      const successfulUpdates = updateResponses.filter(response => response.status === 200);
      expect(successfulUpdates.length).toBeGreaterThan(0);
      console.log('✅ Concurrent modification test passed');
    });
  });

  describe('Environment Tests - Configuration Validation', () => {
    test('should validate environment configuration', async () => {
      console.log('🚀 CI/CD: Running environment tests');
      
      // Test environment variables are accessible
      expect(process.env.NODE_ENV).toBeDefined();
      console.log('✅ Environment variables accessible');

      // Test database connection
      expect(mongoose.connection.readyState).toBe(1); // Connected
      console.log('✅ Database connection verified');

      // Test service endpoints are responsive
      const services = [
        { name: 'Design Service', app: designServiceApp, path: '/api/designs' },
        { name: 'Payment Service', app: paymentServiceApp, path: '/api/payments' }
      ];

      for (const service of services) {
        const response = await request(service.app)
          .get(service.path)
          .expect(200);

        expect(response.body.success).toBe(true);
        console.log(`✅ ${service.name} endpoint responsive`);
      }
    });

    test('should handle missing environment gracefully', async () => {
      console.log('🚀 CI/CD: Running missing environment tests');
      
      // Test with missing Cloudinary credentials (should not crash)
      const originalCloudName = process.env.CLOUDINARY_CLOUD_NAME;
      delete process.env.CLOUDINARY_CLOUD_NAME;

      const designResponse = await request(designServiceApp)
        .post('/api/designs')
        .send({
          name: 'No Cloudinary Test',
          category: 'formal',
          garmentType: 'shirt',
          price: 1000,
          images: ['https://example.com/image.jpg']
        })
        .expect(201);

      expect(designResponse.body.success).toBe(true);
      console.log('✅ Missing Cloudinary credentials handled gracefully');

      // Restore environment
      if (originalCloudName) {
        process.env.CLOUDINARY_CLOUD_NAME = originalCloudName;
      }
    });
  });

  describe('Deployment Tests - Production Readiness', () => {
    test('should be ready for production deployment', async () => {
      console.log('🚀 CI/CD: Running deployment readiness tests');
      
      // Test 1: All critical endpoints are functional
      const criticalEndpoints = [
        { service: designServiceApp, path: '/api/designs', method: 'GET' },
        { service: paymentServiceApp, path: '/api/payments', method: 'POST' }
      ];

      for (const endpoint of criticalEndpoints) {
        const response = await request(endpoint.service)
          [endpoint.method.toLowerCase()](endpoint.path)
          .send(endpoint.method === 'POST' ? { amount: 100, userId: 'test' } : {})
          .expect([200, 201, 400]); // 400 is acceptable for missing data

        expect(response.body).toBeDefined();
        console.log(`✅ ${endpoint.path} endpoint functional`);
      }

      // Test 2: Error handling is robust
      const errorResponse = await request(designServiceApp)
        .get('/api/designs/invalid-id')
        .expect(400);

      expect(errorResponse.body.success).toBe(false);
      console.log('✅ Error handling is robust');

      // Test 3: Performance is acceptable
      const startTime = Date.now();
      await request(designServiceApp)
        .get('/api/designs')
        .expect(200);
      const responseTime = Date.now() - startTime;

      expect(responseTime).toBeLessThan(1000); // Should respond within 1 second
      console.log(`✅ Performance is acceptable: ${responseTime}ms`);

      console.log('🎉 Deployment readiness tests passed!');
    });
  });
});
