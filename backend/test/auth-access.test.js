import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import jwt from 'jsonwebtoken';

const makeMockPool = () => {
    return {
        query: async (sql, params) => {
            if (sql.startsWith('SELECT id, username, email, full_name, age, height_cm, weight_kg, bmi, created_at, updated_at FROM users WHERE id')) {
                const id = params?.[0];
                if (id === 1) {
                    return [[{ id: 1, username: 'user', email: 'user@example.com', full_name: null, age: null, height_cm: null, weight_kg: null, bmi: null, created_at: '2026-01-01', updated_at: '2026-01-01' }]];
                }
                return [[]];
            }
            if (sql.startsWith('SELECT id, username, email, created_at FROM users WHERE id')) {
                const id = params?.[0];
                if (id === 1) {
                    return [[{ id: 1, username: 'user', email: 'user@example.com', created_at: '2026-01-01' }]];
                }
                return [[]];
            }

            // Events route may call INSERT/SELECT; for auth middleware test we don't need to fully implement.
            return [[/* default */]];
        },
    };
};

test('GET /api/auth/me refuses when no token is provided', async () => {
    process.env.JWT_SECRET = 'test_secret';
    process.env.NODE_ENV = 'test';
    globalThis.__mockPool = makeMockPool();

    const { default: app } = await import('../src/app.js');

    const res = await request(app).get('/api/auth/me');

    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
});

test('GET /api/auth/me allows access with valid Bearer token', async () => {
    process.env.JWT_SECRET = 'test_secret';
    process.env.NODE_ENV = 'test';
    globalThis.__mockPool = makeMockPool();

    const { default: app } = await import('../src/app.js');

    const token = jwt.sign({ user_id: 1, username: 'user' }, process.env.JWT_SECRET, { expiresIn: '7d' });

    const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.user.email, 'user@example.com');
});

test('POST /api/events refuses when no token is provided (protected route)', async () => {
    process.env.JWT_SECRET = 'test_secret';
    process.env.NODE_ENV = 'test';
    globalThis.__mockPool = makeMockPool();

    const { default: app } = await import('../src/app.js');

    const res = await request(app)
        .post('/api/events')
        .send({ title: 'Run', category: 'running', event_date: '2026-01-01', event_time: '10:00', location: 'Tunis' });

    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
});
