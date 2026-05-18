const request = require('supertest');
const app = require('../server');
const { API_KEY } = require('../config');

describe('API Endpoints', () => {
    test('GET /health returns 200 and ok status', async () => {
        const response = await request(app)
            .get('/health')
            .set('x-api-key', API_KEY);

        expect(response.statusCode).toBe(200);
        expect(response.body.status).toBe('ok');
    });

    test('GET /health returns 403 without API key', async () => {
        const response = await request(app).get('/health');
        expect(response.statusCode).toBe(403);
    });

    test('GET /status returns system metrics', async () => {
        const response = await request(app)
            .get('/status')
            .set('x-api-key', API_KEY);

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('ram_free');
        expect(response.body).toHaveProperty('services');
    });
});
