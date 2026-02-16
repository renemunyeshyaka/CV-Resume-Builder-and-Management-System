-- Migration: Add system_settings table for admin configuration
-- Run this migration after 001_add_profile_fields.sql

-- Create system_settings table
CREATE TABLE IF NOT EXISTS system_settings (
    id SERIAL PRIMARY KEY,
    max_cv_per_user INTEGER DEFAULT 10,
    max_file_size_mb INTEGER DEFAULT 5,
    require_email_verification BOOLEAN DEFAULT true,
    enable_otp_login BOOLEAN DEFAULT true,
    session_timeout_minutes INTEGER DEFAULT 60,
    allowed_file_types VARCHAR(255) DEFAULT '.pdf,.doc,.docx,.jpg,.png',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default settings
INSERT INTO system_settings (max_cv_per_user, max_file_size_mb, require_email_verification, enable_otp_login, session_timeout_minutes, allowed_file_types)
VALUES (10, 5, true, true, 60, '.pdf,.doc,.docx,.jpg,.png')
ON CONFLICT DO NOTHING;

-- Verify the table was created
SELECT * FROM system_settings;
