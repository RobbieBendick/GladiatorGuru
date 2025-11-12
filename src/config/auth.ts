const TOKEN_KEY = 'auth_token';

export const setAuthToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const removeAuthToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

export const getUserRole = (): string | null => {
  const token = getAuthToken();
  if (!token) return null;

  try {
    // Decode JWT token (simple base64 decode, not verification)
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role || null;
  } catch (error) {
    return null;
  }
};

export const isAdmin = (): boolean => {
  return getUserRole() === 'admin';
};
