import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import healthRouter from './routes/health.route.js';
import authRouter from './routes/auth.route.js';
import eventsRouter from './routes/events.route.js';
import dashboardRouter from './routes/dashboard.route.js';
import goalsRouter from './routes/goals.route.js';
import mealsRouter from './routes/meals.route.js';
import activityRouter from './routes/activity.route.js';
import smokingRouter from './routes/smoking.route.js';
import programRouter from './routes/program.route.js';

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
}

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/events', eventsRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/goals', goalsRouter);
app.use('/api/meals', mealsRouter);
app.use('/api/activities', activityRouter);
app.use('/api/smoking', smokingRouter);
app.use('/api/programs', programRouter);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
    });
});

export default app;
