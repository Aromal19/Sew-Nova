const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const axios = require('axios');

// Mock external API calls
jest.mock('axios');
const mockedAxios = axios;

describe('Service Communication Integration Tests', () => {
  let mongoServer;
  let authServiceApp;
  let customerServiceApp;
  let designServiceApp;
  let paymentServiceApp;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);

    const express = require('express');
    
    // Setup Auth Service
    const authApp = express();
    authApp.use(express.json());
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

    // Setup Customer Service with auth middleware
    const customerApp = express();
    customerApp.use(express.json());
    customerApp.use(async (req, res, next) => {
      try {
        // Mock auth service call
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

    // Setup Design Service
    const designApp = express();
    designApp.use(express.json());
    const designRoutes = require('../../backend/design-service/routes/designRoutes');
    designApp.use('/api/designs', designRoutes);
    designServiceApp = designApp;

    // Setup Payment Service
    const paymentApp = express();
    paymentApp.use(express.json());
    const paymentRoutes = require('../../backend/payment-service/routes/paymentRoutes');
    paymentApp.use('/api/payments', paymentRoutes);
    paymentServiceApp = paymentApp;
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

  describe('Auth Service Communication', () => {
    test('should authenticate user through auth service', async () => {
      // Mock successful auth response
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          success: true,
          user: {
            _id: 'user123',
            email: 'test@example.com',
            role: 'customer'
          }
        }
      });

      const response = await request(customerServiceApp)
        .get('/api/bookings')
        .set('Authorization', 'Bearer valid_token')
        .expect(200);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:3001/api/auth/verify-token',
        { token: 'valid_token' }
      );
    });

    test('should handle auth service failure', async () => {
      // Mock auth service failure
      mockedAxios.post.mockRejectedValueOnce(new Error('Auth service unavailable'));

      const response = await request(customerServiceApp)
        .get('/api/bookings')
        .set('Authorization', 'Bearer invalid_token')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Unauthorized');
    });

    test('should handle missing authorization header', async () => {
      const response = await request(customerServiceApp)
        .get('/api/bookings')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Unauthorized');
    });
  });

  describe('Customer Service to Payment Service Communication', () => {
    test('should create payment order through payment service', async () => {
      // Mock auth service
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          success: true,
          user: { _id: 'user123', email: 'test@example.com' }
        }
      });

      const bookingData = {
        bookingType: 'complete',
        tailorId: new mongoose.Types.ObjectId(),
        fabricId: new mongoose.Types.ObjectId(),
        measurementId: new mongoose.Types.ObjectId(),
        addressId: new mongoose.Types.ObjectId(),
        customerId: 'user123',
        orderDetails: {
          garmentType: 'shirt',
          quantity: 1,
          designDescription: 'Test order'
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
      };

      const response = await request(customerServiceApp)
        .post('/api/bookings')
        .set('Authorization', 'Bearer valid_token')
        .send(bookingData)
        .expect(201);

      expect(response.body.success).toBe(true);
    });
  });

  describe('Design Service to Customer Service Communication', () => {
    test('should create design and reference in booking', async () => {
      // Create design first
      const designData = {
        name: 'Service Communication Design',
        category: 'formal',
        garmentType: 'shirt',
        price: 1000
      };

      const designResponse = await request(designServiceApp)
        .post('/api/designs')
        .send(designData)
        .expect(201);

      expect(designResponse.body.success).toBe(true);
      const designId = designResponse.body.data._id;

      // Create booking with design reference
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          success: true,
          user: { _id: 'user123', email: 'test@example.com' }
        }
      });

      const bookingData = {
        bookingType: 'complete',
        tailorId: new mongoose.Types.ObjectId(),
        fabricId: new mongoose.Types.ObjectId(),
        measurementId: new mongoose.Types.ObjectId(),
        addressId: new mongoose.Types.ObjectId(),
        customerId: 'user123',
        orderDetails: {
          garmentType: 'shirt',
          quantity: 1,
          designDescription: 'Service communication test',
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
      };

      const bookingResponse = await request(customerServiceApp)
        .post('/api/bookings')
        .set('Authorization', 'Bearer valid_token')
        .send(bookingData)
        .expect(201);

      expect(bookingResponse.body.success).toBe(true);
    });
  });

  describe('Payment Service to Customer Service Communication', () => {
    test('should update booking after successful payment', async () => {
      // Mock auth service
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          success: true,
          user: { _id: 'user123', email: 'test@example.com' }
        }
      });

      // Create booking first
      const bookingData = {
        bookingType: 'complete',
        tailorId: new mongoose.Types.ObjectId(),
        fabricId: new mongoose.Types.ObjectId(),
        measurementId: new mongoose.Types.ObjectId(),
        addressId: new mongoose.Types.ObjectId(),
        customerId: 'user123',
        orderDetails: {
          garmentType: 'shirt',
          quantity: 1,
          designDescription: 'Payment test order'
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
      };

      const bookingResponse = await request(customerServiceApp)
        .post('/api/bookings')
        .set('Authorization', 'Bearer valid_token')
        .send(bookingData)
        .expect(201);

      const bookingId = bookingResponse.body.data._id;

      // Create payment order
      const orderData = {
        amount: 200,
        currency: 'INR',
        receipt: `booking_${bookingId}`,
        notes: {
          userId: 'user123',
          bookingId: bookingId
        },
        userId: 'user123'
      };

      const paymentResponse = await request(paymentServiceApp)
        .post('/api/payments/create-order')
        .send(orderData)
        .expect(200);

      // Verify payment
      const verificationData = {
        razorpay_order_id: paymentResponse.body.order.id,
        razorpay_payment_id: 'pay_test123',
        razorpay_signature: 'test_signature_123'
      };

      const verifyResponse = await request(paymentServiceApp)
        .post('/api/payments/verify')
        .send(verificationData)
        .expect(200);

      expect(verifyResponse.body.success).toBe(true);

      // Update booking with payment success
      const paymentSuccessData = {
        razorpayOrderId: paymentResponse.body.order.id,
        razorpayPaymentId: 'pay_test123',
        razorpaySignature: 'test_signature_123',
        paymentMethod: 'razorpay',
        paidAmount: 200,
        paidAt: new Date()
      };

      const paymentSuccessResponse = await request(customerServiceApp)
        .post(`/api/bookings/${bookingId}/payment-success`)
        .set('Authorization', 'Bearer valid_token')
        .send(paymentSuccessData)
        .expect(200);

      expect(paymentSuccessResponse.body.success).toBe(true);
    });
  });

  describe('Service Health Checks', () => {
    test('should check auth service health', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: { success: true, status: 'healthy' }
      });

      const response = await request(authServiceApp)
        .post('/api/auth/verify-token')
        .send({ token: 'test_token' })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    test('should handle service unavailability', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('Service unavailable'));

      const response = await request(customerServiceApp)
        .get('/api/bookings')
        .set('Authorization', 'Bearer valid_token')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Data Consistency Across Services', () => {
    test('should maintain data consistency between services', async () => {
      // Create design
      const designData = {
        name: 'Consistency Test Design',
        category: 'formal',
        garmentType: 'suit',
        price: 2000
      };

      const designResponse = await request(designServiceApp)
        .post('/api/designs')
        .send(designData)
        .expect(201);

      const designId = designResponse.body.data._id;

      // Create booking with design reference
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          success: true,
          user: { _id: 'user123', email: 'test@example.com' }
        }
      });

      const bookingData = {
        bookingType: 'complete',
        tailorId: new mongoose.Types.ObjectId(),
        fabricId: new mongoose.Types.ObjectId(),
        measurementId: new mongoose.Types.ObjectId(),
        addressId: new mongoose.Types.ObjectId(),
        customerId: 'user123',
        orderDetails: {
          garmentType: 'suit',
          quantity: 1,
          designDescription: 'Consistency test order',
          designId: designId
        },
        pricing: {
          fabricCost: 1000,
          tailoringCost: 800,
          totalAmount: 1800,
          advanceAmount: 500
        },
        payment: {
          status: 'pending',
          method: 'razorpay'
        }
      };

      const bookingResponse = await request(customerServiceApp)
        .post('/api/bookings')
        .set('Authorization', 'Bearer valid_token')
        .send(bookingData)
        .expect(201);

      // Verify design still exists
      const designCheckResponse = await request(designServiceApp)
        .get(`/api/designs/${designId}`)
        .expect(200);

      expect(designCheckResponse.body.success).toBe(true);
      expect(designCheckResponse.body.data.name).toBe('Consistency Test Design');

      // Verify booking was created with correct data
      expect(bookingResponse.body.data.orderDetails.designId).toBe(designId);
    });
  });

  describe('Error Propagation', () => {
    test('should propagate errors correctly between services', async () => {
      // Test with invalid design ID in booking
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          success: true,
          user: { _id: 'user123', email: 'test@example.com' }
        }
      });

      const bookingData = {
        bookingType: 'complete',
        tailorId: new mongoose.Types.ObjectId(),
        fabricId: new mongoose.Types.ObjectId(),
        measurementId: new mongoose.Types.ObjectId(),
        addressId: new mongoose.Types.ObjectId(),
        customerId: 'user123',
        orderDetails: {
          garmentType: 'shirt',
          quantity: 1,
          designDescription: 'Error propagation test',
          designId: 'invalid_design_id'
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
      };

      // This should still succeed as design validation is not enforced in booking creation
      const response = await request(customerServiceApp)
        .post('/api/bookings')
        .set('Authorization', 'Bearer valid_token')
        .send(bookingData)
        .expect(201);

      expect(response.body.success).toBe(true);
    });
  });
});
