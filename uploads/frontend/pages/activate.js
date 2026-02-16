import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Activate() {
  const router = useRouter();
  const [status, setStatus] = useState('activating');
  const [message, setMessage] = useState('Activating...');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const token = router.query.token;
    if (!token) return;
    
    axios.get(`http://localhost:4000/api/auth/activate?token=${token}`)
      .then(() => {
        setStatus('success');
        setMessage('Account activated! You can now log in.');
      })
      .catch(() => {
        setStatus('error');
        setMessage('Activation failed or link expired.');
      });
  }, [router.query.token]);

  useEffect(() => {
    if (status === 'success') {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            router.push('/login-otp');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [status, router]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '20px' }}>
      <div style={{ background: 'white', padding: '50px 40px', borderRadius: '12px', boxShadow: '0 15px 50px rgba(0, 0, 0, 0.2)', textAlign: 'center', maxWidth: '500px', width: '100%' }}>
        <h2 style={{ color: '#333', marginBottom: '30px', fontSize: '32px', fontWeight: '700' }}>Account Activation</h2>
        
        {status === 'activating' && (
          <p style={{ margin: '25px 0', padding: '20px', borderRadius: '8px', fontSize: '18px', background: '#d1ecf1', color: '#0c5460', border: '2px solid #bee5eb' }}>{message}</p>
        )}
        
        {status === 'success' && (
          <>
            <div style={{ fontSize: '60px', marginBottom: '20px', color: '#28a745' }}>✓</div>
            <p style={{ margin: '25px 0', padding: '20px', borderRadius: '8px', fontSize: '18px', background: '#d4edda', color: '#155724', border: '2px solid #c3e6cb' }}>{message}</p>
            <p style={{ fontSize: '16px', color: '#666', marginTop: '15px' }}>
              Redirecting to login-otp in {countdown} seconds...
            </p>
            <Link href="/login-otp" style={{ display: 'inline-block', marginTop: '20px', padding: '14px 40px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', textDecoration: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '16px', boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)' }}>
              Go to login-otp Now
            </Link>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div style={{ fontSize: '60px', marginBottom: '20px', color: '#dc3545' }}>✗</div>
            <p style={{ margin: '25px 0', padding: '20px', borderRadius: '8px', fontSize: '18px', background: '#f8d7da', color: '#721c24', border: '2px solid #f5c6cb' }}>{message}</p>
            <Link href="/login-otp" style={{ display: 'inline-block', marginTop: '30px', padding: '14px 40px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', textDecoration: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '16px', boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)' }}>
              Go back to login-otp
            </Link>
          </>
        )}
      </div>
    </div>
  );
}