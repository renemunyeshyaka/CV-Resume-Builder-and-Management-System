import React, { useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function PDFDownload() {
  const { t } = useTranslation();
  const [cvId, setCvId] = useState('');
  const [error, setError] = useState('');

  const handleDownload = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios({
        url: `${API_URL}/api/pdf/download/${cvId}`,
        method: 'GET',
        responseType: 'blob',
        headers: { Authorization: `Bearer ${token}` }
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `cv_${cvId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      setError(t('pdfDownload.error'));
    }
  };

  return (
    <div>
      <h2>{t('pdfDownload.title')}</h2>
      <form onSubmit={handleDownload}>
        <input type="text" placeholder={t('pdfDownload.cvIdPlaceholder')} value={cvId} onChange={e => setCvId(e.target.value)} required />
        <button type="submit">{t('pdfDownload.downloadButton')}</button>
      </form>
      {error && <p style={{color:'red'}}>{error}</p>}
    </div>
  );
}
