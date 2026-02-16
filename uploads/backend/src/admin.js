import express from 'express';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import { authenticateToken } from './auth.js';

const router = express.Router();
const { Pool } = pg;
const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Middleware to check admin role
async function isAdmin(req, res, next) {
  if (req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ error: 'Admin access required' });
}

// Get admin statistics
router.get('/stats', authenticateToken, isAdmin, async (req, res) => {
  try {
    const totalUsers = await pool.query('SELECT COUNT(*) FROM users');
    const totalCVs = await pool.query('SELECT COUNT(*) FROM cvs');
    const activeUsers = await pool.query('SELECT COUNT(*) FROM users WHERE active = true');

    res.json({
      totalUsers: parseInt(totalUsers.rows[0].count),
      totalCVs: parseInt(totalCVs.rows[0].count),
      pendingVerification: 0, // Feature not yet implemented
      activeUsers: parseInt(activeUsers.rows[0].count)
    });
  } catch (err) {
    console.error('Error fetching admin stats:', err);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// List all users
router.get('/users', authenticateToken, isAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, name, role, active, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Create user (admin)
router.post('/users', authenticateToken, isAdmin, async (req, res) => {
  const { email, password, name, role } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, name, role, is_active) VALUES ($1, $2, $3, $4, true) RETURNING id, email, name, role, is_active, created_at',
      [email, hash, name || null, role || 'user']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating user:', err);
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'User creation failed' });
  }
});

// Update user (admin)
router.put('/users/:id', authenticateToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  const { name, email, role } = req.body;
  
  try {
    const result = await pool.query(
      'UPDATE users SET name = $1, email = $2, role = $3 WHERE id = $4 RETURNING id, email, name, role, active, created_at',
      [name, email, role, id]
    );
    
    if (!result.rows[0]) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating user:', err);
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'User update failed' });
  }
});

// Toggle user activation status
router.patch('/users/:id/toggle-activation', authenticateToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  const { active } = req.body;
  
  try {
    const result = await pool.query(
      'UPDATE users SET active = $1 WHERE id = $2 RETURNING id, email, name, role, active',
      [active, id]
    );
    
    if (!result.rows[0]) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error toggling user activation:', err);
    res.status(500).json({ error: 'Failed to update user status' });
  }
});

// Delete user (admin)
router.delete('/users/:id', authenticateToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  
  // Prevent admin from deleting themselves
  if (parseInt(id) === req.user.id) {
    return res.status(400).json({ error: 'Cannot delete your own account' });
  }
  
  try {
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
    
    if (!result.rows[0]) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ error: 'User deletion failed' });
  }
});

// Get system settings
router.get('/settings', authenticateToken, isAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM system_settings LIMIT 1');
    
    if (result.rows.length === 0) {
      // Return default settings if none exist
      return res.json({
        max_cv_per_user: 10,
        max_file_size_mb: 5,
        require_email_verification: true,
        enable_otp_login: true,
        session_timeout_minutes: 60,
        allowed_file_types: '.pdf,.doc,.docx,.jpg,.png'
      });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching settings:', err);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Update system settings
router.put('/settings', authenticateToken, isAdmin, async (req, res) => {
  const { max_cv_per_user, max_file_size_mb, require_email_verification, enable_otp_login, session_timeout_minutes, allowed_file_types } = req.body;
  
  try {
    // Check if settings exist
    const existing = await pool.query('SELECT id FROM system_settings LIMIT 1');
    
    let result;
    if (existing.rows.length === 0) {
      // Insert new settings
      result = await pool.query(
        'INSERT INTO system_settings (max_cv_per_user, max_file_size_mb, require_email_verification, enable_otp_login, session_timeout_minutes, allowed_file_types) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [max_cv_per_user, max_file_size_mb, require_email_verification, enable_otp_login, session_timeout_minutes, allowed_file_types]
      );
    } else {
      // Update existing settings
      result = await pool.query(
        'UPDATE system_settings SET max_cv_per_user = $1, max_file_size_mb = $2, require_email_verification = $3, enable_otp_login = $4, session_timeout_minutes = $5, allowed_file_types = $6 WHERE id = $7 RETURNING *',
        [max_cv_per_user, max_file_size_mb, require_email_verification, enable_otp_login, session_timeout_minutes, allowed_file_types, existing.rows[0].id]
      );
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating settings:', err);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Get reports and analytics
router.get('/reports', authenticateToken, isAdmin, async (req, res) => {
  const { days = 30 } = req.query;
  
  try {
    // User statistics
    const totalUsers = await pool.query('SELECT COUNT(*) FROM users');
    const activeUsers = await pool.query('SELECT COUNT(*) FROM users WHERE active = true');
    const inactiveUsers = await pool.query('SELECT COUNT(*) FROM users WHERE active = false');
    const usersByRole = await pool.query('SELECT role, COUNT(*) as count FROM users GROUP BY role');
    
    // CV statistics
    const totalCVs = await pool.query('SELECT COUNT(*) FROM cvs');
    
    // Activity statistics (within date range)
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - parseInt(days));
    
    const recentRegistrations = await pool.query(
      'SELECT COUNT(*) FROM users WHERE created_at >= $1',
      [dateThreshold]
    );
    
    const recentLogins = { rows: [{ count: 0 }] }; // last_login column doesn't exist
    
    const recentCVs = await pool.query(
      'SELECT COUNT(*) FROM cvs WHERE created_at >= $1',
      [dateThreshold]
    );
    
    // Top users by CV count
    const topUsers = await pool.query(
      'SELECT u.id, u.name, u.email, COUNT(c.id) as cv_count FROM users u LEFT JOIN cvs c ON u.id = c.user_id GROUP BY u.id ORDER BY cv_count DESC LIMIT 10'
    );
    
    res.json({
      userStats: {
        total: parseInt(totalUsers.rows[0].count),
        active: parseInt(activeUsers.rows[0].count),
        inactive: parseInt(inactiveUsers.rows[0].count),
        byRole: usersByRole.rows.reduce((acc, row) => {
          acc[row.role] = parseInt(row.count);
          return acc;
        }, {})
      },
      cvStats: {
        total: parseInt(totalCVs.rows[0].count),
        verified: 0, // Feature not yet implemented
        pending: 0   // Feature not yet implemented
      },
      activityStats: {
        registrations: parseInt(recentRegistrations.rows[0].count),
        logins: parseInt(recentLogins.rows[0].count),
        cvCreated: parseInt(recentCVs.rows[0].count)
      },
      topUsers: topUsers.rows.map(user => ({
        ...user,
        cv_count: parseInt(user.cv_count)
      }))
    });
  } catch (err) {
    console.error('Error fetching reports:', err);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

export default router;
