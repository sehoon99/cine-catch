export type AuthState = {
  grantType: string;
  accessToken: string;
  accessTokenExpiresIn: number;
  email?: string;
};

const AUTH_STORAGE_KEY = 'cinecatch_auth';

export function getAuthState(): AuthState | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as AuthState;
    if (!parsed?.accessToken) {
      return null;
    }

    if (parsed.accessTokenExpiresIn && parsed.accessTokenExpiresIn <= Date.now()) {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function setAuthState(state: AuthState): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(state));
}

export function clearAuthState(): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function isAuthValid(state: AuthState | null): boolean {
  if (!state?.accessToken) {
    return false;
  }

  if (state.accessTokenExpiresIn && state.accessTokenExpiresIn <= Date.now()) {
    return false;
  }

  return true;
}

export function getAuthHeader(): string | null {
  const state = getAuthState();
  if (!state?.accessToken) {
    return null;
  }

  return `${state.grantType} ${state.accessToken}`.trim();
}
