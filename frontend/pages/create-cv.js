import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import CVEditor from '../components/CVEditor';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function CreateCV() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [cvTitle, setCvTitle] = useState('My CV');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    } else {
      setLoading(false);
    }
  }, []);

  const handleSaveCV = async (formData) => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/cv`,
        {
          title: cvTitle,
          content: formData
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setSuccess('✓ CV saved successfully!');
      setTimeout(() => {
        router.push('/my-cvs');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save CV. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', fontSize: '18px', color: '#667eea' }}>
        Loading...
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
              📝 Create Your Professional CV
            </h1>
            <p style={{ fontSize: '16px', color: '#666', margin: 0 }}>
              Build a polished resume that stands out to employers
            </p>
          </div>
          <button
            onClick={() => router.push('/user-dashboard')}
            style={{
              padding: '10px 20px',
              background: '#e8e8e8',
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
        </div>

        {/* CV Title Section */}
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '10px',
          marginBottom: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#333' }}>
            CV Title
          </label>
          <input
            type="text"
            value={cvTitle}
            onChange={(e) => setCvTitle(e.target.value)}
            placeholder="e.g., Software Engineer CV 2024"
            style={{
              width: '100%',
              maxWidth: '400px',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '14px',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Alert Messages */}
        {error && (
          <div style={{
            background: '#fff5f5',
            border: '1px solid #dc3545',
            color: '#dc3545',
            padding: '15px',
            borderRadius: '6px',
            marginBottom: '20px',
            fontSize: '14px'
          }}>
            ❌ {error}
          </div>
        )}

        {success && (
          <div style={{
            background: '#f0fdf4',
            border: '1px solid #28a745',
            color: '#155724',
            padding: '15px',
            borderRadius: '6px',
            marginBottom: '20px',
            fontSize: '14px'
          }}>
            {success}
          </div>
        )}

        {/* CV Editor */}
        <div style={{ position: 'relative' }}>
          {saving && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(255,255,255,0.8)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: '10px',
              zIndex: 10
            }}>
              <div style={{ fontSize: '16px', color: '#667eea', fontWeight: '600' }}>
                Saving your CV...
              </div>
            </div>
          )}
          <CVEditor onSave={handleSaveCV} />
        </div>

        {/* Helper Section */}
        <div style={{
          background: '#f0f4ff',
          border: '1px solid #667eea',
          borderRadius: '10px',
          padding: '20px',
          marginTop: '30px',
          marginBottom: '30px'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#333', fontSize: '16px', fontWeight: '700' }}>
            💡 Tips for a Better CV:
          </h3>
          <ul style={{ margin: 0, paddingLeft: '20px', color: '#555', fontSize: '14px', lineHeight: '1.8' }}>
            <li>Keep your CV concise - aim for 1-2 pages</li>
            <li>Use clear, professional language and avoid jargon</li>
            <li>Focus on achievements and measurable results</li>
            <li>Include relevant skills and certifications</li>
            <li>Use consistent formatting and proper grammar</li>
            <li>Add links to your projects and portfolio</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
