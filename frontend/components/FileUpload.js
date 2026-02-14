import React, { useState } from 'react';
import axios from 'axios';

export default function FileUpload({ label, endpoint, field }) {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFile(e.target.files[0]);
    setMessage('');
  };

  const handleUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append(field, file);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/upload/${endpoint}`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setMessage('Upload successful!');
    } catch {
      setMessage('Upload failed');
    }
  };

  return (
    <div>
      <label>{label}: <input type="file" onChange={handleChange} /></label>
      <button onClick={handleUpload} disabled={!file}>Upload</button>
      {message && <span> {message}</span>}
    </div>
  );
}
