import { useContext } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import Chip from '@mui/material/Chip';
import { useMediaQuery } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import HistoryIcon from '@mui/icons-material/History';
import MenuIcon from '@mui/icons-material/Menu';
import Brightness2Icon from '@mui/icons-material/Brightness2';
import LightMode from '@mui/icons-material/LightMode';
import BookOnlineIcon from '@mui/icons-material/BookOnline';
import LogoutIcon from '@mui/icons-material/Logout';
import ScheduleIcon from '@mui/icons-material/Schedule';
import SettingsIcon from '@mui/icons-material/Settings';
import PeopleIcon from '@mui/icons-material/People';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { ToggleColorModeButton } from '../toggle-color-mode-button';
import { ColorModeContext } from '../../app';
import { ROUTE_PATHS } from '@/schemas/route-paths';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import { useState } from 'react';
import { initiateDiscordOAuth } from '../../config/discord-oauth';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { useCustomerDrawer } from '../../contexts/CustomerDrawerContext';
import { isAdmin } from '../../config/auth';

function ResponsiveNavBar() {
  const { mode, toggleColorMode } = useContext(ColorModeContext);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading, logout } = useUser();
  const { drawerOpen, setDrawerOpen } = useCustomerDrawer();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileMenuAnchorEl, setMobileMenuAnchorEl] =
    useState<null | HTMLElement>(null);

  // Check if user can access customer drawer (admin or coach)
  const canAccessCustomers = user && (isAdmin() || user.role === 'coach');

  // HashRouter provides pathname without the hash prefix
  const currentPath = location.pathname;
  const isHomePage = currentPath === ROUTE_PATHS.home;
  const isBookingPage = currentPath === ROUTE_PATHS.booking;
  const isAuthPage =
    currentPath === ROUTE_PATHS.login || currentPath === ROUTE_PATHS.signup;
  // Check if we're on a schedule route (e.g., /:id/schedule)
  // The route pattern is /:id/schedule, so actual paths will be like /123/schedule
  const isScheduleRoute = currentPath.endsWith('/schedule');

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

  const handleDiscordLogin = async () => {
    try {
      await initiateDiscordOAuth();
    } catch (err: any) {
      console.error('Failed to initiate Discord login:', err);
    }
  };

  // Don't show navbar on auth pages
  if (isAuthPage) {
    return null;
  }

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
                        mt: 1.5,
                        minWidth: 240,
                        borderRadius: 3,
                        boxShadow: theme =>
                          theme.palette.mode === 'dark'
                            ? '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)'
                            : '0 8px 32px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.05)',
                        overflow: 'hidden',
                        backdropFilter: 'blur(20px)',
                        backgroundColor: theme =>
                          theme.palette.mode === 'dark'
                            ? alpha(theme.palette.background.paper, 0.8)
                            : alpha(theme.palette.background.paper, 0.95),
                      },
                    }}
                    MenuListProps={{
                      sx: { py: 0.5 },
                    }}
                  >
                    {!user && (
                      <MenuItem
                        onClick={() => {
                          handleDiscordLogin();
                          handleMobileMenuClose();
                        }}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          py: 1.75,
                          px: 2,
                          mx: 0.75,
                          my: 0.5,
                          borderRadius: 2,
                          backgroundColor: '#5865F2',
                          color: 'white',
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            backgroundColor: '#4752C4',
                            transform: 'translateY(-1px)',
                            boxShadow: '0 4px 12px rgba(88, 101, 242, 0.4)',
                          },
                        }}
                      >
                        <Avatar
                          sx={{
                            width: 20,
                            height: 20,
                            bgcolor: 'transparent',
                            mr: 1.5,
                          }}
                          src='/discord.png'
                          alt='Discord'
                        />
                        <Box sx={{ flex: 1, textAlign: 'center', ml: -1.5 }}>
                          Login with Discord
                        </Box>
                      </MenuItem>
                    )}
                    {isScheduleRoute && canAccessCustomers && (
                      <MenuItem
                        onClick={() => {
                          setDrawerOpen(!drawerOpen);
                          handleMobileMenuClose();
                        }}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          py: 1.5,
                          px: 2,
                          mx: 0.75,
                          borderRadius: 1.5,
                          color: 'text.primary',
                          backgroundColor: drawerOpen
                            ? theme =>
                                alpha(
                                  theme.palette.primary.main,
                                  theme.palette.mode === 'dark' ? 0.15 : 0.08
                                )
                            : 'transparent',
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            backgroundColor: theme =>
                              alpha(
                                theme.palette.primary.main,
                                theme.palette.mode === 'dark' ? 0.15 : 0.08
                              ),
                            transform: 'translateX(4px)',
                          },
                        }}
                      >
                        <PeopleIcon
                          sx={{ mr: 1.5, color: 'primary.main', fontSize: 20 }}
                        />
                        <Box sx={{ flex: 1, textAlign: 'center', ml: -1.5 }}>
                          {drawerOpen ? 'Hide Customers' : 'Customers'}
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
                          px: 2,
                          mx: 0.75,
                          borderRadius: 1.5,
                          color: 'text.primary',
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            backgroundColor: theme =>
                              alpha(
                                theme.palette.primary.main,
                                theme.palette.mode === 'dark' ? 0.15 : 0.08
                              ),
                            transform: 'translateX(4px)',
                          },
                        }}
                      >
                        <BookOnlineIcon
                          sx={{ mr: 1.5, color: 'primary.main', fontSize: 20 }}
                        />
                        <Box sx={{ flex: 1, textAlign: 'center', ml: -1.5 }}>
                          Book a Coach
                        </Box>
                      </MenuItem>
                    )}
                    {user &&
                      user.role === 'user' &&
                      currentPath !== ROUTE_PATHS.pastBookings && (
                        <>
                          <Divider sx={{ my: 0.5 }} />
                          <MenuItem
                            component={Link}
                            to={ROUTE_PATHS.pastBookings}
                            onClick={handleMobileMenuClose}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              py: 1.5,
                              px: 2,
                              mx: 0.75,
                              borderRadius: 1.5,
                              transition: 'all 0.2s ease-in-out',
                              '&:hover': {
                                backgroundColor: theme =>
                                  alpha(
                                    theme.palette.text.secondary,
                                    theme.palette.mode === 'dark' ? 0.15 : 0.08
                                  ),
                                transform: 'translateX(4px)',
                              },
                            }}
                          >
                            <HistoryIcon
                              sx={{
                                mr: 1.5,
                                color: 'text.secondary',
                                fontSize: 20,
                              }}
                            />
                            <Box
                              sx={{ flex: 1, textAlign: 'center', ml: -1.5 }}
                            >
                              Current Bookings
                            </Box>
                          </MenuItem>
                        </>
                      )}
                    {user && (
                      <MenuItem
                        component={Link}
                        to={ROUTE_PATHS.settings}
                        onClick={handleMobileMenuClose}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          py: 1.5,
                          px: 2,
                          mx: 0.75,
                          borderRadius: 1.5,
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            backgroundColor: theme =>
                              alpha(
                                theme.palette.text.secondary,
                                theme.palette.mode === 'dark' ? 0.15 : 0.08
                              ),
                            transform: 'translateX(4px)',
                          },
                        }}
                      >
                        <SettingsIcon
                          sx={{
                            mr: 1.5,
                            color: 'text.secondary',
                            fontSize: 20,
                          }}
                        />
                        <Box sx={{ flex: 1, textAlign: 'center', ml: -1.5 }}>
                          Settings
                        </Box>
                      </MenuItem>
                    )}
                    <Divider sx={{ my: 0.5 }} />
                    <MenuItem
                      onClick={() => {
                        toggleColorMode();
                        handleMobileMenuClose();
                      }}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        py: 1.5,
                        px: 2,
                        mx: 0.75,
                        borderRadius: 1.5,
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          backgroundColor: theme =>
                            alpha(
                              theme.palette.text.secondary,
                              theme.palette.mode === 'dark' ? 0.15 : 0.08
                            ),
                          transform: 'translateX(4px)',
                        },
                      }}
                    >
                      {mode === 'light' ? (
                        <Brightness2Icon
                          sx={{
                            mr: 1.5,
                            color: 'text.secondary',
                            fontSize: 20,
                          }}
                        />
                      ) : (
                        <LightMode
                          sx={{
                            mr: 1.5,
                            color: 'text.secondary',
                            fontSize: 20,
                          }}
                        />
                      )}
                      <Box sx={{ flex: 1, textAlign: 'center', ml: -1.5 }}>
                        {mode === 'light' ? 'Dark Mode' : 'Light Mode'}
                      </Box>
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {isScheduleRoute && canAccessCustomers && (
                    <IconButton
                      onClick={() => setDrawerOpen(!drawerOpen)}
                      sx={{
                        color: 'white',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        backgroundColor: drawerOpen
                          ? 'rgba(255, 255, 255, 0.15)'
                          : 'transparent',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          borderColor: 'rgba(255, 255, 255, 0.5)',
                        },
                      }}
                      title='Customers'
                    >
                      <PeopleIcon />
                    </IconButton>
                  )}
                  {!isBookingPage && (
                    <Button
                      variant='outlined'
                      onClick={() => navigate(ROUTE_PATHS.booking)}
                      startIcon={<BookOnlineIcon />}
                      sx={{
                        color: 'white',
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                        backgroundColor: theme =>
                          theme.palette.mode === 'light'
                            ? 'rgba(8, 83, 62, 0.3)'
                            : 'transparent',
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
                      variant='contained'
                      onClick={handleDiscordLogin}
                      startIcon={
                        <Avatar
                          sx={{
                            width: 20,
                            height: 20,
                            bgcolor: 'transparent',
                          }}
                          src='/discord.png'
                          alt='Discord'
                        />
                      }
                      sx={{
                        backgroundColor: '#5865F2',
                        color: 'white',
                        textTransform: 'none',
                        fontSize: '0.875rem',
                        padding: '6px 16px',
                        '&:hover': {
                          backgroundColor: '#4752C4',
                        },
                      }}
                    >
                      Login with Discord
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
                          backgroundColor: 'transparent',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          display: { xs: 'none', sm: 'flex' },
                          cursor: 'pointer',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            borderColor: 'rgba(255, 255, 255, 0.3)',
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
                    PaperProps={{
                      sx: {
                        mt: 1.5,
                        minWidth: 240,
                        borderRadius: 3,
                        boxShadow: theme =>
                          theme.palette.mode === 'dark'
                            ? '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)'
                            : '0 8px 32px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.05)',
                        overflow: 'hidden',
                        backdropFilter: 'blur(20px)',
                        backgroundColor: theme =>
                          theme.palette.mode === 'dark'
                            ? alpha(theme.palette.background.paper, 0.8)
                            : alpha(theme.palette.background.paper, 0.95),
                      },
                    }}
                    MenuListProps={{
                      sx: { py: 0.5 },
                    }}
                  >
                    {user && user.role === 'admin' && (
                      <>
                        <Box
                          sx={{
                            px: 2.5,
                            py: 1,
                            mt: 0.5,
                            mb: 0.25,
                          }}
                        >
                          <Typography
                            variant='caption'
                            sx={{
                              color: 'text.secondary',
                              fontWeight: 600,
                              fontSize: '0.7rem',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                            }}
                          >
                            Admin
                          </Typography>
                        </Box>
                        <MenuItem
                          component={Link}
                          to={ROUTE_PATHS.admin}
                          onClick={handleMenuClose}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            py: 1.5,
                            px: 2,
                            mx: 0.75,
                            borderRadius: 1.5,
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                              backgroundColor: theme =>
                                alpha(
                                  theme.palette.text.secondary,
                                  theme.palette.mode === 'dark' ? 0.15 : 0.08
                                ),
                              transform: 'translateX(4px)',
                            },
                          }}
                        >
                          <DashboardIcon
                            sx={{
                              mr: 1.5,
                              color: 'text.secondary',
                              fontSize: 20,
                            }}
                          />
                          Admin Dashboard
                        </MenuItem>
                        <MenuItem
                          component={Link}
                          to='/admin/coaches'
                          onClick={handleMenuClose}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            py: 1.5,
                            px: 2,
                            mx: 0.75,
                            borderRadius: 1.5,
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                              backgroundColor: theme =>
                                alpha(
                                  theme.palette.text.secondary,
                                  theme.palette.mode === 'dark' ? 0.15 : 0.08
                                ),
                              transform: 'translateX(4px)',
                            },
                          }}
                        >
                          <PeopleIcon
                            sx={{
                              mr: 1.5,
                              color: 'text.secondary',
                              fontSize: 20,
                            }}
                          />
                          View Coaches
                        </MenuItem>
                        {isScheduleRoute && canAccessCustomers && (
                          <MenuItem
                            component={Link}
                            to={ROUTE_PATHS.customerManagement}
                            onClick={handleMenuClose}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              py: 1.5,
                              px: 2,
                              mx: 0.75,
                              borderRadius: 1.5,
                              transition: 'all 0.2s ease-in-out',
                              '&:hover': {
                                backgroundColor: theme =>
                                  alpha(
                                    theme.palette.text.secondary,
                                    theme.palette.mode === 'dark' ? 0.15 : 0.08
                                  ),
                                transform: 'translateX(4px)',
                              },
                            }}
                          >
                            <AccountBalanceIcon
                              sx={{
                                mr: 1.5,
                                color: 'text.secondary',
                                fontSize: 20,
                              }}
                            />
                            Customer Management
                          </MenuItem>
                        )}
                      </>
                    )}
                    {user &&
                      (user.role === 'coach' || user.role === 'admin') && (
                        <>
                          {user.role === 'admin' && (
                            <Divider sx={{ my: 0.5 }} />
                          )}
                          <Box
                            sx={{
                              px: 2.5,
                              py: 1,
                              mt: user.role === 'admin' ? 0.5 : 0.5,
                              mb: 0.25,
                            }}
                          >
                            <Typography
                              variant='caption'
                              sx={{
                                color: 'text.secondary',
                                fontWeight: 600,
                                fontSize: '0.7rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                              }}
                            >
                              Coach
                            </Typography>
                          </Box>
                          <MenuItem
                            component={Link}
                            to={ROUTE_PATHS.coach}
                            onClick={handleMenuClose}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              py: 1.5,
                              px: 2,
                              mx: 0.75,
                              borderRadius: 1.5,
                              transition: 'all 0.2s ease-in-out',
                              '&:hover': {
                                backgroundColor: theme =>
                                  alpha(
                                    theme.palette.text.secondary,
                                    theme.palette.mode === 'dark' ? 0.15 : 0.08
                                  ),
                                transform: 'translateX(4px)',
                              },
                            }}
                          >
                            <DashboardIcon
                              sx={{
                                mr: 1.5,
                                color: 'text.secondary',
                                fontSize: 20,
                              }}
                            />
                            Coach Dashboard
                          </MenuItem>
                          <MenuItem
                            component={Link}
                            to={`/${user.id}/schedule`}
                            onClick={handleMenuClose}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              py: 1.5,
                              px: 2,
                              mx: 0.75,
                              borderRadius: 1.5,
                              transition: 'all 0.2s ease-in-out',
                              '&:hover': {
                                backgroundColor: theme =>
                                  alpha(
                                    theme.palette.text.secondary,
                                    theme.palette.mode === 'dark' ? 0.15 : 0.08
                                  ),
                                transform: 'translateX(4px)',
                              },
                            }}
                          >
                            <ScheduleIcon
                              sx={{
                                mr: 1.5,
                                color: 'text.secondary',
                                fontSize: 20,
                              }}
                            />
                            My Schedule
                          </MenuItem>
                          {isScheduleRoute && canAccessCustomers && (
                            <MenuItem
                              component={Link}
                              to={ROUTE_PATHS.customerManagement}
                              onClick={handleMenuClose}
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                py: 1.5,
                                px: 2,
                                mx: 0.75,
                                borderRadius: 1.5,
                                transition: 'all 0.2s ease-in-out',
                                '&:hover': {
                                  backgroundColor: theme =>
                                    alpha(
                                      theme.palette.text.secondary,
                                      theme.palette.mode === 'dark'
                                        ? 0.15
                                        : 0.08
                                    ),
                                  transform: 'translateX(4px)',
                                },
                              }}
                            >
                              <AccountBalanceIcon
                                sx={{
                                  mr: 1.5,
                                  color: 'text.secondary',
                                  fontSize: 20,
                                }}
                              />
                              Customer Management
                            </MenuItem>
                          )}
                        </>
                      )}
                    {user && (
                      <>
                        <Divider sx={{ my: 0.5 }} />
                        <Box
                          sx={{
                            px: 2.5,
                            py: 1,
                            mt: 0.5,
                            mb: 0.25,
                          }}
                        >
                          <Typography
                            variant='caption'
                            sx={{
                              color: 'text.secondary',
                              fontWeight: 600,
                              fontSize: '0.7rem',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                            }}
                          >
                            Account
                          </Typography>
                        </Box>
                        {user.role === 'user' &&
                          currentPath !== ROUTE_PATHS.pastBookings && (
                            <MenuItem
                              component={Link}
                              to={ROUTE_PATHS.pastBookings}
                              onClick={handleMenuClose}
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                py: 1.5,
                                px: 2,
                                mx: 0.75,
                                borderRadius: 1.5,
                                transition: 'all 0.2s ease-in-out',
                                '&:hover': {
                                  backgroundColor: theme =>
                                    alpha(
                                      theme.palette.text.secondary,
                                      theme.palette.mode === 'dark'
                                        ? 0.15
                                        : 0.08
                                    ),
                                  transform: 'translateX(4px)',
                                },
                              }}
                            >
                              <HistoryIcon
                                sx={{
                                  mr: 1.5,
                                  color: 'text.secondary',
                                  fontSize: 20,
                                }}
                              />
                              Current Bookings
                            </MenuItem>
                          )}
                        <MenuItem
                          component={Link}
                          to={ROUTE_PATHS.settings}
                          onClick={handleMenuClose}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            py: 1.5,
                            px: 2,
                            mx: 0.75,
                            borderRadius: 1.5,
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                              backgroundColor: theme =>
                                alpha(
                                  theme.palette.text.secondary,
                                  theme.palette.mode === 'dark' ? 0.15 : 0.08
                                ),
                              transform: 'translateX(4px)',
                            },
                          }}
                        >
                          <SettingsIcon
                            sx={{
                              mr: 1.5,
                              color: 'text.secondary',
                              fontSize: 20,
                            }}
                          />
                          Settings
                        </MenuItem>
                      </>
                    )}
                    <Divider sx={{ my: 0.5 }} />
                    <MenuItem
                      onClick={handleLogout}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        py: 1.5,
                        px: 2,
                        mx: 0.75,
                        mb: 0.5,
                        borderRadius: 1.5,
                        color: 'error.main',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          backgroundColor: theme =>
                            alpha(theme.palette.error.main, 0.1),
                          transform: 'translateX(4px)',
                        },
                      }}
                    >
                      <LogoutIcon sx={{ mr: 1.5, fontSize: 20 }} />
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
