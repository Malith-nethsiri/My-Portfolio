import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch } from '../utils/api';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const processAuth = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        navigate('/login');
        return;
      }
      
      try {
        const user = await apiFetch('/me', { method: 'GET' }, token);
        login(token, user);
        
        const username = user.email.split('@')[0];
        navigate(`/${username}`);
      } catch (err) {
        console.error('Failed to login via callback', err);
        navigate('/login');
      }
    };
    
    processAuth();
  }, [searchParams, navigate, login]);

  return (
    <div className="flex min-h-[calc(100vh-140px)] items-center justify-center">
      <div className="text-slate-500">Completing sign in...</div>
    </div>
  );
}
