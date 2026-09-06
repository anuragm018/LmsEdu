import React, { useEffect, useState, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  MessageSquare, 
  Send, 
  Paperclip, 
  Image as ImageIcon, 
  FileText, 
  Download, 
  CheckCheck, 
  Clock, 
  BookOpen, 
  X,
  Sparkles,
  ArrowLeft,
  Search,
  Filter
} from 'lucide-react';

export const StudentDoubtsPage = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [threads, setThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [pendingAttachment, setPendingAttachment] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [filterTab, setFilterTab] = useState('discussed'); // 'discussed' (active/relevant doubts) vs 'all'
  const [searchQuery, setSearchQuery] = useState('');
  
  const fileInputRef = useRef(null);
  const chatScrollRef = useRef(null);

  const initialCourseId = searchParams.get('courseId');

  useEffect(() => {
    fetchThreads(true);
    const interval = setInterval(() => {
      fetchThreads(false);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    chatScrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchThreads = async (isInitial = false) => {
    try {
      const res = await API.get('/chat/student/threads');
      const threadList = res.data || [];
      setThreads(threadList);

      if (isInitial && threadList.length > 0) {
        if (initialCourseId) {
          const match = threadList.find(t => t.courseId?.toString() === initialCourseId);
          if (match) {
            handleSelectThread(match);
            return;
          }
        }
        // Select first active thread or first thread
        const firstActive = threadList.find(t => t.lastMessage) || threadList[0];
        handleSelectThread(firstActive);
      }
    } catch (err) {
      console.error('Failed to fetch student doubt threads:', err);
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  const handleSelectThread = async (thread) => {
    setSelectedThread(thread);
    try {
      const res = await API.get(`/chat/messages/${thread.courseId}/${user._id}`);
      setMessages(res.data);
      // Locally mark unread as 0
      setThreads(prev => prev.map(t => 
        t.courseId === thread.courseId ? { ...t, unreadCount: 0 } : t
      ));
    } catch (err) {
      console.error('Failed to fetch messages for course:', err);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      alert('File size exceeds 25MB limit.');
      return;
    }

    const formData = new FormData();
    formData.append('attachment', file);

    setUploadingAttachment(true);
    try {
      const res = await API.post('/chat/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setPendingAttachment(res.data);
    } catch (err) {
      console.error('Upload failed:', err);
      alert(err.response?.data?.message || 'Failed to upload attachment.');
    } finally {
      setUploadingAttachment(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if ((!inputText.trim() && !pendingAttachment) || !selectedThread || sending) return;

    setSending(true);
    try {
      const payload = {
        courseId: selectedThread.courseId,
        studentId: user._id,
        tutorId: selectedThread.tutor?._id || selectedThread.tutor,
        message: inputText.trim(),
        attachments: pendingAttachment ? [pendingAttachment] : []
      };

      const res = await API.post('/chat/send', payload);
      setMessages(prev => [...prev, res.data]);
      setInputText('');
      setPendingAttachment(null);
      fetchThreads(false);
    } catch (err) {
      console.error('Failed to send message:', err);
      alert(err.response?.data?.message || 'Failed to send doubt message.');
    } finally {
      setSending(false);
    }
  };

  // Filter threads:
  // "discussed": only courses that have an ongoing discussion or unread messages
  // "all": all enrolled courses
  const filteredThreads = threads.filter((t) => {
    // 1. Tab filter: active discussions vs all enrolled
    if (filterTab === 'discussed') {
      const hasDiscussion = t.lastMessage || t.unreadCount > 0;
      if (!hasDiscussion) return false;
    }
    // 2. Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchCourse = t.courseName?.toLowerCase().includes(q);
      const matchTutor = t.tutor?.name?.toLowerCase().includes(q);
      const matchMsg = t.lastMessage?.text?.toLowerCase().includes(q);
      if (!matchCourse && !matchTutor && !matchMsg) return false;
    }
    return true;
  });

  const discussedCount = threads.filter(t => t.lastMessage || t.unreadCount > 0).length;

  return (
    <div className="animate-fade-in">
      {/* Header Banner */}
      <div className="glass-panel" style={{
        padding: '1.5rem 2rem',
        marginBottom: '1.75rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.75), rgba(15, 23, 42, 0.85))',
        borderLeft: '4px solid var(--primary)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35)'
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary-light, #a5b4fc)', fontSize: '0.75rem', fontWeight: 600, marginBottom: '6px' }}>
            <Sparkles size={13} /> Active Doubt Discussions &amp; Resolution
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.02em', background: 'linear-gradient(135deg, #ffffff, #cbd5e1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
            My Course Doubts
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '4px', marginBottom: 0 }}>
            Chat with your tutors, ask questions, share screenshots/code, and clarify any doubts
          </p>
        </div>

        <Link to="/dashboard/student" className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ArrowLeft size={16} /> Back to Courses
        </Link>
      </div>

      {/* Main Doubts Workspace */}
      {loading ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading your tutor doubt conversations...
        </div>
      ) : threads.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3.5rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <MessageSquare size={48} color="var(--text-dim)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '8px' }}>No enrolled courses found</h3>
          <p style={{ maxWidth: '460px', margin: '0 auto 1.5rem', fontSize: '0.9rem' }}>
            Once you enroll in a course, you can ask direct questions and clear doubts with the course tutor here.
          </p>
          <Link to="/courses" className="btn btn-primary btn-sm">Explore Courses</Link>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '330px 1fr',
          gap: '1.5rem',
          minHeight: '640px',
          height: 'calc(100vh - 270px)',
          maxHeight: '780px'
        }}>
          {/* Left Column: Relevant & Active Doubt Threads */}
          <div className="glass-panel" style={{
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            borderRadius: '16px'
          }}>
            {/* Header & Filter Tabs */}
            <div style={{
              padding: '1rem 1.25rem 0.75rem',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              background: 'rgba(17, 24, 39, 0.95)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ fontSize: '1.02rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MessageSquare size={17} color="var(--primary)" /> Doubts
                </h3>
                <span className="badge badge-free" style={{ fontSize: '0.7rem' }}>
                  {filteredThreads.length} {filterTab === 'discussed' ? 'Discussed' : 'Total'}
                </span>
              </div>

              {/* Segmented Filter Control: Active Discussed vs All Enrolled */}
              <div style={{
                display: 'flex',
                background: 'rgba(0, 0, 0, 0.35)',
                padding: '3px',
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}>
                <button
                  type="button"
                  onClick={() => setFilterTab('discussed')}
                  style={{
                    flex: 1,
                    padding: '6px 8px',
                    borderRadius: '8px',
                    border: 'none',
                    background: filterTab === 'discussed' ? 'var(--primary)' : 'transparent',
                    color: filterTab === 'discussed' ? '#fff' : 'var(--text-muted)',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '5px'
                  }}
                >
                  <span>Active Discussed</span>
                  {discussedCount > 0 && (
                    <span style={{
                      fontSize: '0.68rem',
                      background: filterTab === 'discussed' ? 'rgba(255,255,255,0.25)' : 'rgba(99,102,241,0.2)',
                      padding: '1px 5px',
                      borderRadius: '8px'
                    }}>
                      {discussedCount}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setFilterTab('all')}
                  style={{
                    flex: 1,
                    padding: '6px 8px',
                    borderRadius: '8px',
                    border: 'none',
                    background: filterTab === 'all' ? 'var(--primary)' : 'transparent',
                    color: filterTab === 'all' ? '#fff' : 'var(--text-muted)',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '5px'
                  }}
                >
                  <span>All Courses</span>
                  <span style={{
                    fontSize: '0.68rem',
                    background: filterTab === 'all' ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.08)',
                    padding: '1px 5px',
                    borderRadius: '8px'
                  }}>
                    {threads.length}
                  </span>
                </button>
              </div>

              {/* Search Course or Doubt Input */}
              <div style={{ position: 'relative' }}>
                <Search size={14} color="var(--text-dim)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Search course or message..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px 10px 6px 30px',
                    fontSize: '0.78rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    background: 'rgba(0, 0, 0, 0.25)',
                    color: '#fff',
                    outline: 'none'
                  }}
                />
                {searchQuery && (
                  <X 
                    size={13} 
                    color="var(--text-dim)" 
                    onClick={() => setSearchQuery('')}
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer' }} 
                  />
                )}
              </div>
            </div>

            {/* Thread List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
              {filteredThreads.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
                  <MessageSquare size={32} color="var(--text-dim)" style={{ marginBottom: '8px' }} />
                  <p style={{ fontSize: '0.84rem', color: '#fff', fontWeight: 600, margin: 0 }}>
                    {filterTab === 'discussed' ? 'No active discussions' : 'No matching courses'}
                  </p>
                  <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {filterTab === 'discussed' 
                      ? 'Switch to "All Courses" tab above to start a new doubt discussion with your tutor.' 
                      : 'Try clearing your search query.'}
                  </p>
                  {filterTab === 'discussed' && (
                    <button
                      type="button"
                      onClick={() => setFilterTab('all')}
                      className="btn btn-secondary btn-sm"
                      style={{ marginTop: '8px', fontSize: '0.76rem', padding: '4px 10px' }}
                    >
                      Browse All Courses
                    </button>
                  )}
                </div>
              ) : (
                filteredThreads.map((thread) => {
                  const isSelected = selectedThread && selectedThread.courseId === thread.courseId;
                  return (
                    <div
                      key={thread.courseId}
                      onClick={() => handleSelectThread(thread)}
                      style={{
                        padding: '12px',
                        borderRadius: '12px',
                        marginBottom: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        background: isSelected 
                          ? 'rgba(99, 102, 241, 0.2)' 
                          : thread.unreadCount > 0 
                            ? 'rgba(99, 102, 241, 0.08)' 
                            : 'transparent',
                        border: isSelected 
                          ? '1px solid var(--primary)' 
                          : thread.unreadCount > 0 
                            ? '1px solid rgba(99, 102, 241, 0.35)' 
                            : '1px solid transparent',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) e.currentTarget.style.background = thread.unreadCount > 0 ? 'rgba(99, 102, 241, 0.08)' : 'transparent';
                      }}
                    >
                    <div style={{ position: 'relative' }}>
                      <img 
                        src={thread.tutor?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} 
                        alt={thread.tutor?.name}
                        style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }}
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
                          border: '2px solid #0d131f'
                        }}>
                          {thread.unreadCount}
                        </span>
                      )}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {thread.tutor?.name || 'Course Tutor'}
                        </span>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>
                          {new Date(thread.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      </div>

                      {/* Course Identifier Tag */}
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        background: 'rgba(6, 182, 212, 0.12)',
                        border: '1px solid rgba(6, 182, 212, 0.25)',
                        borderRadius: '6px',
                        padding: '2px 8px',
                        marginBottom: '5px',
                        maxWidth: '100%'
                      }}>
                        <BookOpen size={11} color="var(--secondary)" />
                        <span style={{
                          fontSize: '0.73rem',
                          color: 'var(--secondary)',
                          fontWeight: 600,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {thread.courseName}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.78rem', color: thread.unreadCount > 0 ? '#ffffff' : 'var(--text-dim)', fontWeight: thread.unreadCount > 0 ? 600 : 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {thread.lastMessage?.hasAttachments && '📎 '}
                        {thread.lastMessage?.text || 'No messages yet. Click to chat'}
                      </div>
                    </div>
                  </div>
                );
              }))}
            </div>
          </div>

          {/* Right Column: Interactive Chat Conversation */}
          <div className="glass-panel" style={{
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            borderRadius: '16px',
            background: '#0d131f'
          }}>
            {selectedThread ? (
              <>
                {/* Active Chat Header */}
                <div style={{
                  padding: '1rem 1.25rem',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                  background: 'rgba(17, 24, 39, 0.95)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ position: 'relative' }}>
                      <img 
                        src={selectedThread.tutor?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} 
                        alt={selectedThread.tutor?.name}
                        style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }}
                      />
                      <span style={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--success)',
                        border: '2px solid #0d131f'
                      }} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>
                          {selectedThread.tutor?.name || 'Course Tutor'}
                        </h4>
                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          padding: '1px 8px',
                          borderRadius: '10px',
                          background: 'rgba(99, 102, 241, 0.2)',
                          color: '#a5b4fc',
                          border: '1px solid rgba(99, 102, 241, 0.4)'
                        }}>
                          👨‍🏫 Tutor
                        </span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {selectedThread.tutor?.email || 'Instructor at EduSphere'}
                      </div>
                    </div>
                  </div>

                  {/* Course Context Pill */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    background: 'rgba(6, 182, 212, 0.1)',
                    border: '1px solid rgba(6, 182, 212, 0.3)',
                    borderRadius: '10px',
                    padding: '6px 14px'
                  }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '8px',
                      background: 'rgba(6, 182, 212, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--secondary)'
                    }}>
                      <BookOpen size={15} />
                    </div>
                    <div>
                      <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                        Course Subject
                      </span>
                      <strong style={{ fontSize: '0.85rem', color: '#ffffff' }}>
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
                  background: 'radial-gradient(ellipse at bottom, rgba(99, 102, 241, 0.04) 0%, rgba(13, 19, 31, 0) 70%)'
                }}>
                  {messages.length === 0 ? (
                    <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 1rem', maxWidth: '360px' }}>
                      <MessageSquare size={40} color="var(--text-dim)" style={{ marginBottom: '12px' }} />
                      <h4 style={{ color: '#fff', fontSize: '1rem' }}>No doubts asked yet</h4>
                      <p style={{ fontSize: '0.84rem', marginTop: '6px' }}>
                        Type your question below or attach a code screenshot to get clarification from {selectedThread.tutor?.name || 'your instructor'}.
                      </p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isStudentSender = msg.sender?._id === user?._id || msg.sender === user?._id;
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
                            alignItems: isStudentSender ? 'flex-end' : 'flex-start',
                            maxWidth: '75%',
                            alignSelf: isStudentSender ? 'flex-end' : 'flex-start'
                          }}
                        >
                          <div style={{
                            padding: '10px 14px',
                            borderRadius: isStudentSender ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                            background: isStudentSender 
                              ? 'linear-gradient(135deg, #4f46e5, #6366f1)' 
                              : 'rgba(31, 41, 55, 0.85)',
                            color: '#fff',
                            border: isStudentSender ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
                            wordBreak: 'break-word',
                            fontSize: '0.92rem',
                            lineHeight: '1.45'
                          }}>
                            {!isStudentSender && (
                              <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--secondary)', marginBottom: '4px' }}>
                                👨‍🏫 {selectedThread.tutor?.name || 'Tutor'}
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
                                        onClick={() => setPreviewImage(att.fileUrl)}
                                        style={{
                                          borderRadius: '8px',
                                          overflow: 'hidden',
                                          cursor: 'pointer',
                                          border: '1px solid rgba(255, 255, 255, 0.15)',
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
                                          borderRadius: '8px',
                                          background: 'rgba(0, 0, 0, 0.25)',
                                          border: '1px solid rgba(255, 255, 255, 0.1)',
                                          color: '#fff',
                                          textDecoration: 'none',
                                          fontSize: '0.82rem'
                                        }}
                                      >
                                        <FileText size={18} color="var(--secondary)" />
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600 }}>
                                            {att.fileName}
                                          </div>
                                          <div style={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.6)' }}>
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
                            color: 'var(--text-dim)',
                            marginTop: '4px',
                            padding: '0 4px'
                          }}>
                            <span>{formattedTime}</span>
                            {isStudentSender && (
                              <CheckCheck 
                                size={14} 
                                color={msg.read ? 'var(--secondary)' : 'var(--text-dim)'} 
                              />
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={chatScrollRef} />
                </div>

                {/* Pending Attachment Preview */}
                {pendingAttachment && (
                  <div style={{
                    padding: '8px 16px',
                    background: 'rgba(99, 102, 241, 0.12)',
                    borderTop: '1px solid rgba(99, 102, 241, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.82rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff' }}>
                      {pendingAttachment.fileType === 'image' ? (
                        <ImageIcon size={16} color="var(--primary)" />
                      ) : (
                        <FileText size={16} color="var(--secondary)" />
                      )}
                      <span style={{ fontWeight: 600 }}>Attachment Ready: {pendingAttachment.fileName}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPendingAttachment(null)}
                      style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}

                {/* Input Bar */}
                <form 
                  onSubmit={handleSendMessage}
                  style={{
                    padding: '1rem',
                    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                    background: 'rgba(17, 24, 39, 0.98)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                >
                  <input 
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingAttachment}
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: 'var(--secondary)',
                      borderRadius: '10px',
                      padding: '10px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease'
                    }}
                    title="Attach Code Screenshot or Document"
                  >
                    <Paperclip size={18} />
                  </button>

                  <input 
                    type="text"
                    className="form-control"
                    placeholder={`Ask doubt to ${selectedThread.tutor?.name || 'Tutor'}...`}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    style={{ borderRadius: '10px', padding: '10px 14px' }}
                  />

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={sending || (!inputText.trim() && !pendingAttachment)}
                    style={{
                      borderRadius: '10px',
                      padding: '10px 18px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Send size={16} />
                    <span>Send</span>
                  </button>
                </form>
              </>
            ) : (
              <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-muted)' }}>
                Select a course on the left to start clarifying doubts.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Image Lightbox Modal */}
      {previewImage && (
        <div 
          onClick={() => setPreviewImage(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            zIndex: 3000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
          }}
        >
          <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
            <img 
              src={previewImage} 
              alt="Doubt attachment preview" 
              style={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: '12px', objectFit: 'contain' }}
            />
            <button
              onClick={() => setPreviewImage(null)}
              style={{
                position: 'absolute',
                top: '-40px',
                right: '0',
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                color: '#fff',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
