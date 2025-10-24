// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { getPool } from './db.js';
import authRoutes from './routes/auth.js';
import logRoutes from './routes/logs.js';
import userRoutes from './routes/users.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 1434;

// ===== CORS configuration =====
// Hanya izinkan frontend dev & production
const allowedOrigins = [
    'http://localhost:5173',       // Vite dev server
    process.env.FRONTEND_URL        // Production frontend URL dari .env
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(null, false); // Jangan lempar error langsung
        }
    },
    credentials: true
}));


// ===== Middleware =====
app.use(express.json());

// Inject Blynk & DB connection di tiap request
app.use(async (req, res, next) => {
    try {
        req.blynk = {
            base: process.env.BLYNK_BASE,
            token: process.env.BLYNK_TOKEN
        };
        req.dbPool = await getPool();
        next();
    } catch (err) {
        console.error('❌ DB connection error:', err);
        res.status(500).json({ error: 'Database connection failed' });
    }
});

// ===== Routes =====
app.use('/api/auth', authRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/users', userRoutes);

// ===== Health check / root =====
app.get('/', (req, res) => {
    res.send('IoT Door Lock Backend is running 🚪🔐');
});

// ===== 404 handler =====
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// ===== Global error handler =====
app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    res.status(500).json({ error: err.message || 'Server error' });
});

// ===== Start server =====
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
