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
      <div className="glass-panel" style={{
        maxWidth: '800px',
        width: '100%',
        background: '#0d1322',
        border: '2px solid rgba(245, 158, 11, 0.4)',
        boxShadow: '0 0 50px rgba(245, 158, 11, 0.2)',
        padding: '2.5rem',
        position: 'relative',
        borderRadius: '24px'
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
            color: 'var(--text-muted)',
            cursor: 'pointer'
          }}
        >
          <X size={24} />
        </button>

        {/* Certificate Frame */}
        <div style={{
          border: '1px dashed rgba(245, 158, 11, 0.5)',
          padding: '2rem',
          textAlign: 'center',
          borderRadius: '16px',
          background: 'radial-gradient(circle at center, rgba(245, 158, 11, 0.05) 0%, transparent 70%)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 0 20px rgba(245, 158, 11, 0.5)'
            }}>
              <Award size={36} />
            </div>
          </div>

          <p style={{ textTransform: 'uppercase', letterSpacing: '0.2em', color: '#f59e0b', fontSize: '0.85rem', fontWeight: 700 }}>
            Certificate of Completion
          </p>

          <h2 style={{ fontSize: '2rem', margin: '0.5rem 0', fontFamily: 'var(--font-heading)' }}>
            EduSphere E-Learning Platform
          </h2>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            This certifies that
          </p>

          <h1 style={{
            fontSize: '2.4rem',
            color: '#ffffff',
            margin: '0.8rem 0',
            textDecoration: 'underline',
            textDecorationColor: '#f59e0b'
          }}>
            {studentName || 'Sarah Connor'}
          </h1>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '550px', margin: '0 auto' }}>
            has successfully completed all lessons, assessments, and quizzes for the course
          </p>

          <h3 style={{ fontSize: '1.4rem', color: 'var(--secondary)', margin: '1rem 0' }}>
            "{courseName}"
          </h3>

          <div style={{
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            marginTop: '2rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid var(--border-color)'
          }}>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Issued Date</p>
              <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{date || new Date().toLocaleDateString()}</p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--success)', fontSize: '0.85rem', fontWeight: 600 }}>
              <ShieldCheck size={18} /> Verified Certificate
            </div>

            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Verification ID</p>
              <p style={{ fontWeight: 600, fontSize: '0.85rem', color: '#f59e0b' }}>{certId}</p>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
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
