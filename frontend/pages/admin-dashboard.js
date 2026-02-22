import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function AdminDashboard() {
  const router = useRouter();
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCVs: 0,
    pendingVerification: 0,
    activeUsers: 0
  });
  const [recentUsers, setRecentUsers] = useState([]);

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
      setLoading(false);
      
      // Fetch admin stats
      return axios.get(`${API_URL}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    })
    .then(res => {
      if (res) setStats(res.data);
      
      // Fetch recent users
      return axios.get(`${API_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    })
    .then(res => {
      if (res) setRecentUsers(res.data.slice(0, 5)); // Get top 5 recent users
    })
    .catch(() => {
      localStorage.removeItem('token');
      router.push('/login');
    });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  if (loading) return <div>{t('messages.loading')}</div>;

  return (
    <div style={{ padding: '40px', minHeight: '100vh', background: '#f5f5f5' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#333' }}>{t('adminDashboard.title')}</h1>
          <button onClick={handleLogout} style={{ padding: '10px 20px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>{t('nav.logout')}</button>
        </div>

        <div style={{ background: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginBottom: '30px' }}>
          <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>{t('adminDashboard.welcome')}, {user?.name || user?.email}!</h2>
          <p style={{ color: '#666', fontSize: '16px' }}>{t('adminDashboard.roleLabel')}: <strong>{user?.role}</strong></p>
        </div>

        {/* Statistics Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '25px', borderRadius: '10px', color: 'white', boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)' }}>
            <div style={{ fontSize: '14px', opacity: '0.9', marginBottom: '10px' }}>{t('adminDashboard.totalUsers')}</div>
            <div style={{ fontSize: '36px', fontWeight: 'bold' }}>{stats.totalUsers}</div>
          </div>
          <div style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', padding: '25px', borderRadius: '10px', color: 'white', boxShadow: '0 4px 15px rgba(245, 87, 108, 0.4)' }}>
            <div style={{ fontSize: '14px', opacity: '0.9', marginBottom: '10px' }}>{t('adminDashboard.totalCVs')}</div>
            <div style={{ fontSize: '36px', fontWeight: 'bold' }}>{stats.totalCVs}</div>
          </div>
          <div style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', padding: '25px', borderRadius: '10px', color: 'white', boxShadow: '0 4px 15px rgba(79, 172, 254, 0.4)' }}>
            <div style={{ fontSize: '14px', opacity: '0.9', marginBottom: '10px' }}>{t('adminDashboard.pendingVerification')}</div>
            <div style={{ fontSize: '36px', fontWeight: 'bold' }}>{stats.pendingVerification}</div>
          </div>
          <div style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', padding: '25px', borderRadius: '10px', color: 'white', boxShadow: '0 4px 15px rgba(67, 233, 123, 0.4)' }}>
            <div style={{ fontSize: '14px', opacity: '0.9', marginBottom: '10px' }}>{t('adminDashboard.activeUsers')}</div>
            <div style={{ fontSize: '36px', fontWeight: 'bold' }}>{stats.activeUsers}</div>
          </div>
        </div>

        {/* User Management Section - Expanded */}
        <div style={{ background: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginBottom: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '24px', color: '#667eea', display: 'flex', alignItems: 'center', gap: '10px' }}>
              👥 {t('adminDashboard.manageUsersTitle')}
            </h3>
            <button 
              onClick={() => router.push('/manage-users')}
              style={{ padding: '10px 20px', background: '#667eea', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>
              {t('adminDashboard.viewAllUsers')} →
            </button>
          </div>
          <p style={{ color: '#666', marginBottom: '20px' }}>{t('adminDashboard.manageUsersDesc')}</p>
          
          {recentUsers.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#495057' }}>{t('adminDashboard.name')}</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#495057' }}>{t('adminDashboard.email')}</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#495057' }}>{t('adminDashboard.role')}</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#495057' }}>{t('adminDashboard.status')}</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#495057' }}>{t('adminDashboard.joined')}</th>
                  </tr>
                </thead>
                <tbody>
                  {recentUsers.map(user => (
                    <tr key={user.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                      <td style={{ padding: '12px', fontSize: '14px' }}>{user.name || t('common.notAvailable')}</td>
                      <td style={{ padding: '12px', fontSize: '14px', color: '#666' }}>{user.email}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '600', background: user.role === 'admin' ? '#dc3545' : user.role === 'hr' ? '#ffc107' : '#28a745', color: 'white' }}>
                          {user.role.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '600', background: user.active ? '#28a745' : '#6c757d', color: 'white' }}>
                          {user.active ? t('adminDashboard.statusActive') : t('adminDashboard.statusInactive')}
                        </span>
                      </td>
                      <td style={{ padding: '12px', fontSize: '14px', color: '#666' }}>{new Date(user.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ color: '#999', textAlign: 'center', padding: '20px' }}>{t('adminDashboard.noUsers')}</p>
          )}
        </div>

        {/* Feature Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>

          <div style={{ background: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }} 
               onClick={() => router.push('/all-cvs')}
               onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.15)'; }}
               onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)'; }}>
            <h3 style={{ fontSize: '20px', marginBottom: '15px', color: '#667eea' }}>📋 {t('adminDashboard.allCvsTitle')}</h3>
            <p style={{ color: '#666' }}>{t('adminDashboard.allCvsDesc')}</p>
          </div>

          <div style={{ background: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }} 
               onClick={() => router.push('/system-settings')}
               onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.15)'; }}
               onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)'; }}>
            <h3 style={{ fontSize: '20px', marginBottom: '15px', color: '#667eea' }}>⚙️ {t('adminDashboard.systemSettingsTitle')}</h3>
            <p style={{ color: '#666' }}>{t('adminDashboard.systemSettingsDesc')}</p>
          </div>

          <div style={{ background: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }} 
               onClick={() => router.push('/verify-documents')}
               onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.15)'; }}
               onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)'; }}>
            <h3 style={{ fontSize: '20px', marginBottom: '15px', color: '#667eea' }}>✓ {t('adminDashboard.verifyDocumentsTitle')}</h3>
            <p style={{ color: '#666' }}>{t('adminDashboard.verifyDocumentsDesc')}</p>
          </div>

          <div style={{ background: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }} 
               onClick={() => router.push('/reports')}
               onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.15)'; }}
               onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)'; }}>
            <h3 style={{ fontSize: '20px', marginBottom: '15px', color: '#667eea' }}>📊 {t('adminDashboard.reportsTitle')}</h3>
            <p style={{ color: '#666' }}>{t('adminDashboard.reportsDesc')}</p>
          </div>

          <div style={{ background: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }} 
               onClick={() => router.push('/profile')}
               onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.15)'; }}
               onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)'; }}>
            <h3 style={{ fontSize: '20px', marginBottom: '15px', color: '#667eea' }}>👤 {t('adminDashboard.profileTitle')}</h3>
            <p style={{ color: '#666' }}>{t('adminDashboard.profileDesc')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}