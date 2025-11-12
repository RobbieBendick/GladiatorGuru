import { Box, Container, Typography, Button, Paper } from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { ROUTE_PATHS } from '../../schemas/route-paths';
import { styled } from '@mui/material/styles';

const SuccessPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(6),
  borderRadius: theme.shape.borderRadius * 3,
  textAlign: 'center',
  backgroundColor:
    theme.palette.mode === 'light'
      ? theme.palette.background.default
      : theme.palette.background.paper,
}));

const SuccessIcon = styled(CheckCircle)(({ theme }) => ({
  fontSize: '5rem',
  color: theme.palette.success.main,
  marginBottom: theme.spacing(3),
}));

export function BookingSuccess() {
  const navigate = useNavigate();

  return (
    <Container maxWidth='md'>
      <Box sx={{ mt: 8, mb: 4 }}>
        <SuccessPaper elevation={3}>
          <SuccessIcon />
          <Typography variant='h3' gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
            Booking Request Submitted!
          </Typography>
          <Typography
            variant='body1'
            color='text.secondary'
            sx={{ mb: 4, fontSize: '1.1rem' }}
          >
            Thank you for your booking request. We'll contact you via Discord as
            soon as possible to confirm the details and schedule your session.
          </Typography>
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <Button
              variant='contained'
              size='large'
              onClick={() => navigate(ROUTE_PATHS.home)}
              sx={{
                textTransform: 'none',
                px: 4,
                py: 1.5,
              }}
            >
              Back to Home
            </Button>
            <Button
              variant='outlined'
              size='large'
              onClick={() => navigate(ROUTE_PATHS.booking)}
              sx={{
                textTransform: 'none',
                px: 4,
                py: 1.5,
              }}
            >
              Submit Another Request
            </Button>
          </Box>
        </SuccessPaper>
      </Box>
    </Container>
  );
}
