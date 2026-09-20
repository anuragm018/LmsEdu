import React from 'react';
import { Award, CheckCircle2, Download, X, ShieldCheck } from 'lucide-react';

export const CertificateModal = ({ courseName, studentName, date, onClose }) => {
  const certId = 'EDUSPHERE-CERT-' + Math.floor(100000 + Math.random() * 900000);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(10px)',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem'
    }}>
      <div style={{
        maxWidth: '780px',
        width: '100%',
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        padding: '2.5rem',
        position: 'relative',
        borderRadius: 'var(--radius-sm)'
      }}>
        {/* Close Button */}
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'none',
            border: 'none',
            color: 'var(--color-text-muted)',
            cursor: 'pointer'
          }}
        >
          <X size={22} />
        </button>

        {/* Certificate Frame */}
        <div style={{
          border: '2px solid var(--color-primary)',
          padding: '2rem',
          textAlign: 'center',
          borderRadius: 'var(--radius-sm)',
          background: 'var(--color-surface)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--color-primary-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-primary)'
            }}>
              <Award size={32} />
            </div>
          </div>

          <p style={{ textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--color-accent-hover)', fontSize: '0.82rem', fontWeight: 700 }}>
            Certificate of Completion
          </p>

          <h2 style={{ fontSize: '1.8rem', margin: '0.5rem 0', color: 'var(--color-primary)' }}>
            EduSphere E-Learning Platform
          </h2>

          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.92rem' }}>
            This certifies that
          </p>

          <h1 style={{
            fontSize: '2.2rem',
            color: 'var(--color-primary)',
            margin: '0.8rem 0',
            borderBottom: '2px solid var(--color-accent)',
            display: 'inline-block',
            paddingBottom: '4px'
          }}>
            {studentName || 'Student Name'}
          </h1>

          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.92rem', maxWidth: '550px', margin: '0.8rem auto 0' }}>
            has successfully completed all lessons, assessments, and quizzes for the course
          </p>

          <h3 style={{ fontSize: '1.25rem', color: 'var(--color-primary)', margin: '1rem 0' }}>
            "{courseName}"
          </h3>

          <div style={{
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            marginTop: '2rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid var(--color-border)'
          }}>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-subtle)', textTransform: 'uppercase' }}>Issued Date</p>
              <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text)' }}>{date || new Date().toLocaleDateString()}</p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-primary)', fontSize: '0.85rem', fontWeight: 700 }}>
              <ShieldCheck size={18} color="var(--color-accent)" /> Verified Certificate
            </div>

            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-subtle)', textTransform: 'uppercase' }}>Verification ID</p>
              <p style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--color-primary)' }}>{certId}</p>
            </div>
          </div>
        </div>

        {/* Modal Actions: One green primary CTA */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1.5rem' }}>
          <button onClick={handlePrint} className="btn btn-primary">
            <Download size={18} /> Download / Print Certificate
          </button>
          <button onClick={onClose} className="btn btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
