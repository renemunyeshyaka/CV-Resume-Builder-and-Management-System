import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import CVEditor from '../../components/CVEditor';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function EditCV() {
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [cvData, setCvData] = useState(null);
  const [cvTitle, setCvTitle] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    if (!id) return;

    // Fetch CV data
    fetchCV(id, token);
  }, [id, router]);

  const fetchCV = async (cvId, token) => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(
        `${API_URL}/api/cv/${cvId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setCvData(response.data.content);
      setCvTitle(response.data.title);
      setLoading(false);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to load CV. Please try again.';
      setError(errorMessage);
      setLoading(false);
      
      // If CV not found or access denied, redirect to my-cvs after 2 seconds
      if (err.response?.status === 404 || err.response?.status === 403) {
        setTimeout(() => {
          router.push('/my-cvs');
        }, 2000);
      }
    }
  };

  const handleUpdateCV = async (formData) => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_URL}/api/cv/${id}`,
        {
          title: cvTitle,
          content: formData
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setSuccess('✓ CV updated successfully!');
      setCvData(response.data.content);
      setTimeout(() => {
        router.push('/my-cvs');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update CV. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', fontSize: '18px', color: '#667eea' }}>
        Loading CV...
      </div>
    );
  }

  if (error && !cvData) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center', padding: '20px', maxWidth: '500px' }}>
          <h2 style={{ color: '#e74c3c' }}>Error</h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>{error}</p>
          <p style={{ color: '#999', fontSize: '14px' }}>Redirecting to My CVs...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#f8f9fa', minHeight: '100vh', paddingTop: '20px', paddingBottom: '20px' }}>
      <div style={{ maxWidth: '100%', margin: '0 auto', padding: '0 20px' }}>
        {/* Header */}
        <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: '700', margin: '0 0 10px 0', color: '#333' }}>
              ✏️ Edit Your CV
            </h1>
            <p style={{ fontSize: '16px', color: '#666', margin: 0 }}>
              Update your professional resume
            </p>
          </div>
          <button
            onClick={() => router.push('/my-cvs')}
            style={{
              padding: '10px 20px',
              background: '#e8e8e8',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              color: '#333'
            }}
          >
            ← Back to My CVs
          </button>
        </div>

        {/* Title Input */}
        <div style={{ 
          marginBottom: '30px', 
          background: 'white', 
          padding: '20px', 
          borderRadius: '8px', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)' 
        }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
            CV Title
          </label>
          <input
            type="text"
            value={cvTitle}
            onChange={(e) => setCvTitle(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '16px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              boxSizing: 'border-box',
              fontFamily: 'inherit'
            }}
            placeholder="e.g., Senior Developer CV"
          />
        </div>

        {/* Messages */}
        {error && (
          <div style={{
            marginBottom: '20px',
            padding: '15px',
            background: '#fadbd8',
            color: '#c0392b',
            borderRadius: '4px',
            borderLeft: '4px solid #e74c3c'
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{
            marginBottom: '20px',
            padding: '15px',
            background: '#d5f4e6',
            color: '#27ae60',
            borderRadius: '4px',
            borderLeft: '4px solid #2ecc71'
          }}>
            {success}
          </div>
        )}

        {/* CV Editor */}
        {cvData && (
          <CVEditor 
            initialData={cvData}
            onSave={handleUpdateCV}
          />
        )}
      </div>
    </div>
  );
}
