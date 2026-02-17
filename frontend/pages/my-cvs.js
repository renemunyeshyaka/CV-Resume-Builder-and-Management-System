import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function MyCVs() {
  const router = useRouter();
  const [cvs, setCvs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchCVs(token);
  }, []);

  const fetchCVs = async (token) => {
    try {
      const response = await axios.get(`${API_URL}/api/cv`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCvs(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load your CVs');
      setLoading(false);
    }
  };

  const handleDelete = async (cvId) => {
    if (!window.confirm('Are you sure you want to delete this CV?')) return;

    setDeletingId(cvId);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/cv/${cvId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCvs(cvs.filter(cv => cv.id !== cvId));
    } catch (err) {
      alert('Failed to delete CV');
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (cvId) => {
    router.push(`/cv/${cvId}`);
  };

  const handlePreview = (cvId) => {
    router.push(`/preview/${cvId}`);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', fontSize: '18px', color: '#667eea' }}>
        Loading your CVs...
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
              📄 My CVs
            </h1>
            <p style={{ color: '#666', fontSize: '16px', margin: 0 }}>
              Manage and edit your professional resumes
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => router.push('/user-dashboard')}
              style={{
                padding: '10px 20px',
                background: '#e8e8e8',
                color: '#333',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => e.target.style.background = '#d8d8d8'}
              onMouseOut={(e) => e.target.style.background = '#e8e8e8'}
            >
              ← Back
            </button>
            <button
              onClick={() => router.push('/create-cv')}
              style={{
                padding: '10px 20px',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => e.target.style.background = '#5568d3'}
              onMouseOut={(e) => e.target.style.background = '#667eea'}
            >
              + Create New CV
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            background: '#fff5f5',
            border: '1px solid #dc3545',
            color: '#dc3545',
            padding: '15px',
            borderRadius: '6px',
            marginBottom: '20px'
          }}>
            ❌ {error}
          </div>
        )}

        {/* CVs List */}
        {cvs.length === 0 ? (
          <div style={{
            background: 'white',
            padding: '60px 30px',
            borderRadius: '10px',
            textAlign: 'center',
            boxShadow: '0 2px 10px rgba(0,0,0,0.08)'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>📝</div>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#333', marginBottom: '10px' }}>
              No CVs Yet
            </h3>
            <p style={{ color: '#666', fontSize: '16px', marginBottom: '30px' }}>
              You haven't created any CVs yet. Start building your professional resume today!
            </p>
            <button
              onClick={() => router.push('/create-cv')}
              style={{
                padding: '12px 30px',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
            >
              Create Your First CV
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {cvs.map(cv => (
              <div
                key={cv.id}
                style={{
                  background: 'white',
                  borderRadius: '10px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)'}
                onMouseOut={(e) => e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.08)'}
              >
                {/* CV Header */}
                <div style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  padding: '20px',
                  borderBottom: '1px solid #667eea'
                }}>
                  <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', fontWeight: '700' }}>
                    {cv.title}
                  </h3>
                  <p style={{ margin: '0', fontSize: '12px', opacity: 0.9 }}>
                    Version {cv.version}
                  </p>
                </div>

                {/* CV Info */}
                <div style={{ padding: '20px' }}>
                  <div style={{ marginBottom: '15px' }}>
                    <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#666', fontWeight: '600' }}>
                      Created
                    </p>
                    <p style={{ margin: '0', fontSize: '14px', color: '#333' }}>
                      {new Date(cv.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#666', fontWeight: '600' }}>
                      Last Updated
                    </p>
                    <p style={{ margin: '0', fontSize: '14px', color: '#333' }}>
                      {new Date(cv.updated_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>

                  {cv.pdf_path && (
                    <div style={{ marginBottom: '20px', padding: '10px', background: '#f0fdf4', borderRadius: '4px', borderLeft: '3px solid #28a745' }}>
                      <p style={{ margin: '0', fontSize: '12px', color: '#155724', fontWeight: '600' }}>
                        ✓ PDF Generated
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div style={{ padding: '15px 20px', borderTop: '1px solid #eee', display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => handleEdit(cv.id)}
                    style={{
                      flex: 1,
                      padding: '10px',
                      background: '#667eea',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: '600',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => e.target.style.background = '#5568d3'}
                    onMouseOut={(e) => e.target.style.background = '#667eea'}
                  >
                    ✏️ Edit
                  </button>

                  <button
                    onClick={() => handlePreview(cv.id)}
                    style={{
                      flex: 1,
                      padding: '10px',
                      background: '#ffc107',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: '600',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => e.target.style.background = '#ffb300'}
                    onMouseOut={(e) => e.target.style.background = '#ffc107'}
                  >
                    👁️ Preview
                  </button>

                  <button
                    onClick={() => handleDelete(cv.id)}
                    disabled={deletingId === cv.id}
                    style={{
                      flex: 1,
                      padding: '10px',
                      background: deletingId === cv.id ? '#ccc' : '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: deletingId === cv.id ? 'not-allowed' : 'pointer',
                      fontSize: '13px',
                      fontWeight: '600',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => !deletingId && (e.target.style.background = '#c82333')}
                    onMouseOut={(e) => !deletingId && (e.target.style.background = '#dc3545')}
                  >
                    {deletingId === cv.id ? '⏳ Deleting...' : '🗑️ Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
