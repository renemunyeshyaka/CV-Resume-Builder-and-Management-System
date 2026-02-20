import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function Reports() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState({
    userStats: { total: 0, active: 0, inactive: 0, byRole: {} },
    cvStats: { total: 0, verified: 0, pending: 0, byMonth: [] },
    activityStats: { logins: 0, registrations: 0, cvCreated: 0 },
    topUsers: []
  });
  const [dateRange, setDateRange] = useState('30'); // days

  useEffect(() => {
    fetchReports();
  }, [dateRange]);

  const fetchReports = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const response = await axios.get(`${API_URL}/api/admin/reports?days=${dateRange}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReports(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading reports...</div>;

  return (
    <div style={{ padding: '40px', minHeight: '100vh', background: '#f5f5f5' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#333', marginBottom: '10px' }}>System Reports & Analytics</h1>
            <button onClick={() => router.push('/admin-dashboard')} style={{ background: 'none', border: 'none', color: '#667eea', cursor: 'pointer', fontSize: '14px' }}>← Back to Dashboard</button>
          </div>
          <div>
            <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} style={{ padding: '10px 15px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '14px', cursor: 'pointer' }}>
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
              <option value="365">Last Year</option>
            </select>
          </div>
        </div>

        {/* User Statistics */}
        <div style={{ background: 'white', padding: '30px', borderRadius: '10px', marginBottom: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '20px', color: '#333' }}>👥 User Statistics</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Total Users</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#667eea' }}>{reports.userStats.total}</div>
            </div>
            <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Active Users</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#28a745' }}>{reports.userStats.active}</div>
            </div>
            <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Inactive Users</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#6c757d' }}>{reports.userStats.inactive}</div>
            </div>
          </div>
          
          <div style={{ marginTop: '25px' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '15px', color: '#333' }}>Users by Role</h3>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              {Object.entries(reports.userStats.byRole).map(([role, count]) => (
                <div key={role} style={{ padding: '15px 20px', background: '#f8f9fa', borderRadius: '8px', minWidth: '120px' }}>
                  <div style={{ fontSize: '12px', color: '#666', textTransform: 'uppercase', marginBottom: '5px' }}>{role}</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#667eea' }}>{count}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CV Statistics */}
        <div style={{ background: 'white', padding: '30px', borderRadius: '10px', marginBottom: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '20px', color: '#333' }}>📋 CV/Resume Statistics</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Total CVs</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#667eea' }}>{reports.cvStats.total}</div>
            </div>
            <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Verified CVs</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#28a745' }}>{reports.cvStats.verified}</div>
            </div>
            <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Pending Verification</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ffc107' }}>{reports.cvStats.pending}</div>
            </div>
          </div>
        </div>

        {/* Activity Statistics */}
        <div style={{ background: 'white', padding: '30px', borderRadius: '10px', marginBottom: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '20px', color: '#333' }}>📊 Activity Statistics (Last {dateRange} days)</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>New Registrations</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#667eea' }}>{reports.activityStats.registrations}</div>
            </div>
            <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Total Logins</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#28a745' }}>{reports.activityStats.logins}</div>
            </div>
            <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>CVs Created</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ffc107' }}>{reports.activityStats.cvCreated}</div>
            </div>
          </div>
        </div>

        {/* Top Users */}
        <div style={{ background: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '20px', color: '#333' }}>🏆 Top Users by CV Count</h2>
          {reports.topUsers.length === 0 ? (
            <p style={{ color: '#999', textAlign: 'center', padding: '20px' }}>No user data available</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: '#f8f9fa' }}>
                  <tr>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#333' }}>Rank</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#333' }}>Name</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#333' }}>Email</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#333' }}>CV Count</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#333' }}>Last Active</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.topUsers.map((user, index) => (
                    <tr key={user.id} style={{ borderTop: '1px solid #eee' }}>
                      <td style={{ padding: '12px' }}>
                        <span style={{ display: 'inline-block', width: '30px', height: '30px', borderRadius: '50%', background: index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : index === 2 ? '#cd7f32' : '#f8f9fa', textAlign: 'center', lineHeight: '30px', fontWeight: 'bold' }}>
                          {index + 1}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>{user.name || 'N/A'}</td>
                      <td style={{ padding: '12px', color: '#666' }}>{user.email}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ padding: '4px 12px', background: '#667eea', color: 'white', borderRadius: '12px', fontSize: '14px', fontWeight: '600' }}>
                          {user.cv_count}
                        </span>
                      </td>
                      <td style={{ padding: '12px', color: '#666', fontSize: '14px' }}>
                        {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}