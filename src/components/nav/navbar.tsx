import { useContext } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import { useMediaQuery } from '@mui/material';
import { ToggleColorModeButton } from '../toggle-color-mode-button';
import { ColorModeContext } from '../../app';
import { ROUTE_PATHS } from '@/schemas/route-paths';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import { useState } from 'react';

function ResponsiveNavBar() {
  const { mode } = useContext(ColorModeContext);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading, logout } = useUser();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // HashRouter provides pathname without the hash prefix
  const currentPath = location.pathname;
  const isHomePage = currentPath === ROUTE_PATHS.home;
  const isBookingPage = currentPath === ROUTE_PATHS.booking;
  const isAuthPage =
    currentPath === ROUTE_PATHS.login || currentPath === ROUTE_PATHS.signup;
  const isAdminPage = currentPath.startsWith('/admin');

  const isMobile = useMediaQuery('(max-width: 899px)');

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate(ROUTE_PATHS.home);
  };

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
              {loading ? (
                <Box sx={{ width: 32, height: 32 }} /> // Placeholder while loading
              ) : user ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {user.discordUsername ? (
                    <>
                      {/* Desktop: Full chip with text */}
                      <Chip
                        label={`Signed in as ${user.discordUsername}`}
                        avatar={
                          <Avatar
                            sx={{
                              width: 24,
                              height: 24,
                              bgcolor: 'transparent',
                            }}
                            src='/discord.png'
                            alt='Discord'
                          />
                        }
                        onClick={handleMenuOpen}
                        sx={{
                          color: 'white',
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          display: { xs: 'none', sm: 'flex' },
                          cursor: 'pointer',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                          },
                        }}
                      />
                      {/* Mobile: Just Discord icon */}
                      <Button
                        onClick={handleMenuOpen}
                        sx={{
                          color: 'white',
                          minWidth: 'auto',
                          padding: '4px',
                          display: { xs: 'flex', sm: 'none' },
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          },
                        }}
                      >
                        <Avatar
                          sx={{
                            width: 28,
                            height: 28,
                            bgcolor: 'transparent',
                          }}
                          src='/discord.png'
                          alt='Discord'
                        />
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={handleMenuOpen}
                      sx={{
                        color: 'white',
                        textTransform: 'none',
                        minWidth: 'auto',
                        padding: '6px 12px',
                      }}
                    >
                      {user.username}
                    </Button>
                  )}
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right',
                    }}
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                  >
                    <MenuItem onClick={handleLogout}>Logout</MenuItem>
                  </Menu>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Button
                    component={Link}
                    to={ROUTE_PATHS.login}
                    sx={{
                      color: 'white',
                      textTransform: 'none',
                      fontSize: '0.875rem',
                    }}
                  >
                    Login
                  </Button>
                </Box>
              )}
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
