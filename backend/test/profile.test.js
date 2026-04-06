import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import jwt from 'jsonwebtoken';

const makeMockPool = () => {
    const state = {
        user: {
            id: 1,
            username: 'user',
            email: 'user@example.com',
            full_name: null,
            age: null,
            height_cm: null,
            weight_kg: null,
            bmi: null,
            created_at: '2026-01-01',
            updated_at: '2026-01-01',
        },
    };

    return {
        state,
        query: async (sql, params) => {
            if (sql.startsWith('UPDATE users')) {
                const [full_name, age, height_cm, weight_kg, bmi, id] = params;
                assert.equal(id, 1);

                if (full_name !== null) state.user.full_name = full_name;
                if (age !== null) state.user.age = age;
                if (height_cm !== null) state.user.height_cm = height_cm;
                if (weight_kg !== null) state.user.weight_kg = weight_kg;
                if (bmi !== null) state.user.bmi = bmi;

                return [{ affectedRows: 1 }];
            }

            if (sql.startsWith('SELECT id, username, email, full_name, age, height_cm, weight_kg, bmi')) {
                const id = params?.[0];
                if (id === 1) return [[state.user]];
                return [[]];
            }

            return [[/* default */]];
        },
    };
};

test('PUT /api/auth/profile computes BMI correctly', async () => {
    process.env.JWT_SECRET = 'test_secret';
    process.env.NODE_ENV = 'test';
    globalThis.__mockPool = makeMockPool();

    const { default: app } = await import('../src/app.js');
    const token = jwt.sign({ user_id: 1, username: 'user' }, process.env.JWT_SECRET, { expiresIn: '7d' });

    const res = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({ height_cm: 180, weight_kg: 81 });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.user.bmi, 25.0);
});

test('PUT /api/auth/profile rejects invalid height', async () => {
    process.env.JWT_SECRET = 'test_secret';
    process.env.NODE_ENV = 'test';
    globalThis.__mockPool = makeMockPool();

    const { default: app } = await import('../src/app.js');
    const token = jwt.sign({ user_id: 1, username: 'user' }, process.env.JWT_SECRET, { expiresIn: '7d' });

    const res = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({ height_cm: 10, weight_kg: 81 });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
});
