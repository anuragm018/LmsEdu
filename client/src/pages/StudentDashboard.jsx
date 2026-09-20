import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  BookOpen, 
  PlayCircle, 
  Award, 
  CreditCard, 
  Clock, 
  TrendingUp,
  ArrowRight,
  Sparkles,
  Megaphone,
  Bell
} from 'lucide-react';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [eRes, tRes, aRes] = await Promise.all([
        API.get('/enrollments/my-courses'),
        API.get('/transactions/my-transactions'),
        API.get('/announcements/student/feed')
      ]);
      setEnrollments(eRes.data);
      setTransactions(tRes.data);
      setAnnouncements(aRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Welcome Banner */}
      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <img 
            src={user?.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'} 
            alt={user?.name} 
            style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--color-primary)' }}
          />
          <div>
            <h1 style={{ fontSize: '1.8rem', color: 'var(--color-primary)', fontWeight: 700 }}>Welcome back, {user?.name}!</h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
              Student Portal • {enrollments.length} Active Course Enrollments
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2rem'
      }}>
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '12px', borderRadius: 'var(--radius-sm)', background: 'var(--color-primary-subtle)', color: 'var(--color-primary)' }}>
            <BookOpen size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.5rem', color: 'var(--color-primary)', fontWeight: 700, margin: 0 }}>{enrollments.length}</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}>Enrolled Courses</p>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '12px', borderRadius: 'var(--radius-sm)', background: 'var(--color-primary-subtle)', color: 'var(--color-primary)' }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.5rem', color: 'var(--color-primary)', fontWeight: 700, margin: 0 }}>Active</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}>Learning Progress</p>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '12px', borderRadius: 'var(--radius-sm)', background: 'var(--color-accent-subtle)', color: 'var(--color-primary)' }}>
            <CreditCard size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.5rem', color: 'var(--color-primary)', fontWeight: 700, margin: 0 }}>{transactions.length}</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}>Purchases Logged</p>
          </div>
        </div>
      </div>

      {/* Instructor Announcements Feed */}
      {announcements.length > 0 && (
        <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '2rem', borderLeft: '4px solid var(--color-primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary)', fontWeight: 700 }}>
              <Megaphone size={18} color="var(--color-primary)" /> Course Announcements &amp; Updates ({announcements.length})
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>From your course instructors</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {announcements.slice(0, 4).map((ann) => {
              const isImportant = ann.priority === 'important';
              const isUpdate = ann.priority === 'update';
              return (
                <div 
                  key={ann._id} 
                  style={{
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-sm)',
                    background: isImportant ? 'rgba(220, 38, 38, 0.06)' : 'var(--color-primary-subtle)',
                    border: `1px solid ${isImportant ? 'var(--color-danger)' : 'var(--color-border)'}`
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-full)',
                        textTransform: 'uppercase',
                        background: isImportant ? 'rgba(220, 38, 38, 0.15)' : 'var(--color-accent-subtle)',
                        color: isImportant ? 'var(--color-danger)' : 'var(--color-primary)'
                      }}>
                        {isImportant ? '🚨 Important' : isUpdate ? '✨ Update' : '📢 Notice'}
                      </span>
                      <strong style={{ fontSize: '0.92rem', color: 'var(--color-text)' }}>{ann.title}</strong>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      {new Date(ann.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.86rem', color: 'var(--color-text-muted)', marginBottom: '8px', lineHeight: 1.4 }}>
                    {ann.content}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                    <span>Course: <strong style={{ color: 'var(--color-text)' }}>{ann.course_id?.name}</strong></span>
                    <span>•</span>
                    <span>Instructor: <strong style={{ color: 'var(--color-text)' }}>{ann.instructor_id?.name}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Enrolled & Purchased Courses Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary)', fontWeight: 700 }}>
            <BookOpen size={22} color="var(--color-primary)" /> My Courses
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
            Access all your purchased and enrolled courses
          </p>
        </div>
        <span className="badge badge-role" style={{ fontSize: '0.85rem', padding: '6px 14px' }}>
          {enrollments.length} Courses Purchased
        </span>
      </div>

      {loading ? (
        <p style={{ color: 'var(--color-text-muted)' }}>Loading your learning portal...</p>
      ) : enrollments.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', marginBottom: '2rem' }}>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }}>You have not purchased or enrolled in any courses yet.</p>
          <Link to="/courses" className="btn btn-primary btn-sm">Explore Courses to Purchase</Link>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.5rem',
          marginBottom: '3rem'
        }}>
          {enrollments.map((item) => {
            const c = item.course_id;
            if (!c) return null;
            return (
              <div key={item._id} className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', position: 'relative', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ position: 'relative', marginBottom: '1rem' }}>
                  <img 
                    src={c.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600'} 
                    alt={c.name} 
                    style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
                  />
                  <span className={`badge ${c.type === 'free' ? 'badge-free' : 'badge-paid'}`} style={{ position: 'absolute', top: '10px', right: '10px' }}>
                    {c.type === 'free' ? 'FREE' : `PURCHASED ($${c.price})`}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--color-primary)', fontWeight: 700 }}>{c.name}</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: '1rem', flex: 1 }}>{c.desc}</p>
                <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                  <Link to={`/learn/${c._id}`} className="btn btn-primary btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                    <PlayCircle size={16} /> Continue
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Purchase Transaction History */}
      {transactions.length > 0 && (
        <div>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '1.25rem', color: 'var(--color-primary)', fontWeight: 700 }}>Payment & Purchase History</h2>
          <div className="glass-panel" style={{ padding: '1rem', overflowX: 'auto', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left', color: 'var(--color-text-muted)' }}>
                  <th style={{ padding: '10px' }}>Reference</th>
                  <th style={{ padding: '10px' }}>Course</th>
                  <th style={{ padding: '10px' }}>Amount</th>
                  <th style={{ padding: '10px' }}>Payment Method</th>
                  <th style={{ padding: '10px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx._id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '10px', fontFamily: 'monospace', color: 'var(--color-primary)' }}>{tx.transaction_reference}</td>
                    <td style={{ padding: '10px', color: 'var(--color-text)' }}>{tx.course_id?.name || 'Course'}</td>
                    <td style={{ padding: '10px', fontWeight: 700, color: 'var(--color-text)' }}>${tx.amount}</td>
                    <td style={{ padding: '10px', color: 'var(--color-text-muted)' }}>{tx.payment_method}</td>
                    <td style={{ padding: '10px' }}>
                      <span className="badge badge-free">SUCCESS</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
