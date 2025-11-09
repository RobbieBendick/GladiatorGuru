import React, { useContext, useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import Container from '@mui/material/Container';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import MenuIcon from '@mui/icons-material/Menu';
import { useMediaQuery } from '@mui/material';
import Brightness2Icon from '@mui/icons-material/Brightness2';
import { LightMode } from '@mui/icons-material';
import { ToggleColorModeButton } from '../toggle-color-mode-button';
import { ColorModeContext } from '../../app';
import { ROUTE_PATHS } from '@/schemas/route-paths';
import { useLocation, Link, useNavigate } from 'react-router-dom';

function ResponsiveNavBar() {
  const [anchorElNav, setAnchorElNav] = useState<HTMLElement | null>(null);
  const [anchorElUser, setAnchorElUser] = useState<HTMLElement | null>(null);
  const { toggleColorMode, mode } = useContext(ColorModeContext);
  const location = useLocation();
  const navigate = useNavigate();
  // HashRouter provides pathname without the hash prefix
  const currentPath = location.pathname;
  const isHomePage = currentPath === ROUTE_PATHS.home;

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

  const isMobile = useMediaQuery('(max-width: 899px)');

  interface Routes {
    [key: string]: string;
  }

  const routes: Routes = {
    Home: ROUTE_PATHS.home,
  };

  return (
    <>
      <AppBar sx={{ backgroundImage: 'unset' }}>
        <Container className='nav' maxWidth='lg' sx={{ zIndex: 1200 }}>
          <Toolbar sx={{ justifyContent: 'space-between' }} disableGutters>
            <Box display='flex' flexDirection='row' alignItems='center'>
              <Typography
                variant='h6'
                noWrap
                component={Link}
                to='/'
                sx={{
                  display: { xs: 'none', md: 'flex' },
                  fontWeight: 700,
                  letterSpacing: '.1rem',
                  color: 'inherit',
                  textDecoration: 'none',
                  cursor: 'pointer',
                }}
              >
                Gladiator Guru
              </Typography>
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
            <Typography
              variant='h5'
              noWrap
              component={Link}
              to='/'
              sx={{
                display: { xs: 'flex', md: 'none' },
                flexGrow: 1,
                fontWeight: 700,
                letterSpacing: '.1rem',
                color: 'inherit',
                textDecoration: 'none',
                cursor: 'pointer',
              }}
            >
              Gladiator Guru
            </Typography>
            <Box sx={{ flexGrow: 0 }}>
              {isMobile ? (
                <Tooltip title='Open pages'>
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 1 }}>
                    <MenuIcon style={{ color: 'white' }} />
                  </IconButton>
                </Tooltip>
              ) : (
                <Box>
                  {Object.keys(routes).map((routeKey: string) => {
                    if (routes[routeKey] === currentPath) return;
                    return (
                      <Tooltip
                        key={routeKey}
                        title={routeKey}
                        placement='bottom'
                      >
                        <Link
                          key={routeKey}
                          to={routes[routeKey]}
                          style={{
                            marginRight: '20px',
                            textDecoration: 'none',
                            fontWeight: '500',
                            color: 'inherit',
                          }}
                        >
                          {routeKey}
                        </Link>
                      </Tooltip>
                    );
                  })}
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
                  }}
                >
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
                          color: 'inherit',
                        }}
                      >
                        {routeKey}
                      </MenuItem>
                    );
                  })}

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
