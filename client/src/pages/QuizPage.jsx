import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { Clock, HelpCircle, CheckCircle, XCircle, Award, ArrowLeft } from 'lucide-react';

export const QuizPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0); // seconds
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchQuiz();
  }, [id]);

  useEffect(() => {
    if (timeLeft <= 0 || result) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitQuiz(); // Auto submit on timer expiry
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, result]);

  const fetchQuiz = async () => {
    try {
      const res = await API.get(`/quizzes/${id}`);
      setQuiz(res.data);
      setTimeLeft((res.data.duration || 10) * 60);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId, optionIndex) => {
    if (result) return; // Locked after submission
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: optionIndex
    });
  };

  const handleSubmitQuiz = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const formattedAnswers = Object.entries(selectedAnswers).map(([qId, optIdx]) => ({
        question_id: qId,
        selected_option_index: optIdx
      }));

      const res = await API.post(`/quizzes/${id}/submit`, { answers: formattedAnswers });
      setResult(res.data);
    } catch (err) {
      console.error(err);
      alert('Error submitting quiz attempt');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading || !quiz) {
    return <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Loading Quiz...</div>;
  }

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto' }} className="animate-fade-in">
      {/* Quiz Top Header */}
      <div className="glass-panel" style={{
        padding: '1.5rem 2rem',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div>
          <button onClick={() => navigate(-1)} className="btn btn-sm btn-secondary" style={{ marginBottom: '8px' }}>
            <ArrowLeft size={14} /> Back
          </button>
          <h2 style={{ fontSize: '1.5rem' }}>{quiz.title}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Total Marks: {quiz.total_marks}</p>
        </div>

        {/* Live Timer */}
        {!result && (
          <div style={{
            background: 'rgba(245, 158, 11, 0.15)',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            padding: '10px 18px',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#f59e0b',
            fontWeight: 800,
            fontSize: '1.3rem'
          }}>
            <Clock size={22} /> {formatTimer(timeLeft)}
          </div>
        )}
      </div>

      {/* Result Display Screen */}
      {result && (
        <div className="glass-panel" style={{
          padding: '2.5rem',
          textAlign: 'center',
          marginBottom: '2rem',
          border: result.passed ? '2px solid rgba(16, 185, 129, 0.4)' : '2px solid rgba(239, 68, 68, 0.4)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            {result.passed ? (
              <CheckCircle size={64} color="var(--success)" />
            ) : (
              <XCircle size={64} color="var(--danger)" />
            )}
          </div>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
            {result.passed ? 'Congratulations! Quiz Passed' : 'Quiz Attempt Completed'}
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            You scored <strong>{result.score}</strong> out of <strong>{result.totalPossible}</strong> ({result.percentage}%)
          </p>
          <button onClick={() => navigate(-1)} className="btn btn-primary">
            Return to Classroom
          </button>
        </div>
      )}

      {/* Questions List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {quiz.questions?.map((q, idx) => (
          <div key={q._id} className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', gap: '10px' }}>
              <span style={{ color: 'var(--primary)' }}>Q{idx + 1}.</span> {q.question}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {q.options?.map((opt, optIdx) => {
                const isSelected = selectedAnswers[q._id] === optIdx;
                return (
                  <button 
                    key={optIdx}
                    onClick={() => handleSelectOption(q._id, optIdx)}
                    style={{
                      textAlign: 'left',
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-sm)',
                      background: isSelected ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                      border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                      color: isSelected ? '#ffffff' : 'var(--text-muted)',
                      cursor: result ? 'default' : 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: isSelected ? 600 : 400
                    }}
                  >
                    {opt.option_text}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Submit Button */}
      {!result && (
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <button 
            onClick={handleSubmitQuiz} 
            className="btn btn-primary btn-lg"
            style={{ width: '100%', padding: '14px' }}
            disabled={submitting}
          >
            {submitting ? 'Evaluating Submission...' : 'Submit Quiz Attempt'}
          </button>
        </div>
      )}
    </div>
  );
};
