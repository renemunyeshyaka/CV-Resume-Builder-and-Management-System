import express from 'express';
import multer from 'multer';
import path from 'path';
import pg from 'pg';
const { Pool } = pg;
import { authenticateToken } from './auth.js';

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${req.user.id}_${file.fieldname}_${Date.now()}${ext}`);
  }
});

const upload = multer({ storage });

// Profile picture upload
router.post('/profile-picture', authenticateToken, upload.single('profile_picture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // Save file path to database
    const filePath = `/uploads/${req.file.filename}`;
    await pool.query(
      'UPDATE users SET profile_picture = $1 WHERE id = $2',
      [filePath, req.user.id]
    );
    
    res.json({ 
      message: 'Profile picture uploaded successfully',
      file: req.file,
      path: filePath 
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Failed to upload profile picture' });
  }
});

// Signature upload
router.post('/signature', authenticateToken, upload.single('signature'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // Save file path to database
    const filePath = `/uploads/${req.file.filename}`;
    await pool.query(
      'UPDATE users SET signature = $1 WHERE id = $2',
      [filePath, req.user.id]
    );
    
    res.json({ 
      message: 'Signature uploaded successfully',
      file: req.file,
      path: filePath 
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Failed to upload signature' });
  }
});

export default router;
