'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Gagal login');
      }

      if (data.user.role === 'admin') {
        router.push('/admin/dashboard');
      } else if (data.user.role === 'penjual') {
        router.push('/penjual/dashboard');
      } else {
        router.push('/pembeli/dashboard');
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-overlay"></div>
      <div className="auth-card">
        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-subtitle">Sign in to your account to continue</p>
        
        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="auth-form">
          <div className="form-group">
            <div className="floating-label">
              <input 
                type="email" 
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder=" "
                required 
              />
              <label htmlFor="email">Email</label>
            </div>
          </div>
          
          <div className="form-group">
            <div className="floating-label">
              <input 
                type="password" 
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder=" "
                required 
              />
              <label htmlFor="password">Password</label>
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={isLoading}
            className="auth-btn auth-btn-primary"
            style={{ opacity: isLoading ? 0.7 : 1 }}
          >
            {isLoading ? 'Loading...' : 'Login'}
          </button>
        </form>

        <div className="auth-link">
          Belum punya akun? <Link href="/register">Register disini</Link>
        </div>
      </div>
    </div>
  );
}
