import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function AllCvs() {
  const router = useRouter();
  const [cvs, setCvs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchCVs();
  }, []);

  const fetchCVs = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await axios.get(`${API_URL}/api/cv/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setCvs(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching CVs:', err);
      setError('Failed to load CVs');
      setLoading(false);
    }
  };

  const handlePreview = (cvId) => {
    router.push(`/preview?id=${cvId}`);
  };

  const handleVerify = (cvId) => {
    router.push(`/verify-documents?cvId=${cvId}`);
  };

  const filteredCvs = cvs.filter(cv => {
    const matchesSearch = 
      (cv.title?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (cv.user_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (cv.user_email?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (filterStatus === 'all') return matchesSearch;
    return matchesSearch && cv.status === filterStatus;
  });

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', minHeight: '100vh' }}>
        <p>Loading CVs...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', minHeight: '100vh', background: '#f5f5f5' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#333', margin: '0' }}>All Submitted CVs</h1>
            <p style={{ color: '#666', margin: '5px 0 0 0' }}>Total CVs: {filteredCvs.length}</p>
          </div>
          <Link href="/hr-dashboard">
            <button style={{ padding: '10px 20px', background: '#667eea', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
              Back to Dashboard
            </button>
          </Link>
        </div>

        {error && (
          <div style={{ background: '#f8d7da', color: '#721c24', padding: '15px', borderRadius: '5px', marginBottom: '20px' }}>
            {error}
          </div>
        )}

        {/* Search and Filter */}
        <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginBottom: '30px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>Search:</label>
              <input 
                type="text" 
                placeholder="Search by CV title, user name, or email..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 15px',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>Filter by Status:</label>
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 15px',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              >
                <option value="all">All CVs</option>
                <option value="verified">Verified</option>
                <option value="pending">Pending Review</option>
              </select>
            </div>
          </div>
        </div>

        {/* CVs Grid */}
        {filteredCvs.length === 0 ? (
          <div style={{ background: 'white', padding: '40px', borderRadius: '10px', textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <p style={{ color: '#666', fontSize: '16px' }}>No CVs found matching your criteria</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
            {filteredCvs.map((cv) => (
              <div 
                key={cv.id} 
                style={{
                  background: 'white',
                  borderRadius: '10px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                  overflow: 'hidden',
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
              >
                {/* Card Header */}
                <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '20px', color: 'white' }}>
                  <h3 style={{ margin: '0 0 5px 0', fontSize: '18px', fontWeight: 'bold' }}>{cv.title}</h3>
                  <p style={{ margin: '0', opacity: 0.9, fontSize: '14px' }}>by {cv.user_name || cv.user_email}</p>
                </div>

                {/* Card Body */}
                <div style={{ padding: '20px' }}>
                  <div style={{ marginBottom: '15px' }}>
                    <p style={{ margin: '0 0 5px 0', fontSize: '13px', color: '#666' }}>
                      <strong>Email:</strong> {cv.user_email}
                    </p>
                    <p style={{ margin: '0 0 5px 0', fontSize: '13px', color: '#666' }}>
                      <strong>Created:</strong> {new Date(cv.created_at).toLocaleDateString()}
                    </p>
                    <p style={{ margin: '0 0 5px 0', fontSize: '13px', color: '#666' }}>
                      <strong>Version:</strong> {cv.version || 1}
                    </p>
                    <p style={{ margin: '0', fontSize: '13px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '5px 10px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        background: cv.status === 'verified' ? '#d4edda' : '#fff3cd',
                        color: cv.status === 'verified' ? '#155724' : '#856404'
                      }}>
                        {cv.status === 'verified' ? '✓ Verified' : '⏳ Pending'}
                      </span>
                    </p>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <button
                      onClick={() => handlePreview(cv.id)}
                      style={{
                        padding: '10px 15px',
                        background: '#667eea',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '14px',
                        transition: 'background 0.3s'
                      }}
                      onMouseEnter={(e) => e.target.style.background = '#5568d3'}
                      onMouseLeave={(e) => e.target.style.background = '#667eea'}
                    >
                      👁️ Preview
                    </button>
                    <button
                      onClick={() => handleVerify(cv.id)}
                      style={{
                        padding: '10px 15px',
                        background: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '14px',
                        transition: 'background 0.3s'
                      }}
                      onMouseEnter={(e) => e.target.style.background = '#218838'}
                      onMouseLeave={(e) => e.target.style.background = '#28a745'}
                    >
                      ✓ Verify
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}