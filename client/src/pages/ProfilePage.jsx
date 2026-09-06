import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { 
  User, 
  Mail, 
  Phone, 
  FileText, 
  Camera, 
  Save, 
  ArrowLeft, 
  CheckCircle, 
  Shield 
} from 'lucide-react';

export const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone_no: '',
    bio: '',
    avatar: ''
  });
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await API.get('/auth/profile');
      const u = res.data.user;
      setForm({
        name: u.name || '',
        email: u.email || '',
        phone_no: u.phone_no || '',
        bio: u.bio || '',
        avatar: u.avatar || ''
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setUploadingAvatar(true);
    try {
      const res = await API.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setForm(prev => ({ ...prev, avatar: res.data.image_url }));
    } catch (err) {
      setError('Avatar upload failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password && password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name,
        phone_no: form.phone_no,
        bio: form.bio,
        avatar: form.avatar
      };
      if (password) payload.password = password;

      const result = await updateProfile(payload);
      if (result.success) {
        setSuccess('Profile updated successfully! Redirecting...');
        setPassword('');
        setConfirmPassword('');
        setTimeout(() => navigate(-1), 1000);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p style={{ color: 'var(--text-muted)', padding: '2rem' }}>Loading profile...</p>;
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: '680px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2rem' }}>
        <button 
          onClick={() => navigate(-1)} 
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          <ArrowLeft size={22} />
        </button>
        <div>
          <h1 style={{ fontSize: '1.6rem' }}>Edit Profile</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Update your personal details and preferences</p>
        </div>
      </div>

      {/* Success / Error Messages */}
      {success && (
        <div style={{ padding: '12px 16px', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem' }}>
          <CheckCircle size={18} /> {success}
        </div>
      )}
      {error && (
        <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', color: 'var(--danger)', fontSize: '0.88rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Avatar Section */}
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Camera size={18} color="var(--primary)" /> Profile Photo
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ position: 'relative' }}>
              <img 
                src={form.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} 
                alt="Avatar" 
                style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary)' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <input 
                type="file" 
                accept="image/*"
                className="form-control"
                onChange={handleAvatarUpload}
                style={{ fontSize: '0.85rem' }}
              />
              {uploadingAvatar && (
                <p style={{ fontSize: '0.78rem', color: 'var(--secondary)', marginTop: '4px' }}>⚡ Uploading avatar image...</p>
              )}
            </div>
          </div>
        </div>

        {/* Personal Info */}
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={18} color="var(--secondary)" /> Personal Information
          </h3>

          <div className="form-group">
            <label>Full Name</label>
            <input 
              type="text" 
              className="form-control" 
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Email Address (cannot be changed)</label>
            <input 
              type="email" 
              className="form-control" 
              value={form.email}
              disabled
              style={{ opacity: 0.6, cursor: 'not-allowed' }}
            />
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Phone size={14} /> Phone Number
            </label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="e.g. +91 9876543210"
              value={form.phone_no}
              onChange={(e) => setForm({ ...form, phone_no: e.target.value })}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FileText size={14} /> Bio
            </label>
            <textarea 
              className="form-control" 
              rows="3" 
              placeholder="Tell us about yourself..."
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
            />
          </div>
        </div>

        {/* Save Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button type="button" onClick={() => navigate(-1)} className="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};
