import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  BookOpen, 
  DollarSign, 
  ShieldCheck, 
  Trash2, 
  GraduationCap,
  Ban,
  CheckCircle2,
  Search,
  AlertCircle
} from 'lucide-react';

export const AdminDashboard = () => {
  const { user: currentUser } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [userFilter, setUserFilter] = useState('all');

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

  const handleToggleBlock = async (targetUser) => {
    if (currentUser?._id === targetUser._id) {
      alert('You cannot block your own administrator account.');
      return;
    }

    const action = targetUser.isBlocked ? 'unblock' : 'block';
    const confirmMsg = targetUser.isBlocked
      ? `Are you sure you want to unblock ${targetUser.name}? They will regain access to login and platform features.`
      : `Are you sure you want to block ${targetUser.name}? Their active sessions will be terminated and login access revoked.`;

    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await API.put(`/admin/users/${targetUser._id}/toggle-block`);
      const updatedBlockedStatus = res.data.isBlocked;
      setUsers(users.map(u => u._id === targetUser._id ? { ...u, isBlocked: updatedBlockedStatus } : u));
    } catch (err) {
      alert(err.response?.data?.message || `Failed to ${action} user`);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (currentUser?._id === userId) {
      alert('You cannot delete your own administrator account.');
      return;
    }
    if (!window.confirm('Are you sure you want to permanently delete this user? This action cannot be undone.')) return;
    try {
      await API.delete(`/admin/users/${userId}`);
      setUsers(users.filter(u => u._id !== userId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  };

  // Filter & Search Logic
  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      !searchTerm ||
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.phone_no?.includes(searchTerm);

    if (!matchesSearch) return false;

    if (userFilter === 'students') return u.role === 'student';
    if (userFilter === 'tutors') return u.role === 'instructor';
    if (userFilter === 'blocked') return !!u.isBlocked;

    return true;
  });

  const studentCount = users.filter(u => u.role === 'student').length;
  const tutorCount = users.filter(u => u.role === 'instructor').length;
  const blockedCount = users.filter(u => u.isBlocked).length;

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
              Full governance over EduSphere platform users, courses, access control, and revenue
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

      {/* Main Tabs */}
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

      {/* Users Management Tab */}
      {activeTab === 'users' && (
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          {/* Controls: Filter Pills & Search */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            marginBottom: '1.25rem',
            paddingBottom: '1rem',
            borderBottom: '1px solid var(--border-color)'
          }}>
            {/* Filter Pills */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                onClick={() => setUserFilter('all')}
                style={{
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor: userFilter === 'all' ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                  background: userFilter === 'all' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.03)',
                  color: userFilter === 'all' ? '#fff' : 'var(--text-muted)',
                  transition: 'all 0.15s ease'
                }}
              >
                All Users ({users.length})
              </button>
              <button
                onClick={() => setUserFilter('students')}
                style={{
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor: userFilter === 'students' ? '#06b6d4' : 'rgba(255,255,255,0.1)',
                  background: userFilter === 'students' ? 'rgba(6, 182, 212, 0.18)' : 'rgba(255,255,255,0.03)',
                  color: userFilter === 'students' ? '#22d3ee' : 'var(--text-muted)',
                  transition: 'all 0.15s ease'
                }}
              >
                Students ({studentCount})
              </button>
              <button
                onClick={() => setUserFilter('tutors')}
                style={{
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor: userFilter === 'tutors' ? '#a855f7' : 'rgba(255,255,255,0.1)',
                  background: userFilter === 'tutors' ? 'rgba(168, 85, 247, 0.18)' : 'rgba(255,255,255,0.03)',
                  color: userFilter === 'tutors' ? '#c084fc' : 'var(--text-muted)',
                  transition: 'all 0.15s ease'
                }}
              >
                Tutors ({tutorCount})
              </button>
              <button
                onClick={() => setUserFilter('blocked')}
                style={{
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor: userFilter === 'blocked' ? '#ef4444' : 'rgba(255,255,255,0.1)',
                  background: userFilter === 'blocked' ? 'rgba(239, 68, 68, 0.18)' : 'rgba(255,255,255,0.03)',
                  color: userFilter === 'blocked' ? '#f87171' : 'var(--text-muted)',
                  transition: 'all 0.15s ease'
                }}
              >
                Blocked ({blockedCount})
              </button>
            </div>

            {/* Search Input */}
            <div style={{ position: 'relative', minWidth: '240px', maxWidth: '320px', width: '100%' }}>
              <Search 
                size={14} 
                style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} 
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search user name or email..."
                style={{
                  width: '100%',
                  padding: '6px 12px 6px 32px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.12)',
                  background: 'rgba(15, 23, 42, 0.6)',
                  color: 'var(--text-main)',
                  fontSize: '0.84rem'
                }}
              />
            </div>
          </div>

          {/* Users Table */}
          <div style={{ overflowX: 'auto', minHeight: '340px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-dim)' }}>
                  <th style={{ padding: '10px' }}>User</th>
                  <th style={{ padding: '10px' }}>Email</th>
                  <th style={{ padding: '10px' }}>Phone</th>
                  <th style={{ padding: '10px' }}>Role</th>
                  <th style={{ padding: '10px' }}>Status</th>
                  <th style={{ padding: '10px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      No users match the selected filter or search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const isSelf = currentUser?._id === u._id;
                    const isBlocked = !!u.isBlocked;

                    return (
                      <tr 
                        key={u._id} 
                        style={{ 
                          borderBottom: '1px solid rgba(255,255,255,0.03)',
                          backgroundColor: isBlocked ? 'rgba(239, 68, 68, 0.04)' : 'transparent',
                          transition: 'background-color 0.15s ease'
                        }}
                      >
                        {/* User Identity */}
                        <td style={{ padding: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img 
                            src={u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} 
                            alt="" 
                            style={{ 
                              width: '34px', 
                              height: '34px', 
                              borderRadius: '50%',
                              border: isBlocked ? '2px solid rgba(239,68,68,0.5)' : '2px solid rgba(255,255,255,0.08)'
                            }}
                          />
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <strong style={{ color: isBlocked ? 'var(--text-muted)' : 'inherit' }}>{u.name}</strong>
                              {isSelf && (
                                <span style={{
                                  fontSize: '0.68rem',
                                  padding: '1px 6px',
                                  borderRadius: '4px',
                                  background: 'rgba(99, 102, 241, 0.25)',
                                  color: 'var(--primary)',
                                  fontWeight: 600
                                }}>
                                  YOU
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Email */}
                        <td style={{ padding: '10px', color: 'var(--text-muted)' }}>{u.email}</td>

                        {/* Phone */}
                        <td style={{ padding: '10px', color: 'var(--text-muted)' }}>{u.phone_no || '—'}</td>

                        {/* Static Role Badge (Permanent Role) */}
                        <td style={{ padding: '10px' }}>
                          {u.role === 'admin' ? (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              padding: '4px 10px',
                              borderRadius: '6px',
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              background: 'rgba(244, 63, 94, 0.12)',
                              color: '#fb7185',
                              border: '1px solid rgba(244, 63, 94, 0.28)'
                            }}>
                              <ShieldCheck size={13} />
                              Admin
                            </span>
                          ) : u.role === 'instructor' ? (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              padding: '4px 10px',
                              borderRadius: '6px',
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              background: 'rgba(168, 85, 247, 0.12)',
                              color: '#c084fc',
                              border: '1px solid rgba(168, 85, 247, 0.28)'
                            }}>
                              <BookOpen size={13} />
                              Tutor
                            </span>
                          ) : (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              padding: '4px 10px',
                              borderRadius: '6px',
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              background: 'rgba(6, 182, 212, 0.12)',
                              color: '#22d3ee',
                              border: '1px solid rgba(6, 182, 212, 0.28)'
                            }}>
                              <GraduationCap size={13} />
                              Student
                            </span>
                          )}
                        </td>

                        {/* Account Status */}
                        <td style={{ padding: '10px' }}>
                          {isBlocked ? (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              padding: '3px 9px',
                              borderRadius: '20px',
                              fontSize: '0.76rem',
                              fontWeight: 600,
                              background: 'rgba(239, 68, 68, 0.14)',
                              color: '#f87171',
                              border: '1px solid rgba(239, 68, 68, 0.35)'
                            }}>
                              <span style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                background: '#ef4444',
                                boxShadow: '0 0 6px rgba(239, 68, 68, 0.6)'
                              }} />
                              Blocked
                            </span>
                          ) : (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              padding: '3px 9px',
                              borderRadius: '20px',
                              fontSize: '0.76rem',
                              fontWeight: 600,
                              background: 'rgba(16, 185, 129, 0.12)',
                              color: '#34d399',
                              border: '1px solid rgba(16, 185, 129, 0.28)'
                            }}>
                              <span style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                background: '#10b981',
                                boxShadow: '0 0 6px rgba(16, 185, 129, 0.6)'
                              }} />
                              Active
                            </span>
                          )}
                        </td>

                        {/* Action Buttons */}
                        <td style={{ padding: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {/* Block / Unblock Toggle */}
                            {isSelf ? (
                              <span style={{
                                fontSize: '0.75rem',
                                color: 'var(--text-dim)',
                                fontStyle: 'italic',
                                padding: '4px 6px'
                              }}>
                                Protected
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleToggleBlock(u)}
                                title={isBlocked ? 'Unblock user account' : 'Block user account'}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '5px',
                                  padding: '5px 10px',
                                  borderRadius: '6px',
                                  fontSize: '0.78rem',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease',
                                  background: isBlocked ? 'rgba(16, 185, 129, 0.16)' : 'rgba(239, 68, 68, 0.14)',
                                  color: isBlocked ? '#34d399' : '#f87171',
                                  border: `1px solid ${isBlocked ? 'rgba(16, 185, 129, 0.35)' : 'rgba(239, 68, 68, 0.35)'}`
                                }}
                              >
                                {isBlocked ? <CheckCircle2 size={13} /> : <Ban size={13} />}
                                <span>{isBlocked ? 'Unblock' : 'Block'}</span>
                              </button>
                            )}

                            {/* Delete User */}
                            {!isSelf && (
                              <button 
                                onClick={() => handleDeleteUser(u._id)} 
                                className="btn btn-sm btn-danger"
                                style={{ padding: '5px 9px', fontSize: '0.78rem' }}
                                title="Delete user permanently"
                              >
                                <Trash2 size={13} /> Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
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
