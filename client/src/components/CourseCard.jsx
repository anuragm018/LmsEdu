import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Star, User, BookOpen, ArrowRight } from 'lucide-react';

export const CourseCard = ({ course }) => {
  return (
    <div className="glass-card" style={{
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      height: '100%'
    }}>
      {/* Thumbnail */}
      <div style={{ position: 'relative', height: '180px', overflow: 'hidden' }}>
        <img 
          src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600'} 
          alt={course.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          display: 'flex',
          gap: '6px'
        }}>
          <span className={`badge ${course.type === 'free' ? 'badge-free' : 'badge-paid'}`}>
            {course.type === 'free' ? 'FREE' : `$${course.price}`}
          </span>
        </div>
        {course.category && (
          <div style={{
            position: 'absolute',
            bottom: '12px',
            left: '12px',
            background: 'rgba(9, 13, 22, 0.8)',
            backdropFilter: 'blur(8px)',
            padding: '4px 10px',
            borderRadius: '6px',
            fontSize: '0.75rem',
            color: 'var(--secondary)',
            fontWeight: 600
          }}>
            {course.category.name || course.category}
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.6rem', lineHeight: '1.4' }}>
          {course.name}
        </h3>

        <p style={{
          fontSize: '0.85rem',
          color: 'var(--text-muted)',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          marginBottom: '1rem',
          flex: 1
        }}>
          {course.desc}
        </p>

        {/* Metadata */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.8rem',
          color: 'var(--text-dim)',
          borderTop: '1px solid var(--border-color)',
          paddingTop: '0.75rem',
          marginTop: 'auto'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <User size={14} />
            <span>{course.tutor?.name || 'Instructor'}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={14} />
            <span>{course.duration || '4h'}</span>
          </div>
        </div>

        <Link 
          to={`/courses/${course._id}`}
          className="btn btn-secondary btn-sm"
          style={{ width: '100%', marginTop: '1rem', justifyContent: 'center' }}
        >
          Explore Course <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
};
