/**
 * routes/users.js
 *
 * Routes:
 *  POST   /api/users/add            -> trigger enrollment via Blynk (ESP32 handles raspberry & returns callback)
 *  POST   /api/users/callback      -> callback endpoint for ESP32 to notify enrollment success (name,fingerprint_id,photo_path)
 *  GET    /api/users               -> list all users
 *  GET    /api/users/search?name=  -> search by name (partial)
 *  DELETE /api/users/:fingerprint  -> delete user by fingerprint_id (notify ESP32 via Blynk)
 *
 * Requires: pool available via sql.connect in server.js (we use mssql tagged template).
 */

import express from 'express';
import sql from 'mssql';
import axios from 'axios';

const router = express.Router();

// helper to build blynk URLs
function buildBlynkUrl(base, token, pin, value) {
    // Blynk Cloud example: https://blynk.cloud/external/api/update?token=<TOKEN>&<PIN>=<VALUE>
    // We'll use named pattern: V1=ENROLL:NAME  or V1=DELETE:FID
    const url = `${base}/update?token=${encodeURIComponent(token)}&${encodeURIComponent(pin)}=${encodeURIComponent(value)}`;
    return url;
}

/**
 * POST /api/users/add
 * Body: { name }
 * -> Triggers ESP32 via Blynk to start enrollment.
 * Response: { message }
 *
 * NOTE: Enrollment flow:
 *  - Backend triggers Blynk virtual pin (V1) with value like "ENROLL:<name>"
 *  - ESP32 starts fingerprint enrollment & asks Raspberry to capture photo and save it
 *  - After success, ESP32/raspi calls backend POST /api/users/callback with { name, fingerprint_id, photo_path }
 */
router.post('/add', async (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name required' });

    try {
        const { token, base } = req.blynk;
        if (!token) return res.status(500).json({ error: 'Blynk token not configured' });

        // Use V1 as example pin; adapt if your ESP32 listens on other virtual pin
        const value = `ENROLL:${name}`; // adapt if ESP32 expects different format
        const url = buildBlynkUrl(base, token, 'V1', value);

        // send request to Blynk Cloud
        await axios.get(url, { timeout: 5000 });

        // Immediately return: actual DB insert will happen in /callback when ESP32 responds
        return res.json({ message: 'Enrollment request sent to ESP32 (via Blynk). Awaiting callback.' });
    } catch (err) {
        console.error('Error triggering enroll:', err?.message || err);
        return res.status(500).json({ error: 'Failed to trigger enrollment' });
    }
});

/**
 * POST /api/users/callback
 * This endpoint is called by ESP32 (or Raspi via ESP32) after enrollment & photo saved.
 * Body: { name, fingerprint_id, photo_path }
 * - photo_path expected to be the path on Raspberry Pi (absolute or relative) that we store in DB.
 */
router.post('/callback', async (req, res) => {
    const { name, fingerprint_id, photo_path } = req.body;
    if (!name || !fingerprint_id) return res.status(400).json({ error: 'name and fingerprint_id required' });

    try {
        // Insert into DB. Use parameterized query to avoid injection.
        const insertQuery = `
      INSERT INTO users (name, fingerprint_id, photo_path)
      VALUES (@name, @fid, @pp)
    `;

        const pool = req.dbPool || (await sql.connect());
        const request = pool.request();
        request.input('name', sql.NVarChar(200), name);
        request.input('fid', sql.NVarChar(100), fingerprint_id.toString());
        request.input('pp', sql.NVarChar(500), photo_path || null);

        await request.query(insertQuery);

        console.log(`✅ New user saved: ${name} (fid=${fingerprint_id}), photo_path=${photo_path}`);

        return res.json({ message: 'User saved' });
    } catch (err) {
        console.error('Callback save error:', err);
        return res.status(500).json({ error: 'Failed to save user' });
    }
});

/**
 * GET /api/users
 * List all users
 */
router.get('/', async (req, res) => {
    try {
        const pool = req.dbPool || (await sql.connect());
        const result = await pool.request().query(`SELECT id, name, fingerprint_id, photo_path FROM users ORDER BY name`);
        return res.json(result.recordset);
    } catch (err) {
        console.error('GET /api/users error:', err);
        return res.status(500).json({ error: 'Failed to fetch users' });
    }
});

/**
 * GET /api/users/search?name=
 */
router.get('/search', async (req, res) => {
    const q = req.query.name || '';
    try {
        const pool = req.dbPool || (await sql.connect());
        const request = pool.request();
        request.input('q', sql.NVarChar(200), `%${q}%`);
        const result = await request.query(`SELECT id, name, fingerprint_id, photo_path FROM users WHERE name LIKE @q ORDER BY name`);
        return res.json(result.recordset);
    } catch (err) {
        console.error('GET /api/users/search error:', err);
        return res.status(500).json({ error: 'Failed to search users' });
    }
});

/**
 * DELETE /api/users/:fingerprint_id
 * - Deletes DB record
 * - Notifies ESP32 via Blynk to delete fingerprint from sensor and instruct Raspi to delete photo
 * - We don't directly SSH to Raspberry here; we instruct ESP32 which coordinates with Raspi
 */
router.delete('/:fingerprint_id', async (req, res) => {
    const fid = req.params.fingerprint_id;
    if (!fid) return res.status(400).json({ error: 'fingerprint_id required' });

    try {
        const pool = req.dbPool || (await sql.connect());
        // check exist
        const check = await pool.request()
            .input('fid', sql.NVarChar(100), fid)
            .query('SELECT * FROM users WHERE fingerprint_id = @fid');

        if (check.recordset.length === 0) return res.status(404).json({ error: 'User not found' });

        const user = check.recordset[0];
        const photoPath = user.photo_path; // path on Raspberry Pi

        // Notify ESP32 to delete fingerprint (we rely on ESP32 to coordinate Raspi)
        const { token, base } = req.blynk;
        if (token) {
            // We use V1 again (or V2) with a DELETE command; adapt to your ESP32 code.
            const value = `DELETE:${fid}`;
            const url = buildBlynkUrl(base, token, 'V1', value);
            try {
                await axios.get(url, { timeout: 5000 });
                console.log(`🔔 Notified ESP32 via Blynk to delete fid=${fid}`);
            } catch (e) {
                console.warn('Warn: failed to notify ESP32 via Blynk (continuing):', e?.message || e);
            }
        } else {
            console.warn('Blynk token not configured - skipping ESP32 notify');
        }

        // Delete DB record
        await pool.request().input('fid', sql.NVarChar(100), fid).query('DELETE FROM users WHERE fingerprint_id = @fid');

        // We cannot directly delete the photo file on Raspberry from here (no SSH). If you want:
        // - Implement ESP32 -> Raspi delete file after receiving DELETE command, or
        // - Have backend call Raspi HTTP endpoint (if Raspi exposes one) to remove file.
        // For now, we rely on ESP32/Raspi to remove the file on receiving the command.

        console.log(`🗑️ User fid=${fid} removed from DB. Photo (raspi) path: ${photoPath}`);

        return res.json({ message: 'User deleted (DB). ESP32 was notified to remove fingerprint and photo.' });
    } catch (err) {
        console.error('DELETE /api/users error:', err);
        return res.status(500).json({ error: 'Failed to delete user' });
    }
});

export default router;
