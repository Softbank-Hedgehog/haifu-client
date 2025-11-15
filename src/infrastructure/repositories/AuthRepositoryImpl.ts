import type { AuthRepository } from '../../domain/repositories/AuthRepository';
import type { User } from '../../domain/entities/User';
import { apiClient } from '../api/ApiClient';
import { TokenStorage } from '../storage/TokenStorage';
import type {
  GitHubLoginResponse,
  GitHubCallbackRequest,
  GitHubCallbackResponse,
  AuthMeResponse,
} from '../../application/dto/AuthDTO';

export class AuthRepositoryImpl implements AuthRepository {
  async getGitHubLoginUrl(): Promise<string> {
    try {
      const response = await apiClient.get<GitHubLoginResponse | { url?: string; loginUrl?: string }>('/api/auth/github/login');
      // Support multiple response formats
      if (typeof response === 'string') {
        return response;
      }
      if ('loginUrl' in response && response.loginUrl) {
        return response.loginUrl;
      }
      if ('url' in response && response.url) {
        return response.url;
      }
      throw new Error('Invalid response format from login endpoint');
    } catch (error: any) {
      console.error('Failed to get GitHub login URL:', error);
      if (error.response?.data) {
        throw new Error(error.response.data.message || 'Failed to get login URL');
      }
      throw error;
    }
  }

  async handleGitHubCallback(code: string): Promise<{ token: string; user: User }> {
    try {
      const request: GitHubCallbackRequest = { code };
      const response = await apiClient.post<GitHubCallbackResponse | { access_token?: string; token?: string; jwt_token?: string; user?: User }>(
        '/api/auth/github/callback',
        request
      );

      // Support multiple response formats
      // access_token, token, jwt_token 등 다양한 형식 지원
      let jwtToken: string | null = null;
      if ('access_token' in response && response.access_token) {
        jwtToken = response.access_token;
      } else if ('token' in response && response.token) {
        jwtToken = response.token;
      } else if ('jwt_token' in response && response.jwt_token) {
        jwtToken = response.jwt_token;
      } else if (typeof response === 'string') {
        jwtToken = response;
      }
      
      const user = 'user' in response && response.user ? response.user : null;
      
      if (!jwtToken) {
        console.error('Response:', response);
        throw new Error('Token not found in response');
      }
      
      // localStorage에 jwt_token 키로 저장 (access_token이어도 jwt_token으로 저장)
      TokenStorage.save(jwtToken);
      console.log('Token saved to localStorage as jwt_token:', jwtToken.substring(0, 20) + '...');
      
      return {
        token: jwtToken,
        user: user || { id: '', name: '', email: '' },
      };
    } catch (error: any) {
      console.error('Failed to handle GitHub callback:', error);
      console.error('Error details:', error.response?.data || error.message);
      if (error.response?.data) {
        throw new Error(error.response.data.message || 'Failed to authenticate');
      }
      throw error;
    }
  }

  async getCurrentUser(_token: string): Promise<User> {
    try {
      const response = await apiClient.get<AuthMeResponse | User>('/api/auth/me');

      // Support both response formats: { user: User } or User directly
      if ('user' in response && response.user) {
        return response.user;
      }
      if ('id' in response && 'name' in response) {
        return response as User;
      }
      throw new Error('Invalid response format from me endpoint');
    } catch (error: any) {
      console.error('Failed to get current user:', error);
      if (error.response?.status === 401) {
        TokenStorage.remove();
        throw new Error('Authentication required');
      }
      if (error.response?.data) {
        throw new Error(error.response.data.message || 'Failed to get user info');
      }
      throw error;
    }
  }

  logout(): void {
    TokenStorage.remove();
  }
}

