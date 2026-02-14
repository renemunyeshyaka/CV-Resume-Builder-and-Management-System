import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function ManageUsers() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'user' });
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const response = await axios.get(`${API_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      showMessage('Failed to fetch users', 'error');
      setLoading(false);
    }
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      await axios.post(`${API_URL}/api/admin/users`, newUser, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showMessage('User added successfully', 'success');
      setShowAddModal(false);
      setNewUser({ name: '', email: '', password: '', role: 'user' });
      fetchUsers();
    } catch (error) {
      showMessage(error.response?.data?.error || 'Failed to add user', 'error');
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      await axios.put(`${API_URL}/api/admin/users/${selectedUser.id}`, selectedUser, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showMessage('User updated successfully', 'success');
      setShowEditModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      showMessage(error.response?.data?.error || 'Failed to update user', 'error');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

    const token = localStorage.getItem('token');
    try {
      await axios.delete(`${API_URL}/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showMessage('User deleted successfully', 'success');
      fetchUsers();
    } catch (error) {
      showMessage(error.response?.data?.error || 'Failed to delete user', 'error');
    }
  };

  const handleToggleActivation = async (userId, currentStatus) => {
    const token = localStorage.getItem('token');
    try {
      await axios.patch(`${API_URL}/api/admin/users/${userId}/toggle-activation`, 
        { active: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showMessage(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`, 'success');
      fetchUsers();
    } catch (error) {
      showMessage(error.response?.data?.error || 'Failed to update user status', 'error');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;

  return (
    <div style={{ padding: '40px', minHeight: '100vh', background: '#f5f5f5' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#333', marginBottom: '10px' }}>Manage Users</h1>
            <button onClick={() => router.push('/admin-dashboard')} style={{ background: 'none', border: 'none', color: '#667eea', cursor: 'pointer', fontSize: '14px' }}>← Back to Dashboard</button>
          </div>
          <button onClick={() => setShowAddModal(true)} style={{ padding: '12px 24px', background: '#667eea', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: '600' }}>+ Add User</button>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div style={{ padding: '15px', marginBottom: '20px', borderRadius: '5px', background: message.type === 'success' ? '#d4edda' : '#f8d7da', color: message.type === 'success' ? '#155724' : '#721c24', border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}` }}>
            {message.text}
          </div>
        )}

        {/* Search and Filter */}
        <div style={{ background: 'white', padding: '20px', borderRadius: '10px', marginBottom: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ flex: '1', minWidth: '250px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '14px' }}
            />
            <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '14px', cursor: 'pointer' }}>
              <option value="all">All Roles</option>
              <option value="user">User</option>
              <option value="hr">HR</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div style={{ background: 'white', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f8f9fa' }}>
              <tr>
                <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#333' }}>Name</th>
                <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#333' }}>Email</th>
                <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#333' }}>Role</th>
                <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#333' }}>Status</th>
                <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#333' }}>Created</th>
                <th style={{ padding: '15px', textAlign: 'center', fontWeight: '600', color: '#333' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#999' }}>No users found</td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user.id} style={{ borderTop: '1px solid #eee' }}>
                    <td style={{ padding: '15px' }}>{user.name || 'N/A'}</td>
                    <td style={{ padding: '15px' }}>{user.email}</td>
                    <td style={{ padding: '15px' }}>
                      <span style={{ padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '600', background: user.role === 'admin' ? '#dc3545' : user.role === 'hr' ? '#ffc107' : '#28a745', color: 'white' }}>
                        {user.role.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '15px' }}>
                      <span style={{ padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '600', background: user.active ? '#28a745' : '#6c757d', color: 'white' }}>
                        {user.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '15px', fontSize: '14px', color: '#666' }}>{new Date(user.created_at).toLocaleDateString()}</td>
                    <td style={{ padding: '15px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button onClick={() => { setSelectedUser(user); setShowEditModal(true); }} style={{ padding: '6px 12px', background: '#667eea', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Edit</button>
                        <button onClick={() => handleToggleActivation(user.id, user.active)} style={{ padding: '6px 12px', background: user.active ? '#ffc107' : '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
                          {user.active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button onClick={() => handleDeleteUser(user.id)} style={{ padding: '6px 12px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Add User Modal */}
        {showAddModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: 'white', padding: '30px', borderRadius: '10px', maxWidth: '500px', width: '90%' }}>
              <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>Add New User</h2>
              <form onSubmit={handleAddUser}>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600' }}>Name</label>
                  <input type="text" value={newUser.name} onChange={(e) => setNewUser({...newUser, name: e.target.value})} required style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }} />
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600' }}>Email</label>
                  <input type="email" value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})} required style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }} />
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600' }}>Password</label>
                  <input type="password" value={newUser.password} onChange={(e) => setNewUser({...newUser, password: e.target.value})} required style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }} />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600' }}>Role</label>
                  <select value={newUser.role} onChange={(e) => setNewUser({...newUser, role: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', cursor: 'pointer' }}>
                    <option value="user">User</option>
                    <option value="hr">HR</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => { setShowAddModal(false); setNewUser({ name: '', email: '', password: '', role: 'user' }); }} style={{ padding: '10px 20px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" style={{ padding: '10px 20px', background: '#667eea', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Add User</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {showEditModal && selectedUser && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: 'white', padding: '30px', borderRadius: '10px', maxWidth: '500px', width: '90%' }}>
              <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>Edit User</h2>
              <form onSubmit={handleUpdateUser}>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600' }}>Name</label>
                  <input type="text" value={selectedUser.name || ''} onChange={(e) => setSelectedUser({...selectedUser, name: e.target.value})} required style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }} />
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600' }}>Email</label>
                  <input type="email" value={selectedUser.email} onChange={(e) => setSelectedUser({...selectedUser, email: e.target.value})} required style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }} />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600' }}>Role</label>
                  <select value={selectedUser.role} onChange={(e) => setSelectedUser({...selectedUser, role: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', cursor: 'pointer' }}>
                    <option value="user">User</option>
                    <option value="hr">HR</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => { setShowEditModal(false); setSelectedUser(null); }} style={{ padding: '10px 20px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" style={{ padding: '10px 20px', background: '#667eea', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Update User</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}