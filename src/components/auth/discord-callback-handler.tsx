import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * This component handles Discord OAuth callbacks that come without the hash
 * (e.g., /auth/discord/callback?code=... instead of /#/auth/discord/callback?code=...)
 * It redirects to the hash route so React Router can handle it properly
 */
export function DiscordCallbackHandler() {
  const navigate = useNavigate();

  useEffect(() => {
    // Get the code and error from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');

    // Redirect to the hash route with the same parameters
    if (code || error) {
      const params = new URLSearchParams();
      if (code) params.set('code', code);
      if (error) params.set('error', error);

      const hashPath = `/#/auth/discord/callback?${params.toString()}`;
      window.location.href = hashPath;
    } else {
      // No code or error, just redirect to home
      navigate('/');
    }
  }, [navigate]);

  return null;
}
