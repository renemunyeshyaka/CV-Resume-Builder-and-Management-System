import React, { useEffect, useState } from 'react';
import axios from 'axios';

import CVEditor from '../components/CVEditor';

export default function CVs() {
  const [cvs, setCvs] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [token, setToken] = useState('');

  useEffect(() => {
    const t = localStorage.getItem('token');
    setToken(t);
    if (!t) return;
    axios.get('http://localhost:4000/api/cv', {
      headers: { Authorization: `Bearer ${t}` }
    })
      .then(res => setCvs(res.data))
      .catch(() => setError('Failed to load CVs'));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post('http://localhost:4000/api/cv', { title, content }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCvs([...cvs, res.data]);
      setTitle('');
      setContent('');
    } catch {
      setError('Failed to create CV');
    }
  };

  return (
    <div>
      <h2>Your CVs</h2>
      <CVEditor onSave={async (sections) => {
        setError('');
        try {
          const token = localStorage.getItem('token');
          const res = await axios.post('http://localhost:4000/api/cv', {
            title: title || 'My CV',
            content: sections
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setCvs([...cvs, res.data]);
        } catch {
          setError('Failed to create CV');
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
