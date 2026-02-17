import express from 'express';
import { authenticateToken } from './auth.js';
import pg from 'pg';
import QRCode from 'qrcode';
import bwipjs from 'bwip-js';

const router = express.Router();
const { Pool } = pg;
const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Create new CV
router.post('/', authenticateToken, async (req, res) => {
  const { title, content } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO cvs (user_id, title, content) VALUES ($1, $2, $3) RETURNING *',
      [req.user.id, title, content]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create CV' });
  }
});

// Update CV
router.put('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;
  try {
    const result = await pool.query(
      'UPDATE cvs SET title = $1, content = $2, updated_at = NOW(), version = version + 1 WHERE id = $3 AND user_id = $4 RETURNING *',
      [title, content, id, req.user.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'CV not found' });
    // Save version history
    await pool.query('INSERT INTO cv_versions (cv_id, content, version) VALUES ($1, $2, $3)', [id, content, result.rows[0].version]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update CV' });
  }
});

// Get all CVs for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM cvs WHERE user_id = $1', [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch CVs' });
  }
});

// Get all CVs for HR/Admin (requires admin role) - MUST come before /:id
router.get('/all', authenticateToken, async (req, res) => {
  try {
    // Check if user has admin/hr role
    if (req.user.role !== 'admin' && req.user.role !== 'hr') {
      return res.status(403).json({ error: 'Access denied. Admin/HR role required.' });
    }

    const result = await pool.query(`
      SELECT 
        cvs.id,
        cvs.title,
        cvs.content,
        cvs.version,
        cvs.created_at,
        cvs.updated_at,
        users.id as user_id,
        users.name as user_name,
        users.email as user_email,
        CASE 
          WHEN cvs.qr_code IS NOT NULL THEN 'verified'
          ELSE 'pending'
        END as status
      FROM cvs
      INNER JOIN users ON cvs.user_id = users.id
      ORDER BY cvs.created_at DESC
    `);
    
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching all CVs:', err);
    res.status(500).json({ error: 'Failed to fetch CVs' });
  }
});

