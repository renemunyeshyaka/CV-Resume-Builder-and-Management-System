-- Migration: Add signing fields to cvs table
-- Add signed_at, signed_by, and status columns for CV signing workflow
-- Also modify qr_code and barcode columns to TEXT for Base64 data URLs

ALTER TABLE cvs ADD COLUMN IF NOT EXISTS signed_at TIMESTAMP;
ALTER TABLE cvs ADD COLUMN IF NOT EXISTS signed_by INTEGER REFERENCES users(id);
ALTER TABLE cvs ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'draft';

-- Change qr_code and barcode from VARCHAR(255) to TEXT for Base64 data URLs
ALTER TABLE cvs ALTER COLUMN qr_code TYPE TEXT;
ALTER TABLE cvs ALTER COLUMN barcode TYPE TEXT;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_cvs_status ON cvs(status);
CREATE INDEX IF NOT EXISTS idx_cvs_signed_by ON cvs(signed_by);
