const TOKEN_KEY = 'jwt_token';

export class TokenStorage {
  static save(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  static get(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  static remove(): void {
    localStorage.removeItem(TOKEN_KEY);
  }

  static hasToken(): boolean {
    return this.get() !== null;
  }
}

