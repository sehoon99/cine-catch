import { apiClient, API_ENDPOINTS } from './api';

export type LoginRequest = {
  email: string;
  password: string;
};

export type SignupRequest = {
  email: string;
  password: string;
  nickname: string;
};

export type TokenResponse = {
  grantType: string;
  accessToken: string;
  accessTokenExpiresIn: number;
};

export const authService = {
  async signup(payload: SignupRequest): Promise<string> {
    return apiClient.post<string>(API_ENDPOINTS.MEMBERS_SIGNUP, payload);
  },

  async login(payload: LoginRequest): Promise<TokenResponse> {
    return apiClient.post<TokenResponse>(API_ENDPOINTS.MEMBERS_LOGIN, payload);
  },
};
