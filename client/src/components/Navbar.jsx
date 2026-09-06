import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { 
  GraduationCap, 
  BookOpen, 
  User, 
  LogOut, 
  PlusCircle, 
  LayoutDashboard,
  DollarSign,
  MessageSquare
} from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [revenue, setRevenue] = useState(0);
  const [unreadDoubtsCount, setUnreadDoubtsCount] = useState(0);

  const fetchRevenue = async () => {
    if (!user || user.role === 'student') return;
    try {
      const res = await API.get('/transactions/total-revenue');
      if (res.data && typeof res.data.totalRevenue === 'number') {
        setRevenue(res.data.totalRevenue);
      }
    } catch (err) {
      console.error('Failed to fetch total revenue for navbar:', err);
    }
  };

  const fetchUnreadDoubts = async () => {
    if (!user) return;
    try {
      if (user.role === 'instructor') {
        const res = await API.get('/chat/tutor/threads');
        if (Array.isArray(res.data)) {
          const count = res.data.reduce((sum, t) => sum + (t.unreadCount || 0), 0);
          setUnreadDoubtsCount(count);
        }
      } else if (user.role === 'student') {
        const res = await API.get('/chat/student/threads');
        if (Array.isArray(res.data)) {
          const count = res.data.reduce((sum, t) => sum + (t.unreadCount || 0), 0);
          setUnreadDoubtsCount(count);
        }
      }
    } catch (err) {
      console.error('Failed to fetch unread doubts:', err);
    }
  };

  useEffect(() => {
    if (user && user.role !== 'student') {
      fetchRevenue();
    }
    if (user && (user.role === 'instructor' || user.role === 'student')) {
      fetchUnreadDoubts();
      const interval = setInterval(fetchUnreadDoubts, 5000); // 5s live polling for new messages
      return () => clearInterval(interval);
    }
  }, [user, location.pathname]);

  const handleRevenueClick = () => {
    if (!user) return;
    if (user.role === 'instructor') {
      navigate('/dashboard/instructor');
    } else if (user.role === 'admin') {
      navigate('/dashboard/admin');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/dashboard/admin';
    if (user.role === 'instructor') return '/dashboard/instructor';
    return '/dashboard/student';
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="glass-panel" style={{
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      borderRadius: 0,
      borderTop: 'none',
      borderLeft: 'none',
      borderRight: 'none',
      padding: '0.8rem 1.5rem'
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)'
          }}>
            <GraduationCap size={24} />
          </div>
          <div>
            <span style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
              Edu<span style={{ color: 'var(--secondary)' }}>Sphere</span>
            </span>
            <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Next-Gen LMS
            </span>
          </div>
        </Link>

        {/* Navigation Links with Active & Hover Effects */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link to="/courses" className={`nav-link ${isActive('/courses') ? 'active' : ''}`}>
            <BookOpen size={17} /> Catalog
          </Link>

          {user ? (
            <>
              {/* Student View: Catalog, My Courses, and Doubts */}
              {user.role === 'student' && (
                <>
                  <Link to="/dashboard/student" className={`nav-link ${isActive('/dashboard/student') ? 'active' : ''}`}>
                    <BookOpen size={17} /> My Courses
                  </Link>

                  <Link 
                    to="/doubts" 
                    className={`nav-link ${isActive('/doubts') ? 'active' : ''}`}
                    style={{ display: 'flex', alignItems: 'center', gap: '7px', position: 'relative' }}
                    title="Ask doubts and discuss with your course tutors"
                  >
                    <MessageSquare size={17} /> 
                    <span>Doubts</span>
                    {unreadDoubtsCount > 0 && (
                      <span style={{
                        background: 'var(--danger)',
                        color: '#fff',
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        padding: '1px 6px',
                        borderRadius: '10px',
                        lineHeight: 1.2
                      }}>
                        {unreadDoubtsCount}
                      </span>
                    )}
                  </Link>
                </>
              )}

              {/* Non-Student Dashboard Link */}
              {user.role !== 'student' && (
                <Link to={getDashboardPath()} className={`nav-link ${isActive(getDashboardPath()) ? 'active' : ''}`}>
                  <LayoutDashboard size={17} /> Dashboard
                </Link>
              )}

              {/* Instructor View: Total Revenue Button + Studio Link */}
              {user.role === 'instructor' && (
                <>
                  <button
                    onClick={handleRevenueClick}
                    className="revenue-nav-btn"
                    style={{
                      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.16), rgba(6, 182, 212, 0.12))',
                      border: '1px solid rgba(16, 185, 129, 0.4)',
                      color: '#10b981',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '7px',
                      padding: '6px 13px',
                      borderRadius: 'var(--radius-full)',
                      boxShadow: '0 2px 12px rgba(16, 185, 129, 0.18)',
                      cursor: 'pointer',
                      textDecoration: 'none'
                    }}
                    title="Tutor Total Revenue - Click to view earnings analytics"
                  >
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: 'rgba(16, 185, 129, 0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <DollarSign size={13} style={{ strokeWidth: 3 }} />
                    </div>
                    <span>
                      Total Revenue: <span style={{ color: '#ffffff', fontWeight: 800 }}>${revenue.toFixed(2)}</span>
                    </span>
                  </button>

                  <button
                    onClick={() => navigate('/dashboard/instructor?tab=doubts')}
                    className="nav-link"
                    style={{
                      background: unreadDoubtsCount > 0 ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                      border: unreadDoubtsCount > 0 ? '1px solid rgba(99, 102, 241, 0.45)' : '1px solid rgba(255, 255, 255, 0.1)',
                      color: unreadDoubtsCount > 0 ? '#a5b4fc' : 'var(--text-main)',
                      fontWeight: 600,
                      fontSize: '0.82rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '7px',
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-full)',
                      cursor: 'pointer',
                      position: 'relative'
                    }}
                    title="Student Doubts & Questions - Click to open doubts chat"
                  >
                    <MessageSquare size={15} color={unreadDoubtsCount > 0 ? 'var(--primary)' : 'var(--text-muted)'} />
                    <span>Doubts</span>
                    {unreadDoubtsCount > 0 && (
                      <span style={{
                        background: 'var(--danger)',
                        color: '#fff',
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        padding: '1px 6px',
                        borderRadius: '10px',
                        lineHeight: 1.2
                      }}>
                        {unreadDoubtsCount}
                      </span>
                    )}
                  </button>

                  <Link to="/dashboard/instructor" className="btn btn-sm btn-primary" style={{ marginLeft: '4px' }}>
                    <PlusCircle size={16} /> Studio
                  </Link>
                </>
              )}

              {/* Admin View: Platform Total Revenue Button */}
              {user.role === 'admin' && (
                <button
                  onClick={handleRevenueClick}
                  className="revenue-nav-btn"
                  style={{
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.16), rgba(6, 182, 212, 0.12))',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    color: '#10b981',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '7px',
                    padding: '6px 13px',
                    borderRadius: 'var(--radius-full)',
                    boxShadow: '0 2px 12px rgba(16, 185, 129, 0.18)',
                    cursor: 'pointer',
                    textDecoration: 'none'
                  }}
                  title="Platform Total Revenue - Click to view dashboard"
                >
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: 'rgba(16, 185, 129, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <DollarSign size={13} style={{ strokeWidth: 3 }} />
                  </div>
                  <span>
                    Total Revenue: <span style={{ color: '#ffffff', fontWeight: 800 }}>${revenue.toFixed(2)}</span>
                  </span>
                </button>
              )}

              {/* User Profile Badge — Click to Edit Profile */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: 'rgba(255,255,255,0.05)',
                padding: '5px 14px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border-color)',
                marginLeft: '8px'
              }}>
                <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} title="Edit Profile">
                  <img 
                    src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} 
                    alt={user.name} 
                    style={{ width: '26px', height: '26px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user.name}</span>
                </Link>
                
                <button 
                  onClick={handleLogout} 
                  title="Logout" 
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', marginLeft: '4px' }}
                >
                  <LogOut size={16} />
                </button>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '10px', marginLeft: '8px' }}>
              <Link to="/login" className="btn btn-sm btn-secondary">Sign In</Link>
              <Link to="/register" className="btn btn-sm btn-primary">Get Started</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
