import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, XCircle, KeyRound, ShieldCheck, ArrowRight, Mail } from 'lucide-react';

export const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const initialEmail = searchParams.get('email') || '';
  const token = searchParams.get('token') || '';

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [status, setStatus] = useState(token ? 'verifying' : 'idle'); // idle, verifying, success, error
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      verifyTokenLink(token);
    }
  }, [token]);

  const verifyTokenLink = async (t) => {
    setStatus('verifying');
    try {
      const res = await API.get(`/auth/verify-email/${t}`);
      setStatus('success');
      setMessage(res.data.message || 'Email verified successfully!');
      updateLocalUserVerified();
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Invalid or expired verification token.');
    }
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !otp.trim()) return;

    setLoading(true);
    setMessage('');
    try {
      const res = await API.post('/auth/verify-otp', {
        email: email.trim(),
        otp: otp.trim()
      });

      setStatus('success');
      setMessage(res.data.message || 'OTP Verified! Account activated.');
      updateLocalUserVerified();
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Incorrect 6-digit OTP code.');
    } finally {
      setLoading(false);
    }
  };

  const updateLocalUserVerified = () => {
    const savedUser = JSON.parse(localStorage.getItem('edusphere_user') || 'null');
    if (savedUser) {
      savedUser.isVerified = true;
      localStorage.setItem('edusphere_user', JSON.stringify(savedUser));
    }
  };

  return (
    <div style={{ maxWidth: '480px', margin: '3.5rem auto', padding: '1rem' }} className="animate-fade-in">
      <div className="glass-panel" style={{ padding: '2.5rem 2rem' }}>
        {status === 'success' ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'inline-block', marginBottom: '1rem', color: 'var(--success)' }}>
              <CheckCircle2 size={64} />
            </div>
            <h2 style={{ fontSize: '1.8rem', color: '#ffffff' }}>Account Activated!</h2>
            <p style={{ color: 'var(--text-muted)', margin: '1rem 0 1.5rem' }}>{message}</p>
            <Link to="/courses" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }}>
              Explore & Enroll in Courses <ArrowRight size={18} />
            </Link>
          </div>
        ) : (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                marginBottom: '1rem',
                boxShadow: '0 4px 14px rgba(99,102,241,0.4)'
              }}>
                <KeyRound size={28} />
              </div>
              <h2 style={{ fontSize: '1.6rem' }}>Enter 6-Digit OTP Code</h2>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Check your email inbox for your EduSphere verification code
              </p>
            </div>

            {status === 'error' && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: 'var(--danger)',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.85rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <XCircle size={18} /> {message}
              </div>
            )}

            <form onSubmit={handleOTPSubmit}>
              <div className="form-group">
                <label><Mail size={14} style={{ display: 'inline', marginRight: '4px' }} /> Student Email Address</label>
                <input 
                  type="email" 
                  className="form-control" 
                  placeholder="student@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label><ShieldCheck size={14} style={{ display: 'inline', marginRight: '4px' }} /> 6-Digit OTP Code</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. 482910"
                  maxLength={6}
                  style={{
                    letterSpacing: '0.25em',
                    fontSize: '1.3rem',
                    fontWeight: '700',
                    textAlign: 'center',
                    color: 'var(--secondary)'
                  }}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  required
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '0.5rem', padding: '12px' }}
                disabled={loading || otp.length < 6}
              >
                {loading ? 'Verifying OTP...' : 'Verify OTP Code'}
              </button>
            </form>

            <p style={{ textAlign: 'center', fontSize: '0.82rem', marginTop: '1.5rem', color: 'var(--text-dim)' }}>
              Didn't receive the email? Check your spam folder or contact support.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
