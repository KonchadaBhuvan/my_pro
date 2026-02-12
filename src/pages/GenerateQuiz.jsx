import React, { useState } from 'react';

const API = import.meta.env.VITE_API_URL || '';

export default function GenerateQuiz({ setPage }) {
  const options = [
    { id: 'gate', label: 'GATE (Engineering)', desc: 'Technical questions for engineering grads' },
    { id: 'aptitude', label: 'Aptitude', desc: 'Numerical & mental ability problems' },
    { id: 'communication', label: 'Communication', desc: 'Verbal & soft-skills practice' },
    { id: 'programming', label: 'Programming', desc: 'Coding concepts & MCQs' },
    { id: 'reasoning', label: 'Logical Reasoning', desc: 'Puzzles and logical problems' },
    { id: 'quant', label: 'Quantitative Ability', desc: 'Maths, algebra & geometry' },
  ];

  const [selected, setSelected] = useState([]);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});

  const toggle = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleGenerate = async () => {
    if (selected.length === 0) {
      alert('Please select at least one study type.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API}/api/quiz/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          topics: selected.map(s => options.find(o => o.id === s).label),
          numQuestions: 10,
          difficulty: 'medium'
        })
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        setError(data.error || 'Failed to generate quiz');
        setLoading(false);
        return;
      }

      setQuiz(data.quiz);
      setCurrentQuestion(0);
      setUserAnswers({});
      setLoading(false);
    } catch (err) {
      console.error('Error generating quiz:', err);
      setError('Network error: ' + err.message);
      setLoading(false);
    }
  };

  const handleAnswerSelect = (optionIndex) => {
    setUserAnswers((prev) => ({ ...prev, [currentQuestion]: optionIndex }));
  };

  const handleNextQuestion = () => {
    if (currentQuestion < quiz.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const handleSubmitQuiz = () => {
    (async () => {
      let score = 0;
      quiz.forEach((q, idx) => {
        if (userAnswers[idx] === q.correctAnswer) {
          score++;
        }
      });

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Not authenticated');
          return;
        }

        const res = await fetch(`${API}/api/quiz/submit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ topics: selected.map(s => options.find(o => o.id === s).label), quiz, userAnswers, score })
        });

        const data = await res.json();
        if (!res.ok || !data.ok) {
          setError(data.error || 'Failed to submit quiz');
          return;
        }

        // navigate to dashboard to show attempts
        setQuiz(null);
        setSelected([]);
        setUserAnswers({});
        setPage && setPage('dashboard');
      } catch (err) {
        console.error('Submit error', err);
        setError('Network error: ' + err.message);
      }
    })();
  };

  // Display quiz questions
  if (quiz && quiz.length > 0) {
    const currentQ = quiz[currentQuestion];
    return (
      <div className="container generate-page">
        <div className="card">
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ margin: 0 }}>Quiz: Question {currentQuestion + 1} of {quiz.length}</h2>
              <button className="secondary-btn" onClick={() => { setQuiz(null); setSelected([]); setUserAnswers({}); }}>Exit Quiz</button>
            </div>
            <div style={{ width: '100%', backgroundColor: '#e0e0e0', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${((currentQuestion + 1) / quiz.length) * 100}%`, backgroundColor: '#4CAF50', height: '100%', transition: 'width 0.3s' }}></div>
            </div>
          </div>

          <div className="mt">
            <h3>{currentQ.question}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.5rem' }}>
              {currentQ.options.map((option, idx) => (
                <button
                  key={idx}
                  className={`option-btn ${userAnswers[currentQuestion] === idx ? 'selected' : ''}`}
                  onClick={() => handleAnswerSelect(idx)}
                  style={{
                    padding: '0.75rem 1rem',
                    border: `2px solid ${userAnswers[currentQuestion] === idx ? '#4CAF50' : '#ddd'}`,
                    borderRadius: '4px',
                    backgroundColor: userAnswers[currentQuestion] === idx ? '#f1f8f4' : '#fff',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s'
                  }}
                >
                  <strong>{String.fromCharCode(65 + idx)}.</strong> {option}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
            <button className="secondary-btn" onClick={handlePreviousQuestion} disabled={currentQuestion === 0}>
              Previous
            </button>
            <span className="muted" style={{ alignSelf: 'center' }}>
              Answered: {Object.keys(userAnswers).length} / {quiz.length}
            </span>
            {currentQuestion === quiz.length - 1 ? (
              <button className="btn" onClick={handleSubmitQuiz} style={{ backgroundColor: '#4CAF50' }}>Submit Quiz</button>
            ) : (
              <button className="btn" onClick={handleNextQuestion}>Next</button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Display selection screen
  return (
    <div className="container generate-page">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ margin: 0 }}>Create a Custom Quiz</h1>
            <p className="muted small" style={{ marginTop: 6 }}>Select one or more topics and click <strong>Generate Quiz</strong>.</p>
          </div>
          <div className="mt" style={{ marginLeft: 'auto' }}>
            <button className="secondary-btn" onClick={() => setSelected([])}>Clear selection</button>
          </div>
        </div>

        {error && (
          <div style={{ padding: '0.75rem 1rem', marginTop: '1rem', backgroundColor: '#ffebee', border: '1px solid #ff6b6b', borderRadius: '4px', color: '#c92a2a' }}>
            {error}
          </div>
        )}

        <div className="generate-grid mt">
          <div className="left">
            <div className="study-grid">
              {options.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className={`study-option ${selected.includes(opt.id) ? 'selected' : ''}`}
                  onClick={() => toggle(opt.id)}
                  aria-pressed={selected.includes(opt.id)}
                  disabled={loading}
                >
                  <div className="icon" aria-hidden>{opt.label.charAt(0)}</div>
                  <div className="meta">
                    <div className="label">{opt.label}</div>
                    <div className="desc small muted">{opt.desc}</div>
                  </div>
                  <div className="check" aria-hidden>{selected.includes(opt.id) ? '✓' : ''}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="right">
            <div className="card generate-panel">
              <h3 style={{ marginTop: 0 }}>Selected Topics</h3>
              <p className="muted small">We will mix questions from chosen topics. You can update selections anytime.</p>

              <div className="chips mt">
                {selected.length === 0 ? (
                  <div className="muted small">No topics selected</div>
                ) : (
                  selected.map((s) => (
                    <span key={s} className="chip">{options.find(o => o.id === s).label}</span>
                  ))
                )}
              </div>

              <div style={{ marginTop: 18, display: 'flex', gap: 10 }}>
                <button 
                  className="btn generate-cta" 
                  onClick={handleGenerate}
                  disabled={loading}
                  style={{ opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
                >
                  {loading ? 'Generating...' : 'Generate Quiz'}
                </button>
                <button className="secondary-btn" onClick={() => setSelected([])} disabled={loading}>Clear</button>
              </div>

              <div className="mt small muted">
                <strong>Tip:</strong> For balanced practice, choose 2–3 topics.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
