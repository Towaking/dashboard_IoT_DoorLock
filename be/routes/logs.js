// routes/logs.js
import express from 'express';
import { getPool, sql } from '../db.js';
import dotenv from 'dotenv';
import cors from 'cors';
import { protectCallback } from './auth.js';

dotenv.config();
const router = express.Router();

// ===== CORS khusus untuk callback (supaya bisa diakses dari Raspberry) =====
router.use('/callback', cors({
    origin: '*', // izinkan semua (karena Raspberry mungkin tanpa origin)
}));

/**
 * GET /api/logs
 * optional query: from=YYYY-MM-DD&to=YYYY-MM-DD
 */
router.get('/', async (req, res) => {
    const { from, to } = req.query;
    try {
        const pool = await getPool();
        let q = `
            SELECT 
                id, 
                event_date, 
                CONVERT(varchar, event_time, 108) AS event_time, 
                user_name, 
                fingerprint_id, 
                note 
            FROM logs
        `;
        if (from && to) {
            q += ' WHERE event_date BETWEEN @from AND @to';
            const request = pool.request()
                .input('from', sql.Date, from)
                .input('to', sql.Date, to);
            const result = await request.query(q + ' ORDER BY event_date DESC, event_time DESC');
            return res.json(result.recordset);
        } else {
            const result = await pool.request().query(q + ' ORDER BY event_date DESC, event_time DESC');
            return res.json(result.recordset);
        }
    } catch (err) {
        console.error('❌ GET /api/logs error:', err);
        return res.status(500).json({ error: 'Failed to fetch logs' });
    }
});

/**
 * GET /api/logs/frequency
 * optional query: from & to
 * returns rows: { user_name, cnt }
 */
router.get('/frequency', async (req, res) => {
    const { from, to } = req.query;
    try {
        const pool = await getPool();
        let q = `
            SELECT ISNULL(user_name, 'Unknown') AS user_name, COUNT(*) AS cnt
            FROM logs
        `;
        if (from && to) {
            q += ' WHERE event_date BETWEEN @from AND @to';
            q += ' GROUP BY ISNULL(user_name, \'Unknown\') ORDER BY cnt DESC';
            const request = pool.request()
                .input('from', sql.Date, from)
                .input('to', sql.Date, to);
            const result = await request.query(q);
            return res.json(result.recordset);
        } else {
            q += ' GROUP BY ISNULL(user_name, \'Unknown\') ORDER BY cnt DESC';
            const result = await pool.request().query(q);
            return res.json(result.recordset);
        }
    } catch (err) {
        console.error('❌ GET /api/logs/frequency error:', err);
        return res.status(500).json({ error: 'Failed to fetch frequency stats' });
    }
});

/**
 * POST /api/logs/callback
 * Body: { date, time, user_name, fingerprint_id, note }
 * Bisa diakses dari Raspberry (tanpa CORS)
 * Tetap aman pakai secret header
 */
router.post('/callback', protectCallback, async (req, res) => {
    const { date, time, user_name, fingerprint_id, note } = req.body;
    if (!date || !time) return res.status(400).json({ error: 'date and time required' });

    try {
        const pool = await getPool();
        const request = pool.request();
        request.input('d', sql.Date, date);
        // Validasi & konversi agar diterima SQL Server
        let sqlTime = null;
        if (time) {
            const [h, m, s] = time.split(':').map(Number);
            sqlTime = new Date(1970, 0, 1, h || 0, m || 0, s || 0); // waktu dummy
        }
        request.input('t', sql.Time, sqlTime);

        request.input('u', sql.NVarChar(200), user_name || 'Unknown');
        request.input('fid', sql.NVarChar(100), fingerprint_id || null);
        request.input('note', sql.NVarChar(500), note || null);

        const insertQ = `
            INSERT INTO logs (event_date, event_time, user_name, fingerprint_id, note)
            VALUES (@d, @t, @u, @fid, @note)
        `;
        await request.query(insertQ);

        console.log(`✅ Log received: ${user_name} at ${date} ${time}`);
        return res.json({ message: 'Log saved' });
    } catch (err) {
        console.error('❌ POST /api/logs/callback error:', err);
        return res.status(500).json({ error: 'Failed to save log' });
    }
});

export default router;
