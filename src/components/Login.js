import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../index.css';  // Import CSS for styling

function Login({ setToken }) {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await axios.post('/api/admin/login', credentials);
      localStorage.setItem('adminToken', response.data.token);
      setToken(response.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div className="modern-login">
      <div className="login-background">
        <div className="login-card-modern">
          <div className="logo-circle">
            V
          </div>
          <h1 className="login-title">Vyntex Admin</h1>
          <p className="login-subtitle">Welcome back</p>
          
          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-group-modern">
              <input
                type="text"
                className="input-modern"
                id="username"
                placeholder=" "
                value={credentials.username}
                onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                autoFocus
                required
              />
              <label htmlFor="username" className="input-label">Username</label>
              <div className="input-highlight"></div>
            </div>

            <div className="input-group-modern">
              <input
                type="password"
                className="input-modern"
                id="password"
                placeholder=" "
                value={credentials.password}
                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                required
              />
              <label htmlFor="password" className="input-label">Password</label>
              <div className="input-highlight"></div>
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? (
                <>
                  <div className="spinner"></div>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="login-footer">
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;

