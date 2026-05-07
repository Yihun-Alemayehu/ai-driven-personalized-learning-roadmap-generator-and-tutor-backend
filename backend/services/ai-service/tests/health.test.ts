import request from 'supertest';
import app from '../src/app';

describe('GET /api/v1/health', () => {
  it('returns 200 with redis status', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.redis).toBe('connected');
  });

  it('response always contains status and redis fields', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.body).toHaveProperty('status');
    expect(res.body).toHaveProperty('redis');
  });
});
