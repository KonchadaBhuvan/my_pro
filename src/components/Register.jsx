import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const { register } = useAuth();
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    (async () => {
      const res = await register({ name, email, password });
      if (!res.ok) { setError(res.error); return; }
      navigate('/');
    })();
  }

  return (
    <div className="card auth-register">
      <h3 style={{marginTop:0}}>Create account</h3>
      {error && <div className="muted">{error}</div>}

      <form onSubmit={handleSubmit}>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Name" style={{width:'100%',padding:10,borderRadius:8,border:'1px solid rgba(15,23,42,0.06)'}} />
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" style={{width:'100%',padding:10,borderRadius:8,border:'1px solid rgba(15,23,42,0.06)',marginTop:8}} />
        <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" type="password" style={{width:'100%',padding:10,borderRadius:8,border:'1px solid rgba(15,23,42,0.06)',marginTop:8}} />
        <div style={{marginTop:10}}>
          <button className="btn" type="submit">Create</button>
        </div>
      </form>
    </div>
  );
}
