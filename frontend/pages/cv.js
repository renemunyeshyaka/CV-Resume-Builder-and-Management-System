import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

import CVEditor from '../components/CVEditor';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function CVs() {
  const { t } = useTranslation();
  const [cvs, setCvs] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [token, setToken] = useState('');

  useEffect(() => {
    const t = localStorage.getItem('token');
    setToken(t);
    if (!t) return;
    axios.get(`${API_URL}/api/cv`, {
      headers: { Authorization: `Bearer ${t}` }
    })
      .then(res => setCvs(res.data))
        .catch(() => setError(t('allCvs.loadError')));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post(`${API_URL}/api/cv`, { title, content }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCvs([...cvs, res.data]);
      setTitle('');
      setContent('');
    } catch {
      setError(t('cvCreator.errorMessage'));
    }
  };

  return (
    <div>
      <h2>{t('myCvs.title')}</h2>
      <CVEditor onSave={async (sections) => {
        setError('');
        try {
          const token = localStorage.getItem('token');
          const res = await axios.post(`${API_URL}/api/cv`, {
            title: title || t('createCv.defaultTitle'),
            content: sections
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setCvs([...cvs, res.data]);
        } catch {
          setError(t('cvCreator.errorMessage'));
        }
      }} />
      {error && <p style={{color:'red'}}>{error}</p>}
      <ul>
        {cvs.map(cv => (
          <li key={cv.id}><b>{cv.title}</b> (v{cv.version})</li>
        ))}
      </ul>
    </div>
  );
}
