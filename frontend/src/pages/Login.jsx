import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch } from '../utils/api';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const { access_token } = await apiFetch('/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      
      const user = await apiFetch('/me', { method: 'GET' }, access_token);
      login(access_token, user);
      
      const username = user.email.split('@')[0];
      navigate(`/${username}`);
    } catch (err) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-140px)] items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <Card className="w-full max-w-md p-8 space-y-8 bg-white border border-slate-200">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
            Sign in to your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                id="email-address"
                name="email"
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-slate-300 placeholder-slate-500 text-slate-900 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-slate-300 placeholder-slate-500 text-slate-900 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4">
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </div>
          
          <div className="text-center text-sm">
            <span className="text-slate-600">Don't have an account? </span>
            <Link to="/signup" className="font-medium text-primary-600 hover:text-primary-500">
              Sign up
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
