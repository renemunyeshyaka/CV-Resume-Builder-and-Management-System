import express from 'express';
import { authenticateToken } from './auth.js';
import pg from 'pg';
import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import fs from 'fs';
import path from 'path';
import QRCode from 'qrcode';
import bwipjs from 'bwip-js';

const router = express.Router();
const { Pool } = pg;
let pool;
try {
  pool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });
} catch (e) {
  console.error('Failed to create pool:', e.message);
}

// Generate secure PDF for a CV
router.post('/:cvId', authenticateToken, async (req, res) => {
  const { cvId } = req.params;
  console.log(`[PDF DEBUG] Request received for CV ${cvId}`);
  try {
    // Fetch CV, user, and signature info
    console.log(`[PDF DEBUG] Querying CV ${cvId} for user ${req.user.id}...`);
    const cvResult = await pool.query('SELECT * FROM cvs WHERE id = $1 AND user_id = $2', [cvId, req.user.id]);
    if (!cvResult.rows[0]) return res.status(404).json({ error: 'CV not found' });
    const cv = cvResult.rows[0];
    console.log(`[PDF DEBUG] CV loaded, now fetching user ${req.user.id}...`);
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    const user = userResult.rows[0];
    console.log(`[PDF DEBUG] User loaded, creating PDF document...`);

    // Create PDF and embed font
    const pdfDoc = await PDFDocument.create();
    console.log(`[PDF DEBUG] PDF document created`);
    // register fontkit so we can embed TrueType/OTF fonts
    try {
      pdfDoc.registerFontkit(fontkit);
      console.log(`[PDF DEBUG] Fontkit registered`);
    } catch (e) {
      console.warn('Failed to register fontkit:', e && e.message ? e.message : e);
    }
    const pageSize = [595, 842]; // A4
    const firstPage = pdfDoc.addPage(pageSize);
    console.log(`[PDF DEBUG] First page added`);
    let font;
    const tryEmbedFont = async (paths) => {
      for (const pth of paths) {
        try {
          if (fs.existsSync(pth)) {
            const buf = fs.readFileSync(pth);
            return await pdfDoc.embedFont(buf);
          }
        } catch (e) {
          // continue trying other fonts
        }
      }
      return null;
    };

    console.log(`[PDF DEBUG] Starting font embedding...`);
    try {
      const candidates = [
        '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
        '/usr/share/fonts/truetype/noto/NotoSans-Regular.ttf',
        '/usr/share/fonts/truetype/noto/NotoEmoji-Regular.ttf',
        '/usr/share/fonts/truetype/noto/NotoSansSymbols-Regular.ttf',
        '/usr/share/fonts/truetype/freefont/FreeSans.ttf'
      ];
      // Prefer embedding a known-system TTF for robust unicode support
      const preferred = ['/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', '/usr/share/fonts/truetype/freefont/FreeSans.ttf', '/usr/share/fonts/truetype/noto/NotoSans-Regular.ttf'];
      let embedded = null;
      for (const pth of preferred) {
        try {
          if (fs.existsSync(pth)) {
            console.log(`[PDF DEBUG] Embedding font from ${pth}...`);
            const buf = fs.readFileSync(pth);
            embedded = await pdfDoc.embedFont(buf);
            console.log('Embedded font from', pth);
            break;
          }
        } catch (e) {
          // continue
        }
      }

      // If no preferred system font embedded, attempt previous candidates list (including NotoEmoji) and download if necessary
      if (!embedded) {
        embedded = await tryEmbedFont(candidates);
        if (!embedded) {
          try {
            const downloadPath = '/tmp/NotoEmoji-Regular.ttf';
            const notoUrl = 'https://github.com/googlefonts/noto-emoji/raw/main/fonts/NotoEmoji-Regular.ttf';
            if (!fs.existsSync(downloadPath)) {
              const res = await fetch(notoUrl);
              if (res.ok) {
                const arrayBuf = await res.arrayBuffer();
                fs.writeFileSync(downloadPath, Buffer.from(arrayBuf));
              }
            }
            if (fs.existsSync(downloadPath)) {
              embedded = await tryEmbedFont([downloadPath]);
              if (embedded) console.log('Embedded downloaded NotoEmoji');
            }
          } catch (dErr) {
            // ignore download errors
          }
        }
      }

      if (embedded) font = embedded;
      else font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      console.log(`[PDF DEBUG] Font embedding complete`);
    } catch (e) {
      console.warn(`[PDF DEBUG] Font embedding failed:`, e.message);
      font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    }

    // Embed profile picture, signature, QR, and barcode BEFORE drawing on pages
    console.log(`[PDF DEBUG] Starting image embedding...`);
    let profileImage = null;
    if (user.profile_picture) {
      try {
        const profilePath = path.join('uploads', path.basename(user.profile_picture));
        if (fs.existsSync(profilePath)) {
          console.log(`[PDF DEBUG] Embedding profile image from ${profilePath}...`);
          const imgBytes = fs.readFileSync(profilePath);
          const ext = path.extname(profilePath).toLowerCase();
          if (ext === '.jpg' || ext === '.jpeg') profileImage = await pdfDoc.embedJpg(imgBytes);
          else profileImage = await pdfDoc.embedPng(imgBytes);
          console.log(`[PDF DEBUG] Profile image embedded`);
        }
      } catch (embedErr) {
        console.warn('Failed to embed profile picture into PDF:', embedErr.message);
      }
    }

    // Embed signature bytes (handwritten signature if present)
    let signatureImage = null;
    if (user.signature) {
      try {
        console.log(`[PDF DEBUG] Embedding signature image...`);
        const sigPath = path.join('uploads', path.basename(user.signature));
        if (fs.existsSync(sigPath)) {
          const sigBytes = fs.readFileSync(sigPath);
          signatureImage = await pdfDoc.embedPng(sigBytes);
          console.log(`[PDF DEBUG] Signature image embedded`);
        }
      } catch (sigErr) {
        console.warn('Failed to embed signature image:', sigErr.message);
      }
    }

    // Prepare QR and barcode images (embed once)
    console.log(`[PDF DEBUG] Generating QR code...`);
    let qrDataUrl = cv.qr_code;
    if (!qrDataUrl) qrDataUrl = await QRCode.toDataURL(`cv:${cv.id}`);
    const qrBase64 = qrDataUrl.replace(/^data:image\/png;base64,/, '');
    const qrImage = await pdfDoc.embedPng(Buffer.from(qrBase64, 'base64'));
    console.log(`[PDF DEBUG] QR code embedded`);

    // Build a signature-specific QR payload and embed a larger QR for signature block
    console.log(`[PDF DEBUG] Generating signature QR code...`);
    const signaturePayload = {
      type: 'cv-signature',
      cvId: cv.id,
      userId: cv.user_id || user.id,
      signedBy: cv.signed_by || user.id,
      signedAt: cv.signed_at || new Date().toISOString(),
      institution: 'CVBuilder System'
    };
    const signatureQrDataUrl = await QRCode.toDataURL(JSON.stringify(signaturePayload));
    const signatureQrBase64 = signatureQrDataUrl.replace(/^data:image\/png;base64,/, '');
    const signatureQrImage = await pdfDoc.embedPng(Buffer.from(signatureQrBase64, 'base64'));
    console.log(`[PDF DEBUG] Signature QR code embedded`);

    // Barcode should encode document references (doc id, user id, version)
    console.log(`[PDF DEBUG] Generating barcode...`);
    let barcodeDataUrl = cv.barcode;
    const barcodeText = `DOC:${cv.id}|USER:${cv.user_id || user.id}|VER:${cv.version || ''}`;
    if (!barcodeDataUrl) {
      const barcodePng = await new Promise((resolve, reject) => {
        bwipjs.toBuffer({ bcid: 'code128', text: barcodeText, scale: 3, height: 10, includetext: true }, (err, png) => {
          if (err) reject(err); else resolve(png);
        });
      });
      barcodeDataUrl = 'data:image/png;base64,' + barcodePng.toString('base64');
    }
    const barcodeBase64 = barcodeDataUrl.replace(/^data:image\/png;base64,/, '');
    const barcodeImage = await pdfDoc.embedPng(Buffer.from(barcodeBase64, 'base64'));
    console.log(`[PDF DEBUG] Barcode embedded, all images ready`);

    // Sanitize text: remove control chars and surrogate pairs (keep most unicode)
    const sanitize = (s) => {
      let out = ('' + (s || ''));
      // remove control chars
      out = out.replace(/[\r\n\x00-\x1F\x7F]/g, ' ');
      // remove surrogate pairs (common for emoji and other supplementary characters)
      out = out.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, ' ');
      // collapse multiple spaces
      out = out.replace(/\s{2,}/g, ' ').trim();
      return out;
    };

    // drawText wrapper that retries with progressively safer fallbacks if pdf-lib cannot encode glyphs
    const safeDrawText = (page, text, opts) => {
      const clean = sanitize(text);
      try {
        page.drawText(clean, opts);
        return;
      } catch (err) {
        const msg = (err && err.message) ? err.message : '';
        if (!msg.includes('WinAnsi')) throw err;
      }
      // Fallback 1: remove surrogate pairs and characters outside BMP
      let fallback = clean.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, ' ');
      try {
        page.drawText(fallback, opts);
        return;
      } catch (err) {
        const msg = (err && err.message) ? err.message : '';
        if (!msg.includes('WinAnsi')) throw err;
      }
      // Fallback 2: strip non Latin-1 characters (safe but lossy)
      fallback = fallback.replace(/[^\x00-\xFF]/g, ' ');
      page.drawText(fallback, opts);
    };

    // Page 1: Center profile image and full name at top (like previous template with circled picture)
    const profileImageSize = 100;
    const profileX = (pageSize[0] - profileImageSize) / 2; // Center horizontally
    const profileY = 720; // Top area of page 1

    // Draw a circle border around profile image
    const circleRadius = profileImageSize / 2;
    firstPage.drawCircle({
      x: profileX + circleRadius,
      y: profileY + circleRadius,
      size: circleRadius + 2,
      borderColor: rgb(0.2, 0.2, 0.2),
      borderWidth: 2
    });

    if (profileImage) {
      firstPage.drawImage(profileImage, { x: profileX, y: profileY, width: profileImageSize, height: profileImageSize });
    }

    // Center user name below profile image
    const userName = user.name || cv.name || 'Unknown';
    const userNameWidth = userName.length * 10.8; // rough estimate for centering
    const userNameX = Math.max(50, (pageSize[0] - userNameWidth) / 2);
    safeDrawText(firstPage, userName, { x: userNameX, y: profileY - 40, size: 18, font });

    // Draw title below name
    const title_text = cv.title || 'CV';
    const titleWidth = title_text.length * 8.4; // rough estimate for centering
    const titleX = Math.max(50, (pageSize[0] - titleWidth) / 2);
    safeDrawText(firstPage, title_text, { x: titleX, y: profileY - 70, size: 14, font });

    // Prepare content text and pagination
    const contentText = cv.content ? sanitize(JSON.stringify(cv.content, null, 2)) : '';
    const leftX = 50;
    const rightMargin = 50;
    const maxWidth = pageSize[0] - leftX - rightMargin;
    const fontSize = 12;
    const lineHeight = Math.ceil(fontSize * 1.2);
    const startY = 640; // Start content below centered header (profile + name + title area)

    // Split content into wrapped lines using a simple character-width heuristic
    const approxCharWidth = fontSize * 0.6;
    const maxChars = Math.max(20, Math.floor(maxWidth / approxCharWidth));
    const words = contentText.split(/\s+/).map(w => (w || '').replace(/[\r\n\x00-\x1F\x7F]/g, ' '));
    const lines = [];
    let currentLine = '';
    for (const w of words) {
      if (!w) continue;
      if ((currentLine + ' ' + w).trim().length <= maxChars) {
        currentLine = (currentLine + ' ' + w).trim();
      } else {
        if (currentLine) lines.push(currentLine);
        if (w.length > maxChars) {
          for (let i = 0; i < w.length; i += maxChars) {
            lines.push(w.slice(i, i + maxChars));
          }
          currentLine = '';
        } else {
          currentLine = w;
        }
      }
    }
    if (currentLine) lines.push(currentLine);

    // Draw lines across pages
    const pages = [firstPage];
    let currentPage = firstPage;
    let y = startY;
    for (const ln of lines) {
      if (y < 60 + lineHeight) {
        currentPage = pdfDoc.addPage(pageSize);
        pages.push(currentPage);
        safeDrawText(currentPage, cv.title || 'CV', { x: 50, y: 800, size: 18, font });
        y = startY;
      }
      safeDrawText(currentPage, ln, { x: leftX, y, size: fontSize, font });
      y -= lineHeight;
    }

    // Watermark
    const watermarkText = cv.watermark || 'CONFIDENTIAL';
    for (const p of pages) {
      safeDrawText(p, watermarkText, { x: 200, y: 400, size: 50, color: rgb(0.9,0.9,0.9), rotate: degrees(45), font });
    }

    // Draw header/footer on every page
    const pageWidth = pageSize[0];
    const pageHeight = pageSize[1];
    pages.forEach((p, idx) => {
      // Header: title left, user name right (only on non-first pages)
      if (idx > 0) {
        safeDrawText(p, cv.title || 'CV', { x: 50, y: pageHeight - 30, size: 14, font });
        const headerUserName = user.name || '';
        if (headerUserName) safeDrawText(p, headerUserName, { x: pageWidth - 200, y: pageHeight - 30, size: 12, font });
      }

      // Footer: page number centered
      const pageNumText = `Page ${idx + 1} of ${pages.length}`;
      const pnWidth = pageNumText.length * (10 * 0.6);
      safeDrawText(p, pageNumText, { x: (pageWidth - pnWidth) / 2, y: 25, size: 10, font });

      // Page 1: barcode centered at footer
      if (idx === 0) {
        const footerBarcodeWidth = 280;
        const fbX = (pageWidth - footerBarcodeWidth) / 2;
        const fbY = 50; // Centered position above page number
        p.drawImage(barcodeImage, { x: fbX, y: fbY, width: footerBarcodeWidth, height: 45 });
      }
    });

    // Draw signature and signature block on last page if available
    if (pages.length > 0) {
      const last = pages[pages.length - 1];

      // Signature block area on last page
      const sigBlockY = 320; // Higher position for signature block area

      // Signature image (handwritten) if present
      if (signatureImage) {
        last.drawImage(signatureImage, { x: 50, y: sigBlockY - 40, width: 160, height: 60 });
      }

      // Signature block text: full name, institution, date/time (left side)
      const sigTextX = 50;
      const sigTextY = sigBlockY - 80;
      safeDrawText(last, `Signed by: ${user.name || cv.name || 'Unknown'}`, { x: sigTextX, y: sigTextY, size: 12, font });
      safeDrawText(last, `Institution: CVBuilder System`, { x: sigTextX, y: sigTextY - 16, size: 11, font });
      
      const signedAt = cv.signed_at ? new Date(cv.signed_at) : new Date();
      const signedAtText = signedAt.toLocaleString();
      safeDrawText(last, `Signed at: ${signedAtText}`, { x: sigTextX, y: sigTextY - 32, size: 11, font });

      // QR code positioned on right side of signature block (for verification)
      const qrSize = 100;
      const qrX = pageWidth - qrSize - 50;
      const qrY = sigBlockY - 50;
      last.drawImage(signatureQrImage, { x: qrX, y: qrY, width: qrSize, height: qrSize });

      // Bottom section (last page footer): Full name and Date of signature centered
      const bottomAreaY = 80;
      
      // Centered full name at bottom
      const fullName = user.name || cv.name || 'Unknown';
      const fullNameWidth = fullName.length * 10.8;
      const fullNameX = Math.max(50, (pageWidth - fullNameWidth) / 2);
      safeDrawText(last, fullName, { x: fullNameX, y: bottomAreaY + 20, size: 14, font });
      
      // Date of signature at bottom (below name)
      const sigDate = cv.signed_at ? new Date(cv.signed_at).toLocaleDateString() : new Date().toLocaleDateString();
      const sigDateText = `Signed on ${sigDate}`;
      const sigDateWidth = sigDateText.length * 8.4;
      const sigDateX = Math.max(50, (pageWidth - sigDateWidth) / 2);
      safeDrawText(last, sigDateText, { x: sigDateX, y: bottomAreaY, size: 11, font });
    }

    // Save PDF
    console.log(`[PDF DEBUG] Saving PDF document...`);
    const pdfBytes = await pdfDoc.save();
    console.log(`[PDF DEBUG] PDF bytes saved (${pdfBytes.length} bytes), writing to file...`);
    fs.mkdirSync('uploads', { recursive: true });
    const pdfPath = path.join('uploads', `cv_${cv.id}_${Date.now()}.pdf`);
    fs.writeFileSync(pdfPath, pdfBytes);
    console.log(`[PDF DEBUG] PDF file written to ${pdfPath}, updating database...`);
    await pool.query('UPDATE cvs SET pdf_path = $1 WHERE id = $2', [pdfPath, cv.id]);
    console.log(`[PDF DEBUG] Database updated, sending response...`);
    res.json({ message: 'PDF generated', pdfPath });
    console.log(`[PDF DEBUG] Response sent successfully`);
  } catch (err) {
    console.error('PDF generation error:', err);
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
