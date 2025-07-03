const { expect } = require('chai');
const supertest = require('supertest');

// Test configuration
const API_URL = 'http://localhost:3000';
const request = supertest(API_URL);

describe('Meals API Tests', () => {
  
  describe('GET /api/meals/breakfast', () => {
    it('should return breakfast items successfully', async () => {
      const response = await request
        .get('/api/meals/breakfast')
        .expect(200);
      
      expect(response.body).to.be.an('array');
      expect(response.body.length).to.be.greaterThan(0);
      
      // Check structure of first item
      const firstItem = response.body[0];
      expect(firstItem).to.have.property('id');
      expect(firstItem).to.have.property('name');
      expect(firstItem).to.have.property('createdAt');
      expect(firstItem).to.have.property('updatedAt');
      
      // Validate data types
      expect(firstItem.id).to.be.a('string');
      expect(firstItem.name).to.be.a('string');
      expect(firstItem.createdAt).to.be.a('string');
      expect(firstItem.updatedAt).to.be.a('string');
    });
    
    it('should return items in alphabetical order', async () => {
      const response = await request
        .get('/api/meals/breakfast')
        .expect(200);
      
      const names = response.body.map(item => item.name);
      const sortedNames = [...names].sort();
      expect(names).to.deep.equal(sortedNames);
    });
  });

  describe('GET /api/meals/morning-snack', () => {
    it('should return morning snack items successfully', async () => {
      const response = await request
        .get('/api/meals/morning-snack')
        .expect(200);
      
      expect(response.body).to.be.an('array');
      expect(response.body.length).to.be.greaterThan(0);
      
      // Check structure of first item
      const firstItem = response.body[0];
      expect(firstItem).to.have.property('id');
      expect(firstItem).to.have.property('name');
      expect(firstItem).to.have.property('createdAt');
      expect(firstItem).to.have.property('updatedAt');
    });
  });

  describe('GET /api/meals/lunch', () => {
    it('should return lunch items successfully', async () => {
      const response = await request
        .get('/api/meals/lunch')
        .expect(200);
      
      expect(response.body).to.be.an('array');
      expect(response.body.length).to.be.greaterThan(0);
      
      // Check structure of first item
      const firstItem = response.body[0];
      expect(firstItem).to.have.property('id');
      expect(firstItem).to.have.property('name');
      expect(firstItem).to.have.property('createdAt');
      expect(firstItem).to.have.property('updatedAt');
    });
  });

  describe('GET /api/meals/afternoon-snack', () => {
    it('should return afternoon snack items successfully', async () => {
      const response = await request
        .get('/api/meals/afternoon-snack')
        .expect(200);
      
      expect(response.body).to.be.an('array');
      expect(response.body.length).to.be.greaterThan(0);
      
      // Check structure of first item
      const firstItem = response.body[0];
      expect(firstItem).to.have.property('id');
      expect(firstItem).to.have.property('name');
      expect(firstItem).to.have.property('createdAt');
      expect(firstItem).to.have.property('updatedAt');
    });
  });

  describe('GET /api/meals/dinner', () => {
    it('should return dinner items successfully', async () => {
      const response = await request
        .get('/api/meals/dinner')
        .expect(200);
      
      expect(response.body).to.be.an('array');
      expect(response.body.length).to.be.greaterThan(0);
      
      // Check structure of first item
      const firstItem = response.body[0];
      expect(firstItem).to.have.property('id');
      expect(firstItem).to.have.property('name');
      expect(firstItem).to.have.property('createdAt');
      expect(firstItem).to.have.property('updatedAt');
    });
  });

  describe('Error handling', () => {
    it('should return 404 for non-existent meal type', async () => {
      await request
        .get('/api/meals/non-existent')
        .expect(404);
    });
  });

  describe('Response validation', () => {
    it('should validate response schema for all endpoints', async () => {
      const endpoints = [
        '/api/meals/breakfast',
        '/api/meals/morning-snack',
        '/api/meals/lunch',
        '/api/meals/afternoon-snack',
        '/api/meals/dinner'
      ];

      for (const endpoint of endpoints) {
        const response = await request
          .get(endpoint)
          .expect(200);
        
        expect(response.body).to.be.an('array');
        
        // Validate each item has the correct structure
        response.body.forEach(item => {
          expect(item).to.have.property('id');
          expect(item).to.have.property('name');
          expect(item).to.have.property('createdAt');
          expect(item).to.have.property('updatedAt');
          
          // Validate UUID format for id
          expect(item.id).to.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
          
          // Validate date format
          expect(new Date(item.createdAt).toISOString()).to.equal(item.createdAt);
          expect(new Date(item.updatedAt).toISOString()).to.equal(item.updatedAt);
        });
      }
    });
  });

  describe('Performance tests', () => {
    it('should respond within reasonable time', async () => {
      const start = Date.now();
      await request
        .get('/api/meals/breakfast')
        .expect(200);
      const end = Date.now();
      
      const responseTime = end - start;
      expect(responseTime).to.be.lessThan(1000); // Should respond within 1 second
    });
  });
});
