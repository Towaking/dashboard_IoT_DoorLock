// routes/logs.js
import express from 'express';
import { getPool, sql } from '../db.js';
import dotenv from 'dotenv';
dotenv.config();
import { protectCallback } from './auth.js';

const router = express.Router();

/**
 * GET /api/logs
 * optional query: from=YYYY-MM-DD&to=YYYY-MM-DD
 */
// routes/logs.js
router.get('/', async (req, res) => {
    const { from, to } = req.query;
    try {
        const pool = await getPool();
        let q = `SELECT 
                    id, 
                    event_date, 
                    CONVERT(varchar, event_time, 108) AS event_time, 
                    user_name, 
                    fingerprint_id, 
                    note 
                 FROM logs`;
        if (from && to) {
            q += ' WHERE event_date BETWEEN @from AND @to';
            const request = pool.request().input('from', sql.Date, from).input('to', sql.Date, to);
            const result = await request.query(q + ' ORDER BY event_date DESC, event_time DESC');
            return res.json(result.recordset);
        } else {
            const result = await pool.request().query(q + ' ORDER BY event_date DESC, event_time DESC');
            return res.json(result.recordset);
        }
    } catch (err) {
        console.error('GET /api/logs error', err);
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
        let q = `SELECT ISNULL(user_name, 'Unknown') AS user_name, COUNT(*) AS cnt
             FROM logs`;
        if (from && to) {
            q += ' WHERE event_date BETWEEN @from AND @to';
            q += ' GROUP BY ISNULL(user_name, \'Unknown\') ORDER BY cnt DESC';
            const request = pool.request().input('from', sql.Date, from).input('to', sql.Date, to);
            const result = await request.query(q);
            return res.json(result.recordset);
        } else {
            q += ' GROUP BY ISNULL(user_name, \'Unknown\') ORDER BY cnt DESC';
            const result = await pool.request().query(q);
            return res.json(result.recordset);
        }
    } catch (err) {
        console.error('GET /api/logs/frequency error', err);
        return res.status(500).json({ error: 'Failed to fetch frequency stats' });
    }
});

/**
 * POST /api/logs/callback
 * Body: { date: "YYYY-MM-DD", time: "HH:MM:SS", user_name, fingerprint_id, note }
 * Protected by x-callback-secret header
 */
router.post('/callback', protectCallback, async (req, res) => {
    const { date, time, user_name, fingerprint_id, note } = req.body;
    if (!date || !time) return res.status(400).json({ error: 'date and time required' });

    try {
        const pool = await getPool();
        const request = pool.request();
        request.input('d', sql.Date, date);
        request.input('t', sql.Time, time);
        request.input('u', sql.NVarChar(200), user_name || 'Unknown');
        request.input('fid', sql.NVarChar(100), fingerprint_id || null);
        request.input('note', sql.NVarChar(500), note || null);

        const insertQ = `INSERT INTO logs (event_date, event_time, user_name, fingerprint_id, note)
                     VALUES (@d, @t, @u, @fid, @note)`;
        await request.query(insertQ);

        return res.json({ message: 'Log saved' });
    } catch (err) {
        console.error('POST /api/logs/callback error', err);
        return res.status(500).json({ error: 'Failed to save log' });
    }
});

export default router;
