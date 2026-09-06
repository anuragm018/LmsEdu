import React, { useState, useRef, useEffect } from 'react';
import API from '../services/api';
import { 
  Bot, 
  Sparkles, 
  Send, 
  X, 
  MessageSquare, 
  Lightbulb, 
  Code, 
  FileText, 
  ChevronDown,
  Copy,
  Check,
  Paperclip,
  File,
  Image as ImageIcon,
  Loader2
} from 'lucide-react';

/**
 * Clean markdown formatter for AI responses (headers, bold, lists, and code blocks)
 */
const FormattedMessage = ({ text }) => {
  if (!text) return null;

  // Split by code blocks ```lang ... ```
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: text.slice(lastIndex, match.index) });
    }
    parts.push({ type: 'code', lang: match[1] || 'code', content: match[2] });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push({ type: 'text', content: text.slice(lastIndex) });
  }

  const renderInline = (str) => {
    // Replace **bold** with <strong> and `code` with <code>
    const inlineRegex = /(\*\*[^*]+\*\*|`[^`]+`)/g;
    const segments = str.split(inlineRegex);

    return segments.map((seg, i) => {
      if (seg.startsWith('**') && seg.endsWith('**')) {
        return <strong key={i} style={{ color: '#fff', fontWeight: 700 }}>{seg.slice(2, -2)}</strong>;
      }
      if (seg.startsWith('`') && seg.endsWith('`')) {
        return (
          <code key={i} style={{
            background: 'rgba(99, 102, 241, 0.25)',
            color: '#a5b4fc',
            padding: '2px 6px',
            borderRadius: '4px',
            fontSize: '0.82em',
            fontFamily: 'monospace'
          }}>
            {seg.slice(1, -1)}
          </code>
        );
      }
      return seg;
    });
  };

  return (
    <div>
      {parts.map((part, pIdx) => {
        if (part.type === 'code') {
          return (
            <div key={pIdx} style={{
              margin: '8px 0',
              background: '#070b14',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.1)',
              overflow: 'hidden'
            }}>
              <div style={{
                padding: '4px 10px',
                background: 'rgba(255,255,255,0.05)',
                fontSize: '0.7rem',
                color: 'var(--text-dim)',
                textTransform: 'uppercase',
                fontWeight: 600,
                letterSpacing: '0.05em'
              }}>
                {part.lang}
              </div>
              <pre style={{
                margin: 0,
                padding: '10px 12px',
                fontSize: '0.82rem',
                color: '#e2e8f0',
                fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                overflowX: 'auto',
                lineHeight: 1.45
              }}>
                <code>{part.content}</code>
              </pre>
            </div>
          );
        }

        // Render plain text with paragraphs and list bullet points
        const lines = part.content.split('\n');
        return (
          <div key={pIdx}>
            {lines.map((line, lIdx) => {
              const trimmed = line.trim();
              if (!trimmed) {
                return <div key={lIdx} style={{ height: '6px' }} />;
              }
              if (trimmed.startsWith('### ')) {
                return (
                  <h4 key={lIdx} style={{ fontSize: '0.95rem', fontWeight: 700, margin: '8px 0 4px', color: '#fff' }}>
                    {renderInline(trimmed.slice(4))}
                  </h4>
                );
              }
              if (trimmed.startsWith('## ')) {
                return (
                  <h3 key={lIdx} style={{ fontSize: '1.05rem', fontWeight: 700, margin: '10px 0 4px', color: '#fff' }}>
                    {renderInline(trimmed.slice(3))}
                  </h3>
                );
              }
              if (trimmed.startsWith('* ') || trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
                return (
                  <div key={lIdx} style={{ display: 'flex', gap: '6px', alignItems: 'flex-start', margin: '3px 0' }}>
                    <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>•</span>
                    <span style={{ flex: 1 }}>{renderInline(trimmed.replace(/^(\*|-|•)\s+/, ''))}</span>
                  </div>
                );
              }
              return (
                <p key={lIdx} style={{ margin: '3px 0' }}>
                  {renderInline(line)}
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};


export const AIChatbot = ({ courseName = '', lessonTitle = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Hello! I am **EduSphere AI**, your personal learning assistant.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, loading]);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      alert('File size exceeds 20MB limit. Please choose a smaller file.');
      return;
    }

    const formData = new FormData();
    formData.append('attachment', file);

    setUploadingFile(true);
    try {
      const res = await API.post('/chat/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setAttachment(res.data);
    } catch (err) {
      console.error('File upload failed:', err);
      alert(err.response?.data?.message || 'Failed to upload document or image.');
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSend = async (textToSend) => {
    const prompt = textToSend || inputMessage;
    if ((!prompt.trim() && !attachment) || loading) return;

    const currentAttachment = attachment;
    const userMsg = {
      sender: 'user',
      text: prompt.trim() || (currentAttachment ? `Attached: ${currentAttachment.fileName}` : ''),
      attachment: currentAttachment,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setAttachment(null);
    setLoading(true);

    try {
      // Send message along with recent conversation history for contextual Gemini responses
      const historyPayload = messages.slice(-6).map((m) => ({
        sender: m.sender,
        text: m.text
      }));

      const res = await API.post('/ai/chat', {
        message: prompt,
        courseName,
        lessonTitle,
        history: historyPayload,
        attachment: currentAttachment
      });

      const aiMsg = {
        sender: 'ai',
        text: res.data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('[AIChatbot Error]:', err);
      const errMsg = err.response?.data?.message || err.message || 'Connection error';
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: `🤖 Sorry, I had trouble connecting to the AI engine (${errMsg}). Please make sure your backend server is running.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button: Ask AI */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          height: '56px',
          padding: '0 20px',
          borderRadius: '28px',
          background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
          color: '#ffffff',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          boxShadow: '0 8px 24px rgba(99, 102, 241, 0.45)',
          cursor: 'pointer',
          zIndex: 1500,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontWeight: 700,
          fontSize: '0.92rem',
          letterSpacing: '0.01em',
          outline: 'none',
          transition: 'all 0.25s ease'
        }}
        title="EduSphere AI Doubt Assistant"
      >
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {isOpen ? <X size={20} color="#ffffff" /> : <Bot size={20} color="#ffffff" />}
        </div>
        <span>{isOpen ? 'Close AI' : 'Ask AI'}</span>
      </button>

      {/* Chat Window Popup */}
      {isOpen && (
        <div
          className="glass-panel"
          style={{
            position: 'fixed',
            bottom: '96px',
            right: '24px',
            width: '380px',
            maxWidth: 'calc(100vw - 32px)',
            height: '520px',
            zIndex: 1500,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: '20px',
            background: '#0d1322'
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '12px 16px',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(6, 182, 212, 0.2))',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff'
              }}>
                <Sparkles size={18} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>EduSphere AI Assistant</h4>
                <span style={{ fontSize: '0.72rem', color: 'var(--success)', fontWeight: 600 }}>● Online • Doubt Solver</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <ChevronDown size={20} />
            </button>
          </div>

          {/* Messages Body */}
          <div
            style={{
              flex: 1,
              padding: '12px 16px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%'
                }}
              >
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: msg.sender === 'user' ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                    background: msg.sender === 'user' ? 'linear-gradient(135deg, var(--primary), var(--accent))' : 'rgba(255, 255, 255, 0.06)',
                    border: msg.sender === 'user' ? 'none' : '1px solid var(--border-color)',
                    color: '#ffffff',
                    fontSize: '0.86rem',
                    lineHeight: '1.45'
                  }}
                >
                  {msg.sender === 'ai' ? (
                    <FormattedMessage text={msg.text} />
                  ) : (
                    <div>
                      {msg.attachment && (
                        <div style={{ marginBottom: '6px' }}>
                          {msg.attachment.fileType === 'image' ? (
                            <img
                              src={msg.attachment.fileUrl}
                              alt={msg.attachment.fileName}
                              style={{
                                maxWidth: '100%',
                                maxHeight: '160px',
                                borderRadius: '8px',
                                objectFit: 'cover',
                                display: 'block',
                                border: '1px solid rgba(255,255,255,0.2)'
                              }}
                            />
                          ) : (
                            <div style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              background: 'rgba(255, 255, 255, 0.15)',
                              padding: '4px 8px',
                              borderRadius: '6px',
                              fontSize: '0.78rem'
                            }}>
                              <File size={14} />
                              <span style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {msg.attachment.fileName}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                      {msg.text && (
                        <div style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>
                      )}
                    </div>
                  )}
                </div>
                <div
                  style={{
                    fontSize: '0.65rem',
                    color: 'var(--text-dim)',
                    marginTop: '2px',
                    textAlign: msg.sender === 'user' ? 'right' : 'left'
                  }}
                >
                  {msg.timestamp}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ alignSelf: 'flex-start', color: 'var(--secondary)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={14} className="animate-spin" /> AI is thinking...
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Prompt Chips */}
          <div
            style={{
              padding: '6px 12px',
              display: 'flex',
              gap: '6px',
              overflowX: 'auto',
              borderTop: '1px solid var(--border-color)',
              background: 'rgba(0, 0, 0, 0.2)'
            }}
          >
            <button
              onClick={() => handleSend('Explain this lesson simply')}
              style={{
                background: 'rgba(99, 102, 241, 0.15)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                color: 'var(--primary)',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.72rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Lightbulb size={12} /> Explain Concept
            </button>

            <button
              onClick={() => handleSend('Give me a code example')}
              style={{
                background: 'rgba(6, 182, 212, 0.15)',
                border: '1px solid rgba(6, 182, 212, 0.3)',
                color: 'var(--secondary)',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.72rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Code size={12} /> Code Snippet
            </button>

            <button
              onClick={() => handleSend('Summarize key points')}
              style={{
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: 'var(--success)',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.72rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <FileText size={12} /> Summarize
            </button>
          </div>

          {/* Pending Attachment Preview */}
          {attachment && (
            <div style={{
              padding: '6px 12px',
              background: 'rgba(99, 102, 241, 0.12)',
              borderTop: '1px solid rgba(99, 102, 241, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#a5b4fc', minWidth: 0 }}>
                {attachment.fileType === 'image' ? <ImageIcon size={14} /> : <File size={14} />}
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {attachment.fileName}
                </span>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>
                  ({Math.round(attachment.fileSize / 1024)} KB)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setAttachment(null)}
                style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', display: 'flex', padding: '2px' }}
                title="Remove attachment"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            style={{ display: 'none' }}
            accept="image/*,.pdf,.txt,.js,.jsx,.ts,.tsx,.py,.java,.html,.css,.json,.md"
          />

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            style={{
              padding: '10px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: '#090d16'
            }}
          >
            {/* Attach File Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingFile || loading}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: 'var(--radius-sm)',
                color: uploadingFile ? 'var(--primary)' : 'var(--text-muted)',
                padding: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: uploadingFile || loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease'
              }}
              title="Attach screenshot, code file, or document (PDF, TXT, Images)"
            >
              {uploadingFile ? <Loader2 size={16} className="animate-spin" /> : <Paperclip size={16} />}
            </button>

            <input
              type="text"
              className="form-control"
              placeholder={attachment ? "Ask a question about this file..." : "Ask your doubt..."}
              style={{ fontSize: '0.85rem', padding: '8px 12px' }}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
            />
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              style={{ borderRadius: 'var(--radius-sm)' }}
              disabled={loading || uploadingFile || (!inputMessage.trim() && !attachment)}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
