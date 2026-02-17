import React, { useState, useEffect } from 'react';

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
  const [difficulty, setDifficulty] = useState('medium');
  const [numQuestions, setNumQuestions] = useState(10);

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);

  // ================= Toggle Topic =================
  const toggle = (id) => {
    setSelected(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : [...prev, id]
    );
  };

  // ================= Generate Quiz =================
  const handleGenerate = async () => {
    if (selected.length === 0) {
      alert('Please select at least one topic.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`${API}/api/quiz/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          topics: selected.map(s => options.find(o => o.id === s).label),
          difficulty,
          numQuestions
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
      setTimeLeft(numQuestions * 30); // 30 sec per question
      setLoading(false);

    } catch (err) {
      setError('Network error');
      setLoading(false);
    }
  };

  // ================= Timer =================
  useEffect(() => {
    if (!quiz || timeLeft === null) return;

    if (timeLeft <= 0) {
      handleSubmitQuiz();
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, quiz]);

  // ================= Answer Select =================
  const handleAnswerSelect = (optionIndex) => {
    setUserAnswers(prev => ({
      ...prev,
      [currentQuestion]: optionIndex
    }));
  };

  // ================= Submit Quiz =================
  const handleSubmitQuiz = async () => {
    let score = 0;

    quiz.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctAnswer) {
        score++;
      }
    });

    try {
      const token = localStorage.getItem('token');

      const res = await fetch(`${API}/api/quiz/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          topics: selected.map(s => options.find(o => o.id === s).label),
          quiz,
          userAnswers,
          score,
          difficulty,
          numQuestions
        })
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setError(data.error || 'Submit failed');
        return;
      }

      setQuiz(null);
      setSelected([]);
      setUserAnswers({});
      setPage && setPage('dashboard');

    } catch (err) {
      setError('Network error');
    }
  };

  // ================= QUIZ VIEW =================
  if (quiz && quiz.length > 0) {
    const currentQ = quiz[currentQuestion];

    return (
      <div className="container generate-page">
        <div className="card">

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <h2>Question {currentQuestion + 1} / {quiz.length}</h2>
            <div style={{ color: 'red', fontWeight: 'bold' }}>
              Time Left: {timeLeft}s
            </div>
          </div>

          <h3>{currentQ.question}</h3>

          {currentQ.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleAnswerSelect(idx)}
              style={{
                display: 'block',
                marginTop: 10,
                padding: 10,
                border: userAnswers[currentQuestion] === idx
                  ? '2px solid green'
                  : '1px solid #ccc'
              }}
            >
              {String.fromCharCode(65 + idx)}. {option}
            </button>
          ))}

          <div style={{ marginTop: 20 }}>
            {currentQuestion > 0 &&
              <button onClick={() => setCurrentQuestion(prev => prev - 1)}>
                Previous
              </button>
            }

            {currentQuestion < quiz.length - 1 ? (
              <button onClick={() => setCurrentQuestion(prev => prev + 1)}>
                Next
              </button>
            ) : (
              <button onClick={handleSubmitQuiz}>
                Submit Quiz
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ================= SELECTION VIEW =================
  return (
    <div className="container generate-page">
      <div className="card">
        <h1 style={{color:"red"}}>NEW VERSION TEST</h1>


        <h2>Create Custom Quiz</h2>

        {options.map(opt => (
          <button
            key={opt.id}
            onClick={() => toggle(opt.id)}
            style={{
              display: 'block',
              marginTop: 10,
              backgroundColor: selected.includes(opt.id) ? '#e6ffed' : '#fff'
            }}
          >
            {opt.label}
          </button>
        ))}

        <div style={{ marginTop: 20 }}>
          <label>Difficulty:</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          <label style={{ marginTop: 10, display: 'block' }}>
            Number of Questions:
          </label>
          <input
            type="number"
            min="5"
            max="30"
            value={numQuestions}
            onChange={(e) => setNumQuestions(Number(e.target.value))}
          />
        </div>

        <button
          onClick={handleGenerate}
          style={{ marginTop: 20 }}
          disabled={loading}
        >
          {loading ? 'Generating...' : 'Generate Quiz'}
        </button>

        {error && <div style={{ color: 'red' }}>{error}</div>}

      </div>
    </div>
  );
}
