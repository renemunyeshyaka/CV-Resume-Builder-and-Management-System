import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import FileUpload from '../components/FileUpload';
import SignaturePad from '../components/SignaturePad';
import styles from '../styles/Profile.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function Profile() {
  const router = useRouter();
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
      setError('Failed to load profile');
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
      setError('Name is required');
      return;
    }

    if (!formData.email.trim()) {
      setError('Email is required');
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
      setSuccess('✓ Profile updated successfully!');
      setIsEditing(false);
      setUser(prev => ({ ...prev, ...formData }));
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.maxWidth}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>👤 My Profile</h1>
            <p className={styles.subtitle}>Manage your professional information</p>
          </div>
          <button
            onClick={() => router.push('/user-dashboard')}
            className={styles.backButton}
          >
            ← Back
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
              <h2>📋 Profile Information</h2>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={styles.editButton}
              >
                {isEditing ? '✕ Cancel' : '✏️ Edit'}
              </button>
            </div>

            {!isEditing ? (
              <div className={styles.profileView}>
                <div className={styles.profileItem}>
                  <label>Name</label>
                  <p>{formData.name || 'Not set'}</p>
                </div>

                <div className={styles.profileItem}>
                  <label>Email</label>
                  <p>{formData.email || 'Not set'}</p>
                </div>

                <div className={styles.profileItem}>
                  <label>Phone</label>
                  <p>{formData.phone || 'Not set'}</p>
                </div>

                <div className={styles.profileItem}>
                  <label>Location</label>
                  <p>{formData.location || 'Not set'}</p>
                </div>

                <div className={styles.profileItem}>
                  <label>Occupation</label>
                  <p>{formData.occupation || 'Not set'}</p>
                </div>

                <div className={styles.profileItem}>
                  <label>Bio</label>
                  <p className={styles.bioText}>{formData.bio || 'Not set'}</p>
                </div>
              </div>
            ) : (
              <div className={styles.profileForm}>
                <div className={styles.formGroup}>
                  <label>Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Your full name"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your.email@example.com"
                    disabled
                  />
                  <small>Email cannot be changed</small>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Occupation</label>
                    <input
                      type="text"
                      name="occupation"
                      value={formData.occupation}
                      onChange={handleInputChange}
                      placeholder="e.g., Software Engineer"
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="City, Country"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Professional Bio</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Write a brief professional bio about yourself..."
                    rows={4}
                  />
                </div>

                <button
                  onClick={handleSaveProfile}
                  className={styles.saveButton}
                >
                  💾 Save Changes
                </button>
              </div>
            )}
          </div>

          {/* Media Section */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>🖼️ Profile Media</h2>
            
            <div className={styles.mediaSection}>
              <div className={styles.mediaItem}>
                <h3>Profile Picture</h3>
                <p className={styles.mediaDescription}>
                  Upload a professional profile photo
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
                      Current Profile Picture
                    </p>
                  </div>
                )}
                
                <FileUpload
                  label="Upload Photo"
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
                <h3>Electronic Signature</h3>
                <p className={styles.mediaDescription}>
                  Upload your signature image file
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
                      Current Signature
                    </p>
                  </div>
                )}
                
                <FileUpload
                  label="Upload Signature"
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
            <h2 className={styles.cardTitle}>✍️ Draw Your Signature</h2>
            <p className={styles.cardDescription}>
              Use your mouse or touch device to draw your signature below
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
                  setSuccess('✓ Signature uploaded successfully!');
                  setTimeout(() => setSuccess(''), 3000);
                } catch (err) {
                  setError('Failed to upload signature');
                }
              }} />
            </div>
          </div>
        </div>

        {/* Account Information Section */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>🔐 Account Information</h2>
          <div className={styles.accountInfo}>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Account Status:</span>
              <span className={user?.active ? styles.statusActive : styles.statusInactive}>
                {user?.active ? '✓ Active' : '⏸️ Inactive'}
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Member Since:</span>
              <span className={styles.infoValue}>
                {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : 'Not set'}
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Role:</span>
              <span className={styles.roleTag}>{user?.role || 'User'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
