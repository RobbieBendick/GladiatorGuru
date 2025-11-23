import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Link,
  alpha,
  Divider,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { ROUTE_PATHS } from '../../schemas/route-paths';
import { setAuthToken } from '../../config/auth';
import { API_BASE_URL } from '../../config/api';
import { initiateDiscordOAuth } from '../../config/discord-oauth';
import { useUser } from '../../contexts/UserContext';

const LoginPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius * 3,
  backgroundColor:
    theme.palette.mode === 'light'
      ? theme.palette.background.paper
      : alpha(theme.palette.background.default, 0.5),
}));

const LoginTitle = styled(Typography)(({ theme }) => ({
  fontSize: '2.5rem',
  fontWeight: 700,
  marginBottom: theme.spacing(2),
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
}));

const DiscordButton = styled(Button)(() => ({
  backgroundColor: '#5865F2',
  color: '#FFFFFF',
  '&:hover': {
    backgroundColor: '#4752C4',
  },
}));

export function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDiscordLoading, setIsDiscordLoading] = useState(false);
  const navigate = useNavigate();
  const { refreshUser } = useUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.errorMessage || 'Login failed');
      }

      // Store token
      if (data.data?.token) {
        setAuthToken(data.data.token);
        // Refresh user context
        await refreshUser();
      }

      // Redirect based on role
      if (data.data?.user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate(ROUTE_PATHS.home);
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDiscordLogin = async () => {
    setError('');
    setIsDiscordLoading(true);
    try {
      await initiateDiscordOAuth();
      // The redirect will happen, so we don't need to do anything else here
    } catch (err: any) {
      setError(
        err.message || 'Failed to initiate Discord login. Please try again.'
      );
      setIsDiscordLoading(false);
    }
  };

  return (
    <Container maxWidth='sm' sx={{ py: 8 }}>
      <LoginPaper elevation={3}>
        <LoginTitle variant='h1'>Login</LoginTitle>
        <Typography variant='body2' color='text.secondary' sx={{ mb: 4 }}>
          Enter your credentials to access your account
        </Typography>

        <Box component='form' onSubmit={handleSubmit} sx={{ mt: 3 }}>
          {error && (
            <Typography color='error' sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          <TextField
            fullWidth
            label='Username'
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            margin='normal'
            autoComplete='username'
          />

          <TextField
            fullWidth
            label='Password'
            type='password'
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            margin='normal'
            autoComplete='current-password'
          />

          <Button
            type='submit'
            fullWidth
            variant='contained'
            sx={{ mt: 3, mb: 2, py: 1.5 }}
            disabled={isLoading || isDiscordLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>

          <Box sx={{ display: 'flex', alignItems: 'center', my: 2 }}>
            <Divider sx={{ flexGrow: 1 }} />
            <Typography variant='body2' sx={{ px: 2, color: 'text.secondary' }}>
              OR
            </Typography>
            <Divider sx={{ flexGrow: 1 }} />
          </Box>

          <DiscordButton
            fullWidth
            variant='contained'
            startIcon={
              <img src='/discord.png' alt='Discord' style={{ height: 24 }} />
            }
            onClick={handleDiscordLogin}
            disabled={isLoading || isDiscordLoading}
            sx={{ mb: 2 }}
          >
            {isDiscordLoading ? 'Connecting...' : 'Login with Discord'}
          </DiscordButton>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Link
              component={RouterLink}
              to={ROUTE_PATHS.signup}
              variant='body2'
            >
              Don't have an account? Sign up
            </Link>
          </Box>
        </Box>
      </LoginPaper>
    </Container>
  );
}
