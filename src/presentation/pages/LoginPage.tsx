import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDependencies } from '../context/DependencyContext';
import { AuthUseCase } from '../../application/useCases/AuthUseCase';
import LoginAIAgent from '../components/LoginAIAgent';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, checkAuth } = useAuth();
  const { authRepository } = useDependencies();
  const authUseCase = new AuthUseCase(authRepository);
  
  const [loading, setLoading] = useState(false);
  const [aiAgentLoading, setAiAgentLoading] = useState(false);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  useEffect(() => {
    // Apply dark mode to body
    document.documentElement.classList.add('dark');
    document.body.classList.add('dark');
    
    return () => {
      // Remove dark mode when leaving login page
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    };
  }, []);

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
        <div className="login-headline">
          <p className="main-title">Deploy AI, Instantly.</p>
          <p className="subtitle">Connect your GitHub repo and let our AI agent handle the rest on AWS.</p>
        </div>
        <div className="login-button-container">
          {!loading ? (
            <button
              onClick={handleLogin}
              disabled={loading}
              className="github-login-btn"
            >
              <svg className="github-icon" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <title>GitHub</title>
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"></path>
              </svg>
              <span className="btn-text">Continue with GitHub</span>
            </button>
          ) : (
            <button
              disabled
              className="github-login-btn-loading"
            >
              <svg className="spinner" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" fill="currentColor"></path>
              </svg>
              <span className="btn-text">Authenticating...</span>
            </button>
          )}
        </div>
        <a className="login-help-link" href="#" style={{ color: 'rgba(156, 163, 175, 1)' }}>Need Help?</a>
      </div>
      <LoginAIAgent />
    </div>
  );
};

export default LoginPage;

