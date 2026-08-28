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
  ArrowRight
} from 'lucide-react';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [eRes, tRes] = await Promise.all([
        API.get('/enrollments/my-courses'),
        API.get('/transactions/my-transactions')
      ]);
      setEnrollments(eRes.data);
      setTransactions(tRes.data);
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
            style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }}
          />
          <div>
            <h1 style={{ fontSize: '1.8rem' }}>Welcome back, {user?.name}!</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
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
          <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)' }}>
            <BookOpen size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.5rem' }}>{enrollments.length}</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Enrolled Courses</p>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(6, 182, 212, 0.15)', color: 'var(--secondary)' }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.5rem' }}>Active</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Learning Progress</p>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
            <CreditCard size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.5rem' }}>{transactions.length}</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Purchases Logged</p>
          </div>
        </div>
      </div>

      {/* Enrolled Courses Grid */}
      <h2 style={{ fontSize: '1.4rem', marginBottom: '1.25rem' }}>My Enrolled Courses</h2>
      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading enrollments...</p>
      ) : enrollments.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', marginBottom: '2rem' }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>You have not enrolled in any courses yet.</p>
          <Link to="/courses" className="btn btn-primary btn-sm">Browse Catalog</Link>
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
              <div key={item._id} className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
                <img 
                  src={c.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600'} 
                  alt={c.name}
                  style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', marginBottom: '1rem' }}
                />
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{c.name}</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem', flex: 1 }}>{c.desc}</p>
                <Link to={`/learn/${c._id}`} className="btn btn-primary btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                  <PlayCircle size={16} /> Continue Learning
                </Link>
              </div>
            );
          })}
        </div>
      )}

      {/* Purchase Transaction History */}
      {transactions.length > 0 && (
        <div>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '1.25rem' }}>Payment & Purchase History</h2>
          <div className="glass-panel" style={{ padding: '1rem', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-dim)' }}>
                  <th style={{ padding: '10px' }}>Reference</th>
                  <th style={{ padding: '10px' }}>Course</th>
                  <th style={{ padding: '10px' }}>Amount</th>
                  <th style={{ padding: '10px' }}>Payment Method</th>
                  <th style={{ padding: '10px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <td style={{ padding: '10px', fontFamily: 'monospace', color: 'var(--secondary)' }}>{tx.transaction_reference}</td>
                    <td style={{ padding: '10px' }}>{tx.course_id?.name || 'Course'}</td>
                    <td style={{ padding: '10px', fontWeight: 700 }}>${tx.amount}</td>
                    <td style={{ padding: '10px' }}>{tx.payment_method}</td>
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
