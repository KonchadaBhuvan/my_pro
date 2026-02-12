import React, { useState } from 'react';
import Login from '../components/Login';
import Register from '../components/Register';

export default function AuthPage() {
  const [mode, setMode] = useState('login'); // 'login' or 'register'

  return (
    <div className="auth-page">
      <div className="container center">
        <h1>{mode === 'login' ? 'Welcome back' : 'Create an account'}</h1>
        <p className="muted">{mode === 'login' ? 'Sign in to continue' : 'Fill the form to create your account'}</p>
      </div>

      <div className="container">
        <div style={{maxWidth:720, margin:'0 auto'}}>
          {mode === 'login' ? <Login /> : <Register />}

          <div className="center muted" style={{marginTop:12}}>
            {mode === 'login' ? (
              <>
                <span>Don't have an account?</span>
                <button className="secondary-btn" onClick={() => setMode('register')} style={{marginLeft:8}}>Create account</button>
              </>
            ) : (
              <>
                <span>Already have an account?</span>
                <button className="secondary-btn" onClick={() => setMode('login')} style={{marginLeft:8}}>Sign in</button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
