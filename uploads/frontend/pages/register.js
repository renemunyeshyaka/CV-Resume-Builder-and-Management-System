
import React, { useState } from 'react';
import axios from 'axios';
import Link from 'next/link';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const validate = () => {
    const errors = {};
    if (!name.trim()) errors.name = 'Name is required.';
    if (!email.trim()) errors.email = 'Email is required.';
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) errors.email = 'Invalid email address.';
    if (!password) errors.password = 'Password is required.';
    else if (password.length < 6) errors.password = 'Password must be at least 6 characters.';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;
    setLoading(true);
    try {
      await axios.post('http://localhost:4000/api/auth/register', { email, password, name });
      setSuccess('Registration successful! You can now log in.');
      setEmail(''); setPassword(''); setName('');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div style={{
      maxWidth: 400,
      margin: '60px auto',
      background: 'rgba(255,255,255,0.95)',
      borderRadius: 12,
      boxShadow: '0 2px 16px #dbeafe',
      padding: '32px 24px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <h2 style={{ color: '#2a7ae2', marginBottom: 24 }}>Register</h2>
      <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ width: '100%' }}>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={e => setName(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: 6, border: fieldErrors.name ? '1.5px solid #e53e3e' : '1px solid #bbb' }}
          />
          {fieldErrors.name && <span style={{ color: '#e53e3e', fontSize: '0.95rem' }}>{fieldErrors.name}</span>}
        </div>
        <div style={{ width: '100%' }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: 6, border: fieldErrors.email ? '1.5px solid #e53e3e' : '1px solid #bbb' }}
            required
          />
          {fieldErrors.email && <span style={{ color: '#e53e3e', fontSize: '0.95rem' }}>{fieldErrors.email}</span>}
        </div>
        <div style={{ width: '100%' }}>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: 6, border: fieldErrors.password ? '1.5px solid #e53e3e' : '1px solid #bbb' }}
            required
          />
          {fieldErrors.password && <span style={{ color: '#e53e3e', fontSize: '0.95rem' }}>{fieldErrors.password}</span>}
        </div>
        <button
          type="submit"
          style={{
            background: loading ? '#b6d4fe' : '#2a7ae2',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '12px',
            fontWeight: 'bold',
            fontSize: '1.1rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s'
          }}
          disabled={loading}
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
      {error && <p style={{ color: '#e53e3e', marginTop: 16 }}>{error}</p>}
      {success && <p style={{ color: '#38a169', marginTop: 16 }}>{success}</p>}
      <Link href="/" style={{ marginTop: 24, color: '#2a7ae2', textDecoration: 'underline', fontWeight: 'bold', fontSize: '1rem' }}>
        Go back home
      </Link>
    </div>
  );
}
