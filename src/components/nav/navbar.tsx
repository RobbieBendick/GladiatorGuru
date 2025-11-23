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
import IconButton from '@mui/material/IconButton';
import LoginIcon from '@mui/icons-material/Login';
import HistoryIcon from '@mui/icons-material/History';
import MenuIcon from '@mui/icons-material/Menu';
import Brightness2Icon from '@mui/icons-material/Brightness2';
import LightMode from '@mui/icons-material/LightMode';
import BookOnlineIcon from '@mui/icons-material/BookOnline';
import LogoutIcon from '@mui/icons-material/Logout';
import { ToggleColorModeButton } from '../toggle-color-mode-button';
import { ColorModeContext } from '../../app';
import { ROUTE_PATHS } from '@/schemas/route-paths';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import { useState } from 'react';

function ResponsiveNavBar() {
  const { mode, toggleColorMode } = useContext(ColorModeContext);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading, logout } = useUser();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileMenuAnchorEl, setMobileMenuAnchorEl] =
    useState<null | HTMLElement>(null);

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

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMenuAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuAnchorEl(null);
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

  const routes: Routes = {
    'Past Bookings': ROUTE_PATHS.pastBookings,
  };

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
                ml: 'auto',
              }}
            >
              {isMobile ? (
                <>
                  <IconButton
                    onClick={handleMobileMenuOpen}
                    sx={{
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      },
                    }}
                  >
                    <MenuIcon />
                  </IconButton>
                  <Menu
                    anchorEl={mobileMenuAnchorEl}
                    open={Boolean(mobileMenuAnchorEl)}
                    onClose={handleMobileMenuClose}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right',
                    }}
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    PaperProps={{
                      sx: {
                        mt: 1,
                        minWidth: 200,
                        borderRadius: 2,
                      },
                    }}
                  >
                    {!user && (
                      <MenuItem
                        component={Link}
                        to={ROUTE_PATHS.login}
                        onClick={handleMobileMenuClose}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          py: 1.5,
                          color: 'text.primary',
                        }}
                      >
                        <LoginIcon sx={{ mr: 1.5, color: 'text.primary' }} />
                        <Box sx={{ flex: 1, textAlign: 'center', ml: -1.5 }}>
                          Login
                        </Box>
                      </MenuItem>
                    )}
                    {!isBookingPage && (
                      <MenuItem
                        onClick={() => {
                          navigate(ROUTE_PATHS.booking);
                          handleMobileMenuClose();
                        }}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          py: 1.5,
                          color: 'text.primary',
                        }}
                      >
                        <BookOnlineIcon
                          sx={{ mr: 1.5, color: 'text.primary' }}
                        />
                        <Box sx={{ flex: 1, textAlign: 'center', ml: -1.5 }}>
                          Book a Coach
                        </Box>
                      </MenuItem>
                    )}
                    {user && currentPath !== ROUTE_PATHS.pastBookings && (
                      <MenuItem
                        component={Link}
                        to={ROUTE_PATHS.pastBookings}
                        onClick={handleMobileMenuClose}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          py: 1.5,
                        }}
                      >
                        <HistoryIcon sx={{ mr: 1.5 }} />
                        <Box sx={{ flex: 1, textAlign: 'center', ml: -1.5 }}>
                          Past Bookings
                        </Box>
                      </MenuItem>
                    )}
                    <MenuItem
                      onClick={() => {
                        toggleColorMode();
                        handleMobileMenuClose();
                      }}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        py: 1.5,
                      }}
                    >
                      {mode === 'light' ? (
                        <Brightness2Icon sx={{ mr: 1.5 }} />
                      ) : (
                        <LightMode sx={{ mr: 1.5 }} />
                      )}
                      <Box sx={{ flex: 1, textAlign: 'center', ml: -1.5 }}>
                        {mode === 'light' ? 'Dark Mode' : 'Light Mode'}
                      </Box>
                    </MenuItem>
                    {user && (
                      <MenuItem
                        onClick={() => {
                          handleLogout();
                          handleMobileMenuClose();
                        }}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          py: 1.5,
                        }}
                      >
                        <LogoutIcon sx={{ mr: 1.5 }} />
                        <Box sx={{ flex: 1, textAlign: 'center', ml: -1.5 }}>
                          Logout
                        </Box>
                      </MenuItem>
                    )}
                  </Menu>
                </>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {Object.keys(routes).map((routeKey: string) => {
                    if (routes[routeKey] === currentPath) return;
                    const isPastBookings = routeKey === 'Past Bookings';
                    // Don't show Past Bookings if user isn't logged in
                    if (isPastBookings && !user) return null;
                    return (
                      <Button
                        key={routeKey}
                        component={Link}
                        to={routes[routeKey]}
                        variant={isPastBookings ? 'outlined' : 'text'}
                        startIcon={isPastBookings ? <HistoryIcon /> : undefined}
                        sx={{
                          color: 'white',
                          borderColor: isPastBookings
                            ? 'rgba(255, 255, 255, 0.3)'
                            : 'transparent',
                          textTransform: 'none',
                          fontSize: '0.875rem',
                          minWidth: 'auto',
                          padding: isPastBookings ? '6px 16px' : '6px 12px',
                          marginRight: '8px',
                          '&:hover': {
                            backgroundColor: isPastBookings
                              ? 'rgba(255, 255, 255, 0.1)'
                              : 'transparent',
                            borderColor: isPastBookings
                              ? 'rgba(255, 255, 255, 0.5)'
                              : 'transparent',
                            opacity: isPastBookings ? 1 : 0.8,
                          },
                        }}
                      >
                        {routeKey}
                      </Button>
                    );
                  })}
                  {!isBookingPage && (
                    <Button
                      variant='outlined'
                      onClick={() => navigate(ROUTE_PATHS.booking)}
                      startIcon={<BookOnlineIcon />}
                      sx={{
                        color: 'white',
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                        textTransform: 'none',
                        fontSize: '0.875rem',
                        padding: '6px 16px',
                        '&:hover': {
                          borderColor: 'rgba(255, 255, 255, 0.5)',
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        },
                      }}
                    >
                      Book a Coach
                    </Button>
                  )}
                  {!user && (
                    <Button
                      component={Link}
                      to={ROUTE_PATHS.login}
                      variant='outlined'
                      startIcon={<LoginIcon />}
                      sx={{
                        color: 'white',
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                        textTransform: 'none',
                        fontSize: '0.875rem',
                        padding: '6px 16px',
                        '&:hover': {
                          borderColor: 'rgba(255, 255, 255, 0.5)',
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        },
                      }}
                    >
                      Login
                    </Button>
                  )}
                </Box>
              )}
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
                    <MenuItem onClick={handleLogout}>
                      <LogoutIcon sx={{ mr: 1 }} />
                      Logout
                    </MenuItem>
                  </Menu>
                </Box>
              ) : null}
              <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
                <ToggleColorModeButton color='white' />
              </Box>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      {!isHomePage && <Toolbar />}
    </>
  );
}
export default ResponsiveNavBar;
