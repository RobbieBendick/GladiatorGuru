import { PaletteMode, ThemeProvider, useMediaQuery } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import { grey } from '@mui/material/colors';
import { createContext, useEffect, useMemo, useState } from 'react';
import { BindRoutes } from './components/routes/bind-routes';
import { HashRouter } from 'react-router-dom';

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
        padding: '2rem',
        minHeight: '90vh',
        backgroundColor: theme.palette.background.default,
      }}
    >
      <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={theme}>
          <HashRouter>
            <BindRoutes />
          </HashRouter>
        </ThemeProvider>
      </ColorModeContext.Provider>
    </main>
  );
}

export default App;
