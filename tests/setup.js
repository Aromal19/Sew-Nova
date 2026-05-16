const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongoServer;

// Setup test database
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

// Cleanup after each test
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

// Close database connection after all tests
afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

// Global test utilities
global.testUtils = {
  createMockUser: () => ({
    _id: new mongoose.Types.ObjectId(),
    email: 'test@example.com',
    firstname: 'Test',
    lastname: 'User',
    role: 'customer'
  }),
  
  createMockDesign: () => ({
    name: 'Test Design',
    category: 'formal',
    garmentType: 'shirt',
    description: 'Test design description',
    price: 1000,
    images: ['https://example.com/image1.jpg'],
    requiredMeasurements: ['chest', 'waist'],
    isActive: true
  }),
  
  createMockBooking: (customerId) => ({
    customerId,
    bookingType: 'complete',
    orderDetails: {
      garmentType: 'shirt',
      quantity: 1,
      designDescription: 'Test order',
      specialInstructions: 'Test instructions'
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
    status: 'confirmed'
  })
};
