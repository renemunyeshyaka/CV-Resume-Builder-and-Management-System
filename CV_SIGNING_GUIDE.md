# CV Signing and Security Features Guide

## Overview

CVs can now be digitally signed before sharing or approval. When a CV is signed, security features (QR code, barcode, and watermark) are automatically generated and embedded in the PDF.

## How It Works

### 1. **Sign Your CV** (User Action)
   - Navigate to any CV preview page: `/preview/[id]`
   - Click the **"✍️ Sign CV"** button
   - The system automatically generates:
     - **QR Code**: Contains CV ID, timestamp, and user ID for verification
     - **Barcode**: Contains CV ID for quick scanning
     - **Watermark**: Contains signer name and date
   - CV status changes from "draft" to "signed"

### 2. **PDF Generation** (Automatic)
   - When you generate a PDF (Print/Save as PDF), the system:
     - Embeds the QR code (bottom right)
     - Embeds the barcode (bottom left)
     - Applies the watermark (center, diagonal)
     - Adds signature if available from profile
     - Displays "✓ Signed on [date]" indicator

### 3. **Verification** (HR/Admin Only)
   - HR/Admin can verify CVs using the verification page
   - The system checks for:
     - QR code presence
     - Barcode presence
     - Watermark/signature presence
   - Returns authentication status with details

## API Endpoints

### Sign CV
**POST** `/api/cv/:id/sign`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "CV signed successfully",
  "cv": { /* Updated CV object */ },
  "securityFeatures": {
    "qrCode": true,
    "barcode": true,
    "watermark": "Signed by John Doe on 2026-02-17",
    "signedAt": "2026-02-17T10:30:00.000Z",
    "signedBy": "John Doe"
  }
}
```

### Generate PDF with Security Features
**POST** `/api/pdfgen/:cvId`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "PDF generated",
  "pdfPath": "uploads/cv_2_1708167000000.pdf"
}
```

### Verify CV
**POST** `/api/cv/verify`

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "cvId": 2,
  "qrCode": "cv:2:1708167000000:5" // Optional
}
```

**Response:**
```json
{
  "isAuthentic": true,
  "message": "Document is authentic and verified.",
  "details": {
    "cvId": 2,
    "title": "Software Engineer CV",
    "userName": "John Doe",
    "userEmail": "john@example.com",
    "hasQRCode": true,
    "hasBarcode": true,
    "hasSignature": true,
    "qrMatches": true,
    "verifiedAt": "2026-02-17T10:35:00.000Z"
  }
}
```

## Database Schema Updates

New columns added to `cvs` table:

```sql
-- Migration: 003_add_signing_fields.sql
signed_at TIMESTAMP        -- When the CV was signed
signed_by INTEGER           -- User ID who signed (references users.id)
status VARCHAR(50)          -- CV status: 'draft', 'signed', 'verified'
```

## User Workflow

### Before Sharing CV:
1. Create/Edit your CV
2. Preview the CV
3. Click **"Sign CV"** to add security features
4. Generate PDF (security features are embedded)
5. Download and share

### CV States:
- **Draft**: Newly created, not signed
- **Signed**: User has signed (QR, barcode, watermark added)
- **Verified**: HR/Admin has verified authenticity (optional)

## Security Features Explained

### QR Code
- Contains: `cv:{cv_id}:{timestamp}:{user_id}`
- Location: Bottom right of PDF
- Purpose: Quick verification scan
- Size: 80x80 pixels

### Barcode
- Contains: CV ID
- Type: Code128
- Location: Bottom left of PDF
- Purpose: Document identification
- Size: 200x50 pixels

### Watermark
- Contains: "Signed by [Name] on [Date]"
- Location: Center, diagonal (45° rotation)
- Purpose: Visual authenticity indicator
- Color: Light gray (non-intrusive)

### Signature
- Uses uploaded signature from user profile
- Location: Below barcode
- Size: 120x40 pixels
- Purpose: Personal authentication

## Frontend Components

### Preview Page (`pages/preview/[id].js`)
- Shows CV content
- Displays signed status badge if signed
- **Sign CV** button (only for unsigned CVs)
- Print/Save as PDF button
- Success/error messages after signing

### Button States:
- **Normal**: Green "✍️ Sign CV" button
- **Signing**: Gray "⏳ Signing..." (disabled)
- **Signed**: Button hidden, green badge shown "✓ Signed"

## Testing the Feature

### 1. Run Database Migration (Required First Time)
```bash
sudo -u postgres psql -d cv_resume_db -f database/migrations/003_add_signing_fields.sql
```

### 2. Start Backend
```bash
cd backend
npm run dev
```

### 3. Start Frontend
```bash
cd frontend
npm run dev
```

### 4. Test Workflow
1. Login to your account
2. Create or select existing CV
3. Click "Preview" to view CV
4. Click "Sign CV" button
5. Wait for success message: "✓ CV signed successfully..."
6. Notice the green "✓ Signed" badge appears
7. Click "Print/Save as PDF"
8. Open downloaded PDF and verify:
   - QR code (bottom right)
   - Barcode (bottom left)
   - Watermark (center)
   - "✓ Signed on [date]" text (bottom)

### 5. Verify CV (HR/Admin Only)
1. Login with HR/Admin account
2. Navigate to verification page
3. Enter CV ID: 2
4. Click "Verify"
5. Check verification results

## Troubleshooting

### Sign Button Not Appearing
- Check if CV is already signed (green badge shown)
- Verify user is logged in
- Check browser console for errors

### PDF Generation Fails
- Ensure QR code and barcode are Base64 data URLs
- Check backend logs for image embedding errors
- Verify pdf-lib, qrcode, bwip-js packages are installed

### Verification Fails
- Ensure CV is signed (status = 'signed')
- Check database columns exist (run migration)
- Verify user has admin/hr role

## Notes

- Only unsigned CVs show the "Sign CV" button
- Signing is irreversible (cannot unsign)
- PDF generation works for both signed and unsigned CVs
- Unsigned CVs show generic security features
- Signed CVs show personalized security features
- Verification requires HR or Admin role
- QR codes and barcodes are stored as Base64 data URLs

## Future Enhancements

- [ ] Re-sign capability (with version increment)
- [ ] Multiple signatures (co-signing)
- [ ] Digital signature certificates (PKI)
- [ ] Blockchain-based verification
- [ ] Email notification on signing
- [ ] Audit trail for all signature events
- [ ] Custom watermark text
- [ ] QR code with external verification URL

---

Last Updated: 2026-02-17
