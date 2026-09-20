import React from 'react';
import { GraduationCap } from 'lucide-react';

export const Footer = () => {
  return (
    <footer style={{
      borderTop: '1px solid var(--color-border)',
      marginTop: 'auto',
      padding: '2rem 1.5rem 1.5rem',
      background: 'var(--color-surface)'
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: '0.8rem',
        marginBottom: '1.25rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-text-on-dark)'
          }}>
            <GraduationCap size={18} />
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary)' }}>
            Edu<span style={{ color: 'var(--color-accent)' }}>Sphere</span>
          </span>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', maxWidth: '500px' }}>
          Centralized digital learning ecosystem connecting learners, educators, and administrators worldwide.
        </p>
      </div>

      <div style={{
        borderTop: '1px solid var(--color-border)',
        paddingTop: '1rem',
        textAlign: 'center',
        fontSize: '0.8rem',
        color: 'var(--color-text-subtle)'
      }}>
        © 2026 EduSphere LMS Platform.
      </div>
    </footer>
  );
};
