// Discord OAuth Configuration
// The client ID and secret are handled by the backend to keep them secure

import { API_BASE_URL } from './api';

export const DISCORD_OAUTH_SCOPES = 'identify email';
export const DISCORD_OAUTH_RESPONSE_TYPE = 'code';

/**
 * Initiates Discord OAuth flow by redirecting to Discord's authorization page
 * The client ID will be fetched from the backend to keep it secure
 */
export const initiateDiscordOAuth = async (): Promise<void> => {
  try {
    // Get the Discord OAuth URL from the backend
    // This keeps the client ID and client secret secure on the backend
    const response = await fetch(`${API_BASE_URL}/api/auth/discord/authorize`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to initiate Discord OAuth');
    }

    const data = await response.json();

    if (data.data?.authorizeUrl) {
      // Redirect to Discord OAuth URL
      window.location.href = data.data.authorizeUrl;
    } else {
      throw new Error('No authorization URL received from backend');
    }
  } catch (error) {
    console.error('Discord OAuth initiation error:', error);
    throw error;
  }
};

/**
 * Handles the Discord OAuth callback by exchanging the code for a token
 */
export const handleDiscordCallback = async (
  code: string
): Promise<{ token: string; user: any }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/discord/callback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ code }),
    });

    const data = await response.json();
    console.log('Discord callback response:', { ok: response.ok, data });

    if (!response.ok) {
      throw new Error(data.errorMessage || 'Discord authentication failed');
    }

    const token = data.data?.token;
    const user = data.data?.user;
    console.log('Extracted from response - token:', !!token, 'user:', user);

    return {
      token: token || '',
      user: user || null,
    };
  } catch (error) {
    console.error('Discord callback error:', error);
    throw error;
  }
};
