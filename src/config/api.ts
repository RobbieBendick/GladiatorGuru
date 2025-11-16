// API Configuration
// In production, this will point to gladiator-guru-api.vercel.app
// In development, it will use localhost

const getApiUrl = (): string => {
  // Check for environment variable first (for build-time configuration)

  // Check if we're in development mode using Vite's built-in DEV flag
  const isDev =
    (import.meta as any).env?.DEV ||
    (import.meta as any).env?.MODE === 'development';
  console.log('isDev', isDev);

  // Also check hostname as fallback (localhost, 127.0.0.1, or local network IPs)
  const isLocalhost =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname.startsWith('192.168.') ||
      window.location.hostname.startsWith('10.') ||
      window.location.hostname.startsWith('172.'));

  // If in development mode or localhost, use localhost API
  if (isDev || isLocalhost) {
    return 'http://localhost:8080';
  }

  // Production: use the Vercel API URL
  return 'https://gladiator-guru-api.vercel.app';
};

export const API_BASE_URL = getApiUrl();

// Helper function to make API calls
export const apiCall = async (
  endpoint: string,
  options?: RequestInit
): Promise<Response> => {
  // Ensure endpoint starts with / and base URL doesn't end with /
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${cleanEndpoint}`;

  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    credentials: 'include', // Include cookies for authentication
  });
};
