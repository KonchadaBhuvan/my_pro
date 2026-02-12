import React, { useState } from 'react';
import AuthPage from './pages/AuthPage';
import GenerateQuiz from './pages/GenerateQuiz';
import Dashboard from './pages/Dashboard';
import { useAuth } from './context/useAuth';

export default function App() {
  const { user, logout } = useAuth();
  const [page, setPage] = useState('generate');

  if (!user) return <AuthPage />;

  return (
    <div>
      <nav style={{ padding: '1rem', borderBottom: '1px solid #ddd', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setPage('generate')}>Generate Quiz</button>
          <button onClick={() => setPage('dashboard')}>Dashboard</button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="muted">Signed in as {user.email || user.name}</span>
          <button className="secondary-btn" onClick={logout}>Logout</button>
        </div>
      </nav>

      {page === 'generate' && <GenerateQuiz setPage={setPage} />}
      {page === 'dashboard' && <Dashboard />}
    </div>
  );
}

