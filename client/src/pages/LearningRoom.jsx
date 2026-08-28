import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CertificateModal } from '../components/CertificateModal';
import { AIChatbot } from '../components/AIChatbot';
import { 
  PlayCircle, 
  CheckCircle2, 
  FileText, 
  Download, 
  HelpCircle, 
  Award, 
  ChevronRight, 
  ArrowLeft,
  BookOpen
} from 'lucide-react';

export const LearningRoom = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [course, setCourse] = useState(null);
  const [syllabus, setSyllabus] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [activeLesson, setActiveLesson] = useState(null);
  const [progressInfo, setProgressInfo] = useState({ totalLessons: 0, completedCount: 0, percentage: 0, completedLessonIds: [] });
  const [showCertModal, setShowCertModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [courseId]);

  const fetchData = async () => {
    try {
      const [cRes, sRes, qRes, pRes] = await Promise.all([
        API.get(`/courses/${courseId}`),
        API.get(`/syllabus/${courseId}`),
        API.get(`/quizzes/course/${courseId}`),
        API.get(`/progress/course/${courseId}`)
      ]);

      setCourse(cRes.data);
      setSyllabus(sRes.data);
      setQuizzes(qRes.data);
      setProgressInfo(pRes.data);

      // Select first lesson by default
      if (sRes.data.length > 0 && sRes.data[0].lessons.length > 0) {
        setActiveLesson(sRes.data[0].lessons[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleLessonComplete = async (lessonId) => {
    try {
      await API.post('/progress/toggle', { lesson_id: lessonId, course_id: courseId });
      const pRes = await API.get(`/progress/course/${courseId}`);
      setProgressInfo(pRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !course) {
    return <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Loading Learning Classroom...</div>;
  }

  const isCompleted = activeLesson && progressInfo.completedLessonIds.includes(activeLesson._id);

  return (
    <div className="animate-fade-in" style={{ margin: '-1.5rem -1.5rem 0' }}>
      {/* Top Header Bar */}
      <div className="glass-panel" style={{
        borderRadius: 0,
        padding: '1rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderLeft: 'none',
        borderRight: 'none',
        borderTop: 'none'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link to="/dashboard/student" className="btn btn-sm btn-secondary">
            <ArrowLeft size={16} /> My Courses
          </Link>
          <h2 style={{ fontSize: '1.2rem' }}>{course.name}</h2>
        </div>

        {/* Progress Bar & Certificate CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '140px',
              height: '8px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${progressInfo.percentage}%`,
                height: '100%',
                background: 'linear-gradient(90deg, var(--primary), var(--secondary))',
                transition: 'width 0.4s ease'
              }} />
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--secondary)' }}>
              {progressInfo.percentage}% Complete
            </span>
          </div>

          {progressInfo.percentage >= 80 && (
            <button 
              onClick={() => setShowCertModal(true)} 
              className="btn btn-sm btn-primary"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
            >
              <Award size={16} /> Claim Certificate
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Video Stream Player + Syllabus Navigation Sidebar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 340px',
        minHeight: 'calc(100vh - 120px)'
      }}>
        {/* Left Column: Player & Lesson Content */}
        <div style={{ padding: '1.5rem', background: '#070a11' }}>
          {activeLesson ? (
            <div>
              {/* Video Player */}
              <div style={{
                position: 'relative',
                paddingTop: '56.25%', // 16:9 Aspect Ratio
                background: '#000',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-main)',
                marginBottom: '1.5rem'
              }}>
                <video 
                  key={activeLesson._id}
                  controls 
                  autoPlay 
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain'
                  }}
                >
                  <source src={activeLesson.video_url} type="video/mp4" />
                  Your browser does not support HTML5 video playback.
                </video>
              </div>

              {/* Lesson Controls & Description */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.5rem' }}>{activeLesson.title}</h2>
                <button 
                  onClick={() => handleToggleLessonComplete(activeLesson._id)}
                  className={`btn btn-sm ${isCompleted ? 'btn-primary' : 'btn-secondary'}`}
                  style={{
                    background: isCompleted ? 'rgba(16, 185, 129, 0.2)' : undefined,
                    color: isCompleted ? 'var(--success)' : undefined,
                    border: isCompleted ? '1px solid rgba(16, 185, 129, 0.4)' : undefined
                  }}
                >
                  <CheckCircle2 size={18} /> {isCompleted ? 'Completed' : 'Mark as Complete'}
                </button>
              </div>

              <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '0.95rem', marginBottom: '8px', color: 'var(--secondary)' }}>Lesson Details</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  {activeLesson.content || 'Watch the video lecture attentively and complete the associated quizzes.'}
                </p>
              </div>

              {/* Document Resource Download */}
              {activeLesson.document_url && (
                <div className="glass-panel" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FileText size={20} color="var(--primary)" />
                    <div>
                      <h4 style={{ fontSize: '0.9rem' }}>Downloadable Study Resource (PDF / Document)</h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Included with this lesson</span>
                    </div>
                  </div>
                  <a href={activeLesson.document_url} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">
                    <Download size={14} /> Download File
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
              Select a lesson from the syllabus sidebar to begin.
            </div>
          )}
        </div>

        {/* Right Column: Syllabus Sidebar */}
        <div style={{
          background: 'var(--bg-glass)',
          borderLeft: '1px solid var(--border-color)',
          padding: '1.25rem',
          overflowY: 'auto'
        }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen size={18} color="var(--primary)" /> Course Curriculum
          </h3>

          {/* Section & Lesson Accordion */}
          {syllabus.map((sec) => (
            <div key={sec._id} style={{ marginBottom: '1.25rem' }}>
              <h4 style={{
                fontSize: '0.85rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--text-dim)',
                marginBottom: '8px',
                paddingBottom: '4px',
                borderBottom: '1px solid var(--border-color)'
              }}>
                {sec.name}
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {sec.lessons.map((les) => {
                  const done = progressInfo.completedLessonIds.includes(les._id);
                  const isActive = activeLesson && activeLesson._id === les._id;

                  return (
                    <button 
                      key={les._id}
                      onClick={() => setActiveLesson(les)}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-sm)',
                        background: isActive ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                        border: isActive ? '1px solid var(--primary-glow)' : '1px solid transparent',
                        color: isActive ? '#ffffff' : 'var(--text-muted)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '0.85rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                        {done ? (
                          <CheckCircle2 size={16} color="var(--success)" />
                        ) : (
                          <PlayCircle size={16} color={isActive ? 'var(--primary)' : 'var(--text-dim)'} />
                        )}
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {les.title}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{les.duration}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Quizzes Section */}
          {quizzes.length > 0 && (
            <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
              <h4 style={{ fontSize: '0.95rem', marginBottom: '10px', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <HelpCircle size={18} /> Course Quizzes & Assessments
              </h4>
              {quizzes.map((q) => (
                <Link 
                  key={q._id} 
                  to={`/quiz/${q._id}`} 
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%', justifyContent: 'space-between', marginBottom: '8px' }}
                >
                  <span>{q.title}</span>
                  <ChevronRight size={14} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Certificate Modal */}
      {showCertModal && (
        <CertificateModal 
          courseName={course.name} 
          studentName={user?.name} 
          onClose={() => setShowCertModal(false)} 
        />
      )}

      {/* Floating AI Learning Assistant Chatbot */}
      <AIChatbot courseName={course?.name} lessonTitle={activeLesson?.title} />
    </div>
  );
};
