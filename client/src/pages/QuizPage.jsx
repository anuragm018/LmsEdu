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
    return <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)' }}>Loading Quiz...</div>;
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
          <h2 style={{ fontSize: '1.5rem', color: 'var(--color-primary)', fontWeight: 700 }}>{quiz.title}</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Total Marks: {quiz.total_marks}</p>
        </div>

        {/* Live Timer */}
        {!result && (
          <div style={{
            background: 'var(--color-primary-subtle)',
            border: '1px solid var(--color-primary)',
            padding: '10px 18px',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--color-primary)',
            fontWeight: 800,
            fontSize: '1.3rem'
          }}>
            <Clock size={22} color="var(--color-primary)" /> {formatTimer(timeLeft)}
          </div>
        )}
      </div>

      {/* Result Display Screen */}
      {result && (
        <div className="glass-panel" style={{
          padding: '2.5rem',
          textAlign: 'center',
          marginBottom: '2rem',
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-sm)',
          border: result.passed ? '2px solid var(--color-accent)' : '2px solid var(--color-danger)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            {result.passed ? (
              <CheckCircle size={64} color="var(--color-accent)" />
            ) : (
              <XCircle size={64} color="var(--color-danger)" />
            )}
          </div>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: result.passed ? 'var(--color-primary)' : 'var(--color-danger)', fontWeight: 700 }}>
            {result.passed ? 'Congratulations! Quiz Passed' : 'Quiz Attempt Completed'}
          </h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
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
          <div key={q._id} className="glass-panel" style={{ padding: '1.5rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', gap: '10px', color: 'var(--color-text)' }}>
              <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>Q{idx + 1}.</span> {q.question}
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
                      background: isSelected ? 'var(--color-primary-subtle)' : 'var(--color-surface)',
                      border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                      color: isSelected ? 'var(--color-primary)' : 'var(--color-text)',
                      cursor: result ? 'default' : 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: isSelected ? 700 : 400,
                      transition: 'all 0.15s ease'
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
