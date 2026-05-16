const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Booking = require('../../backend/customer-service/models/booking');
const Customer = require('../../backend/customer-service/models/customer');
const Address = require('../../backend/customer-service/models/address');

// Mock email service
jest.mock('../../backend/customer-service/utils/orderEmailService', () => ({
  sendNewOrderNotification: jest.fn().mockResolvedValue({ success: true }),
  sendPaymentConfirmationEmail: jest.fn().mockResolvedValue({ success: true }),
  sendOrderStatusUpdateEmail: jest.fn().mockResolvedValue({ success: true })
}));

describe('Booking Controller Unit Tests', () => {
  let app;
  let mongoServer;
  let testCustomer;
  let testAddress;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
    
    // Create a simple Express app for testing
    const express = require('express');
    app = express();
    app.use(express.json());
    
    // Mock authentication middleware
    app.use((req, res, next) => {
      req.user = testCustomer;
      next();
    });
    
    // Import and use booking routes
    const bookingRoutes = require('../../backend/customer-service/routes/bookingRoutes');
    app.use('/api/bookings', bookingRoutes);
  });

  afterAll(async () => {
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await Booking.deleteMany({});
    await Customer.deleteMany({});
    await Address.deleteMany({});

    // Create test customer
    testCustomer = new Customer({
      firstname: 'Test',
      lastname: 'User',
      email: 'test@example.com',
      phone: '1234567890',
      countryCode: '+91'
    });
    await testCustomer.save();

    // Create test address
    testAddress = new Address({
      customerId: testCustomer._id,
      addressLine: '123 Test Street',
      locality: 'Test Locality',
      city: 'Test City',
      state: 'Test State',
      pincode: '123456',
      country: 'India'
    });
    await testAddress.save();
  });

  describe('GET /api/bookings', () => {
    test('should get customer bookings successfully', async () => {
      const booking = new Booking({
        customerId: testCustomer._id,
        userEmail: testCustomer.email,
        bookingType: 'complete',
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
        },
        status: 'confirmed',
        isActive: true
      });
      await booking.save();

      const response = await request(app)
        .get('/api/bookings')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].bookingType).toBe('complete');
    });

    test('should filter bookings by status', async () => {
      const booking1 = new Booking({
        customerId: testCustomer._id,
        userEmail: testCustomer.email,
        bookingType: 'complete',
        status: 'confirmed',
        isActive: true
      });
      const booking2 = new Booking({
        customerId: testCustomer._id,
        userEmail: testCustomer.email,
        bookingType: 'tailor',
        status: 'cancelled',
        isActive: true
      });
      
      await booking1.save();
      await booking2.save();

      const response = await request(app)
        .get('/api/bookings?status=confirmed')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].status).toBe('confirmed');
    });

    test('should filter bookings by booking type', async () => {
      const booking1 = new Booking({
        customerId: testCustomer._id,
        userEmail: testCustomer.email,
        bookingType: 'complete',
        status: 'confirmed',
        isActive: true
      });
      const booking2 = new Booking({
        customerId: testCustomer._id,
        userEmail: testCustomer.email,
        bookingType: 'tailor',
        status: 'confirmed',
        isActive: true
      });
      
      await booking1.save();
      await booking2.save();

      const response = await request(app)
        .get('/api/bookings?bookingType=complete')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].bookingType).toBe('complete');
    });
  });

  describe('GET /api/bookings/orders', () => {
    test('should get paid customer orders only', async () => {
      const paidBooking = new Booking({
        customerId: testCustomer._id,
        userEmail: testCustomer.email,
        bookingType: 'complete',
        payment: {
          status: 'paid',
          method: 'razorpay',
          paidAmount: 200
        },
        status: 'confirmed',
        isActive: true
      });
      const pendingBooking = new Booking({
        customerId: testCustomer._id,
        userEmail: testCustomer.email,
        bookingType: 'complete',
        payment: {
          status: 'pending',
          method: 'razorpay'
        },
        status: 'confirmed',
        isActive: true
      });
      
      await paidBooking.save();
      await pendingBooking.save();

      const response = await request(app)
        .get('/api/bookings/orders')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].payment.status).toBe('paid');
    });
  });

  describe('POST /api/bookings', () => {
    test('should create booking successfully', async () => {
      const bookingData = {
        bookingType: 'complete',
        tailorId: new mongoose.Types.ObjectId(),
        fabricId: new mongoose.Types.ObjectId(),
        measurementId: new mongoose.Types.ObjectId(),
        addressId: testAddress._id,
        customerId: testCustomer._id,
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

      const response = await request(app)
        .post('/api/bookings')
        .send(bookingData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Order saved successfully');
      expect(response.body.data.bookingType).toBe('complete');
    });

    test('should return 400 for missing required fields', async () => {
      const bookingData = {
        // Missing bookingType and addressId
        tailorId: new mongoose.Types.ObjectId()
      };

      const response = await request(app)
        .post('/api/bookings')
        .send(bookingData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('bookingType and addressId are required');
    });

    test('should return 400 for invalid booking type requirements', async () => {
      const bookingData = {
        bookingType: 'fabric',
        addressId: testAddress._id,
        customerId: testCustomer._id
        // Missing fabricId for fabric booking type
      };

      const response = await request(app)
        .post('/api/bookings')
        .send(bookingData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('fabricId is required for this booking type');
    });

    test('should return 400 for missing measurement data', async () => {
      const bookingData = {
        bookingType: 'complete',
        tailorId: new mongoose.Types.ObjectId(),
        fabricId: new mongoose.Types.ObjectId(),
        addressId: testAddress._id,
        customerId: testCustomer._id
        // Missing measurementId and measurementSnapshot
      };

      const response = await request(app)
        .post('/api/bookings')
        .send(bookingData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Provide measurementId or measurementSnapshot');
    });
  });

  describe('GET /api/bookings/:id', () => {
    test('should get booking by ID successfully', async () => {
      const booking = new Booking({
        customerId: testCustomer._id,
        userEmail: testCustomer.email,
        bookingType: 'complete',
        status: 'confirmed',
        isActive: true
      });
      await booking.save();

      const response = await request(app)
        .get(`/api/bookings/${booking._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(booking._id.toString());
    });

    test('should return 404 for non-existent booking', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .get(`/api/bookings/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Booking not found');
    });
  });

  describe('PUT /api/bookings/:id', () => {
    test('should update booking successfully', async () => {
      const booking = new Booking({
        customerId: testCustomer._id,
        userEmail: testCustomer.email,
        bookingType: 'complete',
        status: 'confirmed',
        isActive: true
      });
      await booking.save();

      const updateData = {
        status: 'in_progress',
        orderDetails: {
          garmentType: 'pants',
          quantity: 2
        }
      };

      const response = await request(app)
        .put(`/api/bookings/${booking._id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Booking updated successfully');
    });

    test('should return 404 for non-existent booking', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const updateData = { status: 'in_progress' };

      const response = await request(app)
        .put(`/api/bookings/${fakeId}`)
        .send(updateData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Booking not found');
    });
  });

  describe('POST /api/bookings/:id/cancel', () => {
    test('should cancel booking successfully', async () => {
      const booking = new Booking({
        customerId: testCustomer._id,
        userEmail: testCustomer.email,
        bookingType: 'complete',
        status: 'confirmed',
        isActive: true
      });
      await booking.save();

      const response = await request(app)
        .post(`/api/bookings/${booking._id}/cancel`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Booking cancelled successfully');
      
      // Verify status was updated
      const updatedBooking = await Booking.findById(booking._id);
      expect(updatedBooking.status).toBe('cancelled');
    });
  });

  describe('POST /api/bookings/:id/status', () => {
    test('should update booking status successfully', async () => {
      const booking = new Booking({
        customerId: testCustomer._id,
        userEmail: testCustomer.email,
        bookingType: 'complete',
        status: 'confirmed',
        isActive: true
      });
      await booking.save();

      const response = await request(app)
        .post(`/api/bookings/${booking._id}/status`)
        .send({ status: 'in_progress' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Booking status updated successfully');
      
      // Verify status was updated
      const updatedBooking = await Booking.findById(booking._id);
      expect(updatedBooking.status).toBe('in_progress');
    });
  });

  describe('POST /api/bookings/:id/payment-success', () => {
    test('should handle payment success successfully', async () => {
      const booking = new Booking({
        customerId: testCustomer._id,
        userEmail: testCustomer.email,
        bookingType: 'complete',
        payment: {
          status: 'pending',
          method: 'razorpay'
        },
        status: 'confirmed',
        isActive: true
      });
      await booking.save();

      const paymentData = {
        razorpayOrderId: 'order_test123',
        razorpayPaymentId: 'pay_test123',
        razorpaySignature: 'test_signature_123',
        paymentMethod: 'razorpay',
        paidAmount: 200,
        paidAt: new Date()
      };

      const response = await request(app)
        .post(`/api/bookings/${booking._id}/payment-success`)
        .send(paymentData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Payment status updated successfully');
      
      // Verify payment status was updated
      const updatedBooking = await Booking.findById(booking._id);
      expect(updatedBooking.payment.status).toBe('paid');
      expect(updatedBooking.status).toBe('confirmed');
    });

    test('should return 400 for missing payment information', async () => {
      const booking = new Booking({
        customerId: testCustomer._id,
        userEmail: testCustomer.email,
        bookingType: 'complete',
        isActive: true
      });
      await booking.save();

      const response = await request(app)
        .post(`/api/bookings/${booking._id}/payment-success`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Missing required payment information');
    });
  });

  describe('POST /api/bookings/:id/review', () => {
    test('should add review to booking successfully', async () => {
      const booking = new Booking({
        customerId: testCustomer._id,
        userEmail: testCustomer.email,
        bookingType: 'complete',
        status: 'completed',
        isActive: true
      });
      await booking.save();

      const reviewData = {
        rating: 5,
        comment: 'Excellent service!'
      };

      const response = await request(app)
        .post(`/api/bookings/${booking._id}/review`)
        .send(reviewData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Review added successfully');
      
      // Verify review was added
      const updatedBooking = await Booking.findById(booking._id);
      expect(updatedBooking.review.rating).toBe(5);
      expect(updatedBooking.review.comment).toBe('Excellent service!');
    });
  });
});
