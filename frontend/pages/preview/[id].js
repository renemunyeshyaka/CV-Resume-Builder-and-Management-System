import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function CVPreview() {
  const router = useRouter();
  const { t } = useTranslation();
  const { id } = router.query;
  const [cv, setCV] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [signing, setSigning] = useState(false);
  const [signMessage, setSignMessage] = useState('');

  useEffect(() => {
    if (!id) return;

    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchCV(token, id);
  }, [id]);

  const fetchCV = async (token, cvId) => {
    try {
      const response = await axios.get(`${API_URL}/api/cv/${cvId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('CV Data received:', response.data);
      console.log('Profile Picture:', response.data.profile_picture);
      setCV(response.data);
      setLoading(false);
    } catch (err) {
      setError(t('preview.loadError'));
      setLoading(false);
    }
  };

  const handleSignCV = async () => {
    setSigning(true);
    setSignMessage('');
    const token = localStorage.getItem('token');

    try {
      const response = await axios.post(
        `${API_URL}/api/cv/${id}/sign`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setSignMessage(t('preview.signSuccess'));
      // Refresh CV data to show signed status
      await fetchCV(token, id);
    } catch (err) {
      setSignMessage(t('preview.signErrorPrefix') + (err.response?.data?.error || err.message));
    } finally {
      setSigning(false);
    }
  };


  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', fontSize: '18px', color: '#667eea' }}>
        {t('preview.loading')}
      </div>
    );
  }

  if (error || !cv) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>{error || t('preview.notFound')}</h2>
        <button
          onClick={() => router.push('/my-cvs')}
          style={{
            padding: '10px 20px',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600'
          }}
        >
          {t('preview.backToMyCvs')}
        </button>
      </div>
    );
  }

  const content = cv.content;

  // Generate avatar based on name
  const getAvatarColor = (name) => {
    const colors = ['#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#fee140', '#30b0fe', '#ec4899'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  // Determine profile picture (real or avatar)
  const fullName = content?.fullName || cv.name || t('preview.yourName');
  const profilePicture = cv.profile_picture;
  const initials = fullName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const avatarColor = getAvatarColor(fullName);
  const formattedDateTime = new Date().toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa', padding: '30px 20px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Header Controls */}
        <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#333', margin: 0 }}>
            📋 {t('preview.previewTitle')} - {cv.title}
            {cv.status === 'signed' && (
              <span style={{ marginLeft: '15px', fontSize: '14px', color: '#10b981', fontWeight: '600', background: '#d1fae5', padding: '5px 12px', borderRadius: '20px' }}>
                {t('preview.signed')}
              </span>
            )}
          </h1>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => router.push('/my-cvs')}
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
              {t('preview.back')}
            </button>
            {cv.status !== 'signed' && (
              <button
                onClick={handleSignCV}
                disabled={signing}
                style={{
                  padding: '10px 20px',
                  background: signing ? '#9ca3af' : '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: signing ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => !signing && (e.target.style.background = '#059669')}
                onMouseOut={(e) => !signing && (e.target.style.background = '#10b981')}
              >
                {signing ? `⏳ ${t('preview.signing')}` : `✍️ ${t('preview.signButton')}`}
              </button>
            )}
            <button
              onClick={() => window.print()}
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
              🖨️ {t('preview.printSave')}
            </button>
          </div>
        </div>


        {/* Sign Message */}
        {signMessage && (
          <div style={{
            marginBottom: '20px',
            padding: '15px 20px',
            background: signMessage.includes('✓') ? '#d1fae5' : '#fee2e2',
            color: signMessage.includes('✓') ? '#065f46' : '#991b1b',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600'
          }}>
            {signMessage}
          </div>
        )}

        {/* CV Document */}
        <div
          className="cv-print-document"
          style={{
            background: 'white',
            padding: '60px 40px',
            borderRadius: '10px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            lineHeight: '1.6',
            fontSize: '14px',
            color: '#333'
          }}
        >
          {/* Personal Header with Photo */}
          <div style={{ textAlign: 'center', marginBottom: '40px', borderBottom: '2px solid #667eea', paddingBottom: '30px' }}>
            {/* Profile Picture or Avatar */}
            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
              {profilePicture ? (
                <img
                  src={profilePicture.startsWith('http') ? profilePicture : `${API_URL}${profilePicture}`}
                  alt={fullName}
                  onError={(e) => {
                    console.error('Profile image failed to load:', `${API_URL}${profilePicture}`);
                    e.target.style.display = 'none';
                  }}
                  onLoad={() => {
                    console.log('Profile image loaded successfully:', profilePicture);
                  }}
                  style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '4px solid #667eea',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    background: avatarColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '48px',
                    fontWeight: '700',
                    color: 'white',
                    border: '4px solid #667eea',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                  }}
                >
                  {initials}
                </div>
              )}
            </div>
            
            <h1 style={{ fontSize: '32px', fontWeight: '700', margin: '0 0 10px 0', color: '#667eea' }}>
              {fullName}
            </h1>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap', fontSize: '13px', color: '#666' }}>
              {content?.email && <span>📧 {content.email}</span>}
              {content?.phone && <span>📱 {content.phone}</span>}
              {content?.location && <span>📍 {content.location}</span>}
            </div>
          </div>

          {/* Professional Summary */}
          {content?.summary && (
            <div className="cv-section" style={{ marginBottom: '35px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#667eea', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                {t('preview.summaryTitle')}
              </h2>
              <p style={{ margin: '0', color: '#555', lineHeight: '1.8' }}>
                {content.summary}
              </p>
            </div>
          )}

          {/* Experience */}
          {content?.experience && content.experience.length > 0 && (
            <div className="cv-section" style={{ marginBottom: '35px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#667eea', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                {t('preview.experienceTitle')}
              </h2>
              {content.experience.map((exp, idx) => (
                exp.company && (
                  <div key={idx} className="cv-item" style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '5px' }}>
                      <h3 style={{ margin: '0', fontWeight: '700', fontSize: '15px' }}>
                        {exp.position}
                      </h3>
                      <span style={{ fontSize: '12px', color: '#999' }}>
                        {exp.duration}
                      </span>
                    </div>
                    <p style={{ margin: '0 0 8px 0', color: '#667eea', fontWeight: '600', fontSize: '13px' }}>
                      {exp.company}
                    </p>
                    <p style={{ margin: '0', color: '#555', fontSize: '13px', whiteSpace: 'pre-wrap' }}>
                      {exp.description}
                    </p>
                  </div>
                )
              ))}
            </div>
          )}

          {/* Education */}
          {content?.education && content.education.length > 0 && (
            <div className="cv-section" style={{ marginBottom: '35px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#667eea', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                {t('preview.educationTitle')}
              </h2>
              {content.education.map((edu, idx) => (
                edu.institution && (
                  <div key={idx} className="cv-item" style={{ marginBottom: '15px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '5px' }}>
                      <h3 style={{ margin: '0', fontWeight: '700', fontSize: '15px' }}>
                        {edu.degree} in {edu.field}
                      </h3>
                      <span style={{ fontSize: '12px', color: '#999' }}>
                        {edu.year}
                      </span>
                    </div>
                    <p style={{ margin: '0', color: '#667eea', fontWeight: '600', fontSize: '13px' }}>
                      {edu.institution}
                    </p>
                  </div>
                )
              ))}
            </div>
          )}

          {/* Skills */}
          {content?.skills && content.skills.length > 0 && (
            <div className="cv-section" style={{ marginBottom: '35px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#667eea', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                {t('preview.skillsTitle')}
              </h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {content.skills.map((skill, idx) => (
                  skill.skill && (
                    <div
                      key={idx}
                      style={{
                        background: '#f0f4ff',
                        border: '1px solid #667eea',
                        padding: '8px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#667eea'
                      }}
                    >
                      {skill.skill} • {skill.proficiency}
                    </div>
                  )
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {content?.projects && content.projects.length > 0 && (
            <div className="cv-section" style={{ marginBottom: '35px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#667eea', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                {t('preview.projectsTitle')}
              </h2>
              {content.projects.map((proj, idx) => (
                proj.title && (
                  <div key={idx} className="cv-item" style={{ marginBottom: '15px' }}>
                    <h3 style={{ margin: '0 0 5px 0', fontWeight: '700', fontSize: '15px' }}>
                      {proj.title}
                    </h3>
                    <p style={{ margin: '0 0 8px 0', color: '#555', fontSize: '13px', whiteSpace: 'pre-wrap' }}>
                      {proj.description}
                    </p>
                    {proj.link && (
                      <p style={{ margin: '0', fontSize: '12px', color: '#667eea' }}>
                        🔗 {proj.link}
                      </p>
                    )}
                  </div>
                )
              ))}
            </div>
          )}

          {/* Certifications */}
          {content?.certifications && content.certifications.length > 0 && (
            <div className="cv-section" style={{ marginBottom: '35px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#667eea', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                {t('preview.certificationsTitle')}
              </h2>
              {content.certifications.map((cert, idx) => (
                cert.name && (
                  <div key={idx} className="cv-item" style={{ marginBottom: '10px', fontSize: '13px' }}>
                    <strong>{cert.name}</strong> • {cert.issuer}
                    {cert.date && <span> • {cert.date}</span>}
                  </div>
                )
              ))}
            </div>
          )}

          {/* Languages */}
          {content?.languages && content.languages.length > 0 && (
            <div className="cv-section">
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#667eea', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                {t('preview.languagesTitle')}
              </h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                {content.languages.map((lang, idx) => (
                  lang.language && (
                    <div key={idx} style={{ fontSize: '13px' }}>
                      <strong>{lang.language}</strong> • {lang.proficiency}
                    </div>
                  )
                ))}
              </div>
              <div style={{ marginTop: '16px', fontSize: '13px', color: '#555' }}>
                <div><strong>{t('preview.dateTimeLabel')}:</strong> {formattedDateTime}</div>
                <div><strong>{t('preview.fullNameLabel')}:</strong> {fullName}</div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div style={{ marginTop: '30px', textAlign: 'center' }}>
          <button
            onClick={() => router.push(`/cv/${id}`)}
            style={{
              padding: '12px 30px',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              marginRight: '10px',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => e.target.style.background = '#5568d3'}
            onMouseOut={(e) => e.target.style.background = '#667eea'}
          >
            ✏️ {t('preview.editCv')}
          </button>
          <button
            onClick={() => router.push('/my-cvs')}
            style={{
              padding: '12px 30px',
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
            {t('preview.backToMyCvsFooter')}
          </button>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            background: white;
            margin: 0;
            padding: 0;
          }
          div[style*="maxWidth: 900px"] {
            box-shadow: none;
            max-width: 100%;
          }
          button {
            display: none !important;
          }
          div[style*="marginTop: 30px"] {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
