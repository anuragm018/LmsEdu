import React from 'react';
import { GraduationCap, Heart, ShieldCheck, Globe } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="glass-panel" style={{
      borderRadius: 0,
      borderBottom: 'none',
      borderLeft: 'none',
      borderRight: 'none',
      marginTop: 'auto',
      padding: '2.5rem 1.5rem 1.5rem',
      background: 'rgba(9, 13, 22, 0.95)'
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '2rem',
        marginBottom: '2rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
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
            <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>
              Edu<span style={{ color: 'var(--secondary)' }}>Sphere</span>
            </span>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            Centralized digital learning ecosystem connecting learners, educators, and administrators worldwide.
          </p>
        </div>

        <div>
          <h4 style={{ fontSize: '0.95rem', marginBottom: '1rem', color: 'var(--secondary)' }}>Platform Roles</h4>
          <ul style={{ listStyle: 'none', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li>🎓 Student Learning & Quiz Portal</li>
            <li>👨‍🏫 Instructor Course & Syllabus Builder</li>
            <li>⚙️ Administrator System Management</li>
          </ul>
        </div>

        <div>
          <h4 style={{ fontSize: '0.95rem', marginBottom: '1rem', color: 'var(--secondary)' }}>Security & Tech</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><ShieldCheck size={16} color="var(--success)" /> JWT Secured API</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Globe size={16} color="var(--primary)" /> MERN MVC Architecture</div>
          </div>
        </div>
      </div>

      <div style={{
        borderTop: '1px solid var(--border-color)',
        paddingTop: '1rem',
        textAlign: 'center',
        fontSize: '0.8rem',
        color: 'var(--text-dim)'
      }}>
        © 2026 EduSphere LMS Platform. All Rights Reserved. Built with MERN Stack & MVC Architecture.
      </div>
    </footer>
  );
};
