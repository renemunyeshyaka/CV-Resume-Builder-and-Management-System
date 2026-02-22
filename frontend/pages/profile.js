import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import FileUpload from '../components/FileUpload';
import SignaturePad from '../components/SignaturePad';
import styles from '../styles/Profile.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function Profile() {
  const router = useRouter();
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    occupation: ''
  });
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [signatureImageUrl, setSignatureImageUrl] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchUserProfile(token);
  }, []);

  const fetchUserProfile = async (token) => {
    try {
      const response = await axios.get(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
      setFormData({
        name: response.data.name || '',
        email: response.data.email || '',
        phone: response.data.phone || '',
        location: response.data.location || '',
        bio: response.data.bio || '',
        occupation: response.data.occupation || ''
      });
      // Set profile image preview
      if (response.data.profile_picture) {
        const imageUrl = `${API_URL}${response.data.profile_picture}`;
        console.log('Setting profile image URL:', imageUrl);
        setProfileImageUrl(imageUrl);
      }
      // Set signature image preview
      if (response.data.signature) {
        const signatureUrl = `${API_URL}${response.data.signature}`;
        console.log('Setting signature URL:', signatureUrl);
        setSignatureImageUrl(signatureUrl);
      }
      setLoading(false);
    } catch (err) {
      console.error('Profile fetch error:', err);
      setError(t('profile.errorMessage'));
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSaveProfile = async () => {
    setError('');
    setSuccess('');

    if (!formData.name.trim()) {
      setError(t('profile.nameRequired'));
      return;
    }

    if (!formData.email.trim()) {
      setError(t('profile.emailRequired'));
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_URL}/api/auth/profile`,
        {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          location: formData.location,
          bio: formData.bio,
          occupation: formData.occupation
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setSuccess(t('profile.successMessage'));
      setIsEditing(false);
      setUser(prev => ({ ...prev, ...formData }));
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || t('profile.errorMessage'));
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <p>{t('messages.loading')}</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.maxWidth}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>👤 {t('profile.myProfile')}</h1>
            <p className={styles.subtitle}>{t('profile.subtitle')}</p>
          </div>
          <button
            onClick={() => router.push('/user-dashboard')}
            className={styles.backButton}
          >
            ← {t('profile.back')}
          </button>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className={styles.errorAlert}>
            ❌ {error}
          </div>
        )}

        {success && (
          <div className={styles.successAlert}>
            {success}
          </div>
        )}

        <div className={styles.contentGrid}>
          {/* Profile Information Section */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2>📋 {t('profile.profileInfoTitle')}</h2>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={styles.editButton}
              >
                {isEditing ? `✕ ${t('profile.cancel')}` : `✏️ ${t('profile.editProfile')}`}
              </button>
            </div>

            {!isEditing ? (
              <div className={styles.profileView}>
                <div className={styles.profileItem}>
                  <label>{t('profile.nameLabel')}</label>
                  <p>{formData.name || t('profile.notSet')}</p>
                </div>

                <div className={styles.profileItem}>
                  <label>{t('profile.emailLabel')}</label>
                  <p>{formData.email || t('profile.notSet')}</p>
                </div>

                <div className={styles.profileItem}>
                  <label>{t('profile.phoneLabel')}</label>
                  <p>{formData.phone || t('profile.notSet')}</p>
                </div>

                <div className={styles.profileItem}>
                  <label>{t('profile.locationLabel')}</label>
                  <p>{formData.location || t('profile.notSet')}</p>
                </div>

                <div className={styles.profileItem}>
                  <label>{t('profile.occupationLabel')}</label>
                  <p>{formData.occupation || t('profile.notSet')}</p>
                </div>

                <div className={styles.profileItem}>
                  <label>{t('profile.bioLabel')}</label>
                  <p className={styles.bioText}>{formData.bio || t('profile.notSet')}</p>
                </div>
              </div>
            ) : (
              <div className={styles.profileForm}>
                <div className={styles.formGroup}>
                  <label>{t('profile.fullNameLabel')}</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder={t('profile.fullNamePlaceholder')}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>{t('profile.emailRequiredLabel')}</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder={t('profile.emailLabel')}
                    disabled
                  />
                  <small>{t('profile.emailCannotChange')}</small>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>{t('profile.phoneLabel')}</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder={t('profile.phonePlaceholder')}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>{t('profile.occupationLabel')}</label>
                    <input
                      type="text"
                      name="occupation"
                      value={formData.occupation}
                      onChange={handleInputChange}
                      placeholder={t('profile.occupationPlaceholder')}
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>{t('profile.locationLabel')}</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder={t('profile.locationPlaceholder')}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>{t('profile.bioTitle')}</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder={t('profile.bioPlaceholder')}
                    rows={4}
                  />
                </div>

                <button
                  onClick={handleSaveProfile}
                  className={styles.saveButton}
                >
                  💾 {t('profile.saveChanges')}
                </button>
              </div>
            )}
          </div>

          {/* Media Section */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>🖼️ {t('profile.profileMediaTitle')}</h2>
            
            <div className={styles.mediaSection}>
              <div className={styles.mediaItem}>
                <h3>{t('profile.profilePictureTitle')}</h3>
                <p className={styles.mediaDescription}>
                  {t('profile.profilePictureDesc')}
                </p>
                
                {/* Profile Picture Preview */}
                {profileImageUrl && (
                  <div style={{
                    marginBottom: '20px',
                    padding: '15px',
                    backgroundColor: '#f9f9f9',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <img
                      src={profileImageUrl}
                      alt="Profile"
                      onError={(e) => {
                        console.error('Profile image failed to load:', profileImageUrl);
                        e.target.src = ''; // Clear on error
                      }}
                      onLoad={() => {
                        console.log('Profile image loaded successfully');
                      }}
                      style={{
                        maxWidth: '200px',
                        maxHeight: '200px',
                        borderRadius: '8px',
                        border: '2px solid #667eea'
                      }}
                    />
                    <p style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
                      {t('profile.currentProfilePicture')}
                    </p>
                  </div>
                )}
                
                <FileUpload
                  label={t('profile.uploadPhoto')}
                  endpoint="profile-picture"
                  field="profile_picture"
                  onUploadSuccess={() => {
                    const token = localStorage.getItem('token');
                    fetchUserProfile(token);
                  }}
                />
              </div>

              <div className={styles.divider}></div>

              <div className={styles.mediaItem}>
                <h3>{t('profile.signatureTitle')}</h3>
                <p className={styles.mediaDescription}>
                  {t('profile.signatureDesc')}
                </p>
                
                {/* Signature Preview */}
                {signatureImageUrl && (
                  <div style={{
                    marginBottom: '20px',
                    padding: '15px',
                    backgroundColor: '#f9f9f9',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <img
                      src={signatureImageUrl}
                      alt="Signature"
                      onError={(e) => {
                        console.error('Signature image failed to load:', signatureImageUrl);
                        e.target.src = '';
                      }}
                      onLoad={() => {
                        console.log('Signature image loaded successfully');
                      }}
                      style={{
                        maxWidth: '300px',
                        maxHeight: '100px',
                        borderRadius: '4px',
                        border: '2px solid #667eea'
                      }}
                    />
                    <p style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
                      {t('profile.currentSignature')}
                    </p>
                  </div>
                )}
                
                <FileUpload
                  label={t('profile.uploadSignature')}
                  endpoint="signature"
                  field="signature"
                  onUploadSuccess={() => {
                    const token = localStorage.getItem('token');
                    fetchUserProfile(token);
                  }}
                />
              </div>
            </div>
          </div>

          {/* Signature Pad Section */}
          <div className={styles.card} style={{ gridColumn: '1 / -1' }}>
            <h2 className={styles.cardTitle}>✍️ {t('profile.drawSignatureTitle')}</h2>
            <p className={styles.cardDescription}>
              {t('profile.drawSignatureDesc')}
            </p>
            <div className={styles.signaturePadWrapper}>
              <SignaturePad onSave={async (dataUrl) => {
                setError('');
                setSuccess('');
                try {
                  const res = await fetch(dataUrl);
                  const blob = await res.blob();
                  const formData = new FormData();
                  formData.append('signature', blob, 'signature.png');
                  const token = localStorage.getItem('token');
                  await fetch(`${API_URL}/api/upload/signature`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData
                  });
                  setSuccess(t('profile.signatureUploadSuccess'));
                  setTimeout(() => setSuccess(''), 3000);
                } catch (err) {
                  setError(t('profile.signatureUploadError'));
                }
              }} />
            </div>
          </div>
        </div>

        {/* Account Information Section */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>🔐 {t('profile.accountInfoTitle')}</h2>
          <div className={styles.accountInfo}>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>{t('profile.accountStatusLabel')}</span>
              <span className={user?.active ? styles.statusActive : styles.statusInactive}>
                {user?.active ? t('profile.statusActive') : t('profile.statusInactive')}
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>{t('profile.memberSinceLabel')}</span>
              <span className={styles.infoValue}>
                {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : t('profile.notSet')}
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>{t('profile.roleLabel')}</span>
              <span className={styles.roleTag}>{user?.role || t('profile.userRoleFallback')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
