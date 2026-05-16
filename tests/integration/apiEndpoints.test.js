const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Mock external services
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

describe('API Endpoints Integration Tests', () => {
  let designServiceApp;
  let customerServiceApp;
  let paymentServiceApp;
  let mongoServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);

    // Setup Design Service
    const express = require('express');
    const designApp = express();
    designApp.use(express.json());
    const designRoutes = require('../../backend/design-service/routes/designRoutes');
    designApp.use('/api/designs', designRoutes);
    designServiceApp = designApp;

    // Setup Customer Service
    const customerApp = express();
    customerApp.use(express.json());
    
    // Mock authentication middleware
    customerApp.use((req, res, next) => {
      req.user = {
        _id: new mongoose.Types.ObjectId(),
        email: 'test@example.com',
        firstname: 'Test',
        lastname: 'User'
      };
      next();
    });
    
    const customerRoutes = require('../../backend/customer-service/routes/bookingRoutes');
    customerApp.use('/api/bookings', customerRoutes);
    customerApp.use('/api/orders', customerRoutes);
    customerServiceApp = customerApp;

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
    // Clean up all collections
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  });

  describe('Design Service Integration', () => {
    test('should create and retrieve design through API', async () => {
      // Create design
      const designData = {
        name: 'Integration Test Design',
        category: 'formal',
        garmentType: 'shirt',
        description: 'Test design for integration',
        price: 1000,
        images: ['https://example.com/image.jpg']
      };

      const createResponse = await request(designServiceApp)
        .post('/api/designs')
        .send(designData)
        .expect(201);

      expect(createResponse.body.success).toBe(true);
      expect(createResponse.body.data.name).toBe('Integration Test Design');

      // Retrieve design
      const getResponse = await request(designServiceApp)
        .get(`/api/designs/${createResponse.body.data._id}`)
        .expect(200);

      expect(getResponse.body.success).toBe(true);
      expect(getResponse.body.data.name).toBe('Integration Test Design');
    });

    test('should update and delete design through API', async () => {
      // Create design first
      const designData = {
        name: 'Update Test Design',
        category: 'casual',
        garmentType: 'tshirt',
        price: 500
      };

      const createResponse = await request(designServiceApp)
        .post('/api/designs')
        .send(designData)
        .expect(201);

      const designId = createResponse.body.data._id;

      // Update design
      const updateData = {
        name: 'Updated Design Name',
        price: 750
      };

      const updateResponse = await request(designServiceApp)
        .put(`/api/designs/${designId}`)
        .send(updateData)
        .expect(200);

      expect(updateResponse.body.success).toBe(true);
      expect(updateResponse.body.data.name).toBe('Updated Design Name');
      expect(updateResponse.body.data.price).toBe(750);

      // Delete design
      const deleteResponse = await request(designServiceApp)
        .delete(`/api/designs/${designId}`)
        .expect(200);

      expect(deleteResponse.body.success).toBe(true);
    });
  });

  describe('Customer Service Integration', () => {
    test('should create and manage booking through API', async () => {
      // Create booking
      const bookingData = {
        bookingType: 'complete',
        tailorId: new mongoose.Types.ObjectId(),
        fabricId: new mongoose.Types.ObjectId(),
        measurementId: new mongoose.Types.ObjectId(),
        addressId: new mongoose.Types.ObjectId(),
        customerId: new mongoose.Types.ObjectId(),
        orderDetails: {
          garmentType: 'shirt',
          quantity: 1,
          designDescription: 'Integration test order'
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

      const createResponse = await request(customerServiceApp)
        .post('/api/bookings')
        .send(bookingData)
        .expect(201);

      expect(createResponse.body.success).toBe(true);
      expect(createResponse.body.data.bookingType).toBe('complete');

      // Get customer bookings
      const getResponse = await request(customerServiceApp)
        .get('/api/bookings')
        .expect(200);

      expect(getResponse.body.success).toBe(true);
      expect(getResponse.body.data).toHaveLength(1);
    });

    test('should handle booking status updates', async () => {
      // Create booking first
      const bookingData = {
        bookingType: 'tailor',
        tailorId: new mongoose.Types.ObjectId(),
        measurementId: new mongoose.Types.ObjectId(),
        addressId: new mongoose.Types.ObjectId(),
        customerId: new mongoose.Types.ObjectId(),
        orderDetails: {
          garmentType: 'pants',
          quantity: 1
        },
        pricing: {
          tailoringCost: 400,
          totalAmount: 400,
          advanceAmount: 100
        },
        payment: {
          status: 'pending',
          method: 'razorpay'
        }
      };

      const createResponse = await request(customerServiceApp)
        .post('/api/bookings')
        .send(bookingData)
        .expect(201);

      const bookingId = createResponse.body.data._id;

      // Update booking status
      const statusResponse = await request(customerServiceApp)
        .post(`/api/bookings/${bookingId}/status`)
        .send({ status: 'in_progress' })
        .expect(200);

      expect(statusResponse.body.success).toBe(true);
      expect(statusResponse.body.message).toBe('Booking status updated successfully');
    });
  });

  describe('Payment Service Integration', () => {
    test('should create order and verify payment through API', async () => {
      // Create payment order
      const orderData = {
        amount: 100,
        currency: 'INR',
        receipt: 'integration_test_receipt',
        notes: {
          userId: 'user123',
          bookingId: 'booking123'
        },
        userId: 'user123'
      };

      const createResponse = await request(paymentServiceApp)
        .post('/api/payments/create-order')
        .send(orderData)
        .expect(200);

      expect(createResponse.body.success).toBe(true);
      expect(createResponse.body.order.id).toBe('order_test123');

      // Verify payment
      const verificationData = {
        razorpay_order_id: 'order_test123',
        razorpay_payment_id: 'pay_test123',
        razorpay_signature: 'test_signature_123'
      };

      const verifyResponse = await request(paymentServiceApp)
        .post('/api/payments/verify')
        .send(verificationData)
        .expect(200);

      expect(verifyResponse.body.success).toBe(true);
      expect(verifyResponse.body.message).toBe('Payment verified successfully');
    });

    test('should handle payment webhook', async () => {
      const webhookData = {
        event: 'payment.captured',
        payload: {
          payment: {
            id: 'pay_test123',
            status: 'captured',
            amount: 10000
          }
        }
      };

      const webhookResponse = await request(paymentServiceApp)
        .post('/api/payments/webhook')
        .send(webhookData)
        .expect(200);

      expect(webhookResponse.body.status).toBe('ok');
    });
  });

  describe('Cross-Service Integration', () => {
    test('should handle complete order flow from design to payment', async () => {
      // Step 1: Create design
      const designData = {
        name: 'Complete Flow Design',
        category: 'formal',
        garmentType: 'suit',
        price: 2000
      };

      const designResponse = await request(designServiceApp)
        .post('/api/designs')
        .send(designData)
        .expect(201);

      expect(designResponse.body.success).toBe(true);
      const designId = designResponse.body.data._id;

      // Step 2: Create booking with design reference
      const bookingData = {
        bookingType: 'complete',
        tailorId: new mongoose.Types.ObjectId(),
        fabricId: new mongoose.Types.ObjectId(),
        measurementId: new mongoose.Types.ObjectId(),
        addressId: new mongoose.Types.ObjectId(),
        customerId: new mongoose.Types.ObjectId(),
        orderDetails: {
          garmentType: 'suit',
          quantity: 1,
          designDescription: 'Complete flow test order',
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
        .send(bookingData)
        .expect(201);

      expect(bookingResponse.body.success).toBe(true);
      const bookingId = bookingResponse.body.data._id;

      // Step 3: Create payment order
      const orderData = {
        amount: 500, // Advance amount
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

      expect(paymentResponse.body.success).toBe(true);

      // Step 4: Verify payment
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

      // Step 5: Update booking with payment success
      const paymentSuccessData = {
        razorpayOrderId: paymentResponse.body.order.id,
        razorpayPaymentId: 'pay_test123',
        razorpaySignature: 'test_signature_123',
        paymentMethod: 'razorpay',
        paidAmount: 500,
        paidAt: new Date()
      };

      const paymentSuccessResponse = await request(customerServiceApp)
        .post(`/api/bookings/${bookingId}/payment-success`)
        .send(paymentSuccessData)
        .expect(200);

      expect(paymentSuccessResponse.body.success).toBe(true);
    });
  });

  describe('Error Handling Integration', () => {
    test('should handle service communication errors gracefully', async () => {
      // Test with invalid data that should cause validation errors
      const invalidBookingData = {
        bookingType: 'invalid_type',
        // Missing required fields
      };

      const response = await request(customerServiceApp)
        .post('/api/bookings')
        .send(invalidBookingData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('bookingType and addressId are required');
    });

    test('should handle payment service errors', async () => {
      const invalidOrderData = {
        amount: -10, // Invalid amount
        currency: 'INR'
      };

      const response = await request(paymentServiceApp)
        .post('/api/payments/create-order')
        .send(invalidOrderData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Valid amount is required');
    });
  });

  describe('Performance Integration', () => {
    test('should handle multiple concurrent requests', async () => {
      const promises = [];
      
      // Create multiple designs concurrently
      for (let i = 0; i < 5; i++) {
        const designData = {
          name: `Concurrent Design ${i}`,
          category: 'casual',
          garmentType: 'tshirt',
          price: 300 + i * 100
        };
        
        promises.push(
          request(designServiceApp)
            .post('/api/designs')
            .send(designData)
        );
      }

      const responses = await Promise.all(promises);
      
      // All requests should succeed
      responses.forEach(response => {
        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
      });
    });
  });
});
