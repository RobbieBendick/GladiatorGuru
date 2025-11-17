import React, { useContext, useState, useEffect } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import Container from '@mui/material/Container';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import { useMediaQuery } from '@mui/material';
import Brightness2Icon from '@mui/icons-material/Brightness2';
import { LightMode } from '@mui/icons-material';
import { ToggleColorModeButton } from '../toggle-color-mode-button';
import { ColorModeContext } from '../../app';
import { ROUTE_PATHS } from '@/schemas/route-paths';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config/api';
import { isAuthenticated, removeAuthToken } from '../../config/auth';

function ResponsiveNavBar() {
  const [anchorElNav, setAnchorElNav] = useState<HTMLElement | null>(null);
  const [anchorElUser, setAnchorElUser] = useState<HTMLElement | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const { toggleColorMode, mode } = useContext(ColorModeContext);
  const location = useLocation();
  const navigate = useNavigate();
  // HashRouter provides pathname without the hash prefix
  const currentPath = location.pathname;
  const isHomePage = currentPath === ROUTE_PATHS.home;
  const isBookingPage = currentPath === ROUTE_PATHS.booking;
  const isAuthPage =
    currentPath === ROUTE_PATHS.login || currentPath === ROUTE_PATHS.signup;
  const isAdminPage = currentPath.startsWith('/admin');

  // Check authentication status
  useEffect(() => {
    setAuthenticated(isAuthenticated());
  }, [location.pathname]);

  const handleToggleColorMode = () => {
    toggleColorMode();
  };

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      removeAuthToken();
      setAuthenticated(false);
      handleCloseUserMenu();
      navigate(ROUTE_PATHS.home);
    }
  };

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
                    marginLeft: '45px',
                  }}
                />
              </Box>
            </Box>

            <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
              <Menu
                id='menu-appbar'
                anchorEl={anchorElNav}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
                open={Boolean(anchorElNav)}
                onClose={handleCloseNavMenu}
                sx={{
                  display: { xs: 'block', md: 'none' },
                }}
              ></Menu>
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
                <Tooltip title='Open pages'>
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 1 }}>
                    <MenuIcon style={{ color: 'white' }} />
                  </IconButton>
                </Tooltip>
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
                  {/* Temporarily hidden - keeping functionality intact */}
                  {false && authenticated ? (
                    <Button
                      variant='text'
                      startIcon={<LogoutIcon sx={{ color: 'white' }} />}
                      onClick={handleLogout}
                      sx={{
                        color: 'white',
                        textTransform: 'none',
                        '&:hover': {
                          backgroundColor: 'transparent',
                        },
                      }}
                    >
                      Logout
                    </Button>
                  ) : (
                    false && (
                      <Button
                        variant='text'
                        onClick={() => navigate(ROUTE_PATHS.login)}
                        sx={{
                          color: 'white',
                          textTransform: 'none',
                          '&:hover': {
                            backgroundColor: 'transparent',
                          },
                        }}
                      >
                        Login/Signup
                      </Button>
                    )
                  )}
                  <ToggleColorModeButton color='white' />
                </Box>
              )}
              <Menu
                sx={{ mt: '45px' }}
                id='menu-appbar'
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 1,
                    p: 1,
                  }}
                >
                  {!isBookingPage && (
                    <Button
                      variant='contained'
                      fullWidth
                      onClick={() => {
                        handleCloseUserMenu();
                        navigate(ROUTE_PATHS.booking);
                      }}
                      sx={{
                        backgroundColor:
                          mode === 'light' ? '#0a7d5a' : 'primary.main',
                        color: 'white',
                        textTransform: 'none',
                        mb: 1,
                        '&:hover': {
                          backgroundColor:
                            mode === 'light' ? '#085a42' : 'primary.dark',
                        },
                      }}
                    >
                      Book a Coach
                    </Button>
                  )}
                  {Object.keys(routes).map(routeKey => {
                    if (routes[routeKey] === currentPath) return;
                    return (
                      <MenuItem
                        key={routeKey}
                        onClick={() => {
                          handleCloseUserMenu();
                          navigate(routes[routeKey]);
                        }}
                        sx={{
                          textDecoration: 'none',
                          width: '100%',
                          textAlign: 'center',
                          justifyContent: 'center',
                          color: 'text.primary',
                        }}
                      >
                        {routeKey}
                      </MenuItem>
                    );
                  })}
                  {/* Temporarily hidden - keeping functionality intact */}
                  {false && authenticated ? (
                    <MenuItem
                      onClick={() => {
                        handleLogout();
                      }}
                      sx={{
                        textDecoration: 'none',
                        width: '100%',
                        textAlign: 'center',
                        justifyContent: 'center',
                        color: 'text.primary',
                        '&:hover': {
                          backgroundColor: 'transparent',
                        },
                      }}
                    >
                      <LogoutIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Logout
                    </MenuItem>
                  ) : (
                    false && (
                      <MenuItem
                        onClick={() => {
                          handleCloseUserMenu();
                          navigate(ROUTE_PATHS.login);
                        }}
                        sx={{
                          textDecoration: 'none',
                          width: '100%',
                          textAlign: 'center',
                          justifyContent: 'center',
                          color: 'text.primary',
                          '&:hover': {
                            backgroundColor: 'transparent',
                          },
                        }}
                      >
                        Login/Signup
                      </MenuItem>
                    )
                  )}

                  <MenuItem
                    key='color-mode-button'
                    onClick={handleToggleColorMode}
                    component='a'
                    sx={{
                      textDecoration: 'none',
                      width: '100%',
                      textAlign: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {mode === 'light' ? <LightMode /> : <Brightness2Icon />}
                  </MenuItem>
                </Box>
              </Menu>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      {!isHomePage && <Toolbar />}
    </>
  );
}
export default ResponsiveNavBar;
