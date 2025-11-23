import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  CircularProgress,
  Container,
  Typography,
  Paper,
  alpha,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { setAuthToken } from '../../config/auth';
import { handleDiscordCallback } from '../../config/discord-oauth';
import { ROUTE_PATHS } from '../../schemas/route-paths';
import { useUser } from '../../contexts/UserContext';

const CallbackPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius * 3,
  backgroundColor:
    theme.palette.mode === 'light'
      ? theme.palette.background.paper
      : alpha(theme.palette.background.default, 0.5),
  textAlign: 'center',
}));

export function DiscordCallback() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshUser } = useUser();
  const [error, setError] = useState<string | null>(null);
  const processedCodeRef = useRef<string | null>(null);
  const hasNavigatedRef = useRef(false);

  console.log('DiscordCallback component rendered');
  console.log('URL search params:', Object.fromEntries(searchParams.entries()));

  const code = searchParams.get('code');
  const errorParam = searchParams.get('error');

  useEffect(() => {
    // Don't process if we've already navigated
    if (hasNavigatedRef.current) {
      return;
    }

    // Don't process if we've already processed this code
    if (code && processedCodeRef.current === code) {
      console.log('Code already processed, skipping...');
      return;
    }

    // Don't process if there's no code or error
    if (!code && !errorParam) {
      return;
    }

    const processCallback = async () => {
      // Mark this code as being processed
      if (code) {
        processedCodeRef.current = code;
      }

      try {
        console.log('Processing callback - code:', code);
        console.log('Processing callback - error:', errorParam);

        // Check if Discord returned an error
        if (errorParam) {
          throw new Error(
            errorParam === 'access_denied'
              ? 'Discord authorization was cancelled'
              : `Discord authorization failed: ${errorParam}`
          );
        }

        // Check if we have a code
        if (!code) {
          throw new Error('No authorization code received from Discord');
        }

        // Exchange code for token
        console.log(
          'Calling handleDiscordCallback with code:',
          code.substring(0, 10) + '...'
        );
        const { token, user } = await handleDiscordCallback(code);
        console.log(
          'Discord callback - token received:',
          !!token,
          'token length:',
          token?.length,
          'user:',
          user
        );

        // Store token
        if (token) {
          console.log('Storing token in localStorage...');
          setAuthToken(token);
          // Verify it was stored
          const storedToken = localStorage.getItem('auth_token');
          console.log(
            'Token stored verification:',
            !!storedToken,
            'length:',
            storedToken?.length
          );
          // Refresh user context and wait for it to complete
          console.log('Refreshing user context...');
          await refreshUser();
          console.log('User context refreshed');
          // Small delay to ensure state updates
          await new Promise(resolve => setTimeout(resolve, 100));
        } else {
          console.error('No token received from Discord callback');
        }

        // Clear URL parameters to prevent re-processing
        setSearchParams({});

        // Mark as navigated
        hasNavigatedRef.current = true;

        // Redirect based on role
        if (user?.role === 'admin') {
          navigate('/admin', { replace: true });
        } else {
          navigate(ROUTE_PATHS.home, { replace: true });
        }
      } catch (err: any) {
        console.error('Discord callback error:', err);
        setError(err.message || 'Failed to complete Discord authentication');

        // Clear URL parameters
        setSearchParams({});
        hasNavigatedRef.current = true;

        // Redirect to login after a short delay
        setTimeout(() => {
          navigate(ROUTE_PATHS.login, { replace: true });
        }, 3000);
      }
    };

    processCallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, errorParam]);

  // Don't render if we've already navigated
  if (hasNavigatedRef.current) {
    return null;
  }

  if (error) {
    return (
      <Container maxWidth='sm' sx={{ py: 8 }}>
        <CallbackPaper elevation={3}>
          <Typography variant='h5' color='error' sx={{ mb: 2 }}>
            Authentication Error
          </Typography>
          <Typography variant='body1' color='text.secondary' sx={{ mb: 2 }}>
            {error}
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            Redirecting to login page...
          </Typography>
        </CallbackPaper>
      </Container>
    );
  }

  return (
    <Container maxWidth='sm' sx={{ py: 8 }}>
      <CallbackPaper elevation={3}>
        <CircularProgress sx={{ mb: 2 }} />
        <Typography variant='h6' sx={{ mb: 1 }}>
          Completing Discord authentication...
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          Please wait while we sign you in
        </Typography>
      </CallbackPaper>
    </Container>
  );
}
