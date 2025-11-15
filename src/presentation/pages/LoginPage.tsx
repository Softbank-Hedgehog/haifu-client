import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDependencies } from '../context/DependencyContext';
import { AuthUseCase } from '../../application/useCases/AuthUseCase';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, checkAuth } = useAuth();
  const { authRepository } = useDependencies();
  const authUseCase = new AuthUseCase(authRepository);
  
  const [loading, setLoading] = useState(false);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
      return;
    }

    // 에러 파라미터가 있으면 사용자에게 알림
    if (error) {
      const errorMessage = searchParams.get('message') || 'Authentication failed. Please try again.';
      alert(errorMessage);
      window.history.replaceState({}, '', window.location.pathname);
      return;
    }

    // code 파라미터가 있으면 콜백 처리
    if (code) {
      handleCallback(code);
    }
  }, [code, error, isAuthenticated, navigate, searchParams]);

  const handleLogin = async () => {
    try {
      setLoading(true);
      await authUseCase.getGitHubLoginUrl().then((url) => {
        window.location.href = url;
      });
    } catch (error) {
      console.error('Failed to initiate login:', error);
      alert('Failed to start login process. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCallback = async (code: string) => {
    try {
      const result = await authUseCase.handleGitHubCallback(code);
      if (result.user) {
        await checkAuth();
        navigate('/');
      }
    } catch (error: any) {
      console.error('Failed to handle GitHub callback:', error);
      const errorMessage = error?.message || 'Failed to authenticate. Please try again.';
      alert(errorMessage);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1>hAIfu</h1>
        <p className="subtitle">AI-powered deployment platform</p>
        <button
          onClick={handleLogin}
          disabled={loading}
          className="github-login-btn"
        >
          {loading ? 'Connecting...' : 'Continue with GitHub'}
        </button>
      </div>
    </div>
  );
};

export default LoginPage;

