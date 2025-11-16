import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useDependencies } from './DependencyContext';
import { AuthUseCase } from '../../application/useCases/AuthUseCase';
import { TokenStorage } from '../../infrastructure/storage/TokenStorage';
import type { User } from '../../domain/entities/User';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { authRepository } = useDependencies();
  const authUseCase = new AuthUseCase(authRepository);

  const checkAuth = async () => {
    const token = TokenStorage.get();
    if (!token) {
      setLoading(false);
      setUser(null);
      return;
    }

    try {
      setLoading(true);
      const currentUser = await authUseCase.getCurrentUser(token);
      setUser(currentUser);
    } catch (error: any) {
      console.error('Failed to get current user:', error);
      TokenStorage.remove();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async () => {
    try {
      const loginUrl = await authUseCase.getGitHubLoginUrl();
      window.location.href = loginUrl;
    } catch (error) {
      console.error('Failed to get login URL:', error);
      throw error;
    }
  };

  const logout = () => {
    authUseCase.logout();
    setUser(null);
    // Router 밖에서 사용할 수 없으므로 window.location 사용
    window.location.href = '/login';
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

