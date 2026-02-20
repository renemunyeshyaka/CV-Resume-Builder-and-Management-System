import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [token, setToken] = useState('');

  useEffect(() => {
    const t = localStorage.getItem('token');
    setToken(t);
    if (!t) return setError('Not authenticated');
    axios.get('http://localhost:4000/api/admin/users', {
      headers: { Authorization: `Bearer ${t}` }
    })
      .then(res => setUsers(res.data))
      .catch(() => setError('Admin access required or failed to load users'));
  }, []);

  const handleActivate = async (id, active) => {
    try {
      await axios.put(`http://localhost:4000/api/admin/users/${id}`, { active: !active }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(users.map(u => u.id === id ? { ...u, active: !active } : u));
    } catch {
      setError('Failed to update user');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:4000/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(users.filter(u => u.id !== id));
    } catch {
      setError('Failed to delete user');
    }
  };

  return (
    <div>
      <h2>Admin User Management</h2>
      {error && <p style={{color:'red'}}>{error}</p>}
      <table border="1" cellPadding="5">
        <thead>
          <tr><th>ID</th><th>Email</th><th>Name</th><th>Active</th><th>Admin</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.email}</td>
              <td>{u.name}</td>
              <td>{u.active ? 'Yes' : 'No'}</td>
              <td>{u.is_admin ? 'Yes' : 'No'}</td>
              <td>
                <button onClick={() => handleActivate(u.id, u.active)}>{u.active ? 'Deactivate' : 'Activate'}</button>
                <button onClick={() => handleDelete(u.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
