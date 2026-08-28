import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { 
  Users, 
  BookOpen, 
  DollarSign, 
  ShieldCheck, 
  Trash2, 
  UserCheck, 
  TrendingUp, 
  Award,
  AlertCircle
} from 'lucide-react';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [sRes, uRes, tRes] = await Promise.all([
        API.get('/admin/stats'),
        API.get('/admin/users'),
        API.get('/transactions/admin/all')
      ]);

      setStats(sRes.data);
      setUsers(uRes.data);
      setTransactions(tRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await API.put(`/admin/users/${userId}/role`, { role: newRole });
      setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user role');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await API.delete(`/admin/users/${userId}`);
      setUsers(users.filter(u => u._id !== userId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Loading Admin Portal...</div>;
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            padding: '12px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, var(--danger), var(--accent))',
            color: '#fff'
          }}>
            <ShieldCheck size={28} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.8rem' }}>System Administrator Command Center</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Full governance over EduSphere platform users, courses, roles, and revenue
            </p>
          </div>
        </div>
      </div>

      {/* Admin Stats Grid */}
      {stats && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem'
        }}>
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Users</p>
            <h3 style={{ fontSize: '1.8rem', color: 'var(--primary)' }}>{stats.totalUsers}</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{stats.totalStudents} Students • {stats.totalInstructors} Tutors</span>
          </div>

          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Courses</p>
            <h3 style={{ fontSize: '1.8rem', color: 'var(--secondary)' }}>{stats.totalCourses}</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{stats.totalEnrollments} Enrollments</span>
          </div>

          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Platform Revenue</p>
            <h3 style={{ fontSize: '1.8rem', color: 'var(--success)' }}>${stats.totalRevenue?.toFixed(2)}</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Total Processed Transactions</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <button 
          onClick={() => setActiveTab('users')} 
          className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Users size={16} /> User Management ({users.length})
        </button>

        <button 
          onClick={() => setActiveTab('transactions')} 
          className={`btn ${activeTab === 'transactions' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <DollarSign size={16} /> Revenue & Transactions ({transactions.length})
        </button>
      </div>

      {/* Users Table Tab */}
      {activeTab === 'users' && (
        <div className="glass-panel" style={{ padding: '1.25rem', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-dim)' }}>
                <th style={{ padding: '10px' }}>User</th>
                <th style={{ padding: '10px' }}>Email</th>
                <th style={{ padding: '10px' }}>Phone</th>
                <th style={{ padding: '10px' }}>Role Guard</th>
                <th style={{ padding: '10px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <td style={{ padding: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img 
                      src={u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} 
                      alt="" 
                      style={{ width: '32px', height: '32px', borderRadius: '50%' }}
                    />
                    <strong>{u.name}</strong>
                  </td>
                  <td style={{ padding: '10px', color: 'var(--text-muted)' }}>{u.email}</td>
                  <td style={{ padding: '10px', color: 'var(--text-muted)' }}>{u.phone_no || 'N/A'}</td>
                  <td style={{ padding: '10px' }}>
                    <select 
                      className="form-control" 
                      style={{ padding: '4px 8px', fontSize: '0.8rem', width: 'auto' }}
                      value={u.role}
                      onChange={(e) => handleRoleChange(u._id, e.target.value)}
                    >
                      <option value="student">student</option>
                      <option value="instructor">instructor</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td style={{ padding: '10px' }}>
                    <button 
                      onClick={() => handleDeleteUser(u._id)} 
                      className="btn btn-sm btn-danger"
                      title="Delete User"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Transactions Table Tab */}
      {activeTab === 'transactions' && (
        <div className="glass-panel" style={{ padding: '1.25rem', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-dim)' }}>
                <th style={{ padding: '10px' }}>Txn Reference</th>
                <th style={{ padding: '10px' }}>Student</th>
                <th style={{ padding: '10px' }}>Course</th>
                <th style={{ padding: '10px' }}>Amount</th>
                <th style={{ padding: '10px' }}>Method</th>
                <th style={{ padding: '10px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <td style={{ padding: '10px', fontFamily: 'monospace', color: 'var(--secondary)' }}>{tx.transaction_reference}</td>
                  <td style={{ padding: '10px' }}>{tx.user_id?.name || 'Student'}</td>
                  <td style={{ padding: '10px' }}>{tx.course_id?.name || 'Course'}</td>
                  <td style={{ padding: '10px', fontWeight: 700, color: 'var(--success)' }}>${tx.amount}</td>
                  <td style={{ padding: '10px' }}>{tx.payment_method}</td>
                  <td style={{ padding: '10px' }}>
                    <span className="badge badge-free">SUCCESS</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
