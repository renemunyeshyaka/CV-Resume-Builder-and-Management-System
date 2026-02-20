import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function ResetPassword() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [tokenValid, setTokenValid] = useState(null);

  // Extract token from URL query params
  useEffect(() => {
    if (router.isReady) {
      const { token: queryToken } = router.query;
      if (queryToken) {
        setToken(queryToken);
        setTokenValid(true);
      } else {
        setError('No reset token found. Please check your email link.');
        setTokenValid(false);
      }
    }
  }, [router.isReady, router.query]);

  const validateReset = () => {
    const errors = {};
    if (!newPassword) {
      errors.newPassword = 'New password is required.';
    } else if (newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters.';
    }
    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password.';
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }
    return errors;
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    const errors = validateReset();
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/auth/reset-password`, {
        token,
        password: newPassword
      });

      setSuccess(true);
      setNewPassword('');
      setConfirmPassword('');

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login-otp');
      }, 3000);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to reset password. Please try again.';
      setError(errorMsg);
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
      marginBottom: 24,
      fontSize: '1.5rem',
      fontWeight: 'bold'
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
      fontSize: '1rem',
      border: '1px solid #bbb',
      boxSizing: 'border-box'
    },
    inputError: {
      borderColor: '#e53e3e',
      borderWidth: '1.5px'
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
    buttonHover: {
      background: '#2461c0'
    },
    error: {
      color: '#e53e3e',
      marginTop: 16,
      padding: '10px',
      background: '#fed7d7',
      borderRadius: 6,
      textAlign: 'center'
    },
    success: {
      color: '#38a169',
      marginTop: 16,
      padding: '10px',
      background: '#c6f6d5',
      borderRadius: 6,
      textAlign: 'center',
      fontWeight: 'bold'
    },
    link: {
      marginTop: 24,
      color: '#2a7ae2',
      textDecoration: 'underline',
      fontWeight: 'bold',
      fontSize: '1rem'
    },
    loadingMessage: {
      color: '#2a7ae2',
      textAlign: 'center',
      padding: '20px',
      fontSize: '1rem'
    }
  };

  // Show loading while checking token
  if (tokenValid === null) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingMessage}>Loading...</div>
      </div>
    );
  }

  // Show error if no token
  if (!tokenValid) {
    return (
      <div style={styles.container}>
        <h2 style={styles.title}>Reset Password</h2>
        <div style={styles.error} role="alert">{error}</div>
        <Link href="/login-otp" style={styles.link}>
          Back to Login
        </Link>
      </div>
    );
  }

  // Show success message
  if (success) {
    return (
      <div style={styles.container}>
        <h2 style={styles.title}>Password Reset Successful</h2>
        <div style={styles.success} role="alert">
          Your password has been reset successfully!<br />
          Redirecting to login page in 3 seconds...
        </div>
        <Link href="/login-otp" style={styles.link}>
          Go to Login Now
        </Link>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Reset Your Password</h2>

      <form onSubmit={handleResetPassword} style={styles.form}>
        <div style={styles.inputWrapper}>
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            style={{
              ...styles.input,
              ...(fieldErrors.newPassword && styles.inputError)
            }}
            aria-label="New password"
            aria-invalid={!!fieldErrors.newPassword}
            required
          />
          {fieldErrors.newPassword && (
            <span style={styles.errorText} role="alert">
              {fieldErrors.newPassword}
            </span>
          )}
        </div>

        <div style={styles.inputWrapper}>
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            style={{
              ...styles.input,
              ...(fieldErrors.confirmPassword && styles.inputError)
            }}
            aria-label="Confirm password"
            aria-invalid={!!fieldErrors.confirmPassword}
            required
          />
          {fieldErrors.confirmPassword && (
            <span style={styles.errorText} role="alert">
              {fieldErrors.confirmPassword}
            </span>
          )}
        </div>

        <button
          type="submit"
          style={{
            ...styles.button,
            ...(loading && styles.buttonDisabled)
          }}
          disabled={loading}
          onMouseEnter={e => !loading && (e.target.style.background = '#2461c0')}
          onMouseLeave={e => (e.target.style.background = '#2a7ae2')}
        >
          {loading ? 'Resetting Password...' : 'Reset Password'}
        </button>
      </form>

      {error && (
        <div style={styles.error} role="alert">
          {error}
        </div>
      )}

      <Link href="/login-otp" style={styles.link}>
        Back to Login
      </Link>
    </div>
  );
}
