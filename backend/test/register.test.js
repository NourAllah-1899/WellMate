import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';

const makeMockPool = ({ existingEmail = false, existingUsername = false } = {}) => {
    const calls = [];

    return {
        calls,
        query: async (sql, params) => {
            calls.push({ sql, params });

            if (sql.startsWith('SELECT id FROM users WHERE email')) {
                return [existingEmail ? [{ id: 1 }] : []];
            }
            if (sql.startsWith('SELECT id FROM users WHERE username')) {
                return [existingUsername ? [{ id: 2 }] : []];
            }
            if (sql.startsWith('INSERT INTO users')) {
                return [{ insertId: 123 }];
            }

            return [[]];
        },
    };
};

test('POST /api/auth/register fails when email is invalid', async () => {
    process.env.JWT_SECRET = 'test_secret';
    process.env.NODE_ENV = 'test';
    globalThis.__mockPool = makeMockPool();

    const { default: app } = await import('../src/app.js');

    const res = await request(app)
        .post('/api/auth/register')
        .send({
            email: 'not-an-email',
            password: 'StrongP@ss1',
            confirmPassword: 'StrongP@ss1',
        });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
});

test('POST /api/auth/register fails when passwords do not match', async () => {
    process.env.JWT_SECRET = 'test_secret';
    process.env.NODE_ENV = 'test';
    globalThis.__mockPool = makeMockPool();

    const { default: app } = await import('../src/app.js');

    const res = await request(app)
        .post('/api/auth/register')
        .send({
            email: 'user@example.com',
            password: 'StrongP@ss1',
            confirmPassword: 'StrongP@ss2',
        });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
});

test('POST /api/auth/register fails when email already exists', async () => {
    process.env.JWT_SECRET = 'test_secret';
    process.env.NODE_ENV = 'test';
    globalThis.__mockPool = makeMockPool({ existingEmail: true });

    const { default: app } = await import('../src/app.js');

    const res = await request(app)
        .post('/api/auth/register')
        .send({
            email: 'user@example.com',
            password: 'StrongP@ss1',
            confirmPassword: 'StrongP@ss1',
        });

    assert.equal(res.status, 409);
    assert.equal(res.body.success, false);
    assert.equal(res.body.message, 'Email already exists.');
});

test('POST /api/auth/register succeeds with valid data', async () => {
    process.env.JWT_SECRET = 'test_secret';
    process.env.NODE_ENV = 'test';
    globalThis.__mockPool = makeMockPool();

    const { default: app } = await import('../src/app.js');

    const res = await request(app)
        .post('/api/auth/register')
        .send({
            email: 'user@example.com',
            password: 'StrongP@ss1',
            confirmPassword: 'StrongP@ss1',
        });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.token);
    assert.equal(res.body.user.email, 'user@example.com');
});
