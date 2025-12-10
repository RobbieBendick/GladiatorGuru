import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Divider,
  alpha,
} from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { ROUTE_PATHS } from '../../schemas/route-paths';
import { styled, keyframes } from '@mui/material/styles';

// Animation for success icon
const scaleIn = keyframes`
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const SuccessPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius * 3,
  textAlign: 'center',
  backgroundColor:
    theme.palette.mode === 'light'
      ? alpha(theme.palette.background.default, 0.8)
      : alpha(theme.palette.background.default, 0.5),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  animation: `${fadeIn} 0.6s ease-out`,
}));

const SuccessIcon = styled(CheckCircle)(({ theme }) => ({
  fontSize: '6rem',
  color: theme.palette.success.main,
  marginBottom: theme.spacing(3),
  filter: `drop-shadow(0 4px 12px ${alpha(theme.palette.success.main, 0.3)})`,
  animation: `${scaleIn} 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)`,
}));

export function BookingSuccess() {
  const navigate = useNavigate();

  return (
    <Container maxWidth='md'>
      <Box sx={{ mt: 8, mb: 4 }}>
        <SuccessPaper elevation={3}>
          <SuccessIcon />
          <Typography
            variant='h3'
            gutterBottom
            sx={{
              fontWeight: 700,
              mb: 2,
              color: 'text.primary',
              animation: `${fadeIn} 0.8s ease-out 0.2s both`,
            }}
          >
            Booking Request Submitted!
          </Typography>
          <Typography
            variant='body1'
            color='text.secondary'
            sx={{
              mb: 4,
              fontSize: '1.1rem',
              lineHeight: 1.7,
              maxWidth: '600px',
              mx: 'auto',
              animation: `${fadeIn} 0.8s ease-out 0.4s both`,
            }}
          >
            Thank you for your booking request. We'll contact you via Discord as
            soon as possible to confirm the details and schedule your session.
          </Typography>

          <Divider sx={{ my: 4 }} />

          <Box
            sx={{
              display: 'flex',
              gap: 2,
              justifyContent: 'center',
              flexWrap: 'wrap',
              animation: `${fadeIn} 0.8s ease-out 0.8s both`,
            }}
          >
            <Button
              variant='contained'
              onClick={() => navigate(ROUTE_PATHS.home)}
            >
              Back to Home
            </Button>
            <Button
              variant='outlined'
              onClick={() => navigate(ROUTE_PATHS.booking)}
            >
              Submit Another Request
            </Button>
          </Box>
        </SuccessPaper>
      </Box>
    </Container>
  );
}