// Get HR/Admin statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    // Check if user has admin/hr role
    if (req.user.role !== 'admin' && req.user.role !== 'hr') {
      return res.status(403).json({ error: 'Access denied. Admin/HR role required.' });
    }

    const totalResult = await pool.query('SELECT COUNT(*) as count FROM cvs');
    const verifiedResult = await pool.query('SELECT COUNT(*) as count FROM cvs WHERE qr_code IS NOT NULL');
    
    const totalCVs = parseInt(totalResult.rows[0].count);
    const verifiedCVs = parseInt(verifiedResult.rows[0].count);
    
    res.json({
      totalCVs,
      verifiedCVs,
      pendingVerification: totalCVs - verifiedCVs
    });
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Get single CV - MUST come after /all and /stats
router.get('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT 
        cvs.id, cvs.user_id, cvs.title, cvs.content, cvs.pdf_path, 
        cvs.qr_code, cvs.barcode, cvs.watermark, cvs.version, 
        cvs.created_at, cvs.updated_at, cvs.signed_at, cvs.signed_by, cvs.status,
        users.profile_picture, users.name
       FROM cvs 
       INNER JOIN users ON cvs.user_id = users.id 
       WHERE cvs.id = $1`, 
      [id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'CV not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch CV' });
  }
});

// Delete CV
router.delete('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    // Check if the CV belongs to the user
    const checkResult = await pool.query(
      'SELECT * FROM cvs WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );
    
    if (!checkResult.rows[0]) {
      return res.status(404).json({ error: 'CV not found or you do not have permission to delete it' });
    }

    // Delete CV versions FIRST (due to foreign key constraint)
    await pool.query(
      'DELETE FROM cv_versions WHERE cv_id = $1',
      [id]
    );

    // Then delete the CV
    await pool.query(
      'DELETE FROM cvs WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    res.json({ message: 'CV deleted successfully' });
  } catch (err) {
    console.error('Error deleting CV:', err);
    res.status(500).json({ error: 'Failed to delete CV' });
  }
});

// Sign CV - Generate QR code, barcode, and watermark
router.post('/:id/sign', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    // Check if the CV belongs to the user
    const checkResult = await pool.query(
      'SELECT * FROM cvs WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );
    
    if (!checkResult.rows[0]) {
      return res.status(404).json({ error: 'CV not found or you do not have permission to sign it' });
    }

    const cv = checkResult.rows[0];

    // Generate QR code (contains CV ID and timestamp for uniqueness)
    const qrData = `cv:${cv.id}:${Date.now()}:${req.user.id}`;
    const qrCode = await QRCode.toDataURL(qrData);

    // Generate barcode (CV ID)
    const barcodePng = await new Promise((resolve, reject) => {
      bwipjs.toBuffer({ bcid: 'code128', text: String(cv.id), scale: 3, height: 10, includetext: true }, (err, png) => {
        if (err) reject(err); else resolve(png);
      });
    });
    const barcodeDataUrl = 'data:image/png;base64,' + barcodePng.toString('base64');

    // Generate watermark text (contains user name and timestamp)
    const userResult = await pool.query('SELECT name FROM users WHERE id = $1', [req.user.id]);
    const userName = userResult.rows[0]?.name || 'Unknown';
    const watermark = `Signed by ${userName} on ${new Date().toISOString().split('T')[0]}`;

    // Update CV with security features
    const updateResult = await pool.query(
      `UPDATE cvs 
       SET qr_code = $1, barcode = $2, watermark = $3, signed_at = NOW(), signed_by = $4, status = 'signed'
       WHERE id = $5 AND user_id = $6
       RETURNING *`,
      [qrCode, barcodeDataUrl, watermark, req.user.id, id, req.user.id]
    );

    res.json({
      message: 'CV signed successfully',
      cv: updateResult.rows[0],
      securityFeatures: {
        qrCode: true,
        barcode: true,
        watermark: watermark,
        signedAt: new Date().toISOString(),
        signedBy: userName
      }
    });
  } catch (err) {
    console.error('Error signing CV:', err);
    res.status(500).json({ error: 'Failed to sign CV', details: err.message });
  }
});

// Verify document authenticity
router.post('/verify', authenticateToken, async (req, res) => {
  const { cvId, qrCode } = req.body;

  try {
    // Check if user has admin/hr role
    if (req.user.role !== 'admin' && req.user.role !== 'hr') {
      return res.status(403).json({ error: 'Access denied. Admin/HR role required.' });
    }

    if (!cvId) {
      return res.status(400).json({ error: 'CV ID required' });
    }

    // Fetch the CV
    const cvResult = await pool.query(`
      SELECT cvs.*, users.name, users.email FROM cvs
      INNER JOIN users ON cvs.user_id = users.id
      WHERE cvs.id = $1
    `, [cvId]);

    if (!cvResult.rows[0]) {
      return res.status(404).json({ error: 'CV not found' });
    }

    const cv = cvResult.rows[0];

    // Verification logic
    const verificationDetails = {
      cvId: cv.id,
      title: cv.title,
      userName: cv.name,
      userEmail: cv.email,
      createdAt: cv.created_at,
      version: cv.version
    };

    // Check if CV has QR code (basic verification)
    const hasQRCode = !!cv.qr_code;
    const hasBarcode = !!cv.barcode;
    const hasSignature = !!cv.watermark;

    // Verify QR code if provided
    let qrMatches = true;
    if (qrCode && cv.qr_code) {
      qrMatches = cv.qr_code === qrCode;
    }

    const isAuthentic = hasQRCode && hasBarcode && qrMatches;

    // Update CV status in database
    if (isAuthentic) {
      await pool.query(
        'UPDATE cvs SET status = $1 WHERE id = $2',
        ['verified', cvId]
      );
    }

    res.json({
      isAuthentic,
      message: isAuthentic 
        ? 'Document is authentic and verified.' 
        : 'Document verification failed. Missing or mismatched security features.',
      details: {
        ...verificationDetails,
        hasQRCode,
        hasBarcode,
        hasSignature,
        qrMatches,
        verifiedAt: new Date().toISOString()
      }
    });
  } catch (err) {
    console.error('Verification error:', err);
    res.status(500).json({ error: 'Failed to verify document', details: err.message });
  }
});

export default router;
