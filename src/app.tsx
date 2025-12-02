import {
  PaletteMode,
  ThemeProvider,
  useMediaQuery,
  alpha,
} from '@mui/material';
import { createTheme } from '@mui/material/styles';
import { grey } from '@mui/material/colors';
import { createContext, useEffect, useMemo, useState } from 'react';
import { BindRoutes } from './components/routes/bind-routes';
import { HashRouter } from 'react-router-dom';
import { UserProvider } from './contexts/UserContext';

const getDesignTokens = (mode: PaletteMode) => {
  const textPrimary = mode === 'light' ? grey[900] : '#fff';

  return {
    palette: {
      mode,
      ...(mode === 'light'
        ? {
            // palette values for light mode
            primary: {
              main: '#0ea47a',
            },
            divider: alpha(textPrimary, 0.3),
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
            divider: alpha(textPrimary, 0.3),
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
  };
};

export const ColorModeContext = createContext({
  toggleColorMode: () => {},
  mode: 'dark' as PaletteMode,
});

function App() {
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

  // Handle Discord OAuth callback when it comes without hash
  // Discord redirects to /auth/discord/callback but we need /#/auth/discord/callback
  useEffect(() => {
    if (window.location.pathname === '/auth/discord/callback') {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');

      if (code) {
        // Redirect to hash route, preserving all query parameters (code, state, etc.)
        const queryString = window.location.search;
        window.location.href = `/#/auth/discord/callback${queryString}`;
      }
    }
  }, []);

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
