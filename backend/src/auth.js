import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});
import nodemailer from 'nodemailer';

const router = express.Router();

// Forgot password: send reset email
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    if (!user) return res.status(404).json({ error: 'User not found' });
    // Generate reset token
    const resetToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await pool.query('UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE id = $3', [resetToken, expires, user.id]);
    // Send reset email
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.example.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER || 'user@example.com',
        pass: process.env.SMTP_PASS || 'password',
      },
    });
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@example.com',
      to: email,
      subject: 'Password Reset Request',
      html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. This link expires in 1 hour.</p>`
    });
    res.json({ message: 'Password reset email sent' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send reset email' });
  }
});

// Reset password: use token
router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ error: 'Token and new password required' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [payload.email]);
    const user = result.rows[0];
    if (!user || user.reset_token !== token || !user.reset_token_expires) return res.status(400).json({ error: 'Invalid or expired token' });
    if (new Date() > new Date(user.reset_token_expires)) return res.status(400).json({ error: 'Token expired' });
    const hash = await bcrypt.hash(password, 10);
    await pool.query('UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL WHERE id = $2', [hash, user.id]);
    res.json({ message: 'Password reset successful' });
  } catch (err) {
    res.status(400).json({ error: 'Invalid or expired token' });
  }
});


// Register with activation email
router.post('/register', async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  try {
    const hash = await bcrypt.hash(password, 10);
    // Generate activation token
    let jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      // Generate a random secret if not defined
      jwtSecret = require('crypto').randomBytes(32).toString('hex');
      console.warn('JWT_SECRET not found in environment. Generated secret:', jwtSecret);
    }
    const activationToken = jwt.sign({ email }, jwtSecret, { expiresIn: '1d' });
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, name, active, activation_token) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, name',
      [email, hash, name || null, false, activationToken]
    );

    // Send activation email
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.example.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      logger: true,
      debug: true
    });
    const activationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/activate?token=${activationToken}`;
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@example.com',
      to: email,
      subject: 'Activate your account',
      html: `<p>Click <a href="${activationUrl}">here</a> to activate your account.</p>`
    });

    res.status(201).json({ message: 'Registration successful. Please check your email to activate your account.' });
  } catch (err) {
    console.log('Registration error:', err);
    if (err.code === '23505' && err.constraint === 'users_email_key') {
      return res.status(409).json({ error: 'Email already registered.' });
    }
    res.status(500).json({ error: 'Registration failed.' });
  }
});
// Activate account
router.get('/activate', async (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).json({ error: 'No activation token' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // Find user with matching email and activation_token
    const result = await pool.query('SELECT * FROM users WHERE email = $1 AND activation_token = $2', [payload.email, token]);
    const user = result.rows[0];
    if (!user) return res.status(400).json({ error: 'Activation failed or link expired' });
    // Activate user
    const update = await pool.query('UPDATE users SET active = true, activation_token = NULL WHERE id = $1 RETURNING id, email, active', [user.id]);
    res.json({ message: 'Account activated', user: update.rows[0] });
  } catch (err) {
    res.status(400).json({ error: 'Invalid or expired activation token' });
  }
});


// Login Step 1: Validate credentials, send OTP
router.post('/login-otp', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    if (!user.active) return res.status(403).json({ error: 'Account not activated' });
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min
    await pool.query('UPDATE users SET otp = $1, otp_expires = $2 WHERE id = $3', [otp, otpExpires, user.id]);

    // Send OTP email
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.example.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      logger: true,
      debug: true
    });
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@example.com',
      to: email,
      subject: 'Your OTP Code',
      html: `<p>Your OTP code is <b>${otp}</b>. It expires in 10 minutes.</p>`
    });

    res.json({ message: 'OTP sent to your email', userId: user.id });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed', details: err.message });
  }
});

// Login Step 1 (OTP variant) - alias for /login
router.post('/login-otp', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    if (!user.active) return res.status(403).json({ error: 'Account not activated' });
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min
    await pool.query('UPDATE users SET otp = $1, otp_expires = $2 WHERE id = $3', [otp, otpExpires, user.id]);

    // Send OTP email
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.example.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      logger: true,
      debug: true
    });
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@example.com',
      to: email,
      subject: 'Your OTP Code',
      html: `<p>Your OTP code is <b>${otp}</b>. It expires in 10 minutes.</p>`
    });

    res.json({ message: 'OTP sent to your email', userId: user.id });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed', details: err.message });
  }
});

// Login Step 2: Verify OTP and issue JWT
router.post('/verify-otp', async (req, res) => {
  const { userId, otp } = req.body;
  if (!userId || !otp) return res.status(400).json({ error: 'User ID and OTP required' });
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    const user = result.rows[0];
    if (!user || !user.otp || !user.otp_expires) return res.status(401).json({ error: 'OTP not found' });
    if (user.otp !== otp) return res.status(401).json({ error: 'Invalid OTP' });
    if (new Date() > new Date(user.otp_expires)) return res.status(401).json({ error: 'OTP expired' });
    // Clear OTP
    await pool.query('UPDATE users SET otp = NULL, otp_expires = NULL WHERE id = $1', [userId]);
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ 
      token, 
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name,
        role: user.role || 'user'
      } 
    });
  } catch (err) {
    console.error('OTP verification error:', err);
    res.status(500).json({ error: 'OTP verification failed', details: err.message });
  }
});

// Auth middleware
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

export default router;

// Get current user info
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, name, phone, location, occupation, bio, profile_picture, signature, role, active, created_at FROM users WHERE id = $1', 
      [req.user.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Fetch user error:', err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  const { name, phone, location, occupation, bio, profile_picture, signature } = req.body;
  
  try {
    // Build dynamic update query based on provided fields
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(name);
    }
    if (phone !== undefined) {
      updates.push(`phone = $${paramCount++}`);
      values.push(phone);
    }
    if (location !== undefined) {
      updates.push(`location = $${paramCount++}`);
      values.push(location);
    }
    if (occupation !== undefined) {
      updates.push(`occupation = $${paramCount++}`);
      values.push(occupation);
    }
    if (bio !== undefined) {
      updates.push(`bio = $${paramCount++}`);
      values.push(bio);
    }
    if (profile_picture !== undefined) {
      updates.push(`profile_picture = $${paramCount++}`);
      values.push(profile_picture);
    }
    if (signature !== undefined) {
      updates.push(`signature = $${paramCount++}`);
      values.push(signature);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    // Add user ID as the last parameter
    values.push(req.user.id);

    const query = `
      UPDATE users 
      SET ${updates.join(', ')} 
      WHERE id = $${paramCount}
      RETURNING id, email, name, phone, location, occupation, bio, profile_picture, signature, role, created_at
    `;

    const result = await pool.query(query, values);
    
    if (!result.rows[0]) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ 
      message: 'Profile updated successfully', 
      user: result.rows[0] 
    });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ error: 'Failed to update profile', details: err.message });
  }
});
