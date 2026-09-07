import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Mail, Key, User, ShieldCheck, AlertCircle, Eye, EyeOff } from 'lucide-react';

export const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student' // Default active selection
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Compulsory role validation
    if (!formData.role) {
      setError('Please select your account role (Student or Tutor) to continue.');
      return;
    }

    const res = await register(formData);
    if (res.success) {
      // Redirect directly to 6-digit OTP verification screen
      navigate(`/verify-email?email=${encodeURIComponent(formData.email)}&role=${formData.role}`);
    } else {
      setError(res.message);
    }
  };

  return (
    <div style={{
      maxWidth: '480px',
      margin: '2.5rem auto',
      padding: '1rem'
    }} className="animate-fade-in">
      <div className="glass-panel" style={{ padding: '2.5rem 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, var(--secondary), var(--primary))',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            marginBottom: '1rem'
          }}>
            <UserPlus size={26} />
          </div>
          <h2 style={{ fontSize: '1.6rem' }}>Create Account</h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>Join EduSphere LMS platform as Student or Tutor</p>
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

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label><User size={14} style={{ display: 'inline', marginRight: '4px' }} /> Full Name</label>
            <input 
              type="text" 
              name="name"
              className="form-control" 
              placeholder="Enter Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label><Mail size={14} style={{ display: 'inline', marginRight: '4px' }} /> Email Address</label>
            <input 
              type="email" 
              name="email"
              className="form-control" 
              placeholder="Enter your mail"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label><Key size={14} style={{ display: 'inline', marginRight: '4px' }} /> Password</label>
            <div style={{ position: 'relative' }}>
              <input 
                type={showPassword ? 'text' : 'password'} 
                name="password"
                className="form-control" 
                placeholder="At least 6 characters"
                value={formData.password}
                onChange={handleChange}
                minLength={6}
                required
                style={{ paddingRight: '42px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: showPassword ? 'var(--primary)' : 'var(--text-dim)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '4px',
                  borderRadius: '4px',
                  transition: 'color 0.2s ease'
                }}
                title={showPassword ? 'Hide password' : 'Show password'}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Compulsory Role Selection */}
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontSize: '0.84rem' }}>
              <ShieldCheck size={15} color="var(--primary)" /> Select Your Account Role <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {/* Student Card */}
              <div 
                onClick={() => setFormData({ ...formData, role: 'student' })}
                className="role-selector-card"
                style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: formData.role === 'student' ? '1.5px solid var(--primary)' : '1px solid var(--border-color)',
                  background: formData.role === 'student' 
                    ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.25), rgba(6, 182, 212, 0.12))' 
                    : 'rgba(255, 255, 255, 0.03)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'all 0.2s ease',
                  boxShadow: formData.role === 'student' ? '0 0 12px rgba(99, 102, 241, 0.35)' : 'none',
                  position: 'relative'
                }}
              >
                <span style={{ fontSize: '1.35rem', lineHeight: 1 }}>🎓</span>
                <div style={{ textAlign: 'left', lineHeight: 1.25 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: formData.role === 'student' ? '#ffffff' : 'var(--text-main)' }}>
                    Student
                  </div>
                  <div style={{ fontSize: '0.68rem', color: formData.role === 'student' ? '#c7d2fe' : 'var(--text-muted)' }}>
                    Enroll &amp; Learn
                  </div>
                </div>
                {formData.role === 'student' && (
                  <div style={{
                    position: 'absolute',
                    top: '6px',
                    right: '6px',
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: 'var(--primary)',
                    boxShadow: '0 0 6px var(--primary)'
                  }} />
                )}
              </div>

              {/* Tutor Card */}
              <div 
                onClick={() => setFormData({ ...formData, role: 'instructor' })}
                className="role-selector-card"
                style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: formData.role === 'instructor' ? '1.5px solid var(--secondary)' : '1px solid var(--border-color)',
                  background: formData.role === 'instructor' 
                    ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.25), rgba(99, 102, 241, 0.12))' 
                    : 'rgba(255, 255, 255, 0.03)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'all 0.2s ease',
                  boxShadow: formData.role === 'instructor' ? '0 0 12px rgba(6, 182, 212, 0.35)' : 'none',
                  position: 'relative'
                }}
              >
                <span style={{ fontSize: '1.35rem', lineHeight: 1 }}>👨‍🏫</span>
                <div style={{ textAlign: 'left', lineHeight: 1.25 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: formData.role === 'instructor' ? '#ffffff' : 'var(--text-main)' }}>
                    Tutor
                  </div>
                  <div style={{ fontSize: '0.68rem', color: formData.role === 'instructor' ? 'var(--secondary)' : 'var(--text-muted)' }}>
                    Create &amp; Teach
                  </div>
                </div>
                {formData.role === 'instructor' && (
                  <div style={{
                    position: 'absolute',
                    top: '6px',
                    right: '6px',
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: 'var(--secondary)',
                    boxShadow: '0 0 6px var(--secondary)'
                  }} />
                )}
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.75rem', padding: '12px' }}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Continue to OTP Verification →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '0.85rem', marginTop: '1.5rem', color: 'var(--text-muted)' }}>
          Already registered? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign In Here</Link>
        </p>
      </div>
    </div>
  );
};
