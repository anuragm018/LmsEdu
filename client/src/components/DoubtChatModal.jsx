import React, { useState, useEffect, useRef } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  X, 
  Send, 
  Paperclip, 
  Image as ImageIcon, 
  FileText, 
  Download, 
  CheckCheck, 
  Clock, 
  User, 
  ExternalLink,
  MessageSquare
} from 'lucide-react';

export const DoubtChatModal = ({ isOpen, onClose, course, initialStudent = null }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [pendingAttachment, setPendingAttachment] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const courseId = course?._id;
  // If current user is student, studentId is current user. Otherwise tutor is chatting with student.
  const studentId = user?.role === 'student' ? user?._id : (initialStudent?._id || initialStudent);
  const tutorId = course?.tutor?._id || course?.tutor;

  useEffect(() => {
    if (isOpen && courseId && studentId) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 4000); // Polling every 4 seconds for fresh replies
      return () => clearInterval(interval);
    }
  }, [isOpen, courseId, studentId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      const res = await API.get(`/chat/messages/${courseId}/${studentId}`);
      setMessages(res.data);
    } catch (err) {
      console.error('Failed to fetch chat messages:', err);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Max 25MB check
    if (file.size > 25 * 1024 * 1024) {
      alert('File size exceeds 25MB limit. Please choose a smaller file.');
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
    if ((!inputText.trim() && !pendingAttachment) || sending) return;

    setSending(true);
    try {
      const payload = {
        courseId,
        studentId,
        tutorId,
        message: inputText.trim(),
        attachments: pendingAttachment ? [pendingAttachment] : []
      };

      const res = await API.post('/chat/send', payload);
      setMessages(prev => [...prev, res.data]);
      setInputText('');
      setPendingAttachment(null);
    } catch (err) {
      console.error('Failed to send message:', err);
      alert(err.response?.data?.message || 'Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  const otherUser = user?.role === 'student' 
    ? (course?.tutor || { name: 'Course Instructor' }) 
    : (initialStudent || { name: 'Student' });

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '1rem',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div 
        style={{
          width: '640px',
          maxWidth: '100%',
          height: '700px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-sm)',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        {/* Chat Header */}
        <div style={{
          padding: '1rem 1.25rem',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--color-surface)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ position: 'relative' }}>
              <img 
                src={otherUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} 
                alt={otherUser?.name}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid var(--color-primary)'
                }}
              />
              <span style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-accent)',
                border: '2px solid var(--color-surface)'
              }} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '1rem', margin: 0, fontWeight: 700, color: 'var(--color-primary)' }}>
                  {otherUser?.name}
                </h3>
                <span style={{
                  fontSize: '0.7rem',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--color-primary-subtle)',
                  color: 'var(--color-primary)',
                  fontWeight: 600
                }}>
                  {user?.role === 'student' ? '👨‍🏫 Course Tutor' : '🎓 Enrolled Student'}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                Course: <strong style={{ color: 'var(--color-text)' }}>{course?.name}</strong>
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-text-muted)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Close Doubt Chat"
          >
            <X size={20} />
          </button>
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
          {messages.length === 0 ? (
            <div style={{
              margin: 'auto',
              textAlign: 'center',
              color: 'var(--color-text-muted)',
              maxWidth: '360px',
              padding: '2rem 1rem'
            }}>
              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--color-primary-subtle)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem'
              }}>
                <MessageSquare size={26} />
              </div>
              <h4 style={{ color: 'var(--color-primary)', marginBottom: '0.4rem' }}>
                {user?.role === 'student' ? 'Ask your tutor any doubt' : 'No messages yet'}
              </h4>
              <p style={{ fontSize: '0.85rem' }}>
                {user?.role === 'student' 
                  ? 'Have a question or stuck on a concept? Type your doubt below and attach code screenshots or study documents.'
                  : 'The student has not started a conversation yet.'}
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.sender?._id === user?._id || msg.sender === user?._id;
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
                    alignItems: isMe ? 'flex-end' : 'flex-start',
                    maxWidth: '82%',
                    alignSelf: isMe ? 'flex-end' : 'flex-start'
                  }}
                >
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    background: isMe ? 'var(--color-primary)' : 'var(--color-surface)',
                    color: isMe ? 'var(--color-text-on-dark)' : 'var(--color-text)',
                    border: '1px solid var(--color-border)',
                    wordBreak: 'break-word',
                    fontSize: '0.9rem',
                    lineHeight: '1.45'
                  }}>
                    {/* Sender name for other party */}
                    {!isMe && (
                      <div style={{
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        color: 'var(--color-primary)',
                        marginBottom: '4px'
                      }}>
                        {msg.sender?.name || 'User'}
                      </div>
                    )}

                    {/* Text content */}
                    {msg.message && (
                      <div style={{ whiteSpace: 'pre-wrap' }}>{msg.message}</div>
                    )}

                    {/* Attachments */}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div style={{ marginTop: msg.message ? '8px' : '0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {msg.attachments.map((att, idx) => (
                          <div key={idx}>
                            {att.fileType === 'image' ? (
                              <div 
                                onClick={() => setPreviewImage(att.fileUrl)}
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
                                  style={{
                                    width: '100%',
                                    maxHeight: '220px',
                                    objectFit: 'cover',
                                    display: 'block'
                                  }}
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
                                  background: 'var(--color-primary-subtle)',
                                  border: '1px solid var(--color-border)',
                                  color: 'var(--color-primary)',
                                  textDecoration: 'none',
                                  fontSize: '0.82rem'
                                }}
                              >
                                <FileText size={18} />
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

                  {/* Timestamp & Status */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.72rem',
                    color: 'var(--color-text-subtle)',
                    marginTop: '4px',
                    padding: '0 4px'
                  }}>
                    <span>{formattedTime}</span>
                    {isMe && (
                      <CheckCheck 
                        size={14} 
                        color={msg.read ? 'var(--color-accent)' : 'var(--color-text-subtle)'} 
                        title={msg.read ? 'Read' : 'Delivered'}
                      />
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Pending Attachment Preview */}
        {pendingAttachment && (
          <div style={{
            padding: '8px 16px',
            background: 'var(--color-primary-subtle)',
            borderTop: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.82rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary)' }}>
              {pendingAttachment.fileType === 'image' ? (
                <ImageIcon size={16} />
              ) : (
                <FileText size={16} />
              )}
              <span style={{ fontWeight: 600 }}>Attached: {pendingAttachment.fileName}</span>
            </div>
            <button
              type="button"
              onClick={() => setPendingAttachment(null)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-danger)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
              title="Remove Attachment"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Input Bar */}
        <div style={{
          padding: '1rem',
          borderTop: '1px solid var(--color-border)',
          background: 'var(--color-surface)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          {/* Hidden File Input */}
          <input 
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            style={{ display: 'none' }}
            accept="image/*,.pdf,.doc,.docx,.txt,.zip"
          />

          {/* Attachment Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingAttachment || sending}
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              color: pendingAttachment ? 'var(--color-primary)' : 'var(--color-text-muted)',
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: uploadingAttachment ? 'not-allowed' : 'pointer',
              flexShrink: 0,
              transition: 'all 0.15s ease'
            }}
            title="Attach image or document (PDF, DOCX)"
          >
            {uploadingAttachment ? (
              <div style={{ width: '16px', height: '16px', border: '2px solid var(--color-primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            ) : (
              <Paperclip size={18} />
            )}
          </button>

          {/* Message Text Input */}
          <input 
            type="text"
            className="form-control"
            placeholder={user?.role === 'student' ? 'Type your doubt or question to the tutor...' : 'Type your reply to clarify doubt...'}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={sending}
            style={{
              flex: 1,
              borderRadius: 'var(--radius-sm)',
              padding: '10px 14px'
            }}
          />

          {/* Send Button: Green Primary CTA */}
          <button
            type="button"
            onClick={handleSendMessage}
            disabled={(!inputText.trim() && !pendingAttachment) || sending || uploadingAttachment}
            className="btn btn-primary"
            style={{
              width: '42px',
              height: '40px',
              padding: 0,
              flexShrink: 0
            }}
            title="Send Message (Enter)"
          >
            <Send size={17} />
          </button>
        </div>

        {/* Image Lightbox Modal */}
        {previewImage && (
          <div 
            onClick={() => setPreviewImage(null)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 3000,
              padding: '2rem'
            }}
          >
            <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
              <img 
                src={previewImage} 
                alt="Enlarged doubt screenshot" 
                style={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: '8px', objectFit: 'contain' }}
              />
              <button
                onClick={() => setPreviewImage(null)}
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
    </div>
  );
};
