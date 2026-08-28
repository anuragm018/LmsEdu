import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  PlusCircle, 
  BookOpen, 
  Layers, 
  HelpCircle, 
  Trash2, 
  Edit, 
  CheckCircle,
  FileText,
  Video
} from 'lucide-react';

export const InstructorDashboard = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [syllabus, setSyllabus] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal / Form States
  const [showCreateCourse, setShowCreateCourse] = useState(false);
  const [newCourse, setNewCourse] = useState({
    name: '',
    desc: '',
    price: 0,
    type: 'free',
    category: '',
    thumbnail: '',
    duration: '4 Hours',
    level: 'All Levels'
  });

  // Section & Lesson Form State
  const [newSectionName, setNewSectionName] = useState('');
  const [newLesson, setNewLesson] = useState({
    section_id: '',
    title: '',
    video_url: '',
    document_url: '',
    content: '',
    duration: '15 mins'
  });

  // Quiz Creator State
  const [showCreateQuiz, setShowCreateQuiz] = useState(false);
  const [quizForm, setQuizForm] = useState({
    title: '',
    duration: 15,
    total_marks: 20,
    questions: [
      {
        question: '',
        mark: 10,
        options: [
          { option_text: '', is_correct: true },
          { option_text: '', is_correct: false }
        ]
      }
    ]
  });

  useEffect(() => {
    fetchInstructorData();
  }, []);

  const fetchInstructorData = async () => {
    try {
      const [cRes, catRes] = await Promise.all([
        API.get('/courses/instructor/my-courses'),
        API.get('/courses/categories')
      ]);
      setCourses(cRes.data);
      setCategories(catRes.data);
      if (cRes.data.length > 0) {
        setSelectedCourse(cRes.data[0]);
        fetchSyllabus(cRes.data[0]._id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSyllabus = async (cId) => {
    try {
      const res = await API.get(`/syllabus/${cId}`);
      setSyllabus(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectCourse = (c) => {
    setSelectedCourse(c);
    fetchSyllabus(c._id);
  };

  const handleCreateCourseSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/courses', newCourse);
      setCourses([res.data, ...courses]);
      setSelectedCourse(res.data);
      setShowCreateCourse(false);
      fetchSyllabus(res.data._id);
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating course');
    }
  };

  const handleCreateSection = async (e) => {
    e.preventDefault();
    if (!newSectionName.trim() || !selectedCourse) return;
    try {
      await API.post('/syllabus/section', {
        name: newSectionName,
        order: syllabus.length + 1,
        course_id: selectedCourse._id
      });
      setNewSectionName('');
      fetchSyllabus(selectedCourse._id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateLesson = async (e) => {
    e.preventDefault();
    if (!newLesson.section_id || !newLesson.title.trim() || !selectedCourse) return;
    try {
      await API.post('/syllabus/lesson', {
        ...newLesson,
        course_id: selectedCourse._id
      });
      setNewLesson({ section_id: '', title: '', video_url: '', document_url: '', content: '', duration: '15 mins' });
      fetchSyllabus(selectedCourse._id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateQuizSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCourse) return;
    try {
      await API.post('/quizzes', {
        course_id: selectedCourse._id,
        ...quizForm
      });
      setShowCreateQuiz(false);
      alert('Quiz created successfully!');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="glass-panel" style={{ padding: '1.75rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem' }}>Instructor Course Studio</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Build, publish, and manage courses, video lessons, and interactive quizzes
          </p>
        </div>
        <button onClick={() => setShowCreateCourse(true)} className="btn btn-primary">
          <PlusCircle size={18} /> Create New Course
        </button>
      </div>

      {/* Main Studio Workspace Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '1.5rem' }}>
        {/* Left Column: Course Selector List */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '1.05rem', marginBottom: '1rem', color: 'var(--secondary)' }}>My Courses ({courses.length})</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {courses.map((c) => (
              <button 
                key={c._id}
                onClick={() => handleSelectCourse(c)}
                style={{
                  textAlign: 'left',
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  background: selectedCourse?._id === c._id ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.03)',
                  border: selectedCourse?._id === c._id ? '1px solid var(--primary)' : '1px solid transparent',
                  color: selectedCourse?._id === c._id ? '#fff' : 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '0.88rem'
                }}
              >
                <div style={{ fontWeight: 600 }}>{c.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                  {c.type === 'free' ? 'FREE' : `$${c.price}`} • {c.level}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Selected Course Builder */}
        {selectedCourse ? (
          <div>
            <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h2 style={{ fontSize: '1.4rem' }}>{selectedCourse.name}</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{selectedCourse.desc}</p>
                </div>
                <button onClick={() => setShowCreateQuiz(true)} className="btn btn-secondary btn-sm">
                  <HelpCircle size={16} /> Add Course Quiz
                </button>
              </div>
            </div>

            {/* Add Section Form */}
            <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.95rem', marginBottom: '0.75rem', color: 'var(--secondary)' }}>+ Add Syllabus Section</h4>
              <form onSubmit={handleCreateSection} style={{ display: 'flex', gap: '10px' }}>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. 1. Introduction to Web APIs"
                  value={newSectionName}
                  onChange={(e) => setNewSectionName(e.target.value)}
                  required
                />
                <button type="submit" className="btn btn-primary btn-sm" style={{ whiteSpace: 'nowrap' }}>Add Section</button>
              </form>
            </div>

            {/* Add Lesson Form */}
            {syllabus.length > 0 && (
              <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '0.95rem', marginBottom: '0.75rem', color: 'var(--secondary)' }}>+ Add Video Lecture / Lesson</h4>
                <form onSubmit={handleCreateLesson}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>Select Target Section</label>
                      <select 
                        className="form-control"
                        value={newLesson.section_id}
                        onChange={(e) => setNewLesson({ ...newLesson, section_id: e.target.value })}
                        required
                      >
                        <option value="">Select Section...</option>
                        {syllabus.map((s) => (
                          <option key={s._id} value={s._id}>{s.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>Lesson Title</label>
                      <input 
                        type="text" 
                        className="form-control"
                        placeholder="e.g. Building Express Controllers"
                        value={newLesson.title}
                        onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>Video Stream URL (MP4 / Direct Link)</label>
                      <input 
                        type="text" 
                        className="form-control"
                        placeholder="https://www.w3schools.com/html/mov_bbb.mp4"
                        value={newLesson.video_url}
                        onChange={(e) => setNewLesson({ ...newLesson, video_url: e.target.value })}
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>PDF / Study Resource URL (Optional)</label>
                      <input 
                        type="text" 
                        className="form-control"
                        placeholder="https://example.com/notes.pdf"
                        value={newLesson.document_url}
                        onChange={(e) => setNewLesson({ ...newLesson, document_url: e.target.value })}
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn btn-secondary btn-sm">Add Lesson to Syllabus</button>
                </form>
              </div>
            )}

            {/* Render Current Course Syllabus Tree */}
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Current Course Syllabus Structure</h3>
            {syllabus.map((sec) => (
              <div key={sec._id} className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '1.05rem', color: 'var(--primary)', marginBottom: '8px' }}>{sec.name}</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {sec.lessons.map((les) => (
                    <div key={les._id} style={{
                      padding: '8px 12px',
                      background: 'rgba(255,255,255,0.03)',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.85rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Video size={16} color="var(--secondary)" />
                        <span>{les.title}</span>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{les.duration}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No courses found. Click <strong>Create New Course</strong> to launch your first course.
          </div>
        )}
      </div>

      {/* Create Course Modal */}
      {showCreateCourse && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <div className="glass-panel" style={{ maxWidth: '550px', width: '100%', padding: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.25rem' }}>Create New Course</h2>
            <form onSubmit={handleCreateCourseSubmit}>
              <div className="form-group">
                <label>Course Title</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. Master React 19 & Next.js"
                  value={newCourse.name}
                  onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea 
                  className="form-control" 
                  rows="3" 
                  placeholder="Course overview and objectives..."
                  value={newCourse.desc}
                  onChange={(e) => setNewCourse({ ...newCourse, desc: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Pricing Type</label>
                  <select 
                    className="form-control"
                    value={newCourse.type}
                    onChange={(e) => setNewCourse({ ...newCourse, type: e.target.value, price: e.target.value === 'free' ? 0 : newCourse.price })}
                  >
                    <option value="free">Free Course</option>
                    <option value="paid">Paid Course</option>
                  </select>
                </div>

                {newCourse.type === 'paid' && (
                  <div className="form-group">
                    <label>Price ($ USD)</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      placeholder="49.99"
                      value={newCourse.price}
                      onChange={(e) => setNewCourse({ ...newCourse, price: parseFloat(e.target.value) })}
                      required
                    />
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Category</label>
                <select 
                  className="form-control"
                  value={newCourse.category}
                  onChange={(e) => setNewCourse({ ...newCourse, category: e.target.value })}
                  required
                >
                  <option value="">Select Category...</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowCreateCourse(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Create Course</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Quiz Modal */}
      {showCreateQuiz && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <div className="glass-panel" style={{ maxWidth: '600px', width: '100%', padding: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.25rem' }}>Create Quiz for {selectedCourse?.name}</h2>
            <form onSubmit={handleCreateQuizSubmit}>
              <div className="form-group">
                <label>Quiz Title</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. Assessment Quiz 1"
                  value={quizForm.title}
                  onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Duration (Minutes)</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    value={quizForm.duration}
                    onChange={(e) => setQuizForm({ ...quizForm, duration: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Total Marks</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    value={quizForm.total_marks}
                    onChange={(e) => setQuizForm({ ...quizForm, total_marks: parseInt(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowCreateQuiz(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Quiz</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
