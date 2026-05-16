const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Payment = require('../../backend/payment-service/models/Payment');

// Mock Razorpay
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

// Mock customer service calls
jest.mock('axios', () => ({
  post: jest.fn().mockResolvedValue({
    data: { _id: 'booking_test123' }
  })
}));

describe('Payment Controller Unit Tests', () => {
  let app;
  let mongoServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
    
    // Create a simple Express app for testing
    const express = require('express');
    app = express();
    app.use(express.json());
    
    // Import and use payment routes
    const paymentRoutes = require('../../backend/payment-service/routes/paymentRoutes');
    app.use('/api/payments', paymentRoutes);
  });

  afterAll(async () => {
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await Payment.deleteMany({});
  });

  describe('POST /api/payments/create-order', () => {
    test('should create payment order successfully', async () => {
      const orderData = {
        amount: 100,
        currency: 'INR',
        receipt: 'receipt_123',
        notes: {
          userId: 'user123',
          bookingId: 'booking123'
        },
        userId: 'user123'
      };

      const response = await request(app)
        .post('/api/payments/create-order')
        .send(orderData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.order.id).toBe('order_test123');
      expect(response.body.order.amount).toBe(10000); // Amount in paise
      expect(response.body.order.currency).toBe('INR');
      expect(response.body.key).toBeDefined();
    });

    test('should return 400 for invalid amount', async () => {
      const orderData = {
        amount: 0, // Invalid amount
        currency: 'INR',
        userId: 'user123'
      };

      const response = await request(app)
        .post('/api/payments/create-order')
        .send(orderData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Valid amount is required');
      expect(response.body.code).toBe('INVALID_AMOUNT');
    });

    test('should return 400 for negative amount', async () => {
      const orderData = {
        amount: -10, // Negative amount
        currency: 'INR',
        userId: 'user123'
      };

      const response = await request(app)
        .post('/api/payments/create-order')
        .send(orderData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Valid amount is required');
    });

    test('should handle missing amount', async () => {
      const orderData = {
        currency: 'INR',
        userId: 'user123'
        // Missing amount
      };

      const response = await request(app)
        .post('/api/payments/create-order')
        .send(orderData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Valid amount is required');
    });

    test('should use default currency INR', async () => {
      const orderData = {
        amount: 100,
        userId: 'user123'
        // Missing currency
      };

      const response = await request(app)
        .post('/api/payments/create-order')
        .send(orderData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.order.currency).toBe('INR');
    });

    test('should create payment record in database', async () => {
      const orderData = {
        amount: 100,
        currency: 'INR',
        receipt: 'receipt_123',
        notes: { userId: 'user123' },
        userId: 'user123'
      };

      await request(app)
        .post('/api/payments/create-order')
        .send(orderData)
        .expect(200);

      // Verify payment record was created
      const payment = await Payment.findOne({ orderId: 'order_test123' });
      expect(payment).toBeTruthy();
      expect(payment.amount).toBe(100);
      expect(payment.currency).toBe('INR');
      expect(payment.status).toBe('pending');
      expect(payment.userId).toBe('user123');
    });
  });

  describe('POST /api/payments/verify', () => {
    beforeEach(async () => {
      // Create a payment record for verification
      await Payment.create({
        orderId: 'order_test123',
        amount: 100,
        currency: 'INR',
        status: 'pending',
        userId: 'user123'
      });
    });

    test('should verify payment successfully', async () => {
      const verificationData = {
        razorpay_order_id: 'order_test123',
        razorpay_payment_id: 'pay_test123',
        razorpay_signature: 'test_signature_123'
      };

      const response = await request(app)
        .post('/api/payments/verify')
        .send(verificationData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Payment verified successfully');
      expect(response.body.paymentId).toBe('pay_test123');
      expect(response.body.orderId).toBe('order_test123');
    });

    test('should return 400 for missing verification fields', async () => {
      const verificationData = {
        razorpay_order_id: 'order_test123'
        // Missing payment_id and signature
      };

      const response = await request(app)
        .post('/api/payments/verify')
        .send(verificationData)
        .expect(400);

      expect(response.body.message).toBe('Missing payment verification fields');
    });

    test('should return 404 for non-existent payment record', async () => {
      const verificationData = {
        razorpay_order_id: 'order_nonexistent',
        razorpay_payment_id: 'pay_test123',
        razorpay_signature: 'test_signature_123'
      };

      const response = await request(app)
        .post('/api/payments/verify')
        .send(verificationData)
        .expect(404);

      expect(response.body.message).toBe('Payment record not found');
    });

    test('should handle test mode signatures', async () => {
      const verificationData = {
        razorpay_order_id: 'order_test123',
        razorpay_payment_id: 'pay_test123',
        razorpay_signature: 'test_signature_123'
      };

      // Mock test mode environment
      process.env.RAZORPAY_KEY_ID = 'rzp_test_123';

      const response = await request(app)
        .post('/api/payments/verify')
        .send(verificationData)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    test('should update payment status to success', async () => {
      const verificationData = {
        razorpay_order_id: 'order_test123',
        razorpay_payment_id: 'pay_test123',
        razorpay_signature: 'test_signature_123'
      };

      await request(app)
        .post('/api/payments/verify')
        .send(verificationData)
        .expect(200);

      // Verify payment status was updated
      const payment = await Payment.findOne({ orderId: 'order_test123' });
      expect(payment.status).toBe('success');
      expect(payment.paymentId).toBe('pay_test123');
      expect(payment.signature).toBe('test_signature_123');
    });

    test('should handle invalid signature', async () => {
      const verificationData = {
        razorpay_order_id: 'order_test123',
        razorpay_payment_id: 'pay_test123',
        razorpay_signature: 'invalid_signature'
      };

      // Mock non-test mode
      process.env.RAZORPAY_KEY_ID = 'rzp_live_123';

      const response = await request(app)
        .post('/api/payments/verify')
        .send(verificationData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid payment signature');
      expect(response.body.code).toBe('INVALID_SIGNATURE');

      // Verify payment status was updated to failed
      const payment = await Payment.findOne({ orderId: 'order_test123' });
      expect(payment.status).toBe('failed');
    });
  });

  describe('POST /api/payments/webhook', () => {
    test('should handle webhook requests', async () => {
      const webhookData = {
        event: 'payment.captured',
        payload: {
          payment: {
            id: 'pay_test123',
            status: 'captured'
          }
        }
      };

      const response = await request(app)
        .post('/api/payments/webhook')
        .send(webhookData)
        .expect(200);

      expect(response.body.status).toBe('ok');
      expect(response.body.message).toBe('Webhooks not configured');
    });
  });

  describe('Error Handling', () => {
    test('should handle Razorpay authentication errors', async () => {
      // Mock Razorpay to throw authentication error
      const mockRazorpay = require('../../backend/payment-service/config/razorpay');
      mockRazorpay.orders.create.mockRejectedValueOnce({
        statusCode: 401,
        error: { description: 'Authentication failed' }
      });

      const orderData = {
        amount: 100,
        currency: 'INR',
        userId: 'user123'
      };

      const response = await request(app)
        .post('/api/payments/create-order')
        .send(orderData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Razorpay authentication failed. Please check your API keys.');
      expect(response.body.code).toBe('RAZORPAY_AUTH_FAILED');
    });

    test('should handle general Razorpay errors', async () => {
      // Mock Razorpay to throw general error
      const mockRazorpay = require('../../backend/payment-service/config/razorpay');
      mockRazorpay.orders.create.mockRejectedValueOnce({
        statusCode: 500,
        error: { description: 'Internal server error' }
      });

      const orderData = {
        amount: 100,
        currency: 'INR',
        userId: 'user123'
      };

      const response = await request(app)
        .post('/api/payments/create-order')
        .send(orderData)
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Internal server error');
      expect(response.body.code).toBe('ORDER_CREATION_FAILED');
    });
  });

  describe('Payment Amount Conversion', () => {
    test('should convert amount to paise correctly', async () => {
      const orderData = {
        amount: 100.50, // Amount with decimal
        currency: 'INR',
        userId: 'user123'
      };

      const response = await request(app)
        .post('/api/payments/create-order')
        .send(orderData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.order.amount).toBe(10050); // 100.50 * 100 = 10050 paise
    });

    test('should handle integer amounts', async () => {
      const orderData = {
        amount: 100, // Integer amount
        currency: 'INR',
        userId: 'user123'
      };

      const response = await request(app)
        .post('/api/payments/create-order')
        .send(orderData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.order.amount).toBe(10000); // 100 * 100 = 10000 paise
    });
  });
});
