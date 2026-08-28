import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { Key, Mail, Lock, CheckCircle2, AlertCircle, ArrowLeft, ShieldCheck } from 'lucide-react';

export const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Request OTP, 2: Enter OTP & New Password, 3: Success
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await API.post('/auth/forgot-password', { email: email.trim() });
      setMessage(res.data.message || 'Password reset 6-digit OTP code sent to your email.');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Error requesting password reset OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await API.post('/auth/reset-password', {
        email: email.trim(),
        otp: otp.trim(),
        newPassword
      });

      setMessage(res.data.message || 'Password reset successfully!');
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Error resetting password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '460px', margin: '3.5rem auto', padding: '1rem' }} className="animate-fade-in">
      <div className="glass-panel" style={{ padding: '2.5rem 2rem' }}>
        {/* Step 1: Request OTP */}
        {step === 1 && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{
                width: '54px',
                height: '54px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, var(--danger), var(--accent))',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                marginBottom: '1rem',
                boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)'
              }}>
                <Key size={26} />
              </div>
              <h2 style={{ fontSize: '1.6rem' }}>Forgot Password?</h2>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Enter your email address to receive a 6-digit reset OTP code
              </p>
            </div>

            {error && (
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
                <AlertCircle size={18} /> {error}
              </div>
            )}

            <form onSubmit={handleRequestOTP}>
              <div className="form-group">
                <label><Mail size={14} style={{ display: 'inline', marginRight: '4px' }} /> Account Email Address</label>
                <input 
                  type="email" 
                  className="form-control" 
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '0.5rem', padding: '12px' }}
                disabled={loading}
              >
                {loading ? 'Sending OTP Code...' : 'Send Reset 6-Digit OTP'}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <Link to="/login" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <ArrowLeft size={14} /> Back to Sign In
              </Link>
            </div>
          </div>
        )}

        {/* Step 2: Reset Password Form */}
        {step === 2 && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{
                width: '54px',
                height: '54px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, var(--warning), var(--primary))',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                marginBottom: '1rem'
              }}>
                <ShieldCheck size={28} />
              </div>
              <h2 style={{ fontSize: '1.6rem' }}>Reset Password</h2>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Enter the 6-digit OTP code sent to <strong>{email}</strong>
              </p>
            </div>

            {error && (
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
                <AlertCircle size={18} /> {error}
              </div>
            )}

            {message && (
              <div style={{
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                color: 'var(--success)',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.85rem',
                marginBottom: '1.25rem'
              }}>
                {message}
              </div>
            )}

            <form onSubmit={handleResetPassword}>
              <div className="form-group">
                <label>6-Digit Reset OTP Code</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. 839201"
                  maxLength={6}
                  style={{
                    letterSpacing: '0.25em',
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    textAlign: 'center',
                    color: 'var(--secondary)'
                  }}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  required
                />
              </div>

              <div className="form-group">
                <label><Lock size={14} style={{ display: 'inline', marginRight: '4px' }} /> New Password</label>
                <input 
                  type="password" 
                  className="form-control" 
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  minLength={6}
                  required
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '0.5rem', padding: '12px' }}
                disabled={loading || otp.length < 6}
              >
                {loading ? 'Updating Password...' : 'Reset & Save Password'}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <button 
                onClick={() => setStep(1)} 
                style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.85rem' }}
              >
                ← Request New OTP Code
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Success Screen */}
        {step === 3 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'inline-block', marginBottom: '1rem', color: 'var(--success)' }}>
              <CheckCircle2 size={64} />
            </div>
            <h2 style={{ fontSize: '1.8rem', color: '#ffffff' }}>Password Updated!</h2>
            <p style={{ color: 'var(--text-muted)', margin: '1rem 0 1.5rem' }}>{message}</p>
            <Link to="/login" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }}>
              Sign In with New Password
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
