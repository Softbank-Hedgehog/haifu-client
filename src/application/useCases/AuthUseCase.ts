import type { User } from '../../domain/entities/User';
import type { AuthRepository } from '../../domain/repositories/AuthRepository';

export class AuthUseCase {
  private authRepository: AuthRepository;

  constructor(authRepository: AuthRepository) {
    this.authRepository = authRepository;
  }

  async getGitHubLoginUrl(): Promise<string> {
    return this.authRepository.getGitHubLoginUrl();
  }

  async handleGitHubCallback(code: string): Promise<{ token: string; user: User }> {
    return this.authRepository.handleGitHubCallback(code);
  }

  async getCurrentUser(token: string): Promise<User> {
    return this.authRepository.getCurrentUser(token);
  }

  logout(): void {
    this.authRepository.logout();
  }
}

