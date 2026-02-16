import express from 'express';
import pg from 'pg';

const router = express.Router();
const { Pool } = pg;
const pool = new Pool();

// Verify by QR code (cv:id)
router.get('/qr/:cvId', async (req, res) => {
  const { cvId } = req.params;
  try {
    const result = await pool.query('SELECT id, title, user_id, created_at FROM cvs WHERE id = $1', [cvId]);
    if (!result.rows[0]) return res.status(404).json({ valid: false, error: 'CV not found' });
    res.json({ valid: true, cv: result.rows[0] });
  } catch (err) {
    res.status(500).json({ valid: false, error: 'Verification failed' });
  }
});

// Verify by barcode (cv:id)
router.get('/barcode/:cvId', async (req, res) => {
  const { cvId } = req.params;
  try {
    const result = await pool.query('SELECT id, title, user_id, created_at FROM cvs WHERE id = $1', [cvId]);
    if (!result.rows[0]) return res.status(404).json({ valid: false, error: 'CV not found' });
    res.json({ valid: true, cv: result.rows[0] });
  } catch (err) {
    res.status(500).json({ valid: false, error: 'Verification failed' });
  }
});

export default router;
