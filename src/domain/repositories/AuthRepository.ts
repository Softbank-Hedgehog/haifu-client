import type { User } from '../entities/User';

export interface AuthRepository {
  getGitHubLoginUrl(): Promise<string>;
  handleGitHubCallback(code: string): Promise<{ token: string; user: User }>;
  getCurrentUser(token: string): Promise<User>;
  logout(): void;
}

