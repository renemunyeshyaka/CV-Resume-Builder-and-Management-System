import express from 'express';
import { authenticateToken } from './auth.js';
import pg from 'pg';
import { PDFDocument, rgb } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import QRCode from 'qrcode';
import bwipjs from 'bwip-js';

const router = express.Router();
const { Pool } = pg;
const pool = new Pool();

// Generate secure PDF for a CV
router.post('/:cvId', authenticateToken, async (req, res) => {
  const { cvId } = req.params;
  try {
    // Fetch CV, user, and signature info
    const cvResult = await pool.query('SELECT * FROM cvs WHERE id = $1 AND user_id = $2', [cvId, req.user.id]);
    if (!cvResult.rows[0]) return res.status(404).json({ error: 'CV not found' });
    const cv = cvResult.rows[0];
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    const user = userResult.rows[0];

    // Create PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4
    page.drawText(cv.title || 'CV', { x: 50, y: 800, size: 24 });
    page.drawText(JSON.stringify(cv.content, null, 2), { x: 50, y: 750, size: 12, maxWidth: 495 });

    // Watermark
    page.drawText('CONFIDENTIAL', { x: 200, y: 400, size: 50, color: rgb(0.9,0.9,0.9), rotate: { degrees: 45 } });

    // QR code (CV ID)
    const qrDataUrl = await QRCode.toDataURL(`cv:${cv.id}`);
    const qrImage = await pdfDoc.embedPng(qrDataUrl);
    page.drawImage(qrImage, { x: 450, y: 50, width: 80, height: 80 });

    // Barcode (CV ID)
    const barcodePng = await new Promise((resolve, reject) => {
      bwipjs.toBuffer({ bcid: 'code128', text: String(cv.id), scale: 3, height: 10, includetext: true }, (err, png) => {
        if (err) reject(err); else resolve(png);
      });
    });
    const barcodeImage = await pdfDoc.embedPng(barcodePng);
    page.drawImage(barcodeImage, { x: 50, y: 50, width: 200, height: 50 });

    // Handwritten signature (if present)
    if (cv.signature) {
      const sigPath = path.join('uploads', path.basename(cv.signature));
      if (fs.existsSync(sigPath)) {
        const sigBytes = fs.readFileSync(sigPath);
        const sigImage = await pdfDoc.embedPng(sigBytes);
        page.drawImage(sigImage, { x: 50, y: 100, width: 120, height: 40 });
      }
    }
    // TODO: Digital signature (DSC) integration

    // Save PDF
    const pdfBytes = await pdfDoc.save();
    const pdfPath = path.join('uploads', `cv_${cv.id}_${Date.now()}.pdf`);
    fs.writeFileSync(pdfPath, pdfBytes);
    await pool.query('UPDATE cvs SET pdf_path = $1 WHERE id = $2', [pdfPath, cv.id]);
    res.json({ message: 'PDF generated', pdfPath });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate PDF', details: err.message });
  }
});

export default router;

// Download generated PDF (authenticated, only owner)
router.get('/download/:cvId', authenticateToken, async (req, res) => {
  const { cvId } = req.params;
  try {
    const result = await pool.query('SELECT pdf_path FROM cvs WHERE id = $1 AND user_id = $2', [cvId, req.user.id]);
    const pdfPath = result.rows[0]?.pdf_path;
    if (!pdfPath || !fs.existsSync(pdfPath)) return res.status(404).json({ error: 'PDF not found' });
    res.download(pdfPath, `cv_${cvId}.pdf`);
  } catch (err) {
    res.status(500).json({ error: 'Failed to download PDF' });
  }
});
