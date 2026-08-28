import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  PlayCircle, 
  CheckCircle, 
  Clock, 
  User, 
  BookOpen, 
  Star, 
  ShieldCheck, 
  CreditCard,
  MessageSquare,
  Award,
  ChevronRight,
  FileText
} from 'lucide-react';

export const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [course, setCourse] = useState(null);
  const [syllabus, setSyllabus] = useState([]);
  const [comments, setComments] = useState([]);
  const [ratingInfo, setRatingInfo] = useState({ averageRating: 0, totalRatings: 0 });
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [userRating, setUserRating] = useState(5);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchCourseDetails();
  }, [id]);

  const fetchCourseDetails = async () => {
    try {
      const [cRes, sRes, cmRes, rRes] = await Promise.all([
        API.get(`/courses/${id}`),
        API.get(`/syllabus/${id}`),
        API.get(`/comments/course/${id}`),
        API.get(`/ratings/course/${id}`)
      ]);

      setCourse(cRes.data);
      setSyllabus(sRes.data);
      setComments(cmRes.data);
      setRatingInfo(rRes.data);

      if (user) {
        const eRes = await API.get(`/enrollments/check/${id}`);
        setIsEnrolled(eRes.data.isEnrolled);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollOrPurchase = async () => {
    if (!user) {
      return navigate('/login');
    }

    setProcessing(true);
    try {
      if (course.type === 'free' || course.price === 0) {
        await API.post('/enrollments', { course_id: course._id });
        setIsEnrolled(true);
        navigate(`/learn/${course._id}`);
      } else {
        // Process checkout transaction
        await API.post('/transactions', {
          course_id: course._id,
          amount: course.price,
          payment_method: 'CARD'
        });
        setIsEnrolled(true);
        navigate(`/learn/${course._id}`);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Enrollment failed');
    } finally {
      setProcessing(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const res = await API.post('/comments', { course_id: course._id, comment: newComment });
      setComments([res.data, ...comments]);
      setNewComment('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddRating = async (rVal) => {
    if (!user) return navigate('/login');
    try {
      setUserRating(rVal);
      await API.post('/ratings', { course_id: course._id, rating: rVal });
      const rRes = await API.get(`/ratings/course/${id}`);
      setRatingInfo(rRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !course) {
    return <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Loading course details...</div>;
  }

  return (
    <div className="animate-fade-in">
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '2.5rem', marginBottom: '2rem', position: 'relative' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem' }}>
              <span className={`badge ${course.type === 'free' ? 'badge-free' : 'badge-paid'}`}>
                {course.type === 'free' ? 'FREE COURSE' : `$${course.price}`}
              </span>
              <span className="badge badge-role">{course.level || 'All Levels'}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', color: '#f59e0b', fontWeight: 700 }}>
                <Star size={16} fill="#f59e0b" /> {ratingInfo.averageRating} ({ratingInfo.totalRatings} ratings)
              </span>
            </div>

            <h1 style={{ fontSize: '2.2rem', marginBottom: '1rem', lineHeight: '1.25' }}>{course.name}</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginBottom: '1.5rem' }}>{course.desc}</p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--text-dim)', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <User size={16} /> Created by <strong style={{ color: 'var(--text-main)' }}>{course.tutor?.name || 'Prof. Alex Morgan'}</strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={16} /> {course.duration || '4h 30m'} Total
              </div>
            </div>
          </div>

          {/* Action Card */}
          <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <img 
              src={course.thumbnail} 
              alt={course.name} 
              style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem' }} 
            />

            {isEnrolled ? (
              <Link to={`/learn/${course._id}`} className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                <PlayCircle size={20} /> Go to Learning Room
              </Link>
            ) : (
              <button 
                onClick={handleEnrollOrPurchase} 
                className="btn btn-primary btn-lg"
                style={{ width: '100%' }}
                disabled={processing}
              >
                {processing ? 'Processing...' : course.type === 'free' ? 'Enroll For Free' : `Enroll Now - $${course.price}`}
              </button>
            )}

            <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '10px' }}>
              ✓ Full Lifetime Access • Includes Certificate & Quizzes
            </p>
          </div>
        </div>
      </div>

      {/* Syllabus / Content Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.25rem' }}>Course Syllabus</h2>
          {syllabus.length === 0 ? (
            <div className="glass-panel" style={{ padding: '1.5rem', color: 'var(--text-muted)' }}>No syllabus sections created yet.</div>
          ) : (
            syllabus.map((section, idx) => (
              <div key={section._id} className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', color: 'var(--secondary)' }}>
                  {section.name}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {section.lessons.map((les) => (
                    <div key={les._id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.88rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <PlayCircle size={16} color="var(--primary)" />
                        <span>{les.title}</span>
                      </div>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>{les.duration}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Reviews & Discussion Forum */}
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.25rem' }}>Discussion & Reviews</h2>

          {/* Rate Course */}
          {user && isEnrolled && (
            <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.95rem', marginBottom: '8px' }}>Rate this Course</h4>
              <div style={{ display: 'flex', gap: '6px', cursor: 'pointer' }}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star 
                    key={s} 
                    size={22} 
                    fill={s <= userRating ? '#f59e0b' : 'none'} 
                    color="#f59e0b" 
                    onClick={() => handleAddRating(s)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Comment Input */}
          {user && (
            <form onSubmit={handleAddComment} style={{ marginBottom: '1.5rem' }}>
              <div className="form-group">
                <textarea 
                  className="form-control" 
                  rows="3" 
                  placeholder="Ask a question or leave feedback..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-secondary btn-sm">
                <MessageSquare size={14} /> Post Discussion Comment
              </button>
            </form>
          )}

          {/* Comments List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {comments.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>No discussions posted yet.</p>
            ) : (
              comments.map((c) => (
                <div key={c._id} className="glass-panel" style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <img 
                      src={c.user_id?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} 
                      alt="" 
                      style={{ width: '24px', height: '24px', borderRadius: '50%' }}
                    />
                    <strong style={{ fontSize: '0.85rem' }}>{c.user_id?.name || 'User'}</strong>
                    <span className="badge badge-role" style={{ fontSize: '0.65rem' }}>{c.user_id?.role}</span>
                  </div>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>{c.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
