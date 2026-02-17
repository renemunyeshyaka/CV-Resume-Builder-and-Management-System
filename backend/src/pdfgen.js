import express from 'express';
import { authenticateToken } from './auth.js';
import pg from 'pg';
import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import fs from 'fs';
import path from 'path';
import QRCode from 'qrcode';
import bwipjs from 'bwip-js';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = express.Router();
const { Pool } = pg;

// Create pool with explicit configuration
let pool = null;
function getPool() {
  if (!pool) {
    pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'cvcreator',
    });
  }
  return pool;
}

// Generate secure PDF for a CV
router.post('/:cvId', authenticateToken, async (req, res) => {
  const { cvId } = req.params;
  const userId = req.user.id;
  
  try {
    console.log(`[PDF] Starting PDF generation for CV ${cvId}, user ${userId}`);
    const pool = getPool();
    
    // Fetch CV data
    console.log('[PDF] Fetching CV data...');
    const cvResult = await pool.query(
      'SELECT * FROM cvs WHERE id = $1 AND user_id = $2',
      [cvId, userId]
    );
    if (!cvResult.rows[0]) {
      return res.status(404).json({ error: 'CV not found' });
    }
    const cv = cvResult.rows[0];

    // Fetch user data
    console.log('[PDF] Fetching user data...');
    const userResult = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [userId]
    );
    const user = userResult.rows[0];
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create PDF
    console.log('[PDF] Creating PDF document...');
    const pdfDoc = await PDFDocument.create();

    // Register fontkit for TrueType embedding
    try {
      pdfDoc.registerFontkit(fontkit);
      console.log('[PDF] Fontkit registered');
    } catch (e) {
      console.warn('[PDF] Fontkit registration failed:', e.message);
    }

    // Embed a font
    let font = StandardFonts.Helvetica;
    try {
      const fontPath = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf';
      if (fs.existsSync(fontPath)) {
        console.log('[PDF] Embedding DejaVuSans font...');
        const fontBytes = fs.readFileSync(fontPath);
        font = await pdfDoc.embedFont(fontBytes);
        console.log('[PDF] Font embedded successfully');
      }
    } catch (e) {
      console.warn('[PDF] Font embedding failed, using default:', e.message);
      font = StandardFonts.Helvetica;
    }

    const primaryColor = rgb(0.4, 0.49, 0.92);
    const textColor = rgb(0.2, 0.2, 0.2);

    const wrapText = (text, maxLength = 90) => {
      const words = String(text || '').split(' ');
      const lines = [];
      let currentLine = '';

      for (const word of words) {
        if ((currentLine + ' ' + word).trim().length > maxLength) {
          if (currentLine.trim().length > 0) lines.push(currentLine.trim());
          currentLine = word;
        } else {
          currentLine = (currentLine + ' ' + word).trim();
        }
      }
      if (currentLine.trim().length > 0) lines.push(currentLine.trim());
      return lines;
    };

    // Add first page
    console.log('[PDF] Adding first page...');
    const pageSize = [595, 842]; // A4
    const firstPage = pdfDoc.addPage(pageSize);
    const pageWidth = pageSize[0];
    const pageHeight = pageSize[1];

    const parseContentObject = (contentValue) => {
      if (!contentValue) return null;
      if (typeof contentValue === 'object') return contentValue;
      if (typeof contentValue !== 'string') return null;
      const trimmedContent = contentValue.trim();
      if ((trimmedContent.startsWith('{') && trimmedContent.endsWith('}')) ||
          (trimmedContent.startsWith('[') && trimmedContent.endsWith(']'))) {
        try {
          return JSON.parse(trimmedContent);
        } catch {
          return null;
        }
      }
      return null;
    };

    const contentObject = parseContentObject(cv.content);

    // Draw page header with user info
    const userName = contentObject?.fullName || user.name || cv.name || 'Unknown User';
    const userTitle = contentObject?.summary ? 'Professional Summary' : (cv.title || 'Professional');

    // Center profile section (top of page)
    const profileImagePath = path.join(__dirname, '../uploads', `profile_${userId}.png`);
    let profileImage = null;
    try {
      if (fs.existsSync(profileImagePath)) {
        console.log('[PDF] Embedding profile image from:', profileImagePath);
        const profileImageBytes = fs.readFileSync(profileImagePath);
        profileImage = await pdfDoc.embedPng(profileImageBytes);
        console.log('[PDF] Profile image embedded successfully');
      } else {
        console.warn('[PDF] Profile image not found at:', profileImagePath);
      }
    } catch (e) {
      console.warn('[PDF] Profile image embedding failed:', e.message);
    }

    // Draw profile image on first page if available
    if (profileImage) {
      const profileSize = 100;
      const profileX = (pageWidth - profileSize) / 2;
      const profileY = pageHeight - 140;
      firstPage.drawImage(profileImage, {
        x: profileX,
        y: profileY,
        width: profileSize,
        height: profileSize,
      });
      console.log('[PDF] Profile image drawn on first page');
    } else {
      console.log('[PDF] Skipping profile image - not available');
    }

    // Draw centered text (name and title)
    try {
      const nameSize = 20;
      const titleSize = 12;
      const nameY = pageHeight - 225;

      // Center name (estimated character width for centering)
      const estCharWidth = nameSize * 0.5;  // Rough estimate
      const nameX = Math.max(50, (pageWidth - userName.length * estCharWidth) / 2);
      
      firstPage.drawText(userName, {
        x: nameX,
        y: nameY,
        size: nameSize,
        font: font,
        color: textColor,
      });

      // Center title
      const titleCharWidth = titleSize * 0.5;
      const titleX = Math.max(50, (pageWidth - userTitle.length * titleCharWidth) / 2);
      
      firstPage.drawText(userTitle, {
        x: titleX,
        y: nameY - 35,
        size: titleSize,
        font: font,
        color: primaryColor,
      });

      // Divider line under header
      firstPage.drawRectangle({
        x: 40,
        y: nameY - 55,
        width: pageWidth - 80,
        height: 2,
        color: primaryColor,
      });

      console.log('[PDF] Header text drawn');
    } catch (e) {
      console.warn('[PDF] Header text failed:', e.message);
    }

    // Generate barcode once and reuse for all pages
    let barcodeImage = null;
    try {
      console.log('[PDF] Generating barcode...');
      const barcodeData = `CV${cvId}`;
      const barcodeBuffer = await new Promise((resolve, reject) => {
        bwipjs.toBuffer({
          bcid: 'code128',
          text: barcodeData,
          scale: 2,
          height: 10,
          includetext: true,
          textxalign: 'center',
        }, (err, png) => {
          if (err) reject(err);
          else resolve(png);
        });
      });
      barcodeImage = await pdfDoc.embedPng(barcodeBuffer);
      console.log('[PDF] Barcode generated');
    } catch (e) {
      console.warn('[PDF] Barcode generation failed:', e.message);
    }

    const drawBarcodeFooter = (page) => {
      if (!barcodeImage) return;
      const barcodeWidth = 150;
      const barcodeHeight = 40;
      const barcodeX = (pageWidth - barcodeWidth) / 2;
      const barcodeY = 30;
      page.drawImage(barcodeImage, {
        x: barcodeX,
        y: barcodeY,
        width: barcodeWidth,
        height: barcodeHeight,
      });
    };

    // Draw barcode on first page footer
    if (barcodeImage) {
      drawBarcodeFooter(firstPage);
      console.log('[PDF] Barcode drawn on first page');
    }

    // Add CV content and create pages
    console.log('[PDF] Adding CV content...');
    let currentPage = firstPage;
    const contentStartY = pageHeight - 300;
    const contentMinY = 160;
    let currentY = contentStartY;
    
    // Handle cv.content as either string or object
    const buildContentItems = (content) => {
      const items = [];
      const addHeader = (title) => {
        items.push({ type: 'spacer' });
        items.push({ type: 'header', text: title });
      };
      const addLine = (text) => {
        wrapText(text, 90).forEach((line) => items.push({ type: 'line', text: line }));
      };
      const addBullet = (text) => {
        wrapText(text, 86).forEach((line, index) => {
          const bullet = index === 0 ? `• ${line}` : `  ${line}`;
          items.push({ type: 'line', text: bullet });
        });
      };

      if (!content || typeof content !== 'object') {
        if (typeof cv.content === 'string' && cv.content.trim().length > 0) {
          cv.content.split('\n').forEach((line) => addLine(line));
        } else {
          addLine('No content available');
        }
        return items;
      }

      addHeader('Personal Information');
      if (content.fullName) addLine(`Name: ${content.fullName}`);
      if (content.email) addLine(`Email: ${content.email}`);
      if (content.phone) addLine(`Phone: ${content.phone}`);
      if (content.location) addLine(`Location: ${content.location}`);

      if (content.summary) {
        addHeader('Professional Summary');
        addLine(content.summary);
      }

      if (Array.isArray(content.experience) && content.experience.length > 0) {
        addHeader('Work Experience');
        content.experience.forEach((exp, index) => {
          const header = [exp.position, exp.company].filter(Boolean).join(' - ');
          addLine(header || `Experience ${index + 1}`);
          if (exp.duration) addLine(`Duration: ${exp.duration}`);
          if (exp.description) addBullet(exp.description);
        });
      }

      if (Array.isArray(content.education) && content.education.length > 0) {
        addHeader('Education');
        content.education.forEach((edu, index) => {
          const header = [edu.degree, edu.field, edu.institution].filter(Boolean).join(' - ');
          addLine(header || `Education ${index + 1}`);
          if (edu.year) addLine(`Year: ${edu.year}`);
        });
      }

      if (Array.isArray(content.skills) && content.skills.length > 0) {
        addHeader('Skills');
        content.skills.forEach((skill) => {
          const detail = [skill.skill, skill.proficiency].filter(Boolean).join(' - ');
          if (detail) addBullet(detail);
        });
      }

      if (Array.isArray(content.projects) && content.projects.length > 0) {
        addHeader('Projects');
        content.projects.forEach((project, index) => {
          addLine(project.title || `Project ${index + 1}`);
          if (project.description) addBullet(project.description);
          if (project.link) addLine(`Link: ${project.link}`);
        });
      }

      if (Array.isArray(content.certifications) && content.certifications.length > 0) {
        addHeader('Certifications');
        content.certifications.forEach((cert, index) => {
          const detail = [cert.name, cert.issuer].filter(Boolean).join(' - ');
          addLine(detail || `Certification ${index + 1}`);
          if (cert.date) addLine(`Date: ${cert.date}`);
        });
      }

      if (Array.isArray(content.languages) && content.languages.length > 0) {
        addHeader('Languages');
        content.languages.forEach((lang) => {
          const detail = [lang.language, lang.proficiency].filter(Boolean).join(' - ');
          if (detail) addBullet(detail);
        });

        const now = new Date();
        const formattedDateTime = now.toLocaleString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
        addLine(`Date & Time: ${formattedDateTime}`);
        addLine(`Full Name: ${userName}`);
      }

      return items;
    };

    const contentItems = buildContentItems(contentObject);

    for (const item of contentItems) {
      if (currentY < contentMinY) {
        // Add new page if needed
        currentPage = pdfDoc.addPage(pageSize);
        currentY = pageHeight - 50;
        
        // Add barcode to footer of new page
        drawBarcodeFooter(currentPage);
      }

      if (item.type === 'header') {
        currentPage.drawText(item.text, {
          x: 50,
          y: currentY,
          size: 12,
          font: font,
          color: primaryColor,
        });
        currentY -= 16;
      } else if (item.type === 'line') {
        currentPage.drawText(item.text, {
          x: 55,
          y: currentY,
          size: 11,
          font: font,
          color: textColor,
        });
        currentY -= 16;
      } else {
        currentY -= 10;
      }
    }

    console.log('[PDF] Content added to all pages');

    // Add QR code on the last page (near full name and date)
    try {
      console.log('[PDF] Generating QR code for last page...');
      const qrData = `CV-${cvId}-${Date.now()}`;
      const qrBuffer = await QRCode.toBuffer(qrData, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        width: 200,
      });
      const qrImage = await pdfDoc.embedPng(qrBuffer);
      
      // Get the last page or create one if needed
      const lastPage = pdfDoc.getPages()[pdfDoc.getPages().length - 1];
      
      const signDate = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      
      // Signature details on left side
      const sigX = 50;
      const sigDetailsY = 280;
      
      lastPage.drawText('Signed by:', { x: sigX, y: sigDetailsY, size: 12, font: font });
      lastPage.drawText(userName, { x: sigX, y: sigDetailsY - 25, size: 11, font: font });
      
      lastPage.drawText('Institution:', { x: sigX, y: sigDetailsY - 60, size: 12, font: font });
      lastPage.drawText('Organization', { x: sigX, y: sigDetailsY - 85, size: 11, font: font });
      
      lastPage.drawText('Signed at:', { x: sigX, y: sigDetailsY - 120, size: 12, font: font });
      lastPage.drawText(signDate.split(' ')[0] + ' ' + signDate.split(' ')[1], { 
        x: sigX, 
        y: sigDetailsY - 145, 
        size: 11, 
        font: font 
      });
      
      // Full name and QR code on same line at bottom
      const bottomY = 120;
      const qrSize = 80;
      const qrX = pageWidth - qrSize - 50;  // Right side
      
      // Draw full name on left
      lastPage.drawText(userName, { 
        x: 50, 
        y: bottomY, 
        size: 13, 
        font: font 
      });
      
      // Draw QR code on right (same line)
      lastPage.drawImage(qrImage, {
        x: qrX,
        y: bottomY - 40,  // Slightly lower to align visually
        width: qrSize,
        height: qrSize,
      });
      
      console.log('[PDF] QR code added to last page with corrected layout');
    } catch (e) {
      console.warn('[PDF] QR code failed:', e.message);
    }

    // Ensure barcode is applied to all pages (including last page updates)
    if (barcodeImage) {
      for (const page of pdfDoc.getPages()) {
        drawBarcodeFooter(page);
      }
      console.log('[PDF] Barcode applied to all pages');
    }

    // Save PDF
    console.log('[PDF] Saving PDF to bytes...');
    const pdfBytes = await pdfDoc.save();

    // Write to file
    const timestamp = Date.now();
    const fileName = `cv_${cvId}_${timestamp}.pdf`;
    const filePath = path.join(__dirname, '../uploads', fileName);
    
    console.log(`[PDF] Writing PDF file to ${filePath}...`);
    fs.writeFileSync(filePath, pdfBytes);
    console.log('[PDF] PDF file written successfully');

    // Send response
    res.json({
      message: 'PDF generated successfully',
      pdfPath: `uploads/${fileName}`,
      fileName: fileName,
    });
    console.log('[PDF] Response sent');

  } catch (error) {
    console.error('[PDF] Error:', error.message);
    console.error(error.stack);
    res.status(500).json({
      error: 'Failed to generate PDF',
      details: error.message,
    });
  }
});

export default router;
