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
  const [verifiedUser, setVerifiedUser] = useState(null);
  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const { setVerifiedUserSession } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleResendOTP = async () => {
    if (!email.trim() || cooldown > 0 || resending) return;
    setResending(true);
    setResendMsg('');
    try {
      const res = await API.post('/auth/resend-otp', { email: email.trim() });
      setResendMsg(res.data.message || 'New OTP sent to your email!');
      setCooldown(30);
    } catch (err) {
      setResendMsg(err.response?.data?.message || 'Failed to resend OTP.');
    } finally {
      setResending(false);
    }
  };

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
      if (res.data.user) {
        setVerifiedUser(res.data.user);
        setVerifiedUserSession(res.data.user);
      }
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
      if (res.data.user) {
        setVerifiedUser(res.data.user);
        setVerifiedUserSession(res.data.user);
      }
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Incorrect 6-digit OTP code.');
    } finally {
      setLoading(false);
    }
  };

  const getDashboardLink = () => {
    if (!verifiedUser) return '/login';
    if (verifiedUser.role === 'admin') return '/dashboard/admin';
    if (verifiedUser.role === 'instructor') return '/dashboard/instructor';
    return '/dashboard/student';
  };

  return (
    <div style={{ maxWidth: '480px', margin: '3.5rem auto', padding: '1rem' }} className="animate-fade-in">
      <div className="glass-panel" style={{ padding: '2.5rem 2rem' }}>
        {status === 'success' ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'inline-block', marginBottom: '1rem', color: 'var(--color-accent)' }}>
              <CheckCircle2 size={64} />
            </div>
            <h2 style={{ fontSize: '1.8rem', color: 'var(--color-primary)', fontWeight: 700 }}>Account Activated!</h2>
            <p style={{ color: 'var(--color-text-muted)', margin: '1rem 0 1.5rem' }}>{message}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Link to={getDashboardLink()} className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }}>
                Go to Dashboard <ArrowRight size={18} />
              </Link>
              <Link to="/courses" className="btn btn-secondary btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                Explore Courses
              </Link>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--color-primary-subtle)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-primary)',
                marginBottom: '1rem',
                border: '1px solid var(--color-border)'
              }}>
                <KeyRound size={28} />
              </div>
              <h2 style={{ fontSize: '1.6rem', color: 'var(--color-primary)', fontWeight: 700 }}>Enter 6-Digit OTP Code</h2>
              <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                Enter the 6-digit OTP code sent to your email to activate your account
              </p>
            </div>

            {status === 'error' && (
              <div style={{
                background: 'rgba(220, 38, 38, 0.1)',
                border: '1px solid var(--color-danger)',
                color: 'var(--color-danger)',
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
                <label><Mail size={14} style={{ display: 'inline', marginRight: '4px' }} /> Email Address</label>
                <input 
                  type="email" 
                  className="form-control" 
                  placeholder="name@example.com"
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
                    color: 'var(--color-primary)'
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
                {loading ? 'Verifying OTP...' : 'Verify OTP & Activate Account'}
              </button>

              <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={resending || cooldown > 0 || !email.trim()}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: (resending || cooldown > 0) ? 'var(--color-text-muted)' : 'var(--color-primary)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: (resending || cooldown > 0) ? 'not-allowed' : 'pointer',
                    textDecoration: (resending || cooldown > 0) ? 'none' : 'underline'
                  }}
                >
                  {resending ? 'Sending new OTP...' : cooldown > 0 ? `Resend OTP in ${cooldown}s` : 'Resend OTP to Email'}
                </button>
                {resendMsg && (
                  <p style={{ 
                    fontSize: '0.82rem', 
                    color: resendMsg.includes('Failed') ? 'var(--color-danger)' : 'var(--color-primary)', 
                    marginTop: '6px',
                    fontWeight: 500
                  }}>
                    {resendMsg}
                  </p>
                )}
              </div>
            </form>

            <p style={{ textAlign: 'center', fontSize: '0.82rem', marginTop: '1.5rem', color: 'var(--color-text-muted)' }}>
              Didn't receive the email? Check your spam folder or click Resend OTP above.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
