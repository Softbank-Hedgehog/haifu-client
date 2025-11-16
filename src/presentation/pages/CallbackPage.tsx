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
    // 1. 토큰 파라미터 확인 (백엔드가 RedirectResponse로 전달)
    const token = searchParams.get('token') || searchParams.get('access_token');
    
    // 2. 에러 파라미터 확인
    const error = searchParams.get('error');
    
    // 3. code 파라미터 확인 (백엔드 수정 전까지 대비용, 또는 GitHub가 직접 프론트엔드로 리다이렉트하는 경우)
    const code = searchParams.get('code');

    // 에러 처리
    if (error) {
      const errorMessage = searchParams.get('message') || 'Authentication failed. Please try again.';
      console.error('OAuth callback error:', error, errorMessage);
      alert(errorMessage);
      window.history.replaceState({}, '', window.location.pathname);
      navigate('/login');
      return;
    }

    // 토큰이 있으면 바로 저장 (백엔드가 RedirectResponse로 리다이렉트한 경우)
    if (token) {
      console.log('Received token from backend redirect');
      handleTokenCallback(token);
      return;
    }
    
    // code가 있으면 POST 요청으로 토큰 받기 (백엔드 수정 전까지 또는 GitHub 직접 리다이렉트)
    if (code) {
      console.log('Received code from callback, requesting token from backend');
      handleCodeCallback(code);
      return;
    }
    
    // 둘 다 없으면 로그인 페이지로 리다이렉트
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

