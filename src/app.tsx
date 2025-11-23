import { PaletteMode, ThemeProvider, useMediaQuery } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import { grey } from '@mui/material/colors';
import { createContext, useEffect, useMemo, useState } from 'react';
import { BindRoutes } from './components/routes/bind-routes';
import { HashRouter } from 'react-router-dom';
import { UserProvider } from './contexts/UserContext';

const getDesignTokens = (mode: PaletteMode) => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          // palette values for light mode
          primary: {
            main: '#0ea47a',
          },
          divider: '#0ea47a',
          background: {
            default: '#fff',
            paper: '#fff',
            secondary: '#ededed',
          },
          text: {
            primary: grey[900],
            secondary: grey[800],
          },
        }
      : {
          // palette values for dark mode
          primary: {
            main: '#0ea47a',
          },
          divider: '#0ea47a',
          background: {
            default: '#1a1c1e',
            paper: '#1a1c1e',
            secondary: '#161719',
          },
          text: {
            primary: '#fff',
            secondary: grey[500],
          },
        }),
  },
});

export const ColorModeContext = createContext({
  toggleColorMode: () => {},
  mode: 'dark' as PaletteMode,
});

function App() {
  // Handle Discord OAuth callback immediately (synchronously) before React renders
  // Discord redirects to /auth/discord/callback but we need /#/auth/discord/callback
  if (
    typeof window !== 'undefined' &&
    window.location.pathname === '/auth/discord/callback'
  ) {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const error = params.get('error');
    const state = params.get('state');

    if (code || error) {
      // Redirect to hash route, preserving all query parameters
      const hashParams = new URLSearchParams();
      if (code) hashParams.set('code', code);
      if (error) hashParams.set('error', error);
      if (state) hashParams.set('state', state);

      // Use replace to avoid adding to history and redirect immediately
      window.location.replace(
        `/#/auth/discord/callback?${hashParams.toString()}`
      );
      // Return null to prevent rendering while redirecting
      return null;
    }
  }

  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  // Retrieve the color mode from localStorage if available, otherwise use prefersDarkMode
  const storedColorMode = localStorage.getItem('colorMode');
  const initialMode =
    storedColorMode === 'dark' || storedColorMode === 'light'
      ? storedColorMode
      : prefersDarkMode
      ? 'dark'
      : 'light';

  const [mode, setMode] = useState<PaletteMode>(initialMode);
  const colorMode = useMemo(
    () => ({
      mode,
      toggleColorMode: () => {
        const newMode = mode === 'light' ? 'dark' : 'light';
        setMode(newMode);
        localStorage.setItem('colorMode', newMode);
      },
    }),
    [mode]
  );

  const theme = useMemo(() => createTheme(getDesignTokens(mode)), [mode]);

  useEffect(() => {
    document.body.style.backgroundColor = theme.palette.background.default;
  }, [theme]);

  return (
    <main
      style={{
        maxWidth: '1280px',
        margin: '0 auto',
        paddingTop: '50px',
        minHeight: '90vh',
        backgroundColor: theme.palette.background.default,
      }}
    >
      <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={theme}>
          <UserProvider>
            <HashRouter>
              <BindRoutes />
            </HashRouter>
          </UserProvider>
        </ThemeProvider>
      </ColorModeContext.Provider>
    </main>
  );
}

export default App;
