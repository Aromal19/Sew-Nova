const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Design = require('../../backend/design-service/models/design');

// Mock the design service
jest.mock('../../backend/design-service/utils/cloudinary', () => ({
  uploadMultipleImages: jest.fn().mockResolvedValue({
    success: true,
    images: ['https://cloudinary.com/test-image.jpg'],
    totalUploaded: 1
  })
}));

describe('Design Controller Unit Tests', () => {
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
    
    // Import and use design routes
    const designRoutes = require('../../backend/design-service/routes/designRoutes');
    app.use('/api/designs', designRoutes);
  });

  afterAll(async () => {
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await Design.deleteMany({});
  });

  describe('GET /api/designs', () => {
    test('should get all designs successfully', async () => {
      // Create test designs
      const design1 = new Design({
        name: 'Formal Shirt',
        category: 'formal',
        garmentType: 'shirt',
        price: 1000,
        isActive: true
      });
      const design2 = new Design({
        name: 'Casual T-Shirt',
        category: 'casual',
        garmentType: 'tshirt',
        price: 500,
        isActive: true
      });
      
      await design1.save();
      await design2.save();

      const response = await request(app)
        .get('/api/designs')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.count).toBe(2);
    });

    test('should filter designs by category', async () => {
      const design1 = new Design({
        name: 'Formal Shirt',
        category: 'formal',
        garmentType: 'shirt',
        isActive: true
      });
      const design2 = new Design({
        name: 'Casual T-Shirt',
        category: 'casual',
        garmentType: 'tshirt',
        isActive: true
      });
      
      await design1.save();
      await design2.save();

      const response = await request(app)
        .get('/api/designs?category=formal')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].category).toBe('formal');
    });

    test('should search designs by name', async () => {
      const design1 = new Design({
        name: 'Blue Formal Shirt',
        category: 'formal',
        garmentType: 'shirt',
        isActive: true
      });
      const design2 = new Design({
        name: 'Red Casual T-Shirt',
        category: 'casual',
        garmentType: 'tshirt',
        isActive: true
      });
      
      await design1.save();
      await design2.save();

      const response = await request(app)
        .get('/api/designs?search=blue')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toContain('Blue');
    });
  });

  describe('GET /api/designs/:id', () => {
    test('should get design by ID successfully', async () => {
      const design = new Design({
        name: 'Test Design',
        category: 'formal',
        garmentType: 'shirt',
        price: 1000,
        isActive: true
      });
      await design.save();

      const response = await request(app)
        .get(`/api/designs/${design._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Test Design');
    });

    test('should return 404 for non-existent design', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .get(`/api/designs/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Design not found');
    });

    test('should return 400 for invalid design ID format', async () => {
      const response = await request(app)
        .get('/api/designs/invalid-id')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid design ID format');
    });
  });

  describe('POST /api/designs', () => {
    test('should create design successfully', async () => {
      const designData = {
        name: 'New Design',
        category: 'formal',
        garmentType: 'shirt',
        description: 'Test description',
        price: 1000,
        images: ['https://example.com/image.jpg']
      };

      const response = await request(app)
        .post('/api/designs')
        .send(designData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Design created successfully');
      expect(response.body.data.name).toBe('New Design');
    });

    test('should return 400 for missing required fields', async () => {
      const designData = {
        category: 'formal',
        garmentType: 'shirt'
        // Missing name
      };

      const response = await request(app)
        .post('/api/designs')
        .send(designData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Missing required fields');
    });

    test('should validate requiredMeasurements', async () => {
      const designData = {
        name: 'Test Design',
        category: 'formal',
        garmentType: 'shirt',
        requiredMeasurements: ['invalid_measurement']
      };

      const response = await request(app)
        .post('/api/designs')
        .send(designData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid measurement IDs provided');
    });
  });

  describe('PUT /api/designs/:id', () => {
    test('should update design successfully', async () => {
      const design = new Design({
        name: 'Original Design',
        category: 'formal',
        garmentType: 'shirt',
        price: 1000,
        isActive: true
      });
      await design.save();

      const updateData = {
        name: 'Updated Design',
        price: 1500
      };

      const response = await request(app)
        .put(`/api/designs/${design._id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Design updated successfully');
      expect(response.body.data.name).toBe('Updated Design');
      expect(response.body.data.price).toBe(1500);
    });

    test('should return 404 for non-existent design', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const updateData = { name: 'Updated Design' };

      const response = await request(app)
        .put(`/api/designs/${fakeId}`)
        .send(updateData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Design not found');
    });
  });

  describe('DELETE /api/designs/:id', () => {
    test('should soft delete design successfully', async () => {
      const design = new Design({
        name: 'Design to Delete',
        category: 'formal',
        garmentType: 'shirt',
        isActive: true
      });
      await design.save();

      const response = await request(app)
        .delete(`/api/designs/${design._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Design deleted successfully');

      // Verify soft delete
      const deletedDesign = await Design.findById(design._id);
      expect(deletedDesign.isActive).toBe(false);
    });

    test('should return 404 for non-existent design', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .delete(`/api/designs/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Design not found');
    });
  });

  describe('GET /api/designs/categories', () => {
    test('should get all design categories', async () => {
      const design1 = new Design({
        name: 'Formal Shirt',
        category: 'formal',
        garmentType: 'shirt',
        isActive: true
      });
      const design2 = new Design({
        name: 'Casual T-Shirt',
        category: 'casual',
        garmentType: 'tshirt',
        isActive: true
      });
      
      await design1.save();
      await design2.save();

      const response = await request(app)
        .get('/api/designs/categories')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toContain('formal');
      expect(response.body.data).toContain('casual');
    });
  });
});
