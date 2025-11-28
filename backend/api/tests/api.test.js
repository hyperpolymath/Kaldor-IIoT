/**
 * Kaldor IIoT - API Tests
 */

const request = require('supertest');
const { app } = require('../server');

describe('API Health Checks', () => {
  it('should return healthy status', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('healthy');
  });
});

describe('Authentication', () => {
  it('should reject login with invalid credentials', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        username: 'invalid',
        password: 'invalid'
      });

    expect(response.status).toBe(401);
  });

  it('should require authentication for protected routes', async () => {
    const response = await request(app).get('/api/v1/looms');

    expect(response.status).toBe(401);
  });
});

describe('Looms API', () => {
  let authToken;

  beforeAll(async () => {
    // Login to get auth token
    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({
        username: 'admin',
        password: 'admin123'
      });

    authToken = loginResponse.body.data.token;
  });

  it('should get list of looms', async () => {
    const response = await request(app)
      .get('/api/v1/looms')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });
});
