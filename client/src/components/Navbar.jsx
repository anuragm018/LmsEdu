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
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      background: 'var(--color-surface)',
      borderBottom: '1px solid var(--color-border)',
      padding: '0.8rem 1.5rem'
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Brand Logo: Forest Green */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-text-on-dark)'
          }}>
            <GraduationCap size={22} />
          </div>
          <div>
            <span style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--color-primary)' }}>
              Edu<span style={{ color: 'var(--color-accent)' }}>Sphere</span>
            </span>
            <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Next-Gen LMS
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
                        background: 'var(--color-danger)',
                        color: 'var(--color-text-on-dark)',
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        padding: '1px 6px',
                        borderRadius: 'var(--radius-full)',
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
                      background: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text-muted)',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '7px',
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer'
                    }}
                    title="Tutor Total Revenue - Click to view earnings analytics"
                  >
                    <div style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--color-primary-subtle)',
                      color: 'var(--color-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <DollarSign size={12} style={{ strokeWidth: 3 }} />
                    </div>
                    <span>
                      Revenue: <span style={{ color: 'var(--color-text)', fontWeight: 800 }}>${revenue.toFixed(2)}</span>
                    </span>
                  </button>

                  <button
                    onClick={() => navigate('/dashboard/instructor?tab=doubts')}
                    className="nav-link"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '7px',
                      padding: '6px 12px',
                      cursor: 'pointer',
                      position: 'relative'
                    }}
                    title="Student Doubts & Questions - Click to open doubts chat"
                  >
                    <MessageSquare size={15} />
                    <span>Doubts</span>
                    {unreadDoubtsCount > 0 && (
                      <span style={{
                        background: 'var(--color-danger)',
                        color: 'var(--color-text-on-dark)',
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        padding: '1px 6px',
                        borderRadius: 'var(--radius-full)',
                        lineHeight: 1.2
                      }}>
                        {unreadDoubtsCount}
                      </span>
                    )}
                  </button>

                  <Link to="/dashboard/instructor" className="btn btn-sm btn-secondary" style={{ marginLeft: '4px' }}>
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
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text-muted)',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '7px',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer'
                  }}
                  title="Platform Total Revenue - Click to view dashboard"
                >
                  <div style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--color-primary-subtle)',
                    color: 'var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <DollarSign size={12} style={{ strokeWidth: 3 }} />
                  </div>
                  <span>
                    Revenue: <span style={{ color: 'var(--color-text)', fontWeight: 800 }}>${revenue.toFixed(2)}</span>
                  </span>
                </button>
              )}

              {/* User Profile Badge */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: 'var(--color-surface)',
                padding: '4px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                marginLeft: '6px'
              }}>
                <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} title="Edit Profile">
                  <img 
                    src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} 
                    alt={user.name} 
                    style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text)' }}>{user.name}</span>
                </Link>
                
                <button 
                  onClick={handleLogout} 
                  title="Logout" 
                  style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', marginLeft: '4px' }}
                >
                  <LogOut size={16} />
                </button>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '8px', marginLeft: '8px' }}>
              <Link to="/login" className="btn btn-sm btn-secondary">Sign In</Link>
              <Link to="/register" className="btn btn-sm btn-primary">Get Started</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
