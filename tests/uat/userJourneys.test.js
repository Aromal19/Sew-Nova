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

describe('User Acceptance Tests - Core User Journeys', () => {
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

  describe('Customer Journey 1: First-Time User Experience', () => {
    test('should guide a new customer through complete onboarding and first order', async () => {
      // Step 1: User discovers the platform and wants to register
      console.log('🎯 UAT: New customer registration journey');
      
      const registrationData = {
        firstname: 'Sarah',
        lastname: 'Johnson',
        email: 'sarah.johnson@example.com',
        phone: '9876543210',
        password: 'securePassword123'
      };

      const registerResponse = await request(authServiceApp)
        .post('/api/auth/register')
        .send(registrationData)
        .expect(200);

      expect(registerResponse.body.success).toBe(true);
      expect(registerResponse.body.user.firstname).toBe('Sarah');
      expect(registerResponse.body.token).toBeDefined();

      const authToken = registerResponse.body.token;
      console.log('✅ Customer registered successfully');

      // Step 2: Customer browses available designs
      console.log('🎯 UAT: Customer browsing designs');
      
      // Admin creates some designs for customers to browse
      const designs = [
        {
          name: 'Classic White Shirt',
          category: 'formal',
          garmentType: 'shirt',
          price: 1200,
          description: 'Perfect for office wear',
          images: ['https://example.com/shirt1.jpg']
        },
        {
          name: 'Casual Denim Shirt',
          category: 'casual',
          garmentType: 'shirt',
          price: 800,
          description: 'Comfortable for everyday wear',
          images: ['https://example.com/shirt2.jpg']
        },
        {
          name: 'Elegant Evening Dress',
          category: 'formal',
          garmentType: 'dress',
          price: 2500,
          description: 'Perfect for special occasions',
          images: ['https://example.com/dress1.jpg']
        }
      ];

      for (const designData of designs) {
        await request(designServiceApp)
          .post('/api/designs')
          .send(designData)
          .expect(201);
      }

      // Customer browses all designs
      const browseAllResponse = await request(designServiceApp)
        .get('/api/designs')
        .expect(200);

      expect(browseAllResponse.body.success).toBe(true);
      expect(browseAllResponse.body.data).toHaveLength(3);
      console.log('✅ Customer can browse all designs');

      // Customer filters by category
      const formalDesignsResponse = await request(designServiceApp)
        .get('/api/designs?category=formal')
        .expect(200);

      expect(formalDesignsResponse.body.data).toHaveLength(2);
      console.log('✅ Customer can filter designs by category');

      // Customer searches for specific items
      const searchResponse = await request(designServiceApp)
        .get('/api/designs?search=shirt')
        .expect(200);

      expect(searchResponse.body.data).toHaveLength(2);
      console.log('✅ Customer can search for specific designs');

      // Step 3: Customer selects a design and creates order
      console.log('🎯 UAT: Customer creating first order');
      
      const selectedDesign = browseAllResponse.body.data[0]; // Classic White Shirt
      
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          success: true,
          user: { _id: 'user123', email: 'sarah.johnson@example.com' }
        }
      });

      const orderData = {
        bookingType: 'complete',
        tailorId: new mongoose.Types.ObjectId(),
        fabricId: new mongoose.Types.ObjectId(),
        measurementId: new mongoose.Types.ObjectId(),
        addressId: new mongoose.Types.ObjectId(),
        customerId: 'user123',
        orderDetails: {
          garmentType: 'shirt',
          quantity: 1,
          designDescription: 'Classic white shirt for office wear',
          designId: selectedDesign._id,
          specialInstructions: 'Please ensure professional fit'
        },
        pricing: {
          fabricCost: 600,
          tailoringCost: 400,
          totalAmount: 1000,
          advanceAmount: 300
        },
        payment: {
          status: 'pending',
          method: 'razorpay'
        }
      };

      const orderResponse = await request(customerServiceApp)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send(orderData)
        .expect(201);

      expect(orderResponse.body.success).toBe(true);
      expect(orderResponse.body.message).toBe('Order saved successfully');
      console.log('✅ Customer created first order successfully');

      // Step 4: Customer proceeds to payment
      console.log('🎯 UAT: Customer payment process');
      
      const orderId = orderResponse.body.data._id;
      
      const paymentOrderData = {
        amount: 300, // Advance amount
        currency: 'INR',
        receipt: `booking_${orderId}`,
        notes: {
          userId: 'user123',
          bookingId: orderId
        },
        userId: 'user123'
      };

      const paymentOrderResponse = await request(paymentServiceApp)
        .post('/api/payments/create-order')
        .send(paymentOrderData)
        .expect(200);

      expect(paymentOrderResponse.body.success).toBe(true);
      expect(paymentOrderResponse.body.order.id).toBe('order_test123');
      console.log('✅ Payment order created successfully');

      // Step 5: Customer completes payment
      const paymentVerificationData = {
        razorpay_order_id: paymentOrderResponse.body.order.id,
        razorpay_payment_id: 'pay_test123',
        razorpay_signature: 'test_signature_123'
      };

      const paymentVerifyResponse = await request(paymentServiceApp)
        .post('/api/payments/verify')
        .send(paymentVerificationData)
        .expect(200);

      expect(paymentVerifyResponse.body.success).toBe(true);
      console.log('✅ Payment verified successfully');

      // Step 6: Update booking with payment success
      const paymentSuccessData = {
        razorpayOrderId: paymentOrderResponse.body.order.id,
        razorpayPaymentId: 'pay_test123',
        razorpaySignature: 'test_signature_123',
        paymentMethod: 'razorpay',
        paidAmount: 300,
        paidAt: new Date()
      };

      const paymentSuccessResponse = await request(customerServiceApp)
        .post(`/api/bookings/${orderId}/payment-success`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(paymentSuccessData)
        .expect(200);

      expect(paymentSuccessResponse.body.success).toBe(true);
      console.log('✅ Order confirmed with payment');

      // Step 7: Customer tracks order status
      console.log('🎯 UAT: Customer order tracking');
      
      const ordersResponse = await request(customerServiceApp)
        .get('/api/bookings/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(ordersResponse.body.success).toBe(true);
      expect(ordersResponse.body.data).toHaveLength(1);
      expect(ordersResponse.body.data[0].payment.status).toBe('paid');
      console.log('✅ Customer can view their orders');

      // Step 8: Order status updates (simulating tailor workflow)
      const statusUpdateResponse = await request(customerServiceApp)
        .post(`/api/bookings/${orderId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'in_progress' })
        .expect(200);

      expect(statusUpdateResponse.body.success).toBe(true);
      console.log('✅ Order status updated to in_progress');

      // Step 9: Order completion and review
      const completeResponse = await request(customerServiceApp)
        .post(`/api/bookings/${orderId}/complete`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(completeResponse.body.success).toBe(true);
      console.log('✅ Order marked as completed');

      // Customer adds review
      const reviewData = {
        rating: 5,
        comment: 'Excellent service! The shirt fits perfectly and the quality is outstanding.'
      };

      const reviewResponse = await request(customerServiceApp)
        .post(`/api/bookings/${orderId}/review`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(reviewData)
        .expect(200);

      expect(reviewResponse.body.success).toBe(true);
      expect(reviewResponse.body.data.review.rating).toBe(5);
      console.log('✅ Customer added review successfully');

      console.log('🎉 UAT: Complete first-time customer journey successful!');
    });
  });

  describe('Customer Journey 2: Returning Customer Experience', () => {
    test('should provide seamless experience for returning customers', async () => {
      // Step 1: Returning customer login
      console.log('🎯 UAT: Returning customer login');
      
      const loginData = {
        email: 'sarah.johnson@example.com',
        password: 'securePassword123'
      };

      const loginResponse = await request(authServiceApp)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(loginResponse.body.success).toBe(true);
      expect(loginResponse.body.user.email).toBe('sarah.johnson@example.com');
      const authToken = loginResponse.body.token;
      console.log('✅ Returning customer logged in successfully');

      // Step 2: Customer views order history
      console.log('🎯 UAT: Customer viewing order history');
      
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          success: true,
          user: { _id: 'user123', email: 'sarah.johnson@example.com' }
        }
      });

      // Create a previous order for the customer
      const previousOrderData = {
        bookingType: 'complete',
        tailorId: new mongoose.Types.ObjectId(),
        fabricId: new mongoose.Types.ObjectId(),
        measurementId: new mongoose.Types.ObjectId(),
        addressId: new mongoose.Types.ObjectId(),
        customerId: 'user123',
        orderDetails: {
          garmentType: 'dress',
          quantity: 1,
          designDescription: 'Previous order'
        },
        pricing: {
          fabricCost: 1000,
          tailoringCost: 500,
          totalAmount: 1500,
          advanceAmount: 500
        },
        payment: {
          status: 'paid',
          method: 'razorpay',
          paidAmount: 500
        },
        status: 'completed'
      };

      await request(customerServiceApp)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send(previousOrderData)
        .expect(201);

      const orderHistoryResponse = await request(customerServiceApp)
        .get('/api/bookings/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(orderHistoryResponse.body.success).toBe(true);
      expect(orderHistoryResponse.body.data).toHaveLength(1);
      console.log('✅ Customer can view order history');

      // Step 3: Customer creates new order with saved preferences
      console.log('🎯 UAT: Customer creating repeat order');
      
      const newOrderData = {
        bookingType: 'complete',
        tailorId: new mongoose.Types.ObjectId(),
        fabricId: new mongoose.Types.ObjectId(),
        measurementId: new mongoose.Types.ObjectId(), // Reusing previous measurements
        addressId: new mongoose.Types.ObjectId(), // Reusing previous address
        customerId: 'user123',
        orderDetails: {
          garmentType: 'shirt',
          quantity: 2, // Ordering multiple items
          designDescription: 'Repeat order with same preferences',
          specialInstructions: 'Same measurements as previous order'
        },
        pricing: {
          fabricCost: 800,
          tailoringCost: 600,
          totalAmount: 1400,
          advanceAmount: 400
        },
        payment: {
          status: 'pending',
          method: 'razorpay'
        }
      };

      const newOrderResponse = await request(customerServiceApp)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newOrderData)
        .expect(201);

      expect(newOrderResponse.body.success).toBe(true);
      console.log('✅ Customer created repeat order successfully');

      // Step 4: Quick payment process (customer familiar with process)
      const newOrderId = newOrderResponse.body.data._id;
      
      const quickPaymentOrderData = {
        amount: 400,
        currency: 'INR',
        receipt: `booking_${newOrderId}`,
        notes: {
          userId: 'user123',
          bookingId: newOrderId
        },
        userId: 'user123'
      };

      const quickPaymentResponse = await request(paymentServiceApp)
        .post('/api/payments/create-order')
        .send(quickPaymentOrderData)
        .expect(200);

      expect(quickPaymentResponse.body.success).toBe(true);
      console.log('✅ Quick payment order created');

      // Complete payment
      const quickPaymentVerificationData = {
        razorpay_order_id: quickPaymentResponse.body.order.id,
        razorpay_payment_id: 'pay_test123',
        razorpay_signature: 'test_signature_123'
      };

      const quickPaymentVerifyResponse = await request(paymentServiceApp)
        .post('/api/payments/verify')
        .send(quickPaymentVerificationData)
        .expect(200);

      expect(quickPaymentVerifyResponse.body.success).toBe(true);
      console.log('✅ Quick payment completed');

      console.log('🎉 UAT: Returning customer journey successful!');
    });
  });

  describe('Admin Journey: Design Management', () => {
    test('should allow admin to manage designs effectively', async () => {
      console.log('🎯 UAT: Admin design management journey');
      
      // Step 1: Admin creates new design
      console.log('🎯 UAT: Admin creating new design');
      
      const designData = {
        name: 'Premium Business Suit',
        category: 'formal',
        garmentType: 'suit',
        price: 3500,
        description: 'High-quality business suit for professional occasions',
        requiredMeasurements: ['chest', 'waist', 'shoulder', 'sleeve', 'length'],
        tags: ['premium', 'business', 'formal', 'suit'],
        images: ['https://example.com/suit1.jpg', 'https://example.com/suit2.jpg']
      };

      const createDesignResponse = await request(adminServiceApp)
        .post('/api/admin/designs')
        .send(designData)
        .expect(201);

      expect(createDesignResponse.body.success).toBe(true);
      expect(createDesignResponse.body.data.name).toBe('Premium Business Suit');
      console.log('✅ Admin created new design successfully');

      // Step 2: Admin views all designs
      console.log('🎯 UAT: Admin viewing all designs');
      
      const getAllDesignsResponse = await request(adminServiceApp)
        .get('/api/admin/designs')
        .expect(200);

      expect(getAllDesignsResponse.body.success).toBe(true);
      expect(getAllDesignsResponse.body.data).toHaveLength(1);
      console.log('✅ Admin can view all designs');

      // Step 3: Admin updates design
      console.log('🎯 UAT: Admin updating design');
      
      const designId = createDesignResponse.body.data._id;
      const updateData = {
        name: 'Premium Executive Business Suit',
        price: 4000,
        description: 'Updated: High-quality executive business suit for senior professionals'
      };

      const updateDesignResponse = await request(adminServiceApp)
        .put(`/api/admin/designs/${designId}`)
        .send(updateData)
        .expect(200);

      expect(updateDesignResponse.body.success).toBe(true);
      expect(updateDesignResponse.body.data.name).toBe('Premium Executive Business Suit');
      expect(updateDesignResponse.body.data.price).toBe(4000);
      console.log('✅ Admin updated design successfully');

      // Step 4: Admin views specific design
      console.log('🎯 UAT: Admin viewing specific design');
      
      const getDesignResponse = await request(adminServiceApp)
        .get(`/api/admin/designs/${designId}`)
        .expect(200);

      expect(getDesignResponse.body.success).toBe(true);
      expect(getDesignResponse.body.data.name).toBe('Premium Executive Business Suit');
      console.log('✅ Admin can view specific design details');

      // Step 5: Admin manages design availability
      console.log('🎯 UAT: Admin managing design availability');
      
      // Soft delete design (make it unavailable)
      const deleteDesignResponse = await request(adminServiceApp)
        .delete(`/api/admin/designs/${designId}`)
        .expect(200);

      expect(deleteDesignResponse.body.success).toBe(true);
      console.log('✅ Admin soft deleted design successfully');

      // Verify design is no longer available to customers
      const customerViewResponse = await request(designServiceApp)
        .get(`/api/designs/${designId}`)
        .expect(404);

      expect(customerViewResponse.body.success).toBe(false);
      console.log('✅ Design is no longer available to customers');

      console.log('🎉 UAT: Admin design management journey successful!');
    });
  });

  describe('Multi-User Scenario: Concurrent Operations', () => {
    test('should handle multiple users operating simultaneously', async () => {
      console.log('🎯 UAT: Multi-user concurrent operations');
      
      // Create multiple users
      const users = [
        { email: 'customer1@example.com', name: 'Customer One' },
        { email: 'customer2@example.com', name: 'Customer Two' },
        { email: 'customer3@example.com', name: 'Customer Three' }
      ];

      const userTokens = [];
      
      // Register all users
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

      // Create designs for users to order
      const designs = [];
      for (let i = 0; i < 5; i++) {
        const designData = {
          name: `Design ${i + 1}`,
          category: i % 2 === 0 ? 'formal' : 'casual',
          garmentType: 'shirt',
          price: 1000 + i * 200
        };

        const designResponse = await request(designServiceApp)
          .post('/api/designs')
          .send(designData)
          .expect(201);

        designs.push(designResponse.body.data);
      }

      // All users browse designs simultaneously
      console.log('🎯 UAT: Multiple users browsing designs');
      
      const browsePromises = userTokens.map(token => 
        request(designServiceApp)
          .get('/api/designs')
          .set('Authorization', `Bearer ${token}`)
      );

      const browseResponses = await Promise.all(browsePromises);
      
      browseResponses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveLength(5);
      });
      console.log('✅ All users can browse designs simultaneously');

      // All users create orders simultaneously
      console.log('🎯 UAT: Multiple users creating orders');
      
      const orderPromises = users.map((user, index) => {
        const orderData = {
          bookingType: 'complete',
          tailorId: new mongoose.Types.ObjectId(),
          fabricId: new mongoose.Types.ObjectId(),
          measurementId: new mongoose.Types.ObjectId(),
          addressId: new mongoose.Types.ObjectId(),
          customerId: `user${index + 1}`,
          orderDetails: {
            garmentType: 'shirt',
            quantity: 1,
            designDescription: `Order from ${user.name}`,
            designId: designs[index % designs.length]._id
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
          .send(orderData);
      });

      const orderResponses = await Promise.all(orderPromises);
      
      orderResponses.forEach(response => {
        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
      });
      console.log('✅ All users created orders successfully');

      // All users make payments simultaneously
      console.log('🎯 UAT: Multiple users making payments');
      
      const paymentPromises = orderResponses.map((orderResponse, index) => {
        const orderId = orderResponse.body.data._id;
        const paymentOrderData = {
          amount: 200,
          currency: 'INR',
          receipt: `booking_${orderId}`,
          notes: {
            userId: `user${index + 1}`,
            bookingId: orderId
          },
          userId: `user${index + 1}`
        };

        return request(paymentServiceApp)
          .post('/api/payments/create-order')
          .send(paymentOrderData);
      });

      const paymentResponses = await Promise.all(paymentPromises);
      
      paymentResponses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });
      console.log('✅ All users created payment orders successfully');

      // Verify all orders exist
      const allOrdersResponse = await request(customerServiceApp)
        .get('/api/bookings')
        .set('Authorization', `Bearer ${userTokens[0]}`)
        .expect(200);

      expect(allOrdersResponse.body.success).toBe(true);
      expect(allOrdersResponse.body.data).toHaveLength(1); // Only user1's orders
      console.log('✅ Order isolation working correctly');

      console.log('🎉 UAT: Multi-user concurrent operations successful!');
    });
  });

  describe('Error Recovery Journey', () => {
    test('should handle errors gracefully and allow recovery', async () => {
      console.log('🎯 UAT: Error recovery journey');
      
      // Step 1: Customer creates order
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          success: true,
          user: { _id: 'user123', email: 'test@example.com' }
        }
      });

      const orderData = {
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

      const orderResponse = await request(customerServiceApp)
        .post('/api/bookings')
        .set('Authorization', 'Bearer valid_token')
        .send(orderData)
        .expect(201);

      const orderId = orderResponse.body.data._id;
      console.log('✅ Order created successfully');

      // Step 2: Payment fails initially
      console.log('🎯 UAT: Simulating payment failure');
      
      const paymentOrderData = {
        amount: 200,
        currency: 'INR',
        receipt: `booking_${orderId}`,
        notes: {
          userId: 'user123',
          bookingId: orderId
        },
        userId: 'user123'
      };

      const paymentOrderResponse = await request(paymentServiceApp)
        .post('/api/payments/create-order')
        .send(paymentOrderData)
        .expect(200);

      // Simulate payment failure
      const failedPaymentData = {
        razorpay_order_id: paymentOrderResponse.body.order.id,
        razorpay_payment_id: 'pay_failed123',
        razorpay_signature: 'invalid_signature'
      };

      // Mock non-test mode to trigger signature validation failure
      process.env.RAZORPAY_KEY_ID = 'rzp_live_123';

      const failedPaymentResponse = await request(paymentServiceApp)
        .post('/api/payments/verify')
        .send(failedPaymentData)
        .expect(400);

      expect(failedPaymentResponse.body.success).toBe(false);
      console.log('✅ Payment failure handled gracefully');

      // Step 3: Customer retries payment
      console.log('🎯 UAT: Customer retrying payment');
      
      // Switch back to test mode
      process.env.RAZORPAY_KEY_ID = 'rzp_test_123';

      const retryPaymentData = {
        razorpay_order_id: paymentOrderResponse.body.order.id,
        razorpay_payment_id: 'pay_test123',
        razorpay_signature: 'test_signature_123'
      };

      const retryPaymentResponse = await request(paymentServiceApp)
        .post('/api/payments/verify')
        .send(retryPaymentData)
        .expect(200);

      expect(retryPaymentResponse.body.success).toBe(true);
      console.log('✅ Payment retry successful');

      // Step 4: Update booking with successful payment
      const paymentSuccessData = {
        razorpayOrderId: paymentOrderResponse.body.order.id,
        razorpayPaymentId: 'pay_test123',
        razorpaySignature: 'test_signature_123',
        paymentMethod: 'razorpay',
        paidAmount: 200,
        paidAt: new Date()
      };

      const paymentSuccessResponse = await request(customerServiceApp)
        .post(`/api/bookings/${orderId}/payment-success`)
        .set('Authorization', 'Bearer valid_token')
        .send(paymentSuccessData)
        .expect(200);

      expect(paymentSuccessResponse.body.success).toBe(true);
      console.log('✅ Order updated with successful payment');

      // Step 5: Verify order is now confirmed
      const finalOrderResponse = await request(customerServiceApp)
        .get(`/api/bookings/${orderId}`)
        .set('Authorization', 'Bearer valid_token')
        .expect(200);

      expect(finalOrderResponse.body.data.payment.status).toBe('paid');
      console.log('✅ Order status correctly updated');

      console.log('🎉 UAT: Error recovery journey successful!');
    });
  });
});
