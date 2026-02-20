import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function UserDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cvCount, setCvCount] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    axios.get(`${API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(res => {
      setUser(res.data);
      setLoading(false);
    })
    .catch(() => {
      localStorage.removeItem('token');
      router.push('/login');
    });

    // Fetch CV count
    axios.get(`${API_URL}/api/cv`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(res => {
      setCvCount(res.data.length);
    })
    .catch(() => setCvCount(0));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', fontSize: '18px', color: '#667eea' }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8f9fa 0%, #f0f4ff 100%)', padding: '30px 20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#333', margin: '0 0 10px 0' }}>
              Dashboard
            </h1>
            <p style={{ color: '#666', fontSize: '16px', margin: 0 }}>Welcome back, {user?.name || user?.email}!</p>
          </div>
          <button
            onClick={handleLogout}
            style={{
              padding: '10px 20px',
              background: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => e.target.style.background = '#c82333'}
            onMouseOut={(e) => e.target.style.background = '#dc3545'}
          >
            🚪 Logout
          </button>
        </div>

        {/* Welcome Card */}
        <div style={{
          background: 'white',
          padding: '30px',
          borderRadius: '10px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
          marginBottom: '40px',
          borderLeft: '4px solid #667eea'
        }}>
          <h2 style={{ fontSize: '22px', marginBottom: '15px', color: '#333' }}>
            👋 Welcome, {user?.name || user?.email}!
          </h2>
          <p style={{ color: '#666', fontSize: '15px', lineHeight: '1.6', margin: 0 }}>
            Create and manage your professional CVs with ease. Use our intuitive CV builder to craft compelling resumes
            that showcase your skills and experience. You currently have <strong>{cvCount}</strong> CV{cvCount !== 1 ? 's' : ''}.
          </p>
        </div>

        {/* Main Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          {/* Create New CV - Featured */}
          <div
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '30px',
              borderRadius: '10px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
              gridColumn: 'span 1'
            }}
            onClick={() => router.push('/create-cv')}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
            }}
          >
            <div style={{ fontSize: '40px', marginBottom: '15px' }}>📝</div>
            <h3 style={{ fontSize: '20px', marginBottom: '10px', fontWeight: '700' }}>Create New CV</h3>
            <p style={{ margin: '0', fontSize: '14px', opacity: 0.95 }}>
              Build a professional resume from scratch with our guided editor
            </p>
          </div>

          {/* My CVs */}
          <div
            style={{
              background: 'white',
              padding: '30px',
              borderRadius: '10px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
              borderTop: '3px solid #28a745'
            }}
            onClick={() => router.push('/my-cvs')}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.12)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.08)';
            }}
          >
            <div style={{ fontSize: '40px', marginBottom: '15px' }}>📄</div>
            <h3 style={{ fontSize: '20px', marginBottom: '10px', fontWeight: '700', color: '#333' }}>My CVs</h3>
            <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>
              View, edit, and manage all your saved resumes
            </p>
            <div style={{ marginTop: '15px', fontSize: '12px', color: '#667eea', fontWeight: '600' }}>
              {cvCount} CV{cvCount !== 1 ? 's' : ''} saved
            </div>
          </div>

          {/* Profile */}
          <div
            style={{
              background: 'white',
              padding: '30px',
              borderRadius: '10px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
              borderTop: '3px solid #ffc107'
            }}
            onClick={() => router.push('/profile')}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.12)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.08)';
            }}
          >
            <div style={{ fontSize: '40px', marginBottom: '15px' }}>👤</div>
            <h3 style={{ fontSize: '20px', marginBottom: '10px', fontWeight: '700', color: '#333' }}>Profile</h3>
            <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>
              Update your personal information and preferences
            </p>
          </div>
        </div>

        {/* Quick Tips Section */}
        <div style={{
          background: 'white',
          padding: '30px',
          borderRadius: '10px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
          marginBottom: '40px'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px', color: '#333' }}>
            ⚡ Quick Tips for Professional CVs
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            {[
              { icon: '✓', title: 'Clear Structure', desc: 'Organize information logically with clear headings' },
              { icon: '✓', title: 'Professional Language', desc: 'Use formal, business-appropriate language' },
              { icon: '✓', title: 'Quantify Achievements', desc: 'Include metrics and specific results' },
              { icon: '✓', title: 'Relevant Skills', desc: 'Highlight skills matching job requirements' },
              { icon: '✓', title: 'Proper Formatting', desc: 'Maintain consistent fonts and spacing' },
              { icon: '✓', title: 'Proofread Carefully', desc: 'Eliminate all spelling and grammar errors' }
            ].map((tip, idx) => (
              <div key={idx} style={{ padding: '15px', background: '#f8f9fa', borderRadius: '6px', borderLeft: '3px solid #667eea' }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#333', fontSize: '15px', fontWeight: '600' }}>
                  {tip.icon} {tip.title}
                </h4>
                <p style={{ margin: '0', fontSize: '13px', color: '#666', lineHeight: '1.5' }}>
                  {tip.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Info */}
        <div style={{
          background: '#f0f4ff',
          border: '1px solid #667eea',
          borderRadius: '10px',
          padding: '20px',
          textAlign: 'center',
          color: '#555',
          fontSize: '13px'
        }}>
          <p style={{ margin: 0 }}>
            💡 Pro Tip: Your CVs are securely stored and can be exported as PDFs with professional formatting.
            You can edit your CVs anytime and track all changes with version history.
          </p>
        </div>
      </div>
    </div>
  );
}