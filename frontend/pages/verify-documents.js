import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function VerifyDocuments() {
  const router = useRouter();
  const { t } = useTranslation();
  const { cvId } = router.query;
  const [cvs, setCvs] = useState([]);
  const [selectedCV, setSelectedCV] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const [qrInput, setQrInput] = useState('');

  useEffect(() => {
    fetchCVsForVerification();
  }, []);

  useEffect(() => {
    if (cvId && cvs.length > 0) {
      const cv = cvs.find(c => c.id === parseInt(cvId));
      if (cv) setSelectedCV(cv);
    }
  }, [cvId, cvs]);

  const fetchCVsForVerification = async () => {
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
      setError(t('verifyDocs.loadError'));
      setLoading(false);
    }
  };

  const handleVerifyCV = async () => {
    if (!selectedCV) {
      setError(t('verifyDocs.selectCvPrompt'));
      return;
    }

    setVerifying(true);
    setVerificationResult(null);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/api/cv/verify`, {
        cvId: selectedCV.id,
        qrCode: qrInput || null
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setVerificationResult({
        isAuthentic: response.data.isAuthentic,
        message: response.data.message,
        details: response.data.details,
        timestamp: new Date().toLocaleString()
      });
    } catch (err) {
      console.error('Verification error:', err);
      setError(err.response?.data?.message || t('verify.error'));
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', minHeight: '100vh' }}>
        <p>{t('verifyDocs.loading')}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', minHeight: '100vh', background: '#f5f5f5' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#333', margin: '0' }}>{t('verifyDocs.title')}</h1>
            <p style={{ color: '#666', margin: '5px 0 0 0' }}>{t('verifyDocs.subtitle')}</p>
          </div>
          <Link href="/hr-dashboard">
            <button style={{ padding: '10px 20px', background: '#667eea', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
              {t('verifyDocs.backToDashboard')}
            </button>
          </Link>
        </div>

        {error && (
          <div style={{ background: '#f8d7da', color: '#721c24', padding: '15px', borderRadius: '5px', marginBottom: '20px' }}>
            ⚠️ {error}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {/* CV Selection Panel */}
          <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px', color: '#333' }}>{t('verifyDocs.selectCvTitle')}</h2>
            {cvs.length === 0 ? (
              <p style={{ color: '#666' }}>{t('verifyDocs.noCvs')}</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {cvs.map((cv) => (
                  <div
                    key={cv.id}
                    onClick={() => setSelectedCV(cv)}
                    style={{
                      padding: '15px',
                      border: selectedCV?.id === cv.id ? '2px solid #667eea' : '1px solid #ddd',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      background: selectedCV?.id === cv.id ? '#f0f4ff' : 'white',
                      transition: 'all 0.3s'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedCV?.id !== cv.id) {
                        e.currentTarget.style.background = '#f9f9f9';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedCV?.id !== cv.id) {
                        e.currentTarget.style.background = 'white';
                      }
                    }}
                  >
                    <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', fontSize: '14px' }}>📄 {cv.title}</p>
                    <p style={{ margin: '0 0 3px 0', fontSize: '12px', color: '#666' }}>
                      {t('verifyDocs.userLabel')}: {cv.user_name || cv.user_email}
                    </p>
                    <p style={{ margin: '0', fontSize: '12px', color: '#999' }}>
                      {new Date(cv.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Verification Form */}
          <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px', color: '#333' }}>{t('verifyDocs.verificationDetails')}</h2>
            {selectedCV ? (
              <>
                <div style={{ marginBottom: '20px', padding: '15px', background: '#f9f9f9', borderRadius: '5px' }}>
                  <p style={{ margin: '0 0 8px 0', fontSize: '14px' }}>
                    <strong>{t('verifyDocs.cvTitleLabel')}:</strong> {selectedCV.title}
                  </p>
                  <p style={{ margin: '0 0 8px 0', fontSize: '14px' }}>
                    <strong>{t('verifyDocs.userLabel')}:</strong> {selectedCV.user_name || selectedCV.user_email}
                  </p>
                  <p style={{ margin: '0 0 8px 0', fontSize: '14px' }}>
                    <strong>{t('verifyDocs.createdLabel')}:</strong> {new Date(selectedCV.created_at).toLocaleString()}
                  </p>
                  <p style={{ margin: '0', fontSize: '14px' }}>
                    <strong>{t('verifyDocs.statusLabel')}:</strong>{' '}
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: '15px',
                      fontSize: '12px',
                      background: selectedCV.status === 'verified' ? '#d4edda' : '#fff3cd',
                      color: selectedCV.status === 'verified' ? '#155724' : '#856404'
                    }}>
                      {selectedCV.status === 'verified' ? t('verifyDocs.statusVerified') : t('verifyDocs.statusPending')}
                    </span>
                  </p>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333', fontSize: '14px' }}>
                    {t('verifyDocs.qrLabel')}
                  </label>
                  <input
                    type="text"
                    placeholder={t('verifyDocs.qrPlaceholder')}
                    value={qrInput}
                    onChange={(e) => setQrInput(e.target.value)}
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

                <button
                  onClick={handleVerifyCV}
                  disabled={verifying}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: verifying ? '#ccc' : '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: verifying ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold',
                    fontSize: '16px',
                    transition: 'background 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    if (!verifying) e.target.style.background = '#218838';
                  }}
                  onMouseLeave={(e) => {
                    if (!verifying) e.target.style.background = '#28a745';
                  }}
                >
                  {verifying ? t('verifyDocs.verifying') : t('verifyDocs.verifyButton')}
                </button>
              </>
            ) : (
              <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>
                {t('verifyDocs.selectCvPrompt')}
              </p>
            )}
          </div>
        </div>

        {/* Verification Result */}
        {verificationResult && (
          <div style={{ marginTop: '30px' }}>
            <div style={{
              background: verificationResult.isAuthentic ? '#d4edda' : '#f8d7da',
              border: `2px solid ${verificationResult.isAuthentic ? '#28a745' : '#dc3545'}`,
              padding: '25px',
              borderRadius: '10px',
              color: verificationResult.isAuthentic ? '#155724' : '#721c24'
            }}>
              <h2 style={{ margin: '0 0 15px 0', fontSize: '22px', fontWeight: 'bold' }}>
                {verificationResult.isAuthentic ? t('verifyDocs.resultVerified') : t('verifyDocs.resultFailed')}
              </h2>
              <p style={{ margin: '0 0 15px 0', fontSize: '16px' }}>
                {verificationResult.message}
              </p>
              {verificationResult.details && (
                <div style={{
                  background: 'rgba(255,255,255,0.5)',
                  padding: '15px',
                  borderRadius: '5px',
                  fontSize: '14px',
                  whiteSpace: 'pre-wrap'
                }}>
                  {Object.entries(verificationResult.details).map(([key, value]) => (
                    <p key={key} style={{ margin: '5px 0' }}>
                      <strong>{key}:</strong> {JSON.stringify(value)}
                    </p>
                  ))}
                </div>
              )}
              <p style={{ margin: '15px 0 0 0', fontSize: '12px', opacity: 0.8 }}>
                Verified at: {verificationResult.timestamp}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}