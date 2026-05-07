import request from 'supertest';
import app from '../src/app';

describe('GET /api/v1/health', () => {
  it('returns 200 with db and redis status', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.db).toBe('connected');
    expect(res.body.redis).toBe('connected');
  });

  it('response always contains status, db, and redis fields', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.body).toHaveProperty('status');
    expect(res.body).toHaveProperty('db');
    expect(res.body).toHaveProperty('redis');
  });
});
