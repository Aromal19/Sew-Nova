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

describe('End-to-End Workflow Validation Tests', () => {
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
    
    // Setup Auth Service
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

    // Setup Customer Service
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

    // Setup Admin Service
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

  describe('Complete Customer Journey - Design to Order', () => {
    test('should complete full customer journey from registration to order completion', async () => {
      // Step 1: Customer Registration
      const registrationData = {
        firstname: 'John',
        lastname: 'Doe',
        email: 'john.doe@example.com',
        phone: '1234567890',
        password: 'password123'
      };

      const registerResponse = await request(authServiceApp)
        .post('/api/auth/register')
        .send(registrationData)
        .expect(200);

      expect(registerResponse.body.success).toBe(true);
      expect(registerResponse.body.user.email).toBe('john.doe@example.com');
      const authToken = registerResponse.body.token;

      // Step 2: Browse Designs
      const designData1 = {
        name: 'Formal Shirt Design',
        category: 'formal',
        garmentType: 'shirt',
        price: 1200,
        description: 'Premium formal shirt design'
      };

      const designData2 = {
        name: 'Casual T-Shirt Design',
        category: 'casual',
        garmentType: 'tshirt',
        price: 600,
        description: 'Comfortable casual t-shirt'
      };

      const design1Response = await request(designServiceApp)
        .post('/api/designs')
        .send(designData1)
        .expect(201);

      const design2Response = await request(designServiceApp)
        .post('/api/designs')
        .send(designData2)
        .expect(201);

      // Browse designs
      const browseResponse = await request(designServiceApp)
        .get('/api/designs')
        .expect(200);

      expect(browseResponse.body.success).toBe(true);
      expect(browseResponse.body.data).toHaveLength(2);

      // Filter by category
      const formalDesignsResponse = await request(designServiceApp)
        .get('/api/designs?category=formal')
        .expect(200);

      expect(formalDesignsResponse.body.data).toHaveLength(1);
      expect(formalDesignsResponse.body.data[0].category).toBe('formal');

      // Step 3: Create Address
      const addressData = {
        addressLine: '123 Main Street',
        locality: 'Downtown',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        country: 'India',
        addressType: 'home'
      };

      // Mock auth for address creation
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          success: true,
          user: { _id: 'user123', email: 'john.doe@example.com' }
        }
      });

      // Step 4: Create Measurement
      const measurementData = {
        measurements: {
          chest: 40,
          waist: 32,
          shoulder: 18,
          sleeve: 24,
          length: 30
        },
        measurementType: 'formal',
        gender: 'male'
      };

      // Step 5: Create Booking
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
          designDescription: 'Custom formal shirt order',
          designId: design1Response.body.data._id,
          specialInstructions: 'Please ensure perfect fit'
        },
        pricing: {
          fabricCost: 800,
          tailoringCost: 400,
          totalAmount: 1200,
          advanceAmount: 300
        },
        payment: {
          status: 'pending',
          method: 'razorpay'
        }
      };

      const bookingResponse = await request(customerServiceApp)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bookingData)
        .expect(201);

      expect(bookingResponse.body.success).toBe(true);
      const bookingId = bookingResponse.body.data._id;

      // Step 6: Create Payment Order
      const orderData = {
        amount: 300, // Advance amount
        currency: 'INR',
        receipt: `booking_${bookingId}`,
        notes: {
          userId: 'user123',
          bookingId: bookingId
        },
        userId: 'user123'
      };

      const paymentOrderResponse = await request(paymentServiceApp)
        .post('/api/payments/create-order')
        .send(orderData)
        .expect(200);

      expect(paymentOrderResponse.body.success).toBe(true);
      expect(paymentOrderResponse.body.order.id).toBe('order_test123');

      // Step 7: Verify Payment
      const verificationData = {
        razorpay_order_id: paymentOrderResponse.body.order.id,
        razorpay_payment_id: 'pay_test123',
        razorpay_signature: 'test_signature_123'
      };

      const verifyResponse = await request(paymentServiceApp)
        .post('/api/payments/verify')
        .send(verificationData)
        .expect(200);

      expect(verifyResponse.body.success).toBe(true);

      // Step 8: Update Booking with Payment Success
      const paymentSuccessData = {
        razorpayOrderId: paymentOrderResponse.body.order.id,
        razorpayPaymentId: 'pay_test123',
        razorpaySignature: 'test_signature_123',
        paymentMethod: 'razorpay',
        paidAmount: 300,
        paidAt: new Date()
      };

      const paymentSuccessResponse = await request(customerServiceApp)
        .post(`/api/bookings/${bookingId}/payment-success`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(paymentSuccessData)
        .expect(200);

      expect(paymentSuccessResponse.body.success).toBe(true);

      // Step 9: Check Order Status
      const ordersResponse = await request(customerServiceApp)
        .get('/api/bookings/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(ordersResponse.body.success).toBe(true);
      expect(ordersResponse.body.data).toHaveLength(1);
      expect(ordersResponse.body.data[0].payment.status).toBe('paid');

      // Step 10: Update Order Status (Tailor workflow)
      const statusUpdateResponse = await request(customerServiceApp)
        .post(`/api/bookings/${bookingId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'in_progress' })
        .expect(200);

      expect(statusUpdateResponse.body.success).toBe(true);

      // Step 11: Complete Order
      const completeResponse = await request(customerServiceApp)
        .post(`/api/bookings/${bookingId}/complete`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(completeResponse.body.success).toBe(true);

      // Step 12: Add Review
      const reviewData = {
        rating: 5,
        comment: 'Excellent service and perfect fit!'
      };

      const reviewResponse = await request(customerServiceApp)
        .post(`/api/bookings/${bookingId}/review`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(reviewData)
        .expect(200);

      expect(reviewResponse.body.success).toBe(true);
      expect(reviewResponse.body.data.review.rating).toBe(5);
    });
  });

  describe('Admin Workflow - Design Management', () => {
    test('should complete admin design management workflow', async () => {
      // Step 1: Create Design (Admin)
      const designData = {
        name: 'Admin Created Design',
        category: 'formal',
        garmentType: 'suit',
        price: 2500,
        description: 'Premium suit design created by admin',
        requiredMeasurements: ['chest', 'waist', 'shoulder', 'sleeve'],
        tags: ['premium', 'formal', 'suit']
      };

      const createResponse = await request(adminServiceApp)
        .post('/api/admin/designs')
        .send(designData)
        .expect(201);

      expect(createResponse.body.success).toBe(true);
      const designId = createResponse.body.data._id;

      // Step 2: Update Design
      const updateData = {
        name: 'Updated Admin Design',
        price: 3000,
        description: 'Updated premium suit design'
      };

      const updateResponse = await request(adminServiceApp)
        .put(`/api/admin/designs/${designId}`)
        .send(updateData)
        .expect(200);

      expect(updateResponse.body.success).toBe(true);
      expect(updateResponse.body.data.name).toBe('Updated Admin Design');
      expect(updateResponse.body.data.price).toBe(3000);

      // Step 3: Get All Designs (Admin)
      const getAllResponse = await request(adminServiceApp)
        .get('/api/admin/designs')
        .expect(200);

      expect(getAllResponse.body.success).toBe(true);
      expect(getAllResponse.body.data).toHaveLength(1);

      // Step 4: Get Design by ID
      const getByIdResponse = await request(adminServiceApp)
        .get(`/api/admin/designs/${designId}`)
        .expect(200);

      expect(getByIdResponse.body.success).toBe(true);
      expect(getByIdResponse.body.data.name).toBe('Updated Admin Design');

      // Step 5: Soft Delete Design
      const deleteResponse = await request(adminServiceApp)
        .delete(`/api/admin/designs/${designId}`)
        .expect(200);

      expect(deleteResponse.body.success).toBe(true);

      // Step 6: Verify Design is Soft Deleted
      const getDeletedResponse = await request(adminServiceApp)
        .get(`/api/admin/designs/${designId}`)
        .expect(404);

      expect(getDeletedResponse.body.success).toBe(false);
    });
  });

  describe('Multi-User Workflow', () => {
    test('should handle multiple users creating orders simultaneously', async () => {
      // Create multiple users
      const users = [
        { email: 'user1@example.com', name: 'User One' },
        { email: 'user2@example.com', name: 'User Two' },
        { email: 'user3@example.com', name: 'User Three' }
      ];

      const userTokens = [];
      
      for (const user of users) {
        const registerData = {
          firstname: user.name,
          lastname: 'Test',
          email: user.email,
          phone: '1234567890',
          password: 'password123'
        };

        const registerResponse = await request(authServiceApp)
          .post('/api/auth/register')
          .send(registerData)
          .expect(200);

        userTokens.push(registerResponse.body.token);
      }

      // Create designs
      const designs = [];
      for (let i = 0; i < 3; i++) {
        const designData = {
          name: `Design ${i + 1}`,
          category: 'formal',
          garmentType: 'shirt',
          price: 1000 + i * 200
        };

        const designResponse = await request(designServiceApp)
          .post('/api/designs')
          .send(designData)
          .expect(201);

        designs.push(designResponse.body.data);
      }

      // Create bookings for each user
      const bookingPromises = users.map((user, index) => {
        const bookingData = {
          bookingType: 'complete',
          tailorId: new mongoose.Types.ObjectId(),
          fabricId: new mongoose.Types.ObjectId(),
          measurementId: new mongoose.Types.ObjectId(),
          addressId: new mongoose.Types.ObjectId(),
          customerId: `user${index + 1}`,
          orderDetails: {
            garmentType: 'shirt',
            quantity: 1,
            designDescription: `Order for ${user.name}`,
            designId: designs[index]._id
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

        return request(customerServiceApp)
          .post('/api/bookings')
          .set('Authorization', `Bearer ${userTokens[index]}`)
          .send(bookingData);
      });

      const bookingResponses = await Promise.all(bookingPromises);

      // All bookings should be created successfully
      bookingResponses.forEach(response => {
        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
      });

      // Verify all bookings exist
      const allBookingsResponse = await request(customerServiceApp)
        .get('/api/bookings')
        .set('Authorization', `Bearer ${userTokens[0]}`)
        .expect(200);

      expect(allBookingsResponse.body.success).toBe(true);
      expect(allBookingsResponse.body.data).toHaveLength(1); // Only user1's bookings
    });
  });

  describe('Error Recovery Workflow', () => {
    test('should handle and recover from payment failures', async () => {
      // Create booking
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
          designDescription: 'Error recovery test order'
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

      const paymentOrderResponse = await request(paymentServiceApp)
        .post('/api/payments/create-order')
        .send(orderData)
        .expect(200);

      // Simulate payment failure
      const failedVerificationData = {
        razorpay_order_id: paymentOrderResponse.body.order.id,
        razorpay_payment_id: 'pay_failed123',
        razorpay_signature: 'invalid_signature'
      };

      // Mock non-test mode to trigger signature validation
      process.env.RAZORPAY_KEY_ID = 'rzp_live_123';

      const failedVerifyResponse = await request(paymentServiceApp)
        .post('/api/payments/verify')
        .send(failedVerificationData)
        .expect(400);

      expect(failedVerifyResponse.body.success).toBe(false);
      expect(failedVerifyResponse.body.error).toBe('Invalid payment signature');

      // Verify booking status remains pending
      const bookingCheckResponse = await request(customerServiceApp)
        .get(`/api/bookings/${bookingId}`)
        .set('Authorization', 'Bearer valid_token')
        .expect(200);

      expect(bookingCheckResponse.body.data.payment.status).toBe('pending');

      // Retry with valid payment
      process.env.RAZORPAY_KEY_ID = 'rzp_test_123'; // Switch back to test mode

      const retryVerificationData = {
        razorpay_order_id: paymentOrderResponse.body.order.id,
        razorpay_payment_id: 'pay_test123',
        razorpay_signature: 'test_signature_123'
      };

      const retryVerifyResponse = await request(paymentServiceApp)
        .post('/api/payments/verify')
        .send(retryVerificationData)
        .expect(200);

      expect(retryVerifyResponse.body.success).toBe(true);

      // Update booking with successful payment
      const paymentSuccessData = {
        razorpayOrderId: paymentOrderResponse.body.order.id,
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

  describe('Data Integrity Validation', () => {
    test('should maintain data integrity across all operations', async () => {
      // Create design
      const designData = {
        name: 'Integrity Test Design',
        category: 'formal',
        garmentType: 'shirt',
        price: 1000
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
      };

      const bookingResponse = await request(customerServiceApp)
        .post('/api/bookings')
        .set('Authorization', 'Bearer valid_token')
        .send(bookingData)
        .expect(201);

      const bookingId = bookingResponse.body.data._id;

      // Verify design still exists and is accessible
      const designCheckResponse = await request(designServiceApp)
        .get(`/api/designs/${designId}`)
        .expect(200);

      expect(designCheckResponse.body.success).toBe(true);
      expect(designCheckResponse.body.data.name).toBe('Integrity Test Design');

      // Verify booking references the correct design
      const bookingCheckResponse = await request(customerServiceApp)
        .get(`/api/bookings/${bookingId}`)
        .set('Authorization', 'Bearer valid_token')
        .expect(200);

      expect(bookingCheckResponse.body.data.orderDetails.designId).toBe(designId);

      // Update design and verify booking still references it
      const designUpdateData = {
        name: 'Updated Integrity Test Design',
        price: 1200
      };

      const designUpdateResponse = await request(designServiceApp)
        .put(`/api/designs/${designId}`)
        .send(designUpdateData)
        .expect(200);

      expect(designUpdateResponse.body.data.name).toBe('Updated Integrity Test Design');

      // Verify booking still references the same design
      const bookingRecheckResponse = await request(customerServiceApp)
        .get(`/api/bookings/${bookingId}`)
        .set('Authorization', 'Bearer valid_token')
        .expect(200);

      expect(bookingRecheckResponse.body.data.orderDetails.designId).toBe(designId);
    });
  });
});
