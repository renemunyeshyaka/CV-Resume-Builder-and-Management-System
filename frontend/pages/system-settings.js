import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function SystemSettings() {
  const router = useRouter();
  const [settings, setSettings] = useState({
    max_cv_per_user: 10,
    max_file_size_mb: 5,
    require_email_verification: true,
    enable_otp_login: true,
    session_timeout_minutes: 60,
    allowed_file_types: '.pdf,.doc,.docx,.jpg,.png'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const response = await axios.get(`${API_URL}/api/admin/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data) {
        setSettings(response.data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching settings:', error);
      setLoading(false);
    }
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    const token = localStorage.getItem('token');

    try {
      await axios.put(`${API_URL}/api/admin/settings`, settings, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showMessage('Settings saved successfully', 'success');
    } catch (error) {
      showMessage(error.response?.data?.error || 'Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;

  return (
    <div style={{ padding: '40px', minHeight: '100vh', background: '#f5f5f5' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#333', marginBottom: '10px' }}>System Settings</h1>
          <button onClick={() => router.push('/admin-dashboard')} style={{ background: 'none', border: 'none', color: '#667eea', cursor: 'pointer', fontSize: '14px' }}>← Back to Dashboard</button>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div style={{ padding: '15px', marginBottom: '20px', borderRadius: '5px', background: message.type === 'success' ? '#d4edda' : '#f8d7da', color: message.type === 'success' ? '#155724' : '#721c24', border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}` }}>
            {message.text}
          </div>
        )}

        {/* Settings Form */}
        <form onSubmit={handleSaveSettings}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '10px', marginBottom: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '20px', color: '#333' }}>General Settings</h2>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#333' }}>Maximum CVs per User</label>
              <input
                type="number"
                min="1"
                max="100"
                value={settings.max_cv_per_user}
                onChange={(e) => setSettings({...settings, max_cv_per_user: parseInt(e.target.value)})}
                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '14px' }}
              />
              <small style={{ color: '#666', fontSize: '12px' }}>Number of CVs each user can create</small>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#333' }}>Maximum File Size (MB)</label>
              <input
                type="number"
                min="1"
                max="50"
                value={settings.max_file_size_mb}
                onChange={(e) => setSettings({...settings, max_file_size_mb: parseInt(e.target.value)})}
                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '14px' }}
              />
              <small style={{ color: '#666', fontSize: '12px' }}>Maximum size for uploaded files (photos, signatures)</small>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#333' }}>Session Timeout (Minutes)</label>
              <input
                type="number"
                min="15"
                max="480"
                value={settings.session_timeout_minutes}
                onChange={(e) => setSettings({...settings, session_timeout_minutes: parseInt(e.target.value)})}
                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '14px' }}
              />
              <small style={{ color: '#666', fontSize: '12px' }}>How long users stay logged in without activity</small>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#333' }}>Allowed File Types</label>
              <input
                type="text"
                value={settings.allowed_file_types}
                onChange={(e) => setSettings({...settings, allowed_file_types: e.target.value})}
                placeholder=".pdf,.jpg,.png"
                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '14px' }}
              />
              <small style={{ color: '#666', fontSize: '12px' }}>Comma-separated file extensions</small>
            </div>
          </div>

          <div style={{ background: 'white', padding: '30px', borderRadius: '10px', marginBottom: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '20px', color: '#333' }}>Security Settings</h2>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={settings.require_email_verification}
                  onChange={(e) => setSettings({...settings, require_email_verification: e.target.checked})}
                  style={{ marginRight: '10px', width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#333' }}>Require Email Verification</span>
              </label>
              <small style={{ color: '#666', fontSize: '12px', marginLeft: '28px' }}>Users must verify their email before accessing the system</small>
            </div>

            <div style={{ marginBottom: '0' }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={settings.enable_otp_login}
                  onChange={(e) => setSettings({...settings, enable_otp_login: e.target.checked})}
                  style={{ marginRight: '10px', width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#333' }}>Enable OTP Login</span>
              </label>
              <small style={{ color: '#666', fontSize: '12px', marginLeft: '28px' }}>Require one-time password for each login</small>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '15px' }}>
            <button
              type="submit"
              disabled={saving}
              style={{ padding: '12px 30px', background: '#667eea', color: 'white', border: 'none', borderRadius: '5px', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '14px', opacity: saving ? 0.7 : 1 }}
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
            <button
              type="button"
              onClick={fetchSettings}
              style={{ padding: '12px 30px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}
            >
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}