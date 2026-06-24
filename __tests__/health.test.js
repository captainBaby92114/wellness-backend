const request = require('supertest');
const { createApp } = require('../src/app');

describe('GET /api/health', () => {
  const app = createApp();

  it('returns ok status', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: 'ok',
      useS3: false,
    });
  });
});
