import React, { useEffect, useState } from 'react';

const API = import.meta.env.VITE_API_URL || '';

export default function Dashboard() {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedAttempt, setSelectedAttempt] = useState(null);

  const fetchAttempts = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/api/quiz/attempts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || 'Failed to load attempts');
        setLoading(false);
        return;
      }
      setAttempts(data.attempts || []);
      setLoading(false);
    } catch (err) {
      setError('Network error');
      setLoading(false);
    }
  };

  useEffect(() => { fetchAttempts(); }, []);

  const viewAttempt = async (id) => {
    setSelectedAttempt(null);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/api/quiz/attempts/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || 'Failed to load attempt');
        return;
      }
      setSelectedAttempt(data.attempt);
    } catch (err) {
      setError('Network error');
    }
  };

  return (
    <div className="container generate-page">
      <div className="card">
        <h2>Your Quiz Attempts</h2>
        {error && <div style={{ color: '#c92a2a' }}>{error}</div>}

        <div style={{ display: 'flex', gap: 20 }}>
          <div style={{ flex: '0 0 320px' }}>
            <button className="secondary-btn" onClick={fetchAttempts} style={{ marginBottom: 12 }}>Refresh</button>
            {loading ? (
              <div>Loading...</div>
            ) : (
              attempts.length === 0 ? <div className="muted">No attempts yet</div> : (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {attempts.map(a => (
                    <li key={a._id} style={{ marginBottom: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                        <div>
                          <div><strong>Score:</strong> {a.score} / {a.numQuestions || a.numQuestions}</div>
                          <div className="muted small">{new Date(a.createdAt).toLocaleString()}</div>
                        </div>
                        <div>
                          <button className="btn" onClick={() => viewAttempt(a._id)}>View</button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )
            )}
          </div>

          <div style={{ flex: 1 }}>
            {selectedAttempt ? (
              <div>
                <h3>Attempt Details</h3>
                <div><strong>Score:</strong> {selectedAttempt.score} / {selectedAttempt.numQuestions}</div>
                <div className="muted small">{new Date(selectedAttempt.createdAt).toLocaleString()}</div>
                <div style={{ marginTop: 12 }}>
                  {selectedAttempt.quiz.map((q, idx) => (
                    <div key={idx} style={{ marginBottom: 16, padding: 12, border: '1px solid #eee', borderRadius: 6 }}>
                      <div style={{ marginBottom: 8 }}><strong>{idx + 1}. {q.question}</strong></div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {q.options.map((opt, oi) => {
                          const isCorrect = oi === q.correctAnswer;
                          const userAns = selectedAttempt.userAnswers && selectedAttempt.userAnswers[idx];
                          const isUser = userAns === oi;
                          return (
                            <div key={oi} style={{ padding: 8, borderRadius: 4, backgroundColor: isCorrect ? '#e6ffed' : (isUser ? '#fff7e6' : '#fff') }}>
                              <strong>{String.fromCharCode(65 + oi)}.</strong> {opt}
                              {isCorrect && <span style={{ marginLeft: 8, color: '#2e7d32' }}> (Correct)</span>}
                              {isUser && <span style={{ marginLeft: 8, color: '#ff6b00' }}> (Your answer)</span>}
                            </div>
                          );
                        })}
                      </div>
                      {q.explanation && <div style={{ marginTop: 8 }} className="muted small">Explanation: {q.explanation}</div>}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="muted">Select an attempt to view details and solutions.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
