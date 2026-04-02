import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { Wallet } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await authService.login(email, password);
      localStorage.setItem('token', response.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <div className="glass-card" style={{ width: '400px', padding: '2.5rem' }}>
        <div className="text-center" style={{ marginBottom: '2rem' }}>
          <Wallet size={48} color="#6366f1" style={{ marginBottom: '1rem' }} />
          <h1 style={{ fontSize: '1.8rem' }}>Welcome Back</h1>
          <p className="text-secondary text-sm">Sign in to manage your wallet</p>
        </div>
        
        {error && <p style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</p>}
        
        <form onSubmit={handleLogin}>
          <div className="mt-4">
            <label className="text-sm text-secondary">Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="mt-4">
            <label className="text-sm text-secondary">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" style={{ width: '100%', marginTop: '2rem' }}>Sign In</button>
        </form>
        
        <p className="text-center text-sm text-secondary" style={{ marginTop: '1.5rem' }}>
          Don't have an account? <span onClick={() => navigate('/register')} style={{ color: '#6366f1', cursor: 'pointer' }}>Register</span>
        </p>
      </div>
    </div>
  );
};

export default Login;
