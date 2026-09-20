import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  Video,
  DollarSign,
  Users,
  TrendingUp,
  CreditCard,
  Sparkles,
  Clock,
  ChevronRight,
  MessageSquare,
  Paperclip,
  Image as ImageIcon,
  Send,
  Download,
  CheckCheck,
  ChevronDown,
  Check,
  X,
  BarChart3,
  Megaphone,
  Star,
  Search,
  AlertTriangle,
  GraduationCap,
  RefreshCw
} from 'lucide-react';

export const InstructorDashboard = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [syllabus, setSyllabus] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active Studio Workspace Tab: 'curriculum' | 'doubts' | 'revenue'
  const [activeStudioTab, setActiveStudioTab] = useState('curriculum');

  // Tutor Doubts Chat State
  const [tutorThreads, setTutorThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [threadMessages, setThreadMessages] = useState([]);
  const [threadInput, setThreadInput] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [uploadingChatAttachment, setUploadingChatAttachment] = useState(false);
  const [pendingChatAttachment, setPendingChatAttachment] = useState(null);
  const [chatPreviewImage, setChatPreviewImage] = useState(null);
  const chatFileInputRef = useRef(null);
  const chatScrollRef = useRef(null);

  // Tutor Earnings State
  const [earningsData, setEarningsData] = useState({
    totalEarnings: 0,
    totalSales: 0,
    totalCourses: 0,
    courseBreakdown: [],
    recentTransactions: []
  });

  // Feature 1: Student Learning Analytics State
  const [courseAnalytics, setCourseAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsSearch, setAnalyticsSearch] = useState('');
  const [analyticsFilter, setAnalyticsFilter] = useState('all');

  // Feature 2: Course Reviews State
  const [reviewsData, setReviewsData] = useState({ reviews: [], stats: { totalReviews: 0, avgRating: 5.0, ratingBreakdown: {} } });
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [replyingCommentId, setReplyingCommentId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [reviewFilterCourse, setReviewFilterCourse] = useState('all');

  // Feature 3: Announcements State
  const [announcements, setAnnouncements] = useState([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(false);
  const [creatingAnnouncement, setCreatingAnnouncement] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    course_id: '',
    title: '',
    content: '',
    priority: 'normal'
  });

  // Modal / Form States
  const [showCreateCourse, setShowCreateCourse] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [thumbnailFileName, setThumbnailFileName] = useState('');
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
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [videoFileName, setVideoFileName] = useState('');
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [docFileName, setDocFileName] = useState('');
  const [newLesson, setNewLesson] = useState({
    section_id: '',
    title: '',
    video_url: '',
    document_url: '',
    content: '',
    duration: '15 mins'
  });
  const [isTargetSectionOpen, setIsTargetSectionOpen] = useState(false);
  const targetSectionRef = useRef(null);

  // Edit Lesson & Video State
  const [editingLesson, setEditingLesson] = useState(null);
  const [editLessonForm, setEditLessonForm] = useState({
    title: '',
    video_url: '',
    document_url: '',
    duration: '15 mins'
  });
  const [uploadingEditVideo, setUploadingEditVideo] = useState(false);
  const [editVideoFileName, setEditVideoFileName] = useState('');
  const [uploadingEditDoc, setUploadingEditDoc] = useState(false);
  const [editDocFileName, setEditDocFileName] = useState('');

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
          { option_text: '', is_correct: false },
          { option_text: '', is_correct: false },
          { option_text: '', is_correct: false }
        ]
      }
    ]
  });

  const [searchParams] = useSearchParams();

  useEffect(() => {
    fetchInstructorData();
  }, []);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'doubts' || tabParam === 'revenue' || tabParam === 'curriculum') {
      setActiveStudioTab(tabParam);
    }
  }, [searchParams]);

  useEffect(() => {
    // Poll tutor threads every 5s across dashboard to keep unread counts and notifications fresh
    fetchTutorThreads();
    const interval = setInterval(fetchTutorThreads, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    chatScrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [threadMessages]);

  // Click outside and escape key dismissal for Target Section dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (targetSectionRef.current && !targetSectionRef.current.contains(e.target)) {
        setIsTargetSectionOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsTargetSectionOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const fetchInstructorData = async () => {
    try {
      const [cRes, catRes, earnRes, threadRes] = await Promise.all([
        API.get('/courses/instructor/my-courses'),
        API.get('/courses/categories'),
        API.get('/transactions/tutor/earnings'),
        API.get('/chat/tutor/threads').catch(() => ({ data: [] }))
      ]);
      setCourses(cRes.data);
      setCategories(catRes.data);
      if (earnRes.data) {
        setEarningsData(earnRes.data);
      }
      setTutorThreads(threadRes.data || []);
      if (threadRes.data && threadRes.data.length > 0 && !selectedThread) {
        handleSelectThread(threadRes.data[0]);
      }
      if (cRes.data.length > 0) {
        setSelectedCourse(cRes.data[0]);
        fetchSyllabus(cRes.data[0]._id);
        fetchCourseAnalytics(cRes.data[0]._id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTutorThreads = async () => {
    try {
      const res = await API.get('/chat/tutor/threads');
      setTutorThreads(res.data);
    } catch (err) {
      console.error('Failed to fetch tutor threads:', err);
    }
  };

  const handleSelectThread = async (thread) => {
    setSelectedThread(thread);
    try {
      const res = await API.get(`/chat/messages/${thread.courseId}/${thread.student._id}`);
      setThreadMessages(res.data);
      // Mark local thread unread as 0
      setTutorThreads(prev => prev.map(t => 
        t.courseId === thread.courseId && t.student._id === thread.student._id 
          ? { ...t, unreadCount: 0 } 
          : t
      ));
    } catch (err) {
      console.error('Failed to fetch messages for thread:', err);
    }
  };

  const handleChatFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      alert('File size exceeds 25MB limit.');
      return;
    }

    const formData = new FormData();
    formData.append('attachment', file);

    setUploadingChatAttachment(true);
    try {
      const res = await API.post('/chat/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setPendingChatAttachment(res.data);
    } catch (err) {
      console.error('Upload failed:', err);
      alert(err.response?.data?.message || 'Failed to upload attachment.');
    } finally {
      setUploadingChatAttachment(false);
      if (chatFileInputRef.current) chatFileInputRef.current.value = '';
    }
  };

  const handleSendTutorReply = async (e) => {
    if (e) e.preventDefault();
    if ((!threadInput.trim() && !pendingChatAttachment) || !selectedThread || sendingReply) return;

    setSendingReply(true);
    try {
      const payload = {
        courseId: selectedThread.courseId,
        studentId: selectedThread.student._id,
        tutorId: user._id,
        message: threadInput.trim(),
        attachments: pendingChatAttachment ? [pendingChatAttachment] : []
      };

      const res = await API.post('/chat/send', payload);
      setThreadMessages(prev => [...prev, res.data]);
      setThreadInput('');
      setPendingChatAttachment(null);
      fetchTutorThreads();
    } catch (err) {
      console.error('Failed to send tutor reply:', err);
      alert(err.response?.data?.message || 'Failed to send reply.');
    } finally {
      setSendingReply(false);
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
    fetchCourseAnalytics(c._id);
  };

  // Feature 1: Analytics Handler
  const fetchCourseAnalytics = async (courseId) => {
    if (!courseId) return;
    setAnalyticsLoading(true);
    try {
      const res = await API.get(`/analytics/course/${courseId}`);
      setCourseAnalytics(res.data);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // Feature 2: Reviews Handlers
  const fetchReviews = async () => {
    setReviewsLoading(true);
    try {
      const res = await API.get('/comments/instructor/all');
      setReviewsData(res.data);
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handlePostReply = async (commentId) => {
    if (!replyText.trim()) return;
    setSubmittingReply(true);
    try {
      const res = await API.put(`/comments/${commentId}/reply`, { text: replyText.trim() });
      setReviewsData(prev => ({
        ...prev,
        reviews: prev.reviews.map(r => r._id === commentId ? res.data.comment : r)
      }));
      setReplyingCommentId(null);
      setReplyText('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to post reply');
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleDeleteReply = async (commentId) => {
    if (!window.confirm('Are you sure you want to remove your reply?')) return;
    try {
      await API.delete(`/comments/${commentId}/reply`);
      setReviewsData(prev => ({
        ...prev,
        reviews: prev.reviews.map(r => r._id === commentId ? { ...r, reply: undefined } : r)
      }));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove reply');
    }
  };

  // Feature 3: Announcements Handlers
  const fetchInstructorAnnouncements = async () => {
    setAnnouncementsLoading(true);
    try {
      const res = await API.get('/announcements/instructor/all');
      setAnnouncements(res.data);
    } catch (err) {
      console.error('Failed to fetch announcements:', err);
    } finally {
      setAnnouncementsLoading(false);
    }
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    if (!newAnnouncement.course_id || !newAnnouncement.title.trim() || !newAnnouncement.content.trim()) {
      alert('Please select a course and fill in both title and content.');
      return;
    }
    setCreatingAnnouncement(true);
    try {
      const res = await API.post('/announcements', newAnnouncement);
      setAnnouncements([res.data.announcement, ...announcements]);
      setNewAnnouncement({
        course_id: selectedCourse?._id || (courses[0]?._id || ''),
        title: '',
        content: '',
        priority: 'normal'
      });
      alert(res.data.message || 'Announcement broadcasted successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to broadcast announcement');
    } finally {
      setCreatingAnnouncement(false);
    }
  };

  const handleDeleteAnnouncement = async (annId) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await API.delete(`/announcements/${annId}`);
      setAnnouncements(announcements.filter(a => a._id !== annId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete announcement');
    }
  };

  const handleThumbnailUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setUploadingThumbnail(true);
    setThumbnailFileName(file.name);
    try {
      const res = await API.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setNewCourse(prev => ({ ...prev, thumbnail: res.data.image_url }));
    } catch (err) {
      console.error(err);
      alert('Thumbnail image upload failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploadingThumbnail(false);
    }
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
    if (!newLesson.section_id) {
      alert('Please select a target chapter section for this lesson');
      return;
    }
    if (!newLesson.title.trim() || !selectedCourse) return;
    try {
      await API.post('/syllabus/lesson', {
        ...newLesson,
        course_id: selectedCourse._id
      });
      setNewLesson({ section_id: '', title: '', video_url: '', document_url: '', content: '', duration: '15 mins' });
      setVideoFileName('');
      setDocFileName('');
      fetchSyllabus(selectedCourse._id);
    } catch (err) {
      console.error(err);
    }
  };

  // Auto-calculate video duration from uploaded local file
  const calculateVideoDuration = (file) => {
    return new Promise((resolve) => {
      try {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = () => {
          window.URL.revokeObjectURL(video.src);
          const totalSeconds = Math.round(video.duration);
          if (isNaN(totalSeconds) || totalSeconds <= 0) {
            resolve('15 mins');
            return;
          }
          const hours = Math.floor(totalSeconds / 3600);
          const minutes = Math.floor((totalSeconds % 3600) / 60);
          const seconds = totalSeconds % 60;

          if (hours > 0) {
            resolve(`${hours}h ${minutes}m`);
          } else if (minutes > 0) {
            resolve(seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes} mins`);
          } else {
            resolve(`${seconds} secs`);
          }
        };
        video.onerror = () => {
          resolve('15 mins');
        };
        video.src = URL.createObjectURL(file);
      } catch (err) {
        resolve('15 mins');
      }
    });
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Automatically calculate duration from uploaded video file
    const calculatedDuration = await calculateVideoDuration(file);
    setNewLesson(prev => ({ ...prev, duration: calculatedDuration }));

    const formData = new FormData();
    formData.append('video', file);

    setUploadingVideo(true);
    setVideoFileName(file.name);
    try {
      const res = await API.post('/upload/video', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setNewLesson(prev => ({ ...prev, video_url: res.data.video_url }));
    } catch (err) {
      console.error(err);
      alert('Local MP4 video upload failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleDocUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('document', file);

    setUploadingDoc(true);
    setDocFileName(file.name);
    try {
      const res = await API.post('/upload/document', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setNewLesson(prev => ({ ...prev, document_url: res.data.doc_url }));
    } catch (err) {
      console.error(err);
      alert('Document upload failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleOpenEditLesson = (les) => {
    setEditingLesson(les);
    setEditLessonForm({
      title: les.title,
      video_url: les.video_url,
      document_url: les.document_url || '',
      duration: les.duration || '15 mins'
    });
    setEditVideoFileName('');
    setEditDocFileName('');
  };

  const handleEditVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Automatically calculate duration from uploaded video file
    const calculatedDuration = await calculateVideoDuration(file);
    setEditLessonForm(prev => ({ ...prev, duration: calculatedDuration }));

    const formData = new FormData();
    formData.append('video', file);

    setUploadingEditVideo(true);
    setEditVideoFileName(file.name);
    try {
      const res = await API.post('/upload/video', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setEditLessonForm(prev => ({ ...prev, video_url: res.data.video_url }));
    } catch (err) {
      console.error(err);
      alert('MP4 video upload failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploadingEditVideo(false);
    }
  };

  const handleEditDocUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('document', file);

    setUploadingEditDoc(true);
    setEditDocFileName(file.name);
    try {
      const res = await API.post('/upload/document', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setEditLessonForm(prev => ({ ...prev, document_url: res.data.doc_url }));
    } catch (err) {
      console.error(err);
      alert('PDF / Document upload failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploadingEditDoc(false);
    }
  };

  const handleSaveEditedLesson = async (e) => {
    e.preventDefault();
    if (!editingLesson) return;

    try {
      await API.put(`/syllabus/lesson/${editingLesson._id}`, editLessonForm);
      setEditingLesson(null);
      fetchSyllabus(selectedCourse._id);
      alert('Lesson and video file updated successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to update lesson: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm('Are you sure you want to delete this lesson?')) return;
    try {
      await API.delete(`/syllabus/lesson/${lessonId}`);
      fetchSyllabus(selectedCourse._id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateQuizSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCourse) return;

    // Validate that questions are filled
    const validQuestions = quizForm.questions.filter(q => q.question.trim().length > 0);
    if (validQuestions.length === 0) {
      alert('Please add at least one question with options for the quiz.');
      return;
    }

    try {
      await API.post('/quizzes', {
        course_id: selectedCourse._id,
        title: quizForm.title,
        duration: quizForm.duration,
        total_marks: quizForm.total_marks,
        questions: validQuestions
      });
      setShowCreateQuiz(false);
      setQuizForm({
        title: '',
        duration: 15,
        total_marks: 20,
        questions: [
          {
            question: '',
            mark: 10,
            options: [
              { option_text: '', is_correct: true },
              { option_text: '', is_correct: false },
              { option_text: '', is_correct: false },
              { option_text: '', is_correct: false }
            ]
          }
        ]
      });
      alert('Quiz created successfully with questions and options!');
    } catch (err) {
      console.error(err);
      alert('Failed to create quiz: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleAddQuestionItem = () => {
    setQuizForm(prev => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          question: '',
          mark: 10,
          options: [
            { option_text: '', is_correct: true },
            { option_text: '', is_correct: false },
            { option_text: '', is_correct: false },
            { option_text: '', is_correct: false }
          ]
        }
      ]
    }));
  };

  const handleAddOptionItem = (qIndex) => {
    setQuizForm(prev => {
      const updated = [...prev.questions];
      updated[qIndex].options.push({ option_text: '', is_correct: false });
      return { ...prev, questions: updated };
    });
  };

  const handleRemoveOptionItem = (qIndex, oIndex) => {
    setQuizForm(prev => {
      const updated = [...prev.questions];
      if (updated[qIndex].options.length <= 2) {
        alert('A question must have at least 2 options.');
        return prev;
      }
      const wasCorrect = updated[qIndex].options[oIndex].is_correct;
      updated[qIndex].options = updated[qIndex].options.filter((_, i) => i !== oIndex);
      // If the removed option was marked correct, designate the first option as correct
      if (wasCorrect && updated[qIndex].options.length > 0) {
        updated[qIndex].options[0].is_correct = true;
      }
      return { ...prev, questions: updated };
    });
  };

  const handleRemoveQuestionItem = (index) => {
    setQuizForm(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const handleQuestionTextChange = (qIndex, text) => {
    setQuizForm(prev => {
      const updated = [...prev.questions];
      updated[qIndex].question = text;
      return { ...prev, questions: updated };
    });
  };

  const handleOptionTextChange = (qIndex, oIndex, text) => {
    setQuizForm(prev => {
      const updated = [...prev.questions];
      updated[qIndex].options[oIndex].option_text = text;
      return { ...prev, questions: updated };
    });
  };

  const handleSetCorrectOption = (qIndex, correctIndex) => {
    setQuizForm(prev => {
      const updated = [...prev.questions];
      updated[qIndex].options = updated[qIndex].options.map((opt, i) => ({
        ...opt,
        is_correct: i === correctIndex
      }));
      return { ...prev, questions: updated };
    });
  };

  const selectedCourseBreakdown = selectedCourse && earningsData.courseBreakdown
    ? earningsData.courseBreakdown.find(cb => cb._id.toString() === selectedCourse._id.toString())
    : null;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="glass-panel" style={{
        padding: '1.75rem 2rem',
        marginBottom: '2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.25rem',
        background: 'var(--color-surface)',
        borderLeft: '4px solid var(--color-primary)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: 'var(--radius-full)', background: 'var(--color-primary-subtle)', color: 'var(--color-primary)', fontSize: '0.75rem', fontWeight: 600, marginBottom: '6px', border: '1px solid var(--color-border)' }}>
            <Sparkles size={13} /> Tutor Studio &amp; Creator Hub
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--color-primary)', margin: 0 }}>
            Tutor Course Studio
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem', marginTop: '2px', marginBottom: 0 }}>
            Build, publish, and manage courses, video lessons, interactive quizzes, and track earnings
          </p>
        </div>
        <button onClick={() => setShowCreateCourse(true)} className="btn btn-primary" style={{ padding: '12px 22px', borderRadius: 'var(--radius-sm)', fontWeight: 600 }}>
          <PlusCircle size={18} /> Create New Course
        </button>
      </div>

      {/* Earnings & Performance Metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2rem'
      }}>
        {/* Total Earnings Card */}
        <div className="glass-panel studio-metric-card" style={{ padding: '1.4rem', display: 'flex', alignItems: 'center', gap: '1.2rem', position: 'relative', overflow: 'hidden', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--color-accent-subtle)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <DollarSign size={26} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Total Revenue</div>
            <h3 style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--color-primary)', marginTop: '2px', lineHeight: 1.1 }}>
              ${earningsData.totalEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <span style={{ fontSize: '0.72rem', color: 'var(--color-primary)', marginTop: '4px', display: 'inline-block', fontWeight: 600 }}>
              ● Lifetime Earnings
            </span>
          </div>
        </div>

        {/* Paid Student Enrollments */}
        <div className="glass-panel studio-metric-card" style={{ padding: '1.4rem', display: 'flex', alignItems: 'center', gap: '1.2rem', position: 'relative', overflow: 'hidden', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--color-primary-subtle)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Users size={26} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Paid Students</div>
            <h3 style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--color-primary)', marginTop: '2px', lineHeight: 1.1 }}>
              {earningsData.totalSales}
            </h3>
            <span style={{ fontSize: '0.72rem', color: 'var(--color-primary)', marginTop: '4px', display: 'inline-block', fontWeight: 600 }}>
              ● Enrolled Purchases
            </span>
          </div>
        </div>

        {/* Total Courses */}
        <div className="glass-panel studio-metric-card" style={{ padding: '1.4rem', display: 'flex', alignItems: 'center', gap: '1.2rem', position: 'relative', overflow: 'hidden', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--color-primary-subtle)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <BookOpen size={26} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Active Courses</div>
            <h3 style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--color-primary)', marginTop: '2px', lineHeight: 1.1 }}>
              {courses.length}
            </h3>
            <span style={{ fontSize: '0.72rem', color: 'var(--color-primary)', marginTop: '4px', display: 'inline-block', fontWeight: 600 }}>
              ● Published in Catalog
            </span>
          </div>
        </div>

        {/* Student Doubts Alert Card */}
        <div 
          onClick={() => setActiveStudioTab('doubts')}
          className="glass-panel studio-metric-card" 
          style={{ 
            padding: '1.4rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1.2rem', 
            position: 'relative', 
            overflow: 'hidden', 
            cursor: 'pointer',
            borderRadius: 'var(--radius-sm)',
            border: tutorThreads.reduce((sum, t) => sum + (t.unreadCount || 0), 0) > 0 ? '1px solid var(--color-danger)' : '1px solid var(--color-border)',
            background: tutorThreads.reduce((sum, t) => sum + (t.unreadCount || 0), 0) > 0 ? 'rgba(220, 38, 38, 0.05)' : 'var(--color-surface)'
          }}
          title="Click to review student doubts"
        >
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: 'var(--radius-sm)',
            background: tutorThreads.reduce((sum, t) => sum + (t.unreadCount || 0), 0) > 0
              ? 'rgba(220, 38, 38, 0.15)'
              : 'var(--color-primary-subtle)',
            border: tutorThreads.reduce((sum, t) => sum + (t.unreadCount || 0), 0) > 0
              ? '1px solid var(--color-danger)'
              : '1px solid var(--color-border)',
            color: tutorThreads.reduce((sum, t) => sum + (t.unreadCount || 0), 0) > 0 ? 'var(--color-danger)' : 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <MessageSquare size={26} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Student Doubts</div>
            <h3 style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--color-text)', marginTop: '2px', lineHeight: 1.1 }}>
              {tutorThreads.reduce((sum, t) => sum + (t.unreadCount || 0), 0)}
              <span style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--color-text-muted)', marginLeft: '6px' }}>
                unread ({tutorThreads.length} total)
              </span>
            </h3>
            <span style={{ fontSize: '0.72rem', color: tutorThreads.reduce((sum, t) => sum + (t.unreadCount || 0), 0) > 0 ? 'var(--color-danger)' : 'var(--color-text-muted)', marginTop: '4px', display: 'inline-block', fontWeight: 600 }}>
              {tutorThreads.reduce((sum, t) => sum + (t.unreadCount || 0), 0) > 0 ? '● Needs Tutor Attention' : '● All Doubts Addressed'}
            </span>
          </div>
        </div>
      </div>

      {/* Studio Navigation Tabs */}
      <div style={{
        display: 'flex',
        gap: '10px',
        marginBottom: '1.75rem',
        borderBottom: '1px solid var(--color-border)',
        paddingBottom: '0.75rem',
        flexWrap: 'wrap'
      }}>
        <button
          type="button"
          onClick={() => setActiveStudioTab('curriculum')}
          className={`btn ${activeStudioTab === 'curriculum' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 18px', borderRadius: 'var(--radius-sm)' }}
        >
          <BookOpen size={17} /> Course Curriculum &amp; Lessons
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveStudioTab('analytics');
            if (selectedCourse) fetchCourseAnalytics(selectedCourse._id);
            else if (courses.length > 0) fetchCourseAnalytics(courses[0]._id);
          }}
          className={`btn ${activeStudioTab === 'analytics' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 18px', borderRadius: 'var(--radius-sm)' }}
        >
          <BarChart3 size={17} /> Student Analytics &amp; Progress
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveStudioTab('reviews');
            fetchReviews();
          }}
          className={`btn ${activeStudioTab === 'reviews' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 18px', borderRadius: 'var(--radius-sm)' }}
        >
          <Star size={17} /> Reviews &amp; Feedback
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveStudioTab('announcements');
            fetchInstructorAnnouncements();
            if (!newAnnouncement.course_id && courses.length > 0) {
              setNewAnnouncement(prev => ({ ...prev, course_id: selectedCourse?._id || courses[0]._id }));
            }
          }}
          className={`btn ${activeStudioTab === 'announcements' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 18px', borderRadius: 'var(--radius-sm)' }}
        >
          <Megaphone size={17} /> Announcements &amp; Broadcasts
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveStudioTab('doubts');
            fetchTutorThreads();
          }}
          className={`btn ${activeStudioTab === 'doubts' ? 'btn-primary' : 'btn-secondary'}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '9px 18px',
            borderRadius: 'var(--radius-sm)',
            position: 'relative'
          }}
        >
          <MessageSquare size={17} /> Student Doubts &amp; Chat
          {tutorThreads.reduce((sum, t) => sum + (t.unreadCount || 0), 0) > 0 && (
            <span style={{
              background: 'var(--danger)',
              color: '#fff',
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              marginLeft: '4px'
            }}>
              {tutorThreads.reduce((sum, t) => sum + (t.unreadCount || 0), 0)} new
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveStudioTab('revenue')}
          className={`btn ${activeStudioTab === 'revenue' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 18px', borderRadius: 'var(--radius-sm)' }}
        >
          <CreditCard size={17} /> Earnings &amp; Purchases History
        </button>
      </div>

      {/* Main Studio Workspace Grid (Curriculum Tab) */}
      {activeStudioTab === 'curriculum' && (
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.5rem' }}>
          {/* Left Column: Course Selector List */}
          <div className="glass-panel" style={{ padding: '1.25rem', height: 'fit-content' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.05rem', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <BookOpen size={18} /> My Courses
            </h3>
            <span className="badge badge-free" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
              {courses.length} Total
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {courses.map((c) => {
              const isSelected = selectedCourse?._id === c._id;
              const cBreakdown = earningsData.courseBreakdown?.find(cb => cb._id.toString() === c._id.toString());
              return (
                <button 
                  key={c._id}
                  onClick={() => handleSelectCourse(c)}
                  className="studio-course-card"
                  style={{
                    textAlign: 'left',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    background: isSelected ? 'var(--color-primary-subtle)' : 'var(--color-surface)',
                    border: isSelected ? '1.5px solid var(--color-primary)' : '1px solid var(--color-border)',
                    borderLeft: isSelected ? '4px solid var(--color-primary)' : '1px solid var(--color-border)',
                    color: isSelected ? 'var(--color-primary)' : 'var(--color-text)',
                    cursor: 'pointer',
                    fontSize: '0.88rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    boxShadow: isSelected ? '0 1px 3px rgba(0, 0, 0, 0.06)' : 'none'
                  }}
                >
                  <img 
                    src={c.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100'} 
                    alt={c.name}
                    style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-sm)', objectFit: 'cover', flexShrink: 0, border: '1px solid var(--color-border)' }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, color: isSelected ? 'var(--color-primary)' : 'var(--color-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {c.name}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', marginTop: '2px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{c.type === 'free' ? 'FREE' : `$${c.price}`} • {c.level}</span>
                      {cBreakdown && cBreakdown.earnings > 0 && (
                        <span style={{ color: 'var(--color-primary)', fontWeight: 700, fontSize: '0.72rem', background: 'var(--color-primary-subtle)', padding: '1px 6px', borderRadius: '4px' }}>
                          +${cBreakdown.earnings}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Course Builder */}
        {selectedCourse ? (
          <div>
            <div className="glass-panel" style={{
              padding: '1.5rem',
              marginBottom: '1.5rem',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                  <img 
                    src={selectedCourse.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200'} 
                    alt={selectedCourse.name} 
                    style={{ width: '68px', height: '68px', borderRadius: 'var(--radius-sm)', objectFit: 'cover', border: '1px solid var(--color-border)', flexShrink: 0 }}
                  />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--color-primary)' }}>{selectedCourse.name}</h2>
                      <span className={`badge ${selectedCourse.type === 'free' ? 'badge-free' : 'badge-paid'}`} style={{ fontSize: '0.72rem' }}>
                        {selectedCourse.type === 'free' ? 'FREE COURSE' : `$${selectedCourse.price}`}
                      </span>
                      {selectedCourseBreakdown && (
                        <span className="badge badge-paid" style={{ background: 'var(--color-primary-subtle)', color: 'var(--color-primary)', border: '1px solid var(--color-border)', fontSize: '0.72rem' }}>
                          💰 Revenue: ${selectedCourseBreakdown.earnings.toFixed(2)} ({selectedCourseBreakdown.salesCount} {selectedCourseBreakdown.salesCount === 1 ? 'sale' : 'sales'})
                        </span>
                      )}
                    </div>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.86rem', marginTop: '4px', maxWidth: '600px' }}>{selectedCourse.desc}</p>
                  </div>
                </div>
                <button onClick={() => setShowCreateQuiz(true)} className="btn btn-secondary btn-sm" style={{ borderRadius: 'var(--radius-sm)' }}>
                  <HelpCircle size={16} /> Add Course Quiz
                </button>
              </div>
            </div>

            {/* Add Section Form */}
            <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.5rem', border: '1px solid var(--color-border)', background: 'var(--color-surface)', borderRadius: 'var(--radius-sm)' }}>
              <h4 style={{ fontSize: '0.95rem', marginBottom: '0.75rem', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Layers size={16} /> Add Syllabus Section / Chapter
              </h4>
              <form onSubmit={handleCreateSection} style={{ display: 'flex', gap: '10px' }}>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. 1. Introduction & Environment Setup"
                  value={newSectionName}
                  onChange={(e) => setNewSectionName(e.target.value)}
                  style={{ borderRadius: 'var(--radius-sm)' }}
                  required
                />
                <button type="submit" className="btn btn-primary btn-sm" style={{ whiteSpace: 'nowrap', padding: '8px 18px', borderRadius: 'var(--radius-sm)' }}>
                  + Add Section
                </button>
              </form>
            </div>

            {/* Add Lesson Form */}
            {syllabus.length > 0 && (
              <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.5rem', border: '1px solid var(--color-border)', background: 'var(--color-surface)', borderRadius: 'var(--radius-sm)', position: 'relative', zIndex: 30 }}>
                <h4 style={{ fontSize: '0.95rem', marginBottom: '1rem', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Video size={16} /> Add Video Lecture &amp; PDF Notes to Syllabus
                </h4>
                <form onSubmit={handleCreateLesson}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div className="form-group" ref={targetSectionRef} style={{ marginBottom: 0, position: 'relative' }}>
                      <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.88rem', fontWeight: 500 }}>
                        Target Section
                      </label>
                      <button
                        type="button"
                        className={`category-dropdown-trigger ${isTargetSectionOpen ? 'open' : ''}`}
                        style={{ width: '100%', minHeight: '42px', borderRadius: 'var(--radius-sm)', padding: '9px 12px' }}
                        onClick={() => setIsTargetSectionOpen(!isTargetSectionOpen)}
                        aria-haspopup="listbox"
                        aria-expanded={isTargetSectionOpen}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                          <Layers size={15} color="var(--color-primary)" style={{ flexShrink: 0 }} />
                          <span style={{ 
                            whiteSpace: 'nowrap', 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis',
                            color: newLesson.section_id ? 'var(--color-text)' : 'var(--color-text-muted)' 
                          }}>
                            {(() => {
                              if (!newLesson.section_id) return 'Select Target Chapter...';
                              const idx = syllabus.findIndex(s => s._id === newLesson.section_id);
                              const sec = syllabus[idx];
                              return sec ? `Chapter ${idx + 1}: ${sec.name}` : 'Select Target Chapter...';
                            })()}
                          </span>
                        </div>
                        <ChevronDown 
                          size={16} 
                          style={{ 
                            flexShrink: 0, 
                            color: 'var(--color-text-muted)',
                            transform: isTargetSectionOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
                          }} 
                        />
                      </button>

                      {/* Dropdown Menu Popover */}
                      {isTargetSectionOpen && (
                        <div 
                          className="category-dropdown-menu" 
                          role="listbox" 
                          aria-label="Target Chapter"
                          style={{ width: '100%', zIndex: 120 }}
                        >
                          <div style={{
                            padding: '6px 10px 4px',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            color: 'var(--color-text-muted)'
                          }}>
                            Select Target Chapter
                          </div>

                          <div style={{ maxHeight: '220px', overflowY: 'auto' }}>
                            {syllabus.map((s, idx) => {
                              const isSelected = newLesson.section_id === s._id;
                              return (
                                <button
                                  key={s._id}
                                  type="button"
                                  role="option"
                                  aria-selected={isSelected}
                                  className={`category-dropdown-item ${isSelected ? 'active' : ''}`}
                                  onClick={() => {
                                    setNewLesson({ ...newLesson, section_id: s._id });
                                    setIsTargetSectionOpen(false);
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                                    <span style={{ 
                                      fontSize: '0.75rem', 
                                      fontWeight: 700, 
                                      padding: '2px 6px', 
                                      borderRadius: '4px',
                                      background: isSelected ? 'var(--color-primary-subtle)' : 'var(--color-background)',
                                      color: isSelected ? 'var(--color-primary)' : 'var(--color-text-muted)',
                                      flexShrink: 0 
                                    }}>
                                      Chapter {idx + 1}
                                    </span>
                                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                      {s.name}
                                    </span>
                                  </div>
                                  {isSelected && <Check size={14} color="var(--color-primary)" style={{ flexShrink: 0 }} />}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>Lesson Title</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="e.g. Understanding MVC Architecture"
                        value={newLesson.title}
                        onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
                        style={{ borderRadius: 'var(--radius-sm)' }}
                        required
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Video size={15} color="var(--color-primary)" /> Upload Local MP4 Video File
                      </label>
                      <input 
                        type="file" 
                        accept="video/mp4,video/mkv,video/webm"
                        className="form-control"
                        onChange={handleVideoUpload}
                        style={{ borderRadius: 'var(--radius-sm)' }}
                        required={!newLesson.video_url}
                      />
                      {uploadingVideo && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-primary)', marginTop: '4px' }}>
                          ⚡ Uploading local MP4 video file... Please wait.
                        </div>
                      )}
                      {newLesson.video_url && !uploadingVideo && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-primary)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle size={14} /> Local MP4 Uploaded: {videoFileName || 'video.mp4'}
                        </div>
                      )}
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FileText size={15} color="var(--color-primary)" /> Upload PDF Study Notes (Optional)
                      </label>
                      <input 
                        type="file" 
                        accept=".pdf,.doc,.docx"
                        className="form-control"
                        onChange={handleDocUpload}
                        style={{ borderRadius: 'var(--radius-sm)' }}
                      />
                      {uploadingDoc && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-primary)', marginTop: '4px' }}>
                          ⚡ Uploading resource file...
                        </div>
                      )}
                      {newLesson.document_url && !uploadingDoc && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-primary)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle size={14} /> Document Uploaded: {docFileName || 'notes.pdf'}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={14} /> Lesson Duration</span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--color-primary)', fontWeight: 500 }}>
                        ⚡ Automatically calculated from video ({newLesson.duration || '15 mins'})
                      </span>
                    </label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={newLesson.duration}
                      onChange={(e) => setNewLesson({ ...newLesson, duration: e.target.value })}
                      placeholder="e.g. 15 mins or 12m 30s"
                      style={{ borderRadius: 'var(--radius-sm)' }}
                    />
                  </div>

                  <button type="submit" className="btn btn-secondary btn-sm" style={{ padding: '8px 18px', borderRadius: 'var(--radius-sm)', fontWeight: 600 }}>
                    + Add Lesson to Syllabus
                  </button>
                </form>
              </div>
            )}

            {/* Render Current Course Syllabus Tree */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary)' }}>
                <Layers size={18} color="var(--color-primary)" /> Course Syllabus Structure
              </h3>
              <span className="badge badge-free" style={{ fontSize: '0.74rem' }}>
                {syllabus.length} {syllabus.length === 1 ? 'Chapter' : 'Chapters'}
              </span>
            </div>

            {syllabus.map((sec, sIdx) => (
              <div key={sec._id} className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1rem', border: '1px solid var(--color-border)', background: 'var(--color-surface)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', paddingBottom: '8px', borderBottom: '1px solid var(--color-border)' }}>
                  <h4 style={{ fontSize: '1.02rem', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                    <span style={{ fontSize: '0.72rem', background: 'var(--color-primary-subtle)', color: 'var(--color-primary)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--color-border)' }}>
                      Chapter {sIdx + 1}
                    </span>
                    {sec.name}
                  </h4>
                  <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>
                    {sec.lessons.length} {sec.lessons.length === 1 ? 'lesson' : 'lessons'}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {sec.lessons.length === 0 ? (
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontStyle: 'italic', padding: '8px 4px' }}>
                      No lessons added to this chapter yet.
                    </div>
                  ) : (
                    sec.lessons.map((les) => (
                      <div key={les._id} className="studio-lesson-row" style={{
                        padding: '10px 14px',
                        background: 'var(--color-background)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--color-border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '0.86rem',
                        gap: '12px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                          <div style={{
                            width: '30px',
                            height: '30px',
                            borderRadius: '50%',
                            background: 'var(--color-primary-subtle)',
                            color: 'var(--color-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            <Video size={15} />
                          </div>
                          <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>{les.title}</span>
                          {les.document_url && (
                            <a 
                              href={les.document_url} 
                              target="_blank" 
                              rel="noreferrer"
                              className="badge badge-free" 
                              style={{ fontSize: '0.7rem', padding: '2px 8px', display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
                              title="Click to view attached PDF notes"
                            >
                              <FileText size={12} /> PDF Notes
                            </a>
                          )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                          <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={13} /> {les.duration}
                          </span>
                          <button 
                            type="button"
                            onClick={() => handleOpenEditLesson(les)} 
                            title="Edit Lesson Video & PDF Notes" 
                            style={{
                              background: 'var(--color-primary-subtle)',
                              border: '1px solid var(--color-border)',
                              borderRadius: 'var(--radius-sm)',
                              padding: '5px 10px',
                              color: 'var(--color-primary)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px',
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <Edit size={13} /> Edit Class &amp; Notes
                          </button>
                          <button 
                            type="button"
                            onClick={() => handleDeleteLesson(les._id)} 
                            title="Delete Lesson" 
                            style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', opacity: 0.75 }}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            No courses found. Click <strong>Create New Course</strong> to launch your first course.
          </div>
        )}
      </div>
      )}

      {/* Feature 1: Student Analytics & Learning Telemetry Tab */}
      {activeStudioTab === 'analytics' && (
        <div className="glass-panel" style={{ padding: '1.75rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
          {/* Header & Course Selector */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '1.75rem',
            paddingBottom: '1.25rem',
            borderBottom: '1px solid var(--color-border)'
          }}>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary)' }}>
                <BarChart3 size={22} color="var(--color-primary)" /> Student Progress &amp; Learning Analytics
              </h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: '3px' }}>
                Monitor enrolled students, syllabus completion rates, drop-off, and identify at-risk learners
              </p>
            </div>

            {/* Course Selector Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '0.84rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>Active Course:</span>
              <select
                className="form-control"
                value={selectedCourse?._id || ''}
                onChange={(e) => {
                  const c = courses.find(item => item._id === e.target.value);
                  if (c) handleSelectCourse(c);
                }}
                style={{
                  minWidth: '220px',
                  background: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)',
                  padding: '7px 12px',
                  fontSize: '0.85rem',
                  borderRadius: 'var(--radius-sm)'
                }}
              >
                {courses.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => selectedCourse && fetchCourseAnalytics(selectedCourse._id)}
                className="btn btn-secondary btn-sm"
                title="Refresh Analytics Telemetry"
                style={{ padding: '8px 12px', borderRadius: 'var(--radius-sm)' }}
              >
                <RefreshCw size={14} className={analyticsLoading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          {/* Metric Overview Cards */}
          {courseAnalytics && courseAnalytics.stats && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              marginBottom: '1.75rem'
            }}>
              <div className="glass-panel" style={{ padding: '1.2rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderLeft: '3px solid var(--color-primary)', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Total Enrolled
                </span>
                <h3 style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '4px', color: 'var(--color-text)' }}>
                  {courseAnalytics.stats.totalStudents}
                </h3>
                <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>Enrolled Students</span>
              </div>

              <div className="glass-panel" style={{ padding: '1.2rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderLeft: '3px solid var(--color-primary)', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Class Avg Completion
                </span>
                <h3 style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '4px', color: 'var(--color-primary)' }}>
                  {courseAnalytics.stats.avgCompletionRate}%
                </h3>
                <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>Across all lessons</span>
              </div>

              <div className="glass-panel" style={{ padding: '1.2rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderLeft: '3px solid var(--color-accent)', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Course Graduates
                </span>
                <h3 style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '4px', color: 'var(--color-primary)' }}>
                  {courseAnalytics.stats.completedStudents}
                </h3>
                <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>100% Finished Syllabus</span>
              </div>

              <div className="glass-panel" style={{ padding: '1.2rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderLeft: `3px solid ${courseAnalytics.stats.inactiveStudents > 0 ? 'var(--danger)' : 'var(--color-border)'}`, borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  At-Risk Learners
                </span>
                <h3 style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '4px', color: courseAnalytics.stats.inactiveStudents > 0 ? 'var(--danger)' : 'var(--color-text)' }}>
                  {courseAnalytics.stats.inactiveStudents}
                </h3>
                <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>0% Progress &gt; 7 Days</span>
              </div>
            </div>
          )}

          {/* Student Roster Filter & Search Bar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '1.25rem'
          }}>
            {/* Filter Pills */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setAnalyticsFilter('all')}
                style={{
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor: analyticsFilter === 'all' ? 'var(--color-primary)' : 'var(--color-border)',
                  background: analyticsFilter === 'all' ? 'var(--color-primary-subtle)' : 'var(--color-surface)',
                  color: analyticsFilter === 'all' ? 'var(--color-primary)' : 'var(--color-text-muted)'
                }}
              >
                All Students ({courseAnalytics?.students?.length || 0})
              </button>
              <button
                type="button"
                onClick={() => setAnalyticsFilter('completed')}
                style={{
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor: analyticsFilter === 'completed' ? 'var(--color-accent)' : 'var(--color-border)',
                  background: analyticsFilter === 'completed' ? 'var(--color-accent-subtle)' : 'var(--color-surface)',
                  color: analyticsFilter === 'completed' ? 'var(--color-primary)' : 'var(--color-text-muted)'
                }}
              >
                Graduated ({courseAnalytics?.stats?.completedStudents || 0})
              </button>
              <button
                type="button"
                onClick={() => setAnalyticsFilter('in_progress')}
                style={{
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor: analyticsFilter === 'in_progress' ? 'var(--color-primary)' : 'var(--color-border)',
                  background: analyticsFilter === 'in_progress' ? 'var(--color-primary-subtle)' : 'var(--color-surface)',
                  color: analyticsFilter === 'in_progress' ? 'var(--color-primary)' : 'var(--color-text-muted)'
                }}
              >
                In Progress ({courseAnalytics?.stats?.inProgressStudents || 0})
              </button>
              <button
                type="button"
                onClick={() => setAnalyticsFilter('inactive')}
                style={{
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor: analyticsFilter === 'inactive' ? 'var(--danger)' : 'var(--color-border)',
                  background: analyticsFilter === 'inactive' ? 'rgba(239, 68, 68, 0.1)' : 'var(--color-surface)',
                  color: analyticsFilter === 'inactive' ? 'var(--danger)' : 'var(--color-text-muted)'
                }}
              >
                At Risk ({courseAnalytics?.stats?.inactiveStudents || 0})
              </button>
            </div>

            {/* Search Input */}
            <div style={{ position: 'relative', minWidth: '220px' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input
                type="text"
                value={analyticsSearch}
                onChange={(e) => setAnalyticsSearch(e.target.value)}
                placeholder="Filter students by name or email..."
                style={{
                  padding: '6px 12px 6px 30px',
                  fontSize: '0.82rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-surface)',
                  color: 'var(--color-text)',
                  width: '100%'
                }}
              />
            </div>
          </div>

          {/* Student Telemetry Table */}
          {analyticsLoading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
              Loading student telemetry metrics...
            </div>
          ) : !courseAnalytics || !courseAnalytics.students || courseAnalytics.students.length === 0 ? (
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
              No students enrolled in this course yet.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left', color: 'var(--color-text-muted)' }}>
                    <th style={{ padding: '10px' }}>Student</th>
                    <th style={{ padding: '10px' }}>Enrolled On</th>
                    <th style={{ padding: '10px' }}>Last Activity</th>
                    <th style={{ padding: '10px', minWidth: '180px' }}>Syllabus Progress</th>
                    <th style={{ padding: '10px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {courseAnalytics.students
                    .filter((s) => {
                      const matchesSearch = !analyticsSearch || 
                        s.student?.name?.toLowerCase().includes(analyticsSearch.toLowerCase()) || 
                        s.student?.email?.toLowerCase().includes(analyticsSearch.toLowerCase());
                      if (!matchesSearch) return false;
                      if (analyticsFilter === 'completed') return s.status === 'completed';
                      if (analyticsFilter === 'in_progress') return s.status === 'in_progress';
                      if (analyticsFilter === 'inactive') return s.isInactive;
                      return true;
                    })
                    .map((s) => (
                      <tr key={s.enrollmentId} style={{ borderBottom: '1px solid var(--color-border)' }}>
                        <td style={{ padding: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img
                            src={s.student?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                            alt=""
                            style={{ width: '32px', height: '32px', borderRadius: '50%' }}
                          />
                          <div>
                            <strong style={{ display: 'block', fontSize: '0.88rem', color: 'var(--color-text)' }}>{s.student?.name}</strong>
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{s.student?.email}</span>
                          </div>
                        </td>
                        <td style={{ padding: '10px', color: 'var(--color-text-muted)' }}>
                          {new Date(s.enrolledAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td style={{ padding: '10px', color: 'var(--color-text-muted)' }}>
                          {s.lastActiveAt ? new Date(s.lastActiveAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Never'}
                        </td>
                        <td style={{ padding: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>{s.percentage}%</span>
                            <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                              {s.completedLessons}/{s.totalLessons} lessons
                            </span>
                          </div>
                          <div style={{ width: '100%', height: '6px', background: 'var(--color-border)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{
                              width: `${s.percentage}%`,
                              height: '100%',
                              background: s.percentage === 100 ? 'var(--color-accent)' : 'var(--color-primary)',
                              borderRadius: '3px'
                            }} />
                          </div>
                        </td>
                        <td style={{ padding: '10px' }}>
                          {s.status === 'completed' ? (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '2px 8px',
                              borderRadius: 'var(--radius-full)',
                              fontSize: '0.74rem',
                              fontWeight: 600,
                              background: 'var(--color-accent-subtle)',
                              color: 'var(--color-primary)'
                            }}>
                              <GraduationCap size={12} /> Graduated
                            </span>
                          ) : s.isInactive ? (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '2px 8px',
                              borderRadius: 'var(--radius-full)',
                              fontSize: '0.74rem',
                              fontWeight: 600,
                              background: 'rgba(239, 68, 68, 0.15)',
                              color: 'var(--danger)'
                            }}>
                              <AlertTriangle size={12} /> At Risk
                            </span>
                          ) : s.status === 'in_progress' ? (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '2px 8px',
                              borderRadius: 'var(--radius-full)',
                              fontSize: '0.74rem',
                              fontWeight: 600,
                              background: 'var(--color-primary-subtle)',
                              color: 'var(--color-primary)'
                            }}>
                              In Progress
                            </span>
                          ) : (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '2px 8px',
                              borderRadius: 'var(--radius-full)',
                              fontSize: '0.74rem',
                              fontWeight: 600,
                              background: 'var(--color-background)',
                              color: 'var(--color-text-muted)'
                            }}>
                              Not Started
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Feature 2: Course Reviews & Feedback Tab */}
      {activeStudioTab === 'reviews' && (
        <div className="glass-panel" style={{ padding: '1.75rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '1.75rem',
            paddingBottom: '1.25rem',
            borderBottom: '1px solid var(--color-border)'
          }}>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary)' }}>
                <Star size={22} color="#f59e0b" fill="#f59e0b" /> Course Reviews &amp; Feedback Management
              </h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: '3px' }}>
                View student ratings, feedback sentiment, and post verified public replies
              </p>
            </div>

            {/* Course Filter Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.84rem', color: 'var(--color-text-muted)' }}>Filter Course:</span>
              <select
                className="form-control"
                value={reviewFilterCourse}
                onChange={(e) => setReviewFilterCourse(e.target.value)}
                style={{
                  minWidth: '200px',
                  background: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)',
                  padding: '7px 12px',
                  fontSize: '0.85rem',
                  borderRadius: 'var(--radius-sm)'
                }}
              >
                <option value="all">All My Courses ({courses.length})</option>
                {courses.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Rating Summary Card */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.25rem',
            marginBottom: '1.75rem'
          }}>
            {/* Average Rating Block */}
            <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', fontWeight: 900, color: '#f59e0b', lineHeight: 1 }}>
                  {reviewsData.stats?.avgRating || '5.0'}
                </div>
                <div style={{ display: 'flex', gap: '3px', justifyContent: 'center', marginTop: '6px' }}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={16}
                      fill={s <= Math.round(reviewsData.stats?.avgRating || 5) ? '#f59e0b' : 'none'}
                      color="#f59e0b"
                    />
                  ))}
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px', display: 'block' }}>
                  Course Rating
                </span>
              </div>

              <div style={{ flex: 1, borderLeft: '1px solid var(--color-border)', paddingLeft: '1.25rem' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text)' }}>
                  {reviewsData.stats?.totalReviews || 0} Total Reviews
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                  From verified enrolled students across published courses.
                </p>
              </div>
            </div>

            {/* Star Distribution Breakdown */}
            <div className="glass-panel" style={{ padding: '1.25rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: '8px' }}>
                RATING DISTRIBUTION
              </div>
              {[5, 4, 3, 2, 1].map((star) => {
                const count = reviewsData.stats?.ratingBreakdown?.[star] || 0;
                const total = reviewsData.stats?.totalReviews || 1;
                const percent = Math.round((count / (reviewsData.stats?.totalReviews || 1)) * 100);
                return (
                  <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', marginBottom: '5px' }}>
                    <span style={{ width: '25px', color: 'var(--color-text-muted)' }}>{star}★</span>
                    <div style={{ flex: 1, height: '6px', background: 'var(--color-border)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${percent}%`, height: '100%', background: '#f59e0b', borderRadius: '3px' }} />
                    </div>
                    <span style={{ width: '30px', textAlign: 'right', color: 'var(--color-text-muted)' }}>{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reviews List Feed */}
          {reviewsLoading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
              Loading reviews and ratings...
            </div>
          ) : !reviewsData.reviews || reviewsData.reviews.length === 0 ? (
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
              No reviews or discussion feedback received yet for your courses.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {reviewsData.reviews
                .filter(r => reviewFilterCourse === 'all' || r.course_id?._id === reviewFilterCourse)
                .map((r) => (
                  <div key={r._id} className="glass-panel" style={{ padding: '1.25rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img
                          src={r.user_id?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                          alt=""
                          style={{ width: '34px', height: '34px', borderRadius: '50%' }}
                        />
                        <div>
                          <strong style={{ fontSize: '0.9rem', color: 'var(--color-text)' }}>{r.user_id?.name || 'Student'}</strong>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                            <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                              {new Date(r.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                            <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>•</span>
                            <span style={{ fontSize: '0.74rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                              {r.course_id?.name}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Stars */}
                      <div style={{ display: 'flex', gap: '2px' }}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} size={14} fill={s <= (r.rating || 5) ? '#f59e0b' : 'none'} color="#f59e0b" />
                        ))}
                      </div>
                    </div>

                    {/* Review Text */}
                    <p style={{ fontSize: '0.88rem', color: 'var(--color-text)', margin: '8px 0 12px', lineHeight: 1.5 }}>
                      "{r.comment}"
                    </p>

                    {/* Official Tutor Reply Box */}
                    {r.reply && r.reply.text ? (
                      <div style={{
                        padding: '12px 14px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--color-primary-subtle)',
                        borderLeft: '3px solid var(--color-primary)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            👨‍🏫 Your Official Reply
                            {r.reply.replied_at && (
                              <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 400 }}>
                                • {new Date(r.reply.replied_at).toLocaleDateString()}
                              </span>
                            )}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteReply(r._id)}
                            style={{ background: 'none', border: 'none', color: 'var(--danger)', fontSize: '0.75rem', cursor: 'pointer' }}
                          >
                            Remove Reply
                          </button>
                        </div>
                        <p style={{ fontSize: '0.84rem', color: 'var(--color-text)', margin: 0 }}>
                          {r.reply.text}
                        </p>
                      </div>
                    ) : (
                      /* Reply Action */
                      <div>
                        {replyingCommentId === r._id ? (
                          <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <textarea
                              className="form-control"
                              rows="2"
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Write a helpful, professional reply to this review..."
                              style={{ fontSize: '0.84rem', borderRadius: 'var(--radius-sm)' }}
                            />
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                              <button
                                type="button"
                                onClick={() => { setReplyingCommentId(null); setReplyText(''); }}
                                className="btn btn-secondary btn-sm"
                                style={{ borderRadius: 'var(--radius-sm)' }}
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => handlePostReply(r._id)}
                                disabled={submittingReply || !replyText.trim()}
                                className="btn btn-primary btn-sm"
                                style={{ borderRadius: 'var(--radius-sm)' }}
                              >
                                {submittingReply ? 'Posting...' : 'Post Public Reply'}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => { setReplyingCommentId(r._id); setReplyText(''); }}
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: '0.78rem', padding: '4px 10px', marginTop: '4px', borderRadius: 'var(--radius-sm)' }}
                          >
                            <MessageSquare size={13} /> Reply to Student
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Feature 3: Announcements & Student Broadcasts Tab */}
      {activeStudioTab === 'announcements' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 420px) 1fr', gap: '1.5rem' }}>
          {/* Left Column: Create Announcement Form */}
          <div className="glass-panel" style={{ padding: '1.5rem', height: 'fit-content', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary)', marginBottom: '6px' }}>
              <Megaphone size={18} color="var(--color-primary)" /> Broadcast New Announcement
            </h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.82rem', marginBottom: '1.25rem' }}>
              Send course updates, schedule notices, or exam reminders directly to all enrolled students.
            </p>

            <form onSubmit={handleCreateAnnouncement} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Target Course */}
              <div className="form-group">
                <label style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>Target Course</label>
                <select
                  className="form-control"
                  value={newAnnouncement.course_id}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, course_id: e.target.value })}
                  style={{ borderRadius: 'var(--radius-sm)' }}
                  required
                >
                  <option value="">Select a Course...</option>
                  {courses.map(c => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Priority Tag */}
              <div className="form-group">
                <label style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>Announcement Priority</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[
                    { val: 'normal', label: '📢 Notice', color: 'var(--color-primary)', bg: 'var(--color-primary-subtle)' },
                    { val: 'update', label: '✨ Update', color: '#c084fc', bg: 'rgba(168,85,247,0.15)' },
                    { val: 'important', label: '🚨 Important', color: '#f87171', bg: 'rgba(239,68,68,0.15)' }
                  ].map(p => (
                    <button
                      key={p.val}
                      type="button"
                      onClick={() => setNewAnnouncement({ ...newAnnouncement, priority: p.val })}
                      style={{
                        flex: 1,
                        padding: '6px 8px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        border: `1px solid ${newAnnouncement.priority === p.val ? p.color : 'var(--color-border)'}`,
                        background: newAnnouncement.priority === p.val ? p.bg : 'var(--color-surface)',
                        color: newAnnouncement.priority === p.val ? (p.val === 'normal' ? 'var(--color-primary)' : p.color) : 'var(--color-text-muted)',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div className="form-group">
                <label style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>Headline / Title</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. New Lesson Added: Redux Toolkit Setup"
                  value={newAnnouncement.title}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                  style={{ borderRadius: 'var(--radius-sm)' }}
                  required
                />
              </div>

              {/* Message Content */}
              <div className="form-group">
                <label style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>Message Body</label>
                <textarea
                  className="form-control"
                  rows="4"
                  placeholder="Explain what is new, any deadlines, or instructions for your students..."
                  value={newAnnouncement.content}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                  style={{ borderRadius: 'var(--radius-sm)' }}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={creatingAnnouncement}
                className="btn btn-primary"
                style={{ padding: '10px 16px', fontWeight: 600, marginTop: '4px', borderRadius: 'var(--radius-sm)' }}
              >
                {creatingAnnouncement ? 'Broadcasting...' : '📢 Broadcast to Students'}
              </button>
            </form>
          </div>

          {/* Right Column: Sent Announcements Feed */}
          <div className="glass-panel" style={{ padding: '1.5rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary)' }}>
                <Clock size={18} color="var(--color-primary)" /> Broadcast History ({announcements.length})
              </h3>
              <button
                type="button"
                onClick={fetchInstructorAnnouncements}
                className="btn btn-secondary btn-sm"
                title="Refresh announcements"
                style={{ borderRadius: 'var(--radius-sm)' }}
              >
                <RefreshCw size={13} className={announcementsLoading ? 'animate-spin' : ''} />
              </button>
            </div>

            {announcementsLoading ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                Loading announcement history...
              </div>
            ) : announcements.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                No announcements broadcasted yet. Send your first announcement from the left panel!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {announcements.map((ann) => {
                  const isImportant = ann.priority === 'important';
                  const isUpdate = ann.priority === 'update';
                  return (
                    <div
                      key={ann._id}
                      style={{
                        padding: '14px 16px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--color-background)',
                        border: `1px solid ${isImportant ? 'rgba(239, 68, 68, 0.3)' : isUpdate ? 'rgba(168, 85, 247, 0.3)' : 'var(--color-border)'}`
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-full)',
                            textTransform: 'uppercase',
                            background: isImportant ? 'rgba(239, 68, 68, 0.15)' : isUpdate ? 'rgba(168, 85, 247, 0.15)' : 'var(--color-primary-subtle)',
                            color: isImportant ? '#f87171' : isUpdate ? '#c084fc' : 'var(--color-primary)'
                          }}>
                            {isImportant ? '🚨 Important' : isUpdate ? '✨ Update' : '📢 Notice'}
                          </span>
                          <strong style={{ fontSize: '0.94rem', color: 'var(--color-text)' }}>{ann.title}</strong>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteAnnouncement(ann._id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--color-text-muted)',
                            cursor: 'pointer',
                            padding: '2px'
                          }}
                          title="Delete announcement"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <p style={{ fontSize: '0.86rem', color: 'var(--color-text-muted)', marginBottom: '10px', lineHeight: 1.45 }}>
                        {ann.content}
                      </p>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        <span>Course: <strong style={{ color: 'var(--color-primary)' }}>{ann.course_id?.name || 'All Courses'}</strong></span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span>👥 {ann.recipientCount || 0} students notified</span>
                          <span>{new Date(ann.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Student Doubts & Chat Workspace (Doubts Tab) */}
      {activeStudioTab === 'doubts' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '320px 1fr',
          gap: '1.5rem',
          minHeight: '620px',
          height: 'calc(100vh - 280px)',
          maxHeight: '750px'
        }}>
          {/* Left Column: Student Conversations List */}
          <div className="glass-panel" style={{
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)'
          }}>
            <div style={{
              padding: '1rem 1.25rem',
              borderBottom: '1px solid var(--color-border)',
              background: 'var(--color-surface)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <h3 style={{ fontSize: '1.05rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary)' }}>
                <MessageSquare size={18} color="var(--color-primary)" /> Student Doubts
              </h3>
              <span className="badge badge-free" style={{ fontSize: '0.72rem' }}>
                {tutorThreads.length} Threads
              </span>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
              {tutorThreads.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-text-muted)' }}>
                  <MessageSquare size={36} color="var(--color-primary)" style={{ marginBottom: '0.75rem' }} />
                  <h4 style={{ color: 'var(--color-primary)', fontSize: '0.95rem' }}>No doubts submitted yet</h4>
                  <p style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                    When students in your courses ask a question or attach code screenshots, they will appear here.
                  </p>
                </div>
              ) : (
                tutorThreads.map((thread) => {
                  const isSelected = selectedThread && selectedThread.courseId === thread.courseId && selectedThread.student._id === thread.student._id;
                  return (
                    <div
                      key={`${thread.courseId}_${thread.student._id}`}
                      onClick={() => handleSelectThread(thread)}
                      style={{
                        padding: '12px',
                        borderRadius: 'var(--radius-sm)',
                        marginBottom: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        background: isSelected 
                          ? 'var(--color-primary-subtle)' 
                          : thread.unreadCount > 0 
                            ? 'var(--color-primary-subtle)' 
                            : 'transparent',
                        border: isSelected 
                          ? '1px solid var(--color-primary)' 
                          : thread.unreadCount > 0 
                            ? '1px solid var(--color-border)' 
                            : '1px solid transparent',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) e.currentTarget.style.background = 'var(--color-background)';
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) e.currentTarget.style.background = thread.unreadCount > 0 ? 'var(--color-primary-subtle)' : 'transparent';
                      }}
                    >
                      <div style={{ position: 'relative' }}>
                        <img 
                          src={thread.student?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} 
                          alt={thread.student?.name}
                          style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--color-border)' }}
                        />
                        {thread.unreadCount > 0 && (
                          <span style={{
                            position: 'absolute',
                            top: -2,
                            right: -2,
                            background: 'var(--danger)',
                            color: '#fff',
                            fontSize: '0.65rem',
                            fontWeight: 800,
                            width: '18px',
                            height: '18px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '2px solid var(--color-surface)'
                          }}>
                            {thread.unreadCount}
                          </span>
                        )}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {thread.student?.name}
                          </span>
                          <span style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)' }}>
                            {new Date(thread.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        {/* Clear Course Identifier Badge */}
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          background: 'var(--color-primary-subtle)',
                          border: '1px solid var(--color-border)',
                          borderRadius: '4px',
                          padding: '2px 8px',
                          marginBottom: '5px',
                          maxWidth: '100%'
                        }}>
                          <BookOpen size={11} color="var(--color-primary)" />
                          <span style={{
                            fontSize: '0.73rem',
                            color: 'var(--color-primary)',
                            fontWeight: 600,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {thread.courseName}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: thread.unreadCount > 0 ? 'var(--color-primary)' : 'var(--color-text-muted)', fontWeight: thread.unreadCount > 0 ? 600 : 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {thread.lastMessage?.hasAttachments && '📎 '}
                          {thread.lastMessage?.text || 'Sent attachment'}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Active WhatsApp-style Conversation */}
          <div className="glass-panel" style={{
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)'
          }}>
            {selectedThread ? (
              <>
                {/* Conversation Header */}
                <div style={{
                  padding: '1rem 1.25rem',
                  borderBottom: '1px solid var(--color-border)',
                  background: 'var(--color-surface)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ position: 'relative' }}>
                      <img 
                        src={selectedThread.student?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} 
                        alt={selectedThread.student?.name}
                        style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--color-primary)' }}
                      />
                      <span style={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--color-accent)',
                        border: '2px solid var(--color-surface)'
                      }} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--color-text)' }}>
                          {selectedThread.student?.name}
                        </h4>
                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          padding: '1px 8px',
                          borderRadius: 'var(--radius-full)',
                          background: 'var(--color-primary-subtle)',
                          color: 'var(--color-primary)',
                          border: '1px solid var(--color-border)'
                        }}>
                          Student
                        </span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                        {selectedThread.student?.email}
                      </div>
                    </div>
                  </div>

                  {/* Course Context Identification Pill */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    background: 'var(--color-primary-subtle)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '6px 12px'
                  }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '8px',
                      background: 'var(--color-surface)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--color-primary)'
                    }}>
                      <BookOpen size={15} />
                    </div>
                    <div>
                      <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                        Inquiring Course
                      </span>
                      <strong style={{ fontSize: '0.85rem', color: 'var(--color-primary)' }}>
                        {selectedThread.courseName}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Messages Body */}
                <div style={{
                  flex: 1,
                  padding: '1.25rem',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  background: 'var(--color-background)'
                }}>
                  {threadMessages.map((msg) => {
                    const isTutor = msg.sender?._id === user?._id || msg.sender === user?._id;
                    const formattedTime = new Date(msg.createdAt).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    });

                    return (
                      <div
                        key={msg._id}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: isTutor ? 'flex-end' : 'flex-start',
                          maxWidth: '75%',
                          alignSelf: isTutor ? 'flex-end' : 'flex-start'
                        }}
                      >
                        <div style={{
                          padding: '10px 14px',
                          borderRadius: isTutor ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                          background: isTutor 
                            ? 'var(--color-primary)' 
                            : 'var(--color-surface)',
                          color: isTutor ? 'var(--color-text-on-dark)' : 'var(--color-text)',
                          border: isTutor ? 'none' : '1px solid var(--color-border)',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                          wordBreak: 'break-word',
                          fontSize: '0.92rem',
                          lineHeight: '1.45'
                        }}>
                          {!isTutor && (
                            <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '4px' }}>
                              {msg.sender?.name || 'Student'}
                            </div>
                          )}

                          {msg.message && (
                            <div style={{ whiteSpace: 'pre-wrap' }}>{msg.message}</div>
                          )}

                          {msg.attachments && msg.attachments.length > 0 && (
                            <div style={{ marginTop: msg.message ? '8px' : '0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              {msg.attachments.map((att, idx) => (
                                <div key={idx}>
                                  {att.fileType === 'image' ? (
                                    <div 
                                      onClick={() => setChatPreviewImage(att.fileUrl)}
                                      style={{
                                        borderRadius: 'var(--radius-sm)',
                                        overflow: 'hidden',
                                        cursor: 'pointer',
                                        border: '1px solid var(--color-border)',
                                        maxHeight: '220px'
                                      }}
                                    >
                                      <img 
                                        src={att.fileUrl} 
                                        alt={att.fileName}
                                        style={{ width: '100%', maxHeight: '220px', objectFit: 'cover', display: 'block' }}
                                      />
                                    </div>
                                  ) : (
                                    <a
                                      href={att.fileUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      download={att.fileName}
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        padding: '8px 12px',
                                        borderRadius: 'var(--radius-sm)',
                                        background: 'var(--color-surface)',
                                        border: '1px solid var(--color-border)',
                                        color: 'var(--color-text)',
                                        textDecoration: 'none',
                                        fontSize: '0.82rem'
                                      }}
                                    >
                                      <FileText size={18} color="var(--color-primary)" />
                                      <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600 }}>
                                          {att.fileName}
                                        </div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                                          {att.fileSize ? `${Math.round(att.fileSize / 1024)} KB` : 'Document'}
                                        </div>
                                      </div>
                                      <Download size={15} />
                                    </a>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.72rem',
                          color: 'var(--color-text-muted)',
                          marginTop: '4px',
                          padding: '0 4px'
                        }}>
                          <span>{formattedTime}</span>
                          {isTutor && (
                            <CheckCheck 
                              size={14} 
                              color={msg.read ? 'var(--color-primary)' : 'var(--color-text-muted)'} 
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={chatScrollRef} />
                </div>

                {/* Pending Attachment Preview */}
                {pendingChatAttachment && (
                  <div style={{
                    padding: '8px 16px',
                    background: 'var(--color-primary-subtle)',
                    borderTop: '1px solid var(--color-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.82rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text)' }}>
                      {pendingChatAttachment.fileType === 'image' ? (
                        <ImageIcon size={16} color="var(--color-primary)" />
                      ) : (
                        <FileText size={16} color="var(--color-primary)" />
                      )}
                      <span style={{ fontWeight: 600 }}>Attached Solution: {pendingChatAttachment.fileName}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPendingChatAttachment(null)}
                      style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}

                {/* Input Bar */}
                <form 
                  onSubmit={handleSendTutorReply}
                  style={{
                    padding: '1rem',
                    borderTop: '1px solid var(--color-border)',
                    background: 'var(--color-surface)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                >
                  <input 
                    type="file"
                    ref={chatFileInputRef}
                    onChange={handleChatFileUpload}
                    style={{ display: 'none' }}
                    accept="image/*,.pdf,.doc,.docx,.txt,.zip"
                  />

                  <button
                    type="button"
                    onClick={() => chatFileInputRef.current?.click()}
                    disabled={uploadingChatAttachment || sendingReply}
                    style={{
                      background: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      color: pendingChatAttachment ? 'var(--color-primary)' : 'var(--color-text-muted)',
                      width: '40px',
                      height: '40px',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      flexShrink: 0
                    }}
                    title="Attach solution image or document"
                  >
                    <Paperclip size={18} />
                  </button>

                  <input 
                    type="text"
                    className="form-control"
                    placeholder="Type your explanation or solution to the student..."
                    value={threadInput}
                    onChange={(e) => setThreadInput(e.target.value)}
                    style={{
                      flex: 1,
                      borderRadius: 'var(--radius-sm)',
                      padding: '10px 14px',
                      background: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text)'
                    }}
                  />

                  <button
                    type="submit"
                    disabled={(!threadInput.trim() && !pendingChatAttachment) || sendingReply || uploadingChatAttachment}
                    className="btn btn-primary"
                    style={{
                      width: '42px',
                      height: '40px',
                      borderRadius: 'var(--radius-sm)',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title="Send Reply (Enter)"
                  >
                    <Send size={17} />
                  </button>
                </form>
              </>
            ) : (
              <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                <MessageSquare size={48} color="var(--color-primary)" style={{ marginBottom: '1rem' }} />
                <h3 style={{ color: 'var(--color-primary)' }}>Select a Student Doubt Thread</h3>
                <p style={{ fontSize: '0.88rem' }}>Choose any conversation from the list to view questions and reply.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tutor Earnings & Student Purchase History Table (Revenue Tab or Curriculum footer) */}
      {(activeStudioTab === 'revenue' || activeStudioTab === 'curriculum') && (
      <div className="glass-panel" style={{ padding: '1.5rem', marginTop: '2rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary)' }}>
              <CreditCard size={20} color="var(--color-primary)" /> Student Purchases &amp; Course Earnings History
            </h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.82rem', marginTop: '2px' }}>
              Real-time payment transactions and earnings from students enrolled in your courses
            </p>
          </div>
          <span className="badge badge-paid" style={{ fontSize: '0.82rem', padding: '6px 12px' }}>
            Total Earned: ${earningsData.totalEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        {earningsData.recentTransactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--color-text-muted)', fontSize: '0.88rem' }}>
            <div style={{ fontSize: '2rem', marginBottom: '8px', opacity: 0.7 }}>💰</div>
            <p style={{ fontWeight: 600, color: 'var(--color-text)', marginBottom: '4px' }}>No student purchases recorded yet.</p>
            <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
              When students purchase your paid courses, their payment details and your revenue will appear here in real-time.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left', color: 'var(--color-text-muted)' }}>
                  <th style={{ padding: '10px 12px' }}>Student</th>
                  <th style={{ padding: '10px 12px' }}>Course</th>
                  <th style={{ padding: '10px 12px' }}>Amount Earned</th>
                  <th style={{ padding: '10px 12px' }}>Payment Method</th>
                  <th style={{ padding: '10px 12px' }}>Reference</th>
                  <th style={{ padding: '10px 12px' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {earningsData.recentTransactions.map((tx) => (
                  <tr key={tx._id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <img 
                          src={tx.user_id?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} 
                          alt={tx.user_id?.name || 'Student'} 
                          style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--color-text)' }}>{tx.user_id?.name || 'Student'}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{tx.user_id?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--color-primary)' }}>
                      {tx.course_id?.name || 'Course'}
                    </td>
                    <td style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--color-primary)' }}>
                      +${Number(tx.amount || 0).toFixed(2)}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <span className="badge badge-free" style={{ fontSize: '0.7rem' }}>
                        {tx.payment_method || 'CARD'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      {tx.transaction_reference}
                    </td>
                    <td style={{ padding: '10px 12px', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                      {new Date(tx.createdAt || tx.transaction_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      )}

      {/* Create Course Modal */}
      {showCreateCourse && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <div className="glass-panel" style={{ maxWidth: '550px', width: '100%', padding: '2rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.25rem', color: 'var(--color-primary)' }}>Create New Course</h2>
            <form onSubmit={handleCreateCourseSubmit}>
              <div className="form-group">
                <label>Course Title</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. Master React 19 & Next.js"
                  value={newCourse.name}
                  onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                  style={{ borderRadius: 'var(--radius-sm)' }}
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
                  style={{ borderRadius: 'var(--radius-sm)' }}
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
                    style={{ borderRadius: 'var(--radius-sm)' }}
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
                      style={{ borderRadius: 'var(--radius-sm)' }}
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
                  style={{ borderRadius: 'var(--radius-sm)' }}
                  required
                >
                  <option value="">Select Category...</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Upload Course Thumbnail Image</label>
                <input 
                  type="file" 
                  accept="image/*"
                  className="form-control"
                  onChange={handleThumbnailUpload}
                  style={{ borderRadius: 'var(--radius-sm)' }}
                />
                {uploadingThumbnail && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-primary)', marginTop: '4px' }}>
                    ⚡ Uploading course thumbnail image... Please wait.
                  </div>
                )}
                {newCourse.thumbnail && !uploadingThumbnail && (
                  <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img 
                      src={newCourse.thumbnail} 
                      alt="Thumbnail Preview" 
                      style={{ width: '90px', height: '55px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
                    />
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle size={14} /> Course Thumbnail Uploaded!
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowCreateCourse(false)} className="btn btn-secondary" style={{ borderRadius: 'var(--radius-sm)' }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ borderRadius: 'var(--radius-sm)' }}>Create Course</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Quiz Modal */}
      {showCreateQuiz && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <div className="glass-panel" style={{ maxWidth: '600px', width: '100%', padding: '2rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.25rem', color: 'var(--color-primary)' }}>Create Quiz for {selectedCourse?.name}</h2>
            <form onSubmit={handleCreateQuizSubmit}>
              <div className="form-group">
                <label>Quiz Title</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. Assessment Quiz 1"
                  value={quizForm.title}
                  onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                  style={{ borderRadius: 'var(--radius-sm)' }}
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
                    style={{ borderRadius: 'var(--radius-sm)' }}
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
                    style={{ borderRadius: 'var(--radius-sm)' }}
                    required
                  />
                </div>
              </div>

              {/* Questions & Options Builder */}
              <div style={{ marginTop: '1rem', maxHeight: '340px', overflowY: 'auto', paddingRight: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h4 style={{ fontSize: '1rem', color: 'var(--color-primary)' }}>Quiz Questions ({quizForm.questions.length})</h4>
                  <button 
                    type="button" 
                    onClick={handleAddQuestionItem} 
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.8rem', borderRadius: 'var(--radius-sm)' }}
                  >
                    + Add Question
                  </button>
                </div>

                {quizForm.questions.map((q, qIdx) => (
                  <div key={qIdx} style={{
                    background: 'var(--color-background)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '1rem',
                    marginBottom: '1rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '0.88rem', color: 'var(--color-primary)' }}>
                        Question {qIdx + 1}
                      </span>
                      {quizForm.questions.length > 1 && (
                        <button 
                          type="button" 
                          onClick={() => handleRemoveQuestionItem(qIdx)}
                          style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>

                    <div className="form-group" style={{ marginBottom: '10px' }}>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Enter question text..."
                        value={q.question}
                        onChange={(e) => handleQuestionTextChange(qIdx, e.target.value)}
                        style={{ borderRadius: 'var(--radius-sm)' }}
                        required
                      />
                    </div>

                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '6px' }}>
                      Options (Select radio button for Correct Answer):
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      {q.options.map((opt, oIdx) => (
                        <div key={oIdx} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <input 
                            type="radio" 
                            name={`correct_opt_${qIdx}`}
                            checked={opt.is_correct === true}
                            onChange={() => handleSetCorrectOption(qIdx, oIdx)}
                            title="Mark as correct option"
                            style={{ cursor: 'pointer', accentColor: 'var(--color-primary)' }}
                          />
                          <input 
                            type="text" 
                            className="form-control" 
                            style={{ fontSize: '0.82rem', padding: '6px 10px', flex: 1, borderRadius: 'var(--radius-sm)' }}
                            placeholder={`Option ${oIdx + 1}`}
                            value={opt.option_text}
                            onChange={(e) => handleOptionTextChange(qIdx, oIdx, e.target.value)}
                            required
                          />
                          {q.options.length > 2 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveOptionItem(qIdx, oIdx)}
                              title="Delete this option"
                              style={{
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: 'none',
                                color: 'var(--danger)',
                                cursor: 'pointer',
                                borderRadius: '4px',
                                padding: '4px 6px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    <div style={{ marginTop: '8px', textAlign: 'right' }}>
                      <button 
                        type="button" 
                        onClick={() => handleAddOptionItem(qIdx)}
                        style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontSize: '0.78rem' }}
                      >
                        + Add Extra Option
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowCreateQuiz(false)} className="btn btn-secondary" style={{ borderRadius: 'var(--radius-sm)' }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ borderRadius: 'var(--radius-sm)' }}>Save Quiz & Questions</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Lesson & Video File Modal */}
      {editingLesson && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <div className="glass-panel" style={{ maxWidth: '550px', width: '100%', padding: '2rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '1.25rem', color: 'var(--color-primary)' }}>Edit Lesson, Video &amp; PDF Notes</h2>
            <form onSubmit={handleSaveEditedLesson}>
              <div className="form-group">
                <label>Lesson Title</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={editLessonForm.title}
                  onChange={(e) => setEditLessonForm({ ...editLessonForm, title: e.target.value })}
                  style={{ borderRadius: 'var(--radius-sm)' }}
                  required
                />
              </div>

              {/* Video File Upload / Replace */}
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Video size={16} color="var(--color-primary)" /> Replace / Upload New MP4 Video File
                </label>
                <input 
                  type="file" 
                  accept="video/mp4,video/mkv,video/webm"
                  className="form-control"
                  onChange={handleEditVideoUpload}
                  style={{ borderRadius: 'var(--radius-sm)' }}
                />
                {uploadingEditVideo && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-primary)', marginTop: '4px' }}>
                    ⚡ Uploading new local MP4 video file... Please wait.
                  </div>
                )}
                {editVideoFileName && !uploadingEditVideo && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-primary)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle size={14} /> New Video Uploaded: {editVideoFileName}
                  </div>
                )}
                {editLessonForm.video_url && (
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '4px', wordBreak: 'break-all' }}>
                    Current Video: {editLessonForm.video_url}
                  </div>
                )}
              </div>

              {/* PDF Notes / Document Upload & Replace */}
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileText size={16} color="var(--color-primary)" /> Attach / Change PDF Study Notes
                </label>
                <input 
                  type="file" 
                  accept=".pdf,.doc,.docx"
                  className="form-control"
                  onChange={handleEditDocUpload}
                  style={{ borderRadius: 'var(--radius-sm)' }}
                />
                {uploadingEditDoc && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-primary)', marginTop: '4px' }}>
                    ⚡ Uploading new PDF document... Please wait.
                  </div>
                )}
                {editDocFileName && !uploadingEditDoc && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-primary)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle size={14} /> New PDF Notes Selected: {editDocFileName}
                  </div>
                )}
                {editLessonForm.document_url && (
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ color: 'var(--color-primary)' }}>✓ Notes currently attached:</span>
                    <a href={editLessonForm.document_url} target="_blank" rel="noreferrer" style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>
                      View / Download
                    </a>
                    <button 
                      type="button" 
                      onClick={() => { setEditLessonForm({ ...editLessonForm, document_url: '' }); setEditDocFileName(''); }}
                      style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '0.75rem' }}
                    >
                      (Remove Notes)
                    </button>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={14} /> Class Duration</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-primary)', fontWeight: 500 }}>
                    ⚡ Auto-calculated from video ({editLessonForm.duration || '15 mins'})
                  </span>
                </label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={editLessonForm.duration}
                  onChange={(e) => setEditLessonForm({ ...editLessonForm, duration: e.target.value })}
                  placeholder="e.g. 15 mins or 12m 30s"
                  style={{ borderRadius: 'var(--radius-sm)' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setEditingLesson(null)} className="btn btn-secondary" style={{ borderRadius: 'var(--radius-sm)' }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ borderRadius: 'var(--radius-sm)' }}>Save Updated Lesson &amp; Notes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tutor Image Lightbox Modal */}
      {chatPreviewImage && (
        <div 
          onClick={() => setChatPreviewImage(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 3000,
            padding: '2rem'
          }}
        >
          <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
            <img 
              src={chatPreviewImage} 
              alt="Enlarged doubt screenshot" 
              style={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: 'var(--radius-sm)', objectFit: 'contain' }}
            />
            <button
              onClick={() => setChatPreviewImage(null)}
              style={{
                position: 'absolute',
                top: '-40px',
                right: 0,
                background: 'none',
                border: 'none',
                color: '#fff',
                cursor: 'pointer'
              }}
            >
              <X size={28} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
