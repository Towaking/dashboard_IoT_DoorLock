// routes/auth.js
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getPool, sql } from '../db.js';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

/**
 * LOGIN ADMIN
 * Request body: { username, password }
 */
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username & password required' });
    }

    try {
        const pool = await getPool();

        const result = await pool.request()
            .input('username', sql.NVarChar, username)
            .query(`
                SELECT id, username, password_hash
                FROM admins
                WHERE username = @username
            `);

        const admin = result.recordset[0];
        if (!admin) {
            console.warn(`⚠️ Login failed: user "${username}" not found`);
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const match = await bcrypt.compare(password, admin.password_hash);
        if (!match) {
            console.warn(`⚠️ Login failed: wrong password for "${username}"`);
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: admin.id, username: admin.username },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        console.log(`✅ Admin "${username}" logged in successfully`);
        return res.json({ token });

    } catch (err) {
        console.error('❌ auth/login error:', err);
        return res.status(500).json({ error: 'Server error' });
    }
});

/**
 * Middleware: Verify JWT for protected routes
 */
export function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token provided' });

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.admin = decoded;
        next();
    } catch (err) {
        console.warn('⚠️ Invalid token');
        return res.status(401).json({ error: 'Invalid token' });
    }
}

/**
 * Middleware: Protect IoT callbacks (ESP32/Raspberry → backend)
 * Requires header: x-callback-secret: <CALLBACK_SECRET>
 */
export function protectCallback(req, res, next) {
    const headerSecret = req.headers['x-callback-secret'];
    const expectedSecret = process.env.CALLBACK_SECRET;

    if (!expectedSecret) {
        console.error('❌ CALLBACK_SECRET not configured in .env');
        return res.status(500).json({ error: 'CALLBACK_SECRET not configured' });
    }

    if (!headerSecret || headerSecret !== expectedSecret) {
        console.warn('⚠️ Invalid callback secret attempt');
        return res.status(401).json({ error: 'Invalid callback secret' });
    }

    next();
}

export default router;
