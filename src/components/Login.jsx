import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    const res = await login({ email, password });
    if (!res.ok) {
      setError(res.error);
      return;
    }
    navigate('/');
  }

  return (
    <div className="card auth-login">
      <h3 style={{marginTop:0}}>Sign in</h3>
      {error && <div className="muted">{error}</div>}
      <form onSubmit={handleSubmit}>
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" style={{width:'100%',padding:10,borderRadius:8,border:'1px solid rgba(15,23,42,0.06)'}} />
        <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" type="password" style={{width:'100%',padding:10,borderRadius:8,border:'1px solid rgba(15,23,42,0.06)',marginTop:8}} />
        <div style={{marginTop:10,display:'flex',gap:8}}>
          <button className="btn" type="submit">Sign in</button>
          <button type="button" className="secondary-btn">Forgot?</button>
        </div>
      </form>
    </div>
  );
}
