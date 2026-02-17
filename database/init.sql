-- Migration: Add active and activation_token columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS activation_token VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user';
-- PostgreSQL initialization script for CV/Resume Builder
-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    phone VARCHAR(20),
    location VARCHAR(255),
    occupation VARCHAR(255),
    bio TEXT,
    profile_picture VARCHAR(255),
    signature VARCHAR(255),
    reset_token VARCHAR(255),
    reset_token_expires TIMESTAMP,
    role VARCHAR(50) DEFAULT 'user',
    active BOOLEAN DEFAULT FALSE,
    activation_token VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CVs table
CREATE TABLE IF NOT EXISTS cvs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    title VARCHAR(255),
    content JSONB,
    pdf_path VARCHAR(255),
    qr_code VARCHAR(255),
    barcode VARCHAR(255),
    watermark VARCHAR(255),
    version INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CV version history
CREATE TABLE IF NOT EXISTS cv_versions (
    id SERIAL PRIMARY KEY,
    cv_id INTEGER REFERENCES cvs(id),
    content JSONB,
    version INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
