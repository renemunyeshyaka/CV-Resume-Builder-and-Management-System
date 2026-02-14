import express from 'express';
import { authenticateToken } from './auth.js';
import pg from 'pg';
import fs from 'fs';
import path from 'path';

const router = express.Router();
const { Pool } = pg;
const pool = new Pool();

// Apply electronic signature to a CV (store signature reference in DB)
router.post('/handwritten/:cvId', authenticateToken, async (req, res) => {
  const { cvId } = req.params;
  // Assume signature file already uploaded and path stored in user profile
  try {
    const userResult = await pool.query('SELECT signature FROM users WHERE id = $1', [req.user.id]);
    const signaturePath = userResult.rows[0]?.signature;
    if (!signaturePath) return res.status(400).json({ error: 'No signature uploaded' });
    // Store signature reference in CV (for later PDF embedding)
    await pool.query('UPDATE cvs SET signature = $1 WHERE id = $2 AND user_id = $3', [signaturePath, cvId, req.user.id]);
    res.json({ message: 'Handwritten signature applied to CV' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to sign CV' });
  }
});

export default router;
