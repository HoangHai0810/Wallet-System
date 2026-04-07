import React, { useState } from 'react';
import { authService } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Mail, Lock, Phone, ArrowRight } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    phoneNumber: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await authService.register(formData);
      localStorage.setItem('token', res.data.token);
      navigate('/');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container flex items-center justify-center" style={{ minHeight: '80vh' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '450px', padding: '3rem' }}>
        <div className="text-center" style={{ marginBottom: '2.5rem' }}>
          <div style={{ 
            width: '64px', height: '64px', borderRadius: '16px', 
            background: 'rgba(99, 102, 241, 0.1)', display: 'inline-flex', 
            alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' 
          }}>
            <UserPlus size={32} color="#818cf8" />
          </div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Create Account</h2>
          <p className="text-secondary text-sm">Join our secure wallet system today</p>
        </div>

        {error && (
          <div style={{ 
            padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', 
            border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px',
            color: '#ef4444', fontSize: '0.875rem', marginBottom: '1.5rem', textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group">
            <label className="text-secondary text-xs" style={{ marginBottom: '0.5rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                type="email"
                placeholder="name@example.com"
                style={{ paddingLeft: '3rem' }}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="text-secondary text-xs" style={{ marginBottom: '0.5rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                type="password"
                placeholder="••••••••"
                style={{ paddingLeft: '3rem' }}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="text-secondary text-xs" style={{ marginBottom: '0.5rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Phone Number
            </label>
            <div style={{ position: 'relative' }}>
              <Phone size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                type="text"
                placeholder="09xx xxx xxx"
                style={{ paddingLeft: '3rem' }}
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="flex items-center justify-center gap-4" 
            style={{ width: '100%', padding: '1rem', marginTop: '1rem' }}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : (
              <>Sign Up <ArrowRight size={18} /></>
            )}
          </button>
        </form>

        <p className="text-center text-secondary text-sm" style={{ marginTop: '2rem' }}>
          Already have an account? <Link to="/login" style={{ color: '#818cf8', fontWeight: 600, textDecoration: 'none' }}>Log In</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
