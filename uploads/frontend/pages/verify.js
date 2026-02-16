import React, { useState } from 'react';
import axios from 'axios';

export default function Verify() {
  const [cvId, setCvId] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleVerify = async (type) => {
    setError('');
    setResult(null);
    try {
      const res = await axios.get(`http://localhost:4000/api/verify/${type}/${cvId}`);
      setResult(res.data);
    } catch {
      setError('Verification failed');
    }
  };

  return (
    <div>
      <h2>Verify CV (QR/Barcode)</h2>
      <input type="text" placeholder="CV ID" value={cvId} onChange={e => setCvId(e.target.value)} />
      <button onClick={() => handleVerify('qr')}>Verify by QR</button>
      <button onClick={() => handleVerify('barcode')}>Verify by Barcode</button>
      {error && <p style={{color:'red'}}>{error}</p>}
      {result && (
        <div>
          <p>Valid: {result.valid ? 'Yes' : 'No'}</p>
          {result.cv && <pre>{JSON.stringify(result.cv, null, 2)}</pre>}
        </div>
      )}
    </div>
  );
}
