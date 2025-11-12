// API Configuration
// In production, this will point to gladiator-guru-api.vercel.app
// In development, it will use localhost

const getApiUrl = (): string => {
  // Check for environment variable first (for build-time configuration)
  const envApiUrl = (import.meta as any).env?.VITE_API_URL;
  if (envApiUrl) {
    // Remove trailing slash if present
    return envApiUrl.replace(/\/+$/, '');
  }

  // Production: use the Vercel API URL
  const isProd =
    (import.meta as any).env?.PROD ||
    (import.meta as any).env?.MODE === 'production' ||
    (typeof window !== 'undefined' && window.location.hostname !== 'localhost');
  if (isProd) {
    return 'https://gladiator-guru-api.vercel.app';
  }

  // Development: use localhost
  return 'http://localhost:8080';
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
