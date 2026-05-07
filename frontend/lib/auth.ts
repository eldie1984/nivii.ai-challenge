interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
}

interface AuthError {
  success: boolean;
  error: string;
  message: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class AuthAPI {
  private baseURL: string;

  constructor() {
    this.baseURL = `${API_BASE_URL}/api/auth`;
  }

  async register(email: string, password: string, firstName?: string, lastName?: string): Promise<AuthResponse> {
    const response = await fetch(`${this.baseURL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        firstName: firstName || '',
        lastName: lastName || ''
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }

    return data;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${this.baseURL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    return data;
  }

  async validateToken(token: string): Promise<{ valid: boolean; user?: User }> {
    try {
      const response = await fetch(`${this.baseURL}/validate`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        return { valid: true, user: data.user };
      }

      return { valid: false };
    } catch (error) {
      return { valid: false };
    }
  }
}

export const authAPI = new AuthAPI();
export type { User, AuthResponse, AuthError };
