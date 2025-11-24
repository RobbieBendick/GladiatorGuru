import {
  Box,
  Container,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Paper,
  alpha,
  styled,
  keyframes,
  Button,
  Divider,
} from '@mui/material';
import { ArrowBack, Info } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { ROUTE_PATHS } from '../../schemas/route-paths';

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const ContentPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(0, 6),
  borderRadius: theme.shape.borderRadius * 3,
  backgroundColor:
    theme.palette.mode === 'light'
      ? alpha(theme.palette.background.default, 0.8)
      : alpha(theme.palette.background.default, 0.5),
  marginBottom: theme.spacing(4),
  animation: `${fadeInUp} 0.6s ease-out`,
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(3, 2),
  },
}));

const steps = [
  {
    icon: '📝',
    label: 'Book Your Session',
    description:
      'Fill out our booking form with your character details, preferred game version, bracket, and availability. Select the number of coaches and hours you need.',
  },
  {
    icon: '💬',
    label: 'We Contact You',
    description:
      "Within 24 hours, we'll reach out to you via Discord to confirm your booking details, discuss your goals, and answer any questions you may have. We'll start with a consultation to understand your goals and needs.",
  },
  {
    icon: '📅',
    label: 'Schedule Your Session',
    description:
      "We'll coordinate with you to find the best time for your coaching session. Once scheduled, you'll receive a confirmation with all the details.",
  },
  {
    icon: '🎮',
    label: 'Pay For & Attend Your Coaching Session',
    description:
      "Join your coaching session with our elite players. We'll be playing in your desired bracket, playing along with you and coaching you along the way. Learn advanced strategies, positioning, communication, and game sense.",
  },
  {
    icon: '📈',
    label: 'Improve & Practice',
    description:
      "Apply what you've learned in your own games. Our coaches will provide feedback and tips to help you continue improving your arena skills.",
  },
];

export function HowItWorks() {
  const navigate = useNavigate();

  return (
    <Container maxWidth='md' sx={{ px: { xs: 1, md: 3 } }} disableGutters>
      <Box>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(ROUTE_PATHS.home)}
          sx={{ mb: 2 }}
        >
          Back to Home
        </Button>
      </Box>

      <ContentPaper elevation={3} sx={{ paddingBlock: 4 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            mb: 1,
          }}
        >
          <Info
            sx={{
              fontSize: { xs: '1.5rem', md: '2rem' },
              color: 'text.primary',
            }}
          />
          <Typography
            variant='h2'
            sx={{
              fontWeight: 700,
              background: theme => theme.palette.text.primary,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: { xs: '2rem', md: '3rem' },
            }}
          >
            How It Works
          </Typography>
        </Box>
        <Typography
          variant='body1'
          color='text.secondary'
          sx={{ mb: 3, fontSize: { xs: '1rem', md: '1.1rem' } }}
        >
          Get started with professional WoW Classic arena coaching in just a few
          simple steps
        </Typography>

        <Divider
          sx={{
            mb: 4,
            borderColor: theme => alpha(theme.palette.text.primary, 0.3),
          }}
        />

        <Stepper
          activeStep={0}
          orientation='vertical'
          sx={{
            '& .MuiStepConnector-root span': {
              display: 'none',
            },
          }}
        >
          {steps.map((step, index) => (
            <Step
              key={step.label}
              completed={index === 0}
              sx={{
                paddingTop: '0.5rem',
              }}
            >
              <StepLabel
                sx={{
                  '& .MuiStepLabel-label': {
                    fontSize: '1.25rem',
                    fontWeight: 700,
                  },
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  {step.icon} {step.label}
                </Box>
              </StepLabel>
              <Box
                sx={{
                  pl: { xs: 4, md: 5 },
                  pb: 1.2,
                }}
              >
                <Typography
                  variant='body1'
                  color='text.secondary'
                  sx={{ lineHeight: 1.7 }}
                >
                  {step.description}
                </Typography>
              </Box>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button
            variant='contained'
            size='large'
            onClick={() => navigate(ROUTE_PATHS.booking)}
            sx={{
              padding: theme => theme.spacing(1.5, 4),
              fontSize: '1.1rem',
              textTransform: 'none',
              borderRadius: theme => theme.shape.borderRadius * 2,
              background: theme =>
                `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${
                  theme.palette.primary.dark || theme.palette.primary.main
                } 100%)`,
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: theme =>
                  `0 8px 24px ${alpha(theme.palette.primary.main, 0.4)}`,
              },
            }}
          >
            Book a Coach Now
          </Button>
        </Box>
      </ContentPaper>
    </Container>
  );
}
