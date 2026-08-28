import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Mail, Key, User, ShieldCheck, AlertCircle } from 'lucide-react';

export const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student'
  });
  const [error, setError] = useState('');
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await register(formData);
    if (res.success) {
      if (formData.role === 'admin') navigate('/dashboard/admin');
      else if (formData.role === 'instructor') navigate('/dashboard/instructor');
      else navigate('/dashboard/student');
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
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>Join EduSphere LMS platform as Student or Instructor</p>
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
              placeholder="Sarah Connor"
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
              placeholder="sarah@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>


          <div className="form-group">
            <label><Key size={14} style={{ display: 'inline', marginRight: '4px' }} /> Password</label>
            <input 
              type="password" 
              name="password"
              className="form-control" 
              placeholder="At least 6 characters"
              value={formData.password}
              onChange={handleChange}
              minLength={6}
              required
            />
          </div>

          <div className="form-group">
            <label><ShieldCheck size={14} style={{ display: 'inline', marginRight: '4px' }} /> Select Your Account Role</label>
            <select 
              name="role" 
              className="form-control"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="student">🎓 Student (Enroll & Learn)</option>
              <option value="instructor">👨‍🏫 Instructor (Create & Teach Courses)</option>
              <option value="admin">⚙️ Administrator (System Governance)</option>
            </select>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem', padding: '12px' }}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Register Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '0.85rem', marginTop: '1.5rem', color: 'var(--text-muted)' }}>
          Already registered? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign In Here</Link>
        </p>
      </div>
    </div>
  );
};
