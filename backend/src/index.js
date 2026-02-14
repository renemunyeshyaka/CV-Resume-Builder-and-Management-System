import dotenv from 'dotenv';
dotenv.config({ path: '.env' });
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

import authRoutes from './auth.js';
app.use('/api/auth', authRoutes);

import uploadRoutes from './upload.js';
app.use('/api/upload', uploadRoutes);

import cvRoutes from './cv.js';
app.use('/api/cv', cvRoutes);

import signRoutes from './sign.js';
app.use('/api/sign', signRoutes);

import pdfgenRoutes from './pdfgen.js';
app.use('/api/pdf', pdfgenRoutes);

import verifyRoutes from './verify.js';
app.use('/api/verify', verifyRoutes);

import adminRoutes from './admin.js';
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
  res.send('CV/Resume Builder API is running.');
});

// TODO: Add authentication, file upload, PDF, QR/barcode, version control routes

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
