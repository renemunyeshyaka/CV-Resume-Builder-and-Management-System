import React, { useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function Verify() {
  const { t } = useTranslation();
  const [cvId, setCvId] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleVerify = async (type) => {
    setError('');
    setResult(null);
    try {
      const res = await axios.get(`${API_URL}/api/verify/${type}/${cvId}`);
      setResult(res.data);
    } catch {
      setError(t('verify.error'));
    }
  };

  return (
    <div>
      <h2>{t('verify.title')}</h2>
      <input type="text" placeholder={t('verify.cvIdPlaceholder')} value={cvId} onChange={e => setCvId(e.target.value)} />
      <button onClick={() => handleVerify('qr')}>{t('verify.verifyQr')}</button>
      <button onClick={() => handleVerify('barcode')}>{t('verify.verifyBarcode')}</button>
      {error && <p style={{color:'red'}}>{error}</p>}
      {result && (
        <div>
          <p>{t('verify.validLabel')}: {result.valid ? t('verify.validYes') : t('verify.validNo')}</p>
          {result.cv && <pre>{JSON.stringify(result.cv, null, 2)}</pre>}
        </div>
      )}
    </div>
  );
}
