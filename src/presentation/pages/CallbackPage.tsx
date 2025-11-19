import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDependencies } from '../context/DependencyContext';
import { AuthUseCase } from '../../application/useCases/AuthUseCase';
import { TokenStorage } from '../../infrastructure/storage/TokenStorage';

const CallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { checkAuth } = useAuth();
  const { authRepository } = useDependencies();
  const authUseCase = new AuthUseCase(authRepository);

  useEffect(() => {
    const token = searchParams.get('token') || searchParams.get('access_token');
    const error = searchParams.get('error');    
    const code = searchParams.get('code');

    if (error) {
      const errorMessage = searchParams.get('message') || 'Authentication failed. Please try again.';
      console.error('OAuth callback error:', error, errorMessage);
      alert(errorMessage);
      window.history.replaceState({}, '', window.location.pathname);
      navigate('/login');
      return;
    }

    if (token) {
      console.log('Received token from backend redirect');
      handleTokenCallback(token);
      return;
    }
    
    if (code) {
      console.log('Received code from callback, requesting token from backend');
      handleCodeCallback(code);
      return;
    }
    
    console.error('No token or code received from callback');
    alert('No authentication data received. Please try logging in again.');
    navigate('/login');
  }, [navigate, searchParams]);

  const handleTokenCallback = async (token: string) => {
    try {
      console.log('Processing token from backend redirect');
      
      if (!token || token.trim().length === 0) {
        throw new Error('Invalid token received');
      }
      
      TokenStorage.save(token);
      console.log('JWT token saved to localStorage as jwt_token');
      
      const savedToken = TokenStorage.get();
      if (!savedToken) {
        throw new Error('Failed to save token to localStorage');
      }
      console.log('Token successfully saved and verified');
      
      await checkAuth();
      
      window.history.replaceState({}, '', window.location.pathname);
      
      navigate('/', { replace: true });
    } catch (error: any) {
      console.error('Failed to handle token callback:', error);
      TokenStorage.remove();
      const errorMessage = error?.message || 'Failed to authenticate. Please try again.';
      alert(errorMessage);
      navigate('/login');
    }
  };

  const handleCodeCallback = async (code: string) => {
    try {
      console.log('Received code from callback, requesting token from backend');
      
      const result = await authUseCase.handleGitHubCallback(code);
      console.log('Callback result:', result);
      
      const savedToken = localStorage.getItem('jwt_token');
      if (savedToken) {
        console.log('JWT token successfully saved to localStorage');
      }
      
      if (result.token) {
        await checkAuth();
        window.history.replaceState({}, '', '/');
        navigate('/');
      }
    } catch (error: any) {
      console.error('Failed to handle code callback:', error);
      console.error('Error response:', error.response?.data);
      const errorMessage = error?.message || 'Failed to authenticate. Please try again.';
      alert(errorMessage);
      navigate('/login');
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1>hAIfu</h1>
        <p className="subtitle">Processing login...</p>
        <div style={{ marginTop: '1rem', color: 'var(--text-slate-600)' }}>
          Please wait while we complete your authentication.
        </div>
      </div>
    </div>
  );
};

export default CallbackPage;

