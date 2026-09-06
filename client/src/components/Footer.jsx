import React from 'react';
import { GraduationCap } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="glass-panel" style={{
      borderRadius: 0,
      borderBottom: 'none',
      borderLeft: 'none',
      borderRight: 'none',
      marginTop: 'auto',
      padding: '2rem 1.5rem 1.5rem',
      background: 'rgba(9, 13, 22, 0.95)'
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff'
          }}>
            <GraduationCap size={20} />
          </div>
          <span style={{ fontSize: '1.3rem', fontWeight: 800 }}>
            Edu<span style={{ color: 'var(--secondary)' }}>Sphere</span>
          </span>
        </div>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', maxWidth: '500px' }}>
          Centralized digital learning ecosystem connecting learners, educators, and administrators worldwide.
        </p>
      </div>

      <div style={{
        borderTop: '1px solid var(--border-color)',
        paddingTop: '1rem',
        textAlign: 'center',
        fontSize: '0.8rem',
        color: 'var(--text-dim)'
      }}>
        © 2026 EduSphere LMS Platform.
      </div>
    </footer>
  );
};
