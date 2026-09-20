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
    return <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)' }}>Loading Admin Portal...</div>;
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            padding: '12px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--color-primary-subtle)',
            color: 'var(--color-primary)',
            border: '1px solid var(--color-border)'
          }}>
            <ShieldCheck size={28} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.8rem', color: 'var(--color-primary)', fontWeight: 700 }}>System Administrator Command Center</h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
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
          <div className="glass-panel" style={{ padding: '1.25rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderLeft: '3px solid var(--color-primary)', borderRadius: 'var(--radius-sm)' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Total Users</p>
            <h3 style={{ fontSize: '1.8rem', color: 'var(--color-primary)', fontWeight: 800 }}>{stats.totalUsers}</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{stats.totalStudents} Students • {stats.totalInstructors} Tutors</span>
          </div>

          <div className="glass-panel" style={{ padding: '1.25rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderLeft: '3px solid var(--color-primary)', borderRadius: 'var(--radius-sm)' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Total Courses</p>
            <h3 style={{ fontSize: '1.8rem', color: 'var(--color-primary)', fontWeight: 800 }}>{stats.totalCourses}</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{stats.totalEnrollments} Enrollments</span>
          </div>

          <div className="glass-panel" style={{ padding: '1.25rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderLeft: '3px solid var(--color-accent)', borderRadius: 'var(--radius-sm)' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Platform Revenue</p>
            <h3 style={{ fontSize: '1.8rem', color: 'var(--color-primary)', fontWeight: 800 }}>${stats.totalRevenue?.toFixed(2)}</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Total Processed Transactions</span>
          </div>
        </div>
      )}

      {/* Main Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <button 
          onClick={() => setActiveTab('users')} 
          className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ borderRadius: 'var(--radius-sm)' }}
        >
          <Users size={16} /> User Management ({users.length})
        </button>

        <button 
          onClick={() => setActiveTab('transactions')} 
          className={`btn ${activeTab === 'transactions' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ borderRadius: 'var(--radius-sm)' }}
        >
          <DollarSign size={16} /> Revenue & Transactions ({transactions.length})
        </button>
      </div>

      {/* Users Management Tab */}
      {activeTab === 'users' && (
        <div className="glass-panel" style={{ padding: '1.25rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
          {/* Controls: Filter Pills & Search */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            marginBottom: '1.25rem',
            paddingBottom: '1rem',
            borderBottom: '1px solid var(--color-border)'
          }}>
            {/* Filter Pills */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                onClick={() => setUserFilter('all')}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor: userFilter === 'all' ? 'var(--color-primary)' : 'var(--color-border)',
                  background: userFilter === 'all' ? 'var(--color-primary-subtle)' : 'var(--color-surface)',
                  color: userFilter === 'all' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  transition: 'all 0.15s ease'
                }}
              >
                All Users ({users.length})
              </button>
              <button
                onClick={() => setUserFilter('students')}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor: userFilter === 'students' ? 'var(--color-primary)' : 'var(--color-border)',
                  background: userFilter === 'students' ? 'var(--color-primary-subtle)' : 'var(--color-surface)',
                  color: userFilter === 'students' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  transition: 'all 0.15s ease'
                }}
              >
                Students ({studentCount})
              </button>
              <button
                onClick={() => setUserFilter('tutors')}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor: userFilter === 'tutors' ? 'var(--color-primary)' : 'var(--color-border)',
                  background: userFilter === 'tutors' ? 'var(--color-primary-subtle)' : 'var(--color-surface)',
                  color: userFilter === 'tutors' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  transition: 'all 0.15s ease'
                }}
              >
                Tutors ({tutorCount})
              </button>
              <button
                onClick={() => setUserFilter('blocked')}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor: userFilter === 'blocked' ? 'var(--danger)' : 'var(--color-border)',
                  background: userFilter === 'blocked' ? 'rgba(239, 68, 68, 0.1)' : 'var(--color-surface)',
                  color: userFilter === 'blocked' ? 'var(--danger)' : 'var(--color-text-muted)',
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
                style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} 
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search user name or email..."
                style={{
                  width: '100%',
                  padding: '6px 12px 6px 32px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-surface)',
                  color: 'var(--color-text)',
                  fontSize: '0.84rem'
                }}
              />
            </div>
          </div>

          {/* Users Table */}
          <div style={{ overflowX: 'auto', minHeight: '340px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left', color: 'var(--color-text-muted)' }}>
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
                    <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
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
                          borderBottom: '1px solid var(--color-border)',
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
                              border: isBlocked ? '2px solid var(--danger)' : '1px solid var(--color-border)'
                            }}
                          />
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <strong style={{ color: isBlocked ? 'var(--color-text-muted)' : 'var(--color-text)' }}>{u.name}</strong>
                              {isSelf && (
                                <span style={{
                                  fontSize: '0.68rem',
                                  padding: '1px 6px',
                                  borderRadius: 'var(--radius-full)',
                                  background: 'var(--color-primary-subtle)',
                                  color: 'var(--color-primary)',
                                  fontWeight: 600,
                                  border: '1px solid var(--color-border)'
                                }}>
                                  YOU
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Email */}
                        <td style={{ padding: '10px', color: 'var(--color-text-muted)' }}>{u.email}</td>

                        {/* Phone */}
                        <td style={{ padding: '10px', color: 'var(--color-text-muted)' }}>{u.phone_no || '—'}</td>

                        {/* Static Role Badge (Permanent Role) */}
                        <td style={{ padding: '10px' }}>
                          {u.role === 'admin' ? (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              padding: '3px 9px',
                              borderRadius: 'var(--radius-full)',
                              fontSize: '0.76rem',
                              fontWeight: 600,
                              background: 'rgba(244, 63, 94, 0.1)',
                              color: '#e11d48',
                              border: '1px solid rgba(244, 63, 94, 0.25)'
                            }}>
                              <ShieldCheck size={13} />
                              Admin
                            </span>
                          ) : u.role === 'instructor' ? (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              padding: '3px 9px',
                              borderRadius: 'var(--radius-full)',
                              fontSize: '0.76rem',
                              fontWeight: 600,
                              background: 'var(--color-primary-subtle)',
                              color: 'var(--color-primary)',
                              border: '1px solid var(--color-border)'
                            }}>
                              <BookOpen size={13} />
                              Tutor
                            </span>
                          ) : (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              padding: '3px 9px',
                              borderRadius: 'var(--radius-full)',
                              fontSize: '0.76rem',
                              fontWeight: 600,
                              background: 'var(--color-surface)',
                              color: 'var(--color-text)',
                              border: '1px solid var(--color-border)'
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
                              borderRadius: 'var(--radius-full)',
                              fontSize: '0.76rem',
                              fontWeight: 600,
                              background: 'rgba(239, 68, 68, 0.1)',
                              color: 'var(--danger)',
                              border: '1px solid rgba(239, 68, 68, 0.25)'
                            }}>
                              <span style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                background: 'var(--danger)'
                              }} />
                              Blocked
                            </span>
                          ) : (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              padding: '3px 9px',
                              borderRadius: 'var(--radius-full)',
                              fontSize: '0.76rem',
                              fontWeight: 600,
                              background: 'var(--color-accent-subtle)',
                              color: 'var(--color-primary)',
                              border: '1px solid var(--color-border)'
                            }}>
                              <span style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                background: 'var(--color-accent)'
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
                                color: 'var(--color-text-muted)',
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
                                  borderRadius: 'var(--radius-sm)',
                                  fontSize: '0.78rem',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease',
                                  background: isBlocked ? 'var(--color-accent-subtle)' : 'rgba(239, 68, 68, 0.1)',
                                  color: isBlocked ? 'var(--color-primary)' : 'var(--danger)',
                                  border: `1px solid ${isBlocked ? 'var(--color-border)' : 'rgba(239, 68, 68, 0.25)'}`
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
                                style={{ padding: '5px 9px', fontSize: '0.78rem', borderRadius: 'var(--radius-sm)' }}
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
        <div className="glass-panel" style={{ padding: '1.25rem', overflowX: 'auto', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left', color: 'var(--color-text-muted)' }}>
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
                <tr key={tx._id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '10px', fontFamily: 'monospace', color: 'var(--color-primary)' }}>{tx.transaction_reference}</td>
                  <td style={{ padding: '10px', color: 'var(--color-text)' }}>{tx.user_id?.name || 'Student'}</td>
                  <td style={{ padding: '10px', color: 'var(--color-text)' }}>{tx.course_id?.name || 'Course'}</td>
                  <td style={{ padding: '10px', fontWeight: 700, color: 'var(--color-primary)' }}>${tx.amount}</td>
                  <td style={{ padding: '10px', color: 'var(--color-text-muted)' }}>{tx.payment_method}</td>
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
