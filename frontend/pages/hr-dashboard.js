import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function HRDashboard() {
  const router = useRouter();
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ totalCVs: 0, pendingVerification: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    // Fetch user info
    axios.get(`${API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(res => {
      setUser(res.data);
    })
    .catch(() => {
      localStorage.removeItem('token');
      router.push('/login');
    });

    // Fetch HR statistics
    axios.get(`${API_URL}/api/cv/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(res => {
      setStats(res.data);
      setLoading(false);
    })
    .catch(() => {
      setLoading(false);
    });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>{t('messages.loading')}</div>;

  return (
    <div style={{ padding: '20px', minHeight: '100vh', background: '#f5f5f5' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', flexWrap: 'wrap', gap: '20px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#333' }}>{t('dashboard.hrDashboardTitle')}</h1>
          <button onClick={handleLogout} style={{ padding: '10px 20px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>{t('nav.logout')}</button>
        </div>

        {/* Welcome Card */}
        <div style={{ background: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginBottom: '30px' }}>
          <h2 style={{ fontSize: '24px', marginBottom: '10px', color: '#333' }}>{t('dashboard.welcomeBack')}, {user?.name || user?.email}!</h2>
          <p style={{ color: '#666', fontSize: '16px', margin: '0' }}>{t('dashboard.roleLabel')}: <strong>{user?.role}</strong></p>
        </div>

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '25px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', color: 'white' }}>
            <h3 style={{ fontSize: '14px', opacity: 0.9, margin: '0 0 10px 0' }}>{t('dashboard.totalCVs')}</h3>
            <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '0' }}>{stats.totalCVs}</p>
          </div>
          
          <div style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', padding: '25px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', color: 'white' }}>
            <h3 style={{ fontSize: '14px', opacity: 0.9, margin: '0 0 10px 0' }}>{t('dashboard.pendingVerification')}</h3>
            <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '0' }}>{stats.pendingVerification}</p>
          </div>
        </div>

        {/* Feature Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {/* View All CVs Card */}
          <div 
            style={{ 
              background: 'white', 
              padding: '30px', 
              borderRadius: '10px', 
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)', 
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              border: '2px solid transparent'
            }} 
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.3)';
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.borderColor = '#667eea';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = 'transparent';
            }}
            onClick={() => router.push('/all-cvs')}
          >
            <div style={{ fontSize: '40px', marginBottom: '15px' }}>📋</div>
            <h3 style={{ fontSize: '20px', marginBottom: '10px', color: '#333', fontWeight: 'bold' }}>{t('dashboard.viewAllCVs')}</h3>
            <p style={{ color: '#666', margin: '0', lineHeight: '1.5' }}>{t('dashboard.viewAllCVsDesc')}</p>
            <div style={{ marginTop: '15px', color: '#667eea', fontWeight: 'bold', fontSize: '14px' }}>
              {t('dashboard.viewCVsCta')} →
            </div>
          </div>

          {/* Verify Documents Card */}
          <div 
            style={{ 
              background: 'white', 
              padding: '30px', 
              borderRadius: '10px', 
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)', 
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              border: '2px solid transparent'
            }} 
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.3)';
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.borderColor = '#667eea';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = 'transparent';
            }}
            onClick={() => router.push('/verify-documents')}
          >
            <div style={{ fontSize: '40px', marginBottom: '15px' }}>✓</div>
            <h3 style={{ fontSize: '20px', marginBottom: '10px', color: '#333', fontWeight: 'bold' }}>{t('dashboard.verifyDocuments')}</h3>
            <p style={{ color: '#666', margin: '0', lineHeight: '1.5' }}>{t('dashboard.verifyDocumentsDesc')}</p>
            <div style={{ marginTop: '15px', color: '#667eea', fontWeight: 'bold', fontSize: '14px' }}>
              {t('dashboard.verifyNowCta')} →
            </div>
          </div>

          {/* Profile Card */}
          <div 
            style={{ 
              background: 'white', 
              padding: '30px', 
              borderRadius: '10px', 
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)', 
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              border: '2px solid transparent'
            }} 
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.3)';
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.borderColor = '#667eea';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = 'transparent';
            }}
            onClick={() => router.push('/profile')}
          >
            <div style={{ fontSize: '40px', marginBottom: '15px' }}>👤</div>
            <h3 style={{ fontSize: '20px', marginBottom: '10px', color: '#333', fontWeight: 'bold' }}>{t('dashboard.profileCardTitle')}</h3>
            <p style={{ color: '#666', margin: '0', lineHeight: '1.5' }}>{t('dashboard.profileCardDesc')}</p>
            <div style={{ marginTop: '15px', color: '#667eea', fontWeight: 'bold', fontSize: '14px' }}>
              {t('dashboard.editProfileCta')} →
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}