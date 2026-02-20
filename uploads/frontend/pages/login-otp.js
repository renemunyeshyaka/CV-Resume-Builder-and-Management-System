import React, { useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/router';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function LoginOTP() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userId, setUserId] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotCode, setForgotCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [forgotMsg, setForgotMsg] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  const validateLogin = () => {
    const errors = {};
    const trimmedEmail = email.trim();
    if (!trimmedEmail) errors.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) errors.email = 'Invalid email address.';
    if (!password) errors.password = 'Password is required.';
    else if (password.length < 6) errors.password = 'Password must be at least 6 characters.';
    return errors;
  };

  const validateOtp = () => {
    const errors = {};
    const trimmedOtp = otp.trim();
    if (!trimmedOtp) errors.otp = 'OTP is required.';
    else if (!/^\d{6}$/.test(trimmedOtp)) errors.otp = 'OTP must be 6 digits.';
    return errors;
  };

  const validateForgot = () => {
    const errors = {};
    const trimmedEmail = forgotEmail.trim();
    if (!trimmedEmail) errors.forgotEmail = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) errors.forgotEmail = 'Invalid email address.';
    return errors;
  };

  const validateReset = () => {
    const errors = {};
    if (!forgotCode.trim()) errors.forgotCode = 'Code is required.';
    if (!newPassword) errors.newPassword = 'New password is required.';
    else if (newPassword.length < 6) errors.newPassword = 'Password must be at least 6 characters.';
    return errors;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    const errors = validateLogin();
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/auth/login-otp`, { 
        email: email.trim(), 
        password 
      });
      setUserId(res.data.userId);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    const errors = validateOtp();
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/auth/verify-otp`, { 
        userId, 
        otp: otp.trim() 
      });
      
      // Store token
      localStorage.setItem('token', res.data.token);
      
      // Get user role and redirect accordingly
      const userRole = res.data.user?.role || res.data.role;
      
      // Role-based routing
      if (userRole === 'admin') {
        router.push('/admin-dashboard');
      } else if (userRole === 'hr' || userRole === 'recruiter') {
        router.push('/hr-dashboard');
      } else {
        router.push('/user-dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'OTP verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    setForgotMsg('');
    setFieldErrors({});
    const errors = validateForgot();
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;
    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/auth/forgot-password`, { 
        email: forgotEmail.trim() 
      });
      setForgotMsg('A reset code has been sent to your email.');
      setForgotStep(2);
    } catch (err) {
      setForgotMsg(err.response?.data?.error || 'Failed to send reset code');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setForgotMsg('');
    setFieldErrors({});
    const errors = validateReset();
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;
    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/auth/reset-password`, { 
        email: forgotEmail.trim(), 
        code: forgotCode.trim(), 
        newPassword 
      });
      setForgotMsg('Password reset successful! You can now log in.');
      setResetSuccess(true);
      setTimeout(() => {
        setShowForgotPassword(false);
        setResetSuccess(false);
        setForgotStep(1);
        setForgotEmail('');
        setForgotCode('');
        setNewPassword('');
      }, 2000);
    } catch (err) {
      setForgotMsg(err.response?.data?.error || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      maxWidth: 400,
      margin: '60px auto',
      background: 'rgba(255,255,255,0.95)',
      borderRadius: 12,
      boxShadow: '0 2px 16px #dbeafe',
      padding: '32px 24px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    },
    title: {
      color: '#2a7ae2',
      marginBottom: 24
    },
    form: {
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    },
    inputWrapper: {
      width: '100%'
    },
    input: {
      width: '100%',
      padding: '10px',
      borderRadius: 6,
      fontSize: '1rem'
    },
    errorText: {
      color: '#e53e3e',
      fontSize: '0.9rem',
      marginTop: 4
    },
    button: {
      background: '#2a7ae2',
      color: '#fff',
      border: 'none',
      borderRadius: 6,
      padding: '12px',
      fontWeight: 'bold',
      fontSize: '1.1rem',
      cursor: 'pointer',
      transition: 'background 0.2s'
    },
    buttonDisabled: {
      background: '#b6d4fe',
      cursor: 'not-allowed'
    },
    textButton: {
      background: 'none',
      color: '#2a7ae2',
      border: 'none',
      textDecoration: 'underline',
      cursor: 'pointer',
      fontSize: '0.98rem'
    },
    error: {
      color: '#e53e3e',
      marginTop: 16
    },
    success: {
      color: '#38a169',
      marginTop: 16,
      textAlign: 'center'
    },
    link: {
      marginTop: 24,
      color: '#2a7ae2',
      textDecoration: 'underline',
      fontWeight: 'bold',
      fontSize: '1rem'
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>
        {showForgotPassword ? 'Reset Password' : 'Login (OTP)'}
      </h2>

      {/* Login Step 1: Email & Password */}
      {step === 1 && !showForgotPassword && (
        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.inputWrapper}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{
                ...styles.input,
                border: fieldErrors.email ? '1.5px solid #e53e3e' : '1px solid #bbb'
              }}
              aria-label="Email"
              aria-invalid={!!fieldErrors.email}
              required
            />
            {fieldErrors.email && (
              <span style={styles.errorText} role="alert">{fieldErrors.email}</span>
            )}
          </div>
          <div style={styles.inputWrapper}>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{
                ...styles.input,
                border: fieldErrors.password ? '1.5px solid #e53e3e' : '1px solid #bbb'
              }}
              aria-label="Password"
              aria-invalid={!!fieldErrors.password}
              required
            />
            {fieldErrors.password && (
              <span style={styles.errorText} role="alert">{fieldErrors.password}</span>
            )}
          </div>
          <button
            type="submit"
            style={{
              ...styles.button,
              ...(loading && styles.buttonDisabled)
            }}
            disabled={loading}
          >
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </button>
          <div style={{ textAlign: 'right', marginTop: 8 }}>
            <button
              type="button"
              style={styles.textButton}
              onClick={() => setShowForgotPassword(true)}
            >
              Forgot Password?
            </button>
          </div>
        </form>
      )}

      {/* Login Step 2: OTP Verification */}
      {step === 2 && (
        <form onSubmit={handleVerifyOtp} style={styles.form}>
          <div style={styles.inputWrapper}>
            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={e => setOtp(e.target.value)}
              maxLength={6}
              style={{
                ...styles.input,
                border: fieldErrors.otp ? '1.5px solid #e53e3e' : '1px solid #bbb'
              }}
              aria-label="OTP"
              aria-invalid={!!fieldErrors.otp}
              required
            />
            {fieldErrors.otp && (
              <span style={styles.errorText} role="alert">{fieldErrors.otp}</span>
            )}
          </div>
          <button
            type="submit"
            style={{
              ...styles.button,
              ...(loading && styles.buttonDisabled)
            }}
            disabled={loading}
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
          <button
            type="button"
            style={styles.textButton}
            onClick={() => setStep(1)}
          >
            ← Back to login
          </button>
        </form>
      )}

      {/* Forgot Password: Enter Email */}
      {showForgotPassword && forgotStep === 1 && !resetSuccess && (
        <form onSubmit={handleForgot} style={styles.form}>
          <div style={styles.inputWrapper}>
            <input
              type="email"
              placeholder="Enter your email"
              value={forgotEmail}
              onChange={e => setForgotEmail(e.target.value)}
              style={{
                ...styles.input,
                border: fieldErrors.forgotEmail ? '1.5px solid #e53e3e' : '1px solid #bbb'
              }}
              aria-label="Email for password reset"
              aria-invalid={!!fieldErrors.forgotEmail}
              required
            />
            {fieldErrors.forgotEmail && (
              <span style={styles.errorText} role="alert">{fieldErrors.forgotEmail}</span>
            )}
          </div>
          <button
            type="submit"
            style={{
              ...styles.button,
              ...(loading && styles.buttonDisabled)
            }}
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Reset Code'}
          </button>
          <button
            type="button"
            style={styles.textButton}
            onClick={() => setShowForgotPassword(false)}
          >
            ← Back to login
          </button>
        </form>
      )}

      {/* Forgot Password: Enter Code & New Password */}
      {showForgotPassword && forgotStep === 2 && !resetSuccess && (
        <form onSubmit={handleReset} style={styles.form}>
          <div style={styles.inputWrapper}>
            <input
              type="text"
              placeholder="Enter reset code"
              value={forgotCode}
              onChange={e => setForgotCode(e.target.value)}
              style={{
                ...styles.input,
                border: fieldErrors.forgotCode ? '1.5px solid #e53e3e' : '1px solid #bbb'
              }}
              aria-label="Reset code"
              aria-invalid={!!fieldErrors.forgotCode}
              required
            />
            {fieldErrors.forgotCode && (
              <span style={styles.errorText} role="alert">{fieldErrors.forgotCode}</span>
            )}
          </div>
          <div style={styles.inputWrapper}>
            <input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              style={{
                ...styles.input,
                border: fieldErrors.newPassword ? '1.5px solid #e53e3e' : '1px solid #bbb'
              }}
              aria-label="New password"
              aria-invalid={!!fieldErrors.newPassword}
              required
            />
            {fieldErrors.newPassword && (
              <span style={styles.errorText} role="alert">{fieldErrors.newPassword}</span>
            )}
          </div>
          <button
            type="submit"
            style={{
              ...styles.button,
              ...(loading && styles.buttonDisabled)
            }}
            disabled={loading}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      )}

      {/* Success Message */}
      {resetSuccess && (
        <div style={styles.success} role="alert">
          {forgotMsg}
        </div>
      )}

      {/* Error Messages */}
      {error && <p style={styles.error} role="alert">{error}</p>}
      {forgotMsg && !resetSuccess && (
        <p 
          style={{
            ...styles.error,
            color: forgotMsg.includes('successful') ? '#38a169' : '#e53e3e'
          }} 
          role="alert"
        >
          {forgotMsg}
        </p>
      )}

      <Link href="/" style={styles.link}>
        Go back home
      </Link>
    </div>
  );
}