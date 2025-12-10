import {
  Box,
  Container,
  Typography,
  Paper,
  alpha,
  styled,
  keyframes,
  Button,
  Divider,
  useTheme,
} from '@mui/material';
import { ArrowBack, Info, BookOnline } from '@mui/icons-material';
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

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.9;
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

const StepCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3, 4),
  borderRadius: theme.shape.borderRadius * 2,
  backgroundColor:
    theme.palette.mode === 'light'
      ? alpha(theme.palette.background.paper, 0.9)
      : alpha(theme.palette.background.paper, 0.6),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '4px',
    height: '100%',
    background: `linear-gradient(180deg, ${theme.palette.primary.main} 0%, ${
      theme.palette.primary.dark || theme.palette.primary.main
    } 100%)`,
    transition: 'width 0.3s ease',
  },
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.15)}`,
    borderColor: alpha(theme.palette.primary.main, 0.4),
    '&::before': {
      width: '6px',
    },
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2.5, 2.5),
  },
}));

const StepNumber = styled(Box)(({ theme }) => ({
  width: 56,
  height: 56,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${
    theme.palette.primary.dark || theme.palette.primary.main
  } 100%)`,
  color: theme.palette.primary.contrastText,
  fontWeight: 700,
  fontSize: '1.5rem',
  boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.3)}`,
  animation: `${pulse} 2s ease-in-out infinite`,
  flexShrink: 0,
  [theme.breakpoints.down('sm')]: {
    width: 48,
    height: 48,
    fontSize: '1.25rem',
  },
}));

const StepIcon = styled(Box)(({ theme }) => ({
  fontSize: '2.5rem',
  lineHeight: 1,
  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
  [theme.breakpoints.down('sm')]: {
    fontSize: '2rem',
  },
}));

const ConnectorLine = styled(Box)(({ theme }) => ({
  width: '2px',
  height: theme.spacing(3),
  background: `linear-gradient(180deg, ${alpha(
    theme.palette.primary.main,
    0.3
  )} 0%, ${alpha(theme.palette.primary.main, 0.1)} 100%)`,
  margin: theme.spacing(1, 'auto'),
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: theme.palette.primary.main,
    boxShadow: `0 0 8px ${alpha(theme.palette.primary.main, 0.5)}`,
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
      "Within 24 hours, we'll reach out to you via Discord to confirm your booking details, discuss your goals, and answer any questions you may have. If it's your first time, your first booking will be a consultation to understand your personalized goals and needs. During this consultation, we'll also determine the pricing for your coaching session based on your specific requirements.",
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
  const theme = useTheme();

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

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
          }}
        >
          {steps.map((step, index) => (
            <Box
              key={step.label}
              sx={{
                animation: `${slideIn} 0.6s ease-out ${index * 0.1}s both`,
              }}
            >
              <StepCard elevation={2}>
                <Box
                  sx={{
                    display: 'flex',
                    gap: 3,
                    alignItems: 'flex-start',
                    [theme.breakpoints.down('sm')]: {
                      gap: 2,
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <StepNumber>{index + 1}</StepNumber>
                    {index < steps.length - 1 && <ConnectorLine />}
                  </Box>
                  <Box sx={{ flex: 1, pt: 0.5 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        mb: 1.5,
                      }}
                    >
                      <StepIcon>{step.icon}</StepIcon>
                      <Typography
                        variant='h5'
                        sx={{
                          fontWeight: 700,
                          fontSize: { xs: '1.25rem', md: '1.5rem' },
                          background: theme =>
                            `linear-gradient(135deg, ${
                              theme.palette.text.primary
                            } 0%, ${alpha(
                              theme.palette.text.primary,
                              0.7
                            )} 100%)`,
                          backgroundClip: 'text',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                        }}
                      >
                        {step.label}
                      </Typography>
                    </Box>
                    <Typography
                      variant='body1'
                      color='text.secondary'
                      sx={{
                        lineHeight: 1.8,
                        fontSize: { xs: '0.95rem', md: '1rem' },
                      }}
                    >
                      {step.description}
                    </Typography>
                  </Box>
                </Box>
              </StepCard>
            </Box>
          ))}
        </Box>

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button
            variant='contained'
            size='large'
            startIcon={<BookOnline />}
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
