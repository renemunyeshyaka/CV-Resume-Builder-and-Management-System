import express from 'express';
import multer from 'multer';
import path from 'path';
import { authenticateToken } from './auth.js';

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
router.post('/profile-picture', authenticateToken, upload.single('profile_picture'), (req, res) => {
  res.json({ file: req.file });
});

// Signature upload
router.post('/signature', authenticateToken, upload.single('signature'), (req, res) => {
  res.json({ file: req.file });
});

export default router;
