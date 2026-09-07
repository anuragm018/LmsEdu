import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { CourseCard } from '../components/CourseCard';
import { 
  Sparkles, 
  BookOpen, 
  Users, 
  Award, 
  ArrowRight, 
  CheckCircle,
  Code,
  Cpu,
  Palette,
  Briefcase,
  Clock,
  ShieldCheck
} from 'lucide-react';

export const Home = () => {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cRes, catRes] = await Promise.all([
          API.get('/courses'),
          API.get('/courses/categories')
        ]);
        setCourses(cRes.data.slice(0, 6));
        setCategories(catRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const getCategoryIcon = (iconName) => {
    switch (iconName) {
      case 'Code': return <Code size={24} color="var(--primary)" />;
      case 'Cpu': return <Cpu size={24} color="var(--secondary)" />;
      case 'Palette': return <Palette size={24} color="var(--accent)" />;
      default: return <Briefcase size={24} color="var(--warning)" />;
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section style={{
        padding: '4rem 1rem 3rem',
        textAlign: 'center',
        position: 'relative'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          borderRadius: 'var(--radius-full)',
          background: 'rgba(99, 102, 241, 0.12)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          color: 'var(--primary)',
          fontSize: '0.85rem',
          fontWeight: 600,
          marginBottom: '1.5rem'
        }}>
          <Sparkles size={16} /> Next-Gen Enterprise E-Learning Architecture
        </div>

        <h1 style={{
          fontSize: 'clamp(2.2rem, 5vw, 3.8rem)',
          fontWeight: 800,
          lineHeight: 1.15,
          maxWidth: '900px',
          margin: '0 auto 1.5rem',
          background: 'linear-gradient(180deg, #ffffff 0%, #94a3b8 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Empowering Learners & Educators with <span style={{ color: 'var(--primary)', WebkitTextFillColor: 'initial' }}>EduSphere</span>
        </h1>

        <p style={{
          fontSize: '1.1rem',
          color: 'var(--text-muted)',
          maxWidth: '680px',
          margin: '0 auto 2.5rem'
        }}>
          A unified digital learning ecosystem integrating interactive video streaming, automated MCQ quizzes, downloadable study resources, role-based dashboards, and instant completion certificates.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/courses" className="btn btn-primary btn-lg">
            Explore All Courses <ArrowRight size={20} />
          </Link>
          <Link to="/register" className="btn btn-secondary btn-lg">
            Join as Student / Tutor
          </Link>
        </div>

        {/* Platform Highlights Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
          maxWidth: '720px',
          margin: '3.5rem auto 0'
        }}>
          <div className="glass-panel" style={{ 
            padding: '1.75rem 1.5rem', 
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            border: '1px solid rgba(6, 182, 212, 0.25)',
            background: 'linear-gradient(180deg, rgba(6, 182, 212, 0.08) 0%, rgba(17, 24, 39, 0.6) 100%)'
          }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'rgba(6, 182, 212, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '4px'
            }}>
              <Clock size={22} color="var(--secondary)" />
            </div>
            <h3 style={{ fontSize: '1.75rem', color: 'var(--secondary)', fontWeight: 700, margin: 0 }}>Automated</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>Smart Quiz Timer & Auto Grading</p>
          </div>

          <div className="glass-panel" style={{ 
            padding: '1.75rem 1.5rem', 
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            background: 'linear-gradient(180deg, rgba(16, 185, 129, 0.08) 0%, rgba(17, 24, 39, 0.6) 100%)'
          }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '4px'
            }}>
              <ShieldCheck size={22} color="var(--success)" />
            </div>
            <h3 style={{ fontSize: '1.75rem', color: 'var(--success)', fontWeight: 700, margin: 0 }}>100% Verified</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>Instant Downloadable Certificates</p>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      {categories.length > 0 && (
        <section style={{ margin: '4rem 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div>
              <h2 style={{ fontSize: '1.8rem' }}>Browse Categories</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Choose from top educational domains</p>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '1.25rem'
          }}>
            {categories.map((cat) => (
              <Link 
                to={`/courses?category=${cat._id}`} 
                key={cat._id}
                className="glass-card" 
                style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}
              >
                <div style={{
                  padding: '12px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.05)'
                }}>
                  {getCategoryIcon(cat.icon)}
                </div>
                <div>
                  <h4 style={{ fontSize: '1.05rem' }}>{cat.name}</h4>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{cat.description || 'Explore courses'}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Courses Catalog */}
      <section style={{ margin: '4rem 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h2 style={{ fontSize: '1.8rem' }}>Featured Courses</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Handcrafted learning paths by expert tutors</p>
          </div>
          <Link to="/courses" className="btn btn-secondary btn-sm">
            View All Courses <ArrowRight size={16} />
          </Link>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
          gap: '1.5rem'
        }}>
          {courses.map((course) => (
            <CourseCard key={course._id} course={course} />
          ))}
        </div>
      </section>
    </div>
  );
};
