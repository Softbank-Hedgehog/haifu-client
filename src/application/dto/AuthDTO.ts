import type { User } from '../../domain/entities/User';

export interface GitHubLoginResponse {
  loginUrl: string;
}

export interface GitHubCallbackRequest {
  code: string;
}

export interface GitHubCallbackResponse {
  access_token: string;
  user: User;
}

export interface AuthMeResponse {
  user: User;
}

