import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function Admin() {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [token, setToken] = useState('');

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    setToken(storedToken);
    if (!storedToken) return setError(t('adminLegacy.errors.notAuthenticated'));
    axios.get(`${API_URL}/api/admin/users`, {
      headers: { Authorization: `Bearer ${storedToken}` }
    })
      .then(res => setUsers(res.data))
      .catch(() => setError(t('adminLegacy.errors.fetchFailed')));
  }, []);

  const handleActivate = async (id, active) => {
    try {
      await axios.put(`${API_URL}/api/admin/users/${id}`, { active: !active }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(users.map(u => u.id === id ? { ...u, active: !active } : u));
    } catch {
      setError(t('adminLegacy.errors.updateFailed'));
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(users.filter(u => u.id !== id));
    } catch {
      setError(t('adminLegacy.errors.deleteFailed'));
    }
  };

  return (
    <div>
      <h2>{t('adminLegacy.title')}</h2>
      {error && <p style={{color:'red'}}>{error}</p>}
      <table border="1" cellPadding="5">
        <thead>
          <tr>
            <th>{t('adminLegacy.columns.id')}</th>
            <th>{t('adminLegacy.columns.email')}</th>
            <th>{t('adminLegacy.columns.name')}</th>
            <th>{t('adminLegacy.columns.active')}</th>
            <th>{t('adminLegacy.columns.admin')}</th>
            <th>{t('adminLegacy.columns.actions')}</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.email}</td>
              <td>{u.name}</td>
              <td>{u.active ? t('common.yes') : t('common.no')}</td>
              <td>{u.is_admin ? t('common.yes') : t('common.no')}</td>
              <td>
                <button onClick={() => handleActivate(u.id, u.active)}>
                  {u.active ? t('adminLegacy.actions.deactivate') : t('adminLegacy.actions.activate')}
                </button>
                <button onClick={() => handleDelete(u.id)}>{t('adminLegacy.actions.delete')}</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
