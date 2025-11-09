// API Configuration
// In production, this will point to api.gladiatorguru.com
// In development, it will use localhost

const getApiUrl = (): string => {
  // Check for environment variable first (for build-time configuration)
  const envApiUrl = (import.meta as any).env?.VITE_API_URL;
  if (envApiUrl) {
    return envApiUrl;
  }

  // Production: use the API subdomain
  const isProd =
    (import.meta as any).env?.PROD ||
    (import.meta as any).env?.MODE === 'production';
  if (isProd) {
    return 'https://api.gladiatorguru.com';
  }

  // Development: use localhost
  return 'http://localhost:3000';
};

export const API_BASE_URL = getApiUrl();

// Helper function to make API calls
export const apiCall = async (
  endpoint: string,
  options?: RequestInit
): Promise<Response> => {
  const url = `${API_BASE_URL}${
    endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  }`;

  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    credentials: 'include', // Include cookies for authentication
  });
};
