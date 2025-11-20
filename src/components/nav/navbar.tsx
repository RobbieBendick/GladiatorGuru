import { useContext } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import { useMediaQuery } from '@mui/material';
import { ToggleColorModeButton } from '../toggle-color-mode-button';
import { ColorModeContext } from '../../app';
import { ROUTE_PATHS } from '@/schemas/route-paths';
import { useLocation, Link, useNavigate } from 'react-router-dom';

function ResponsiveNavBar() {
  const { mode } = useContext(ColorModeContext);
  const location = useLocation();
  const navigate = useNavigate();
  // HashRouter provides pathname without the hash prefix
  const currentPath = location.pathname;
  const isHomePage = currentPath === ROUTE_PATHS.home;
  const isBookingPage = currentPath === ROUTE_PATHS.booking;
  const isAuthPage =
    currentPath === ROUTE_PATHS.login || currentPath === ROUTE_PATHS.signup;
  const isAdminPage = currentPath.startsWith('/admin');

  const isMobile = useMediaQuery('(max-width: 899px)');

  // Don't show navbar on auth pages or admin pages
  if (isAuthPage || isAdminPage) {
    return null;
  }

  interface Routes {
    [key: string]: string;
  }

  const routes: Routes = {};

  return (
    <>
      <AppBar sx={{ backgroundImage: 'unset' }}>
        <Container
          className='nav'
          maxWidth='lg'
          sx={{ zIndex: 1200, px: 0 }}
          disableGutters
        >
          <Toolbar sx={{ justifyContent: 'space-between' }} disableGutters>
            <Box display='flex' flexDirection='row' alignItems='center'>
              <Box
                component={Link}
                to='/'
                sx={{
                  display: { xs: 'none', md: 'flex' },
                  textDecoration: 'none',
                  cursor: 'pointer',
                  height: 40,
                  '& img': {
                    height: '100%',
                    width: 'auto',
                    objectFit: 'contain',
                  },
                }}
              >
                <img
                  src='/gladiator-guru-logo.png'
                  alt='GladiatorGuru'
                  style={{
                    height: '48px', 
                    width: 'auto',
                    position: 'relative',
                    left: '45px',
                  }}
                />
              </Box>
            </Box>

            <Box
              component={Link}
              to='/'
              sx={{
                display: { xs: 'flex', md: 'none' },
                flexGrow: 1,
                textDecoration: 'none',
                cursor: 'pointer',
                height: 40,
                alignItems: 'center',
                '& img': {
                  height: '100%',
                  width: 'auto',
                  objectFit: 'contain',
                },
              }}
            >
              <img
                src='/gladiator-guru-logo.png'
                alt='GladiatorGuru'
                style={{ height: '40px', width: 'auto', marginLeft: '45px' }}
              />
            </Box>
            <Box
              sx={{
                flexGrow: 0,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              {isMobile ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {!isBookingPage && (
                    <Button
                      variant='contained'
                      onClick={() => navigate(ROUTE_PATHS.booking)}
                      sx={{
                        backgroundColor:
                          mode === 'light' ? '#0a7d5a' : 'primary.main',
                        color: 'white',
                        textTransform: 'none',
                        fontSize: '0.875rem',
                        padding: '6px 12px',
                        '&:hover': {
                          backgroundColor:
                            mode === 'light' ? '#085a42' : 'primary.dark',
                        },
                      }}
                    >
                      Book a Coach
                    </Button>
                  )}
                  <ToggleColorModeButton color='white' />
                </Box>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {Object.keys(routes).map((routeKey: string) => {
                    if (routes[routeKey] === currentPath) return;
                    return (
                      <Button
                        key={routeKey}
                        component={Link}
                        to={routes[routeKey]}
                        variant='text'
                        sx={{
                          color: 'white',
                          textTransform: 'none',
                          fontSize: '1rem',
                          fontWeight: 400,
                          fontFamily: 'inherit',
                          minWidth: 'auto',
                          padding: '6px 12px',
                          marginRight: '8px',
                          '&:hover': {
                            backgroundColor: 'transparent',
                            opacity: 0.8,
                          },
                        }}
                      >
                        {routeKey}
                      </Button>
                    );
                  })}
                  {!isBookingPage && (
                    <Button
                      variant='contained'
                      onClick={() => navigate(ROUTE_PATHS.booking)}
                      sx={{
                        backgroundColor:
                          mode === 'light' ? '#0a7d5a' : 'primary.main',
                        color: 'white',
                        textTransform: 'none',
                        '&:hover': {
                          backgroundColor:
                            mode === 'light' ? '#085a42' : 'primary.dark',
                        },
                      }}
                    >
                      Book a Coach
                    </Button>
                  )}
                  <ToggleColorModeButton color='white' />
                </Box>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      {!isHomePage && <Toolbar />}
    </>
  );
}
export default ResponsiveNavBar;
