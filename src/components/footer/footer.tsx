import { Box, Container, Link, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { ROUTE_PATHS } from '../../schemas/route-paths';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component='footer'
      sx={{
        mt: 'auto',
        py: 3,
        borderTop: theme => `1px solid ${theme.palette.divider}`,
        backgroundColor: theme => theme.palette.background.paper,
      }}
    >
      <Container maxWidth='lg'>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'center', sm: 'center' },
            gap: 2,
          }}
        >
          <Typography variant='body2' color='text.secondary'>
            © {currentYear} GladiatorGuru. All rights reserved.
          </Typography>
          <Box
            sx={{
              display: 'flex',
              gap: 3,
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            <Link
              component={RouterLink}
              to={ROUTE_PATHS.privacyPolicy}
              color='text.secondary'
              underline='hover'
              sx={{
                '&:hover': {
                  color: 'primary.main',
                },
              }}
            >
              Privacy Policy
            </Link>
            <Link
              component={RouterLink}
              to={ROUTE_PATHS.termsOfService}
              color='text.secondary'
              underline='hover'
              sx={{
                '&:hover': {
                  color: 'primary.main',
                },
              }}
            >
              Terms of Service
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
