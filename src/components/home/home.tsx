import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  alpha,
  keyframes,
  styled,
} from '@mui/material';
import {
  ArrowForward,
  EmojiEvents,
  Speed,
  Security,
  Star,
  Groups,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { ROUTE_PATHS } from '@/schemas/route-paths';

// Animation keyframes
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

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const scaleIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.05);
  }
`;

const gradientShift = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

// Styled Components
const AnimatedBackground = styled(Box)(({ theme }) => ({
  minHeight: '90vh',
  width: '100%',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '-50%',
    left: '-50%',
    width: '200%',
    height: '200%',
    animation: `${rotate} 20s linear infinite`,
    pointerEvents: 'none',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: '20%',
    right: '-10%',
    width: '400px',
    height: '400px',
    background: `radial-gradient(circle, ${alpha(
      theme.palette.primary.main,
      0.08
    )} 0%, transparent 70%)`,
    borderRadius: '50%',
    animation: `${pulse} 4s ease-in-out infinite`,
    pointerEvents: 'none',
  },
}));

const HeroContainer = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(4, 6),
  borderRadius: theme.shape.borderRadius * 3,
  backgroundColor:
    theme.palette.mode === 'light'
      ? alpha(theme.palette.background.default, 0.8)
      : alpha(theme.palette.background.default, 0.5),
  marginBottom: theme.spacing(6),
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(4),
    marginBottom: theme.spacing(6),
  },
}));

const HeroTitle = styled(Typography)(({ theme }) => ({
  fontSize: '4rem',
  fontWeight: 700,
  marginBottom: theme.spacing(2),
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${
    theme.palette.primary.dark || theme.palette.primary.main
  } 100%)`,
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  lineHeight: 1.2,
  animation: `${fadeInUp} 0.8s ease-out`,
  position: 'relative',
  [theme.breakpoints.down('md')]: {
    fontSize: '2.5rem',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: '-10px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100px',
    height: '4px',
    background: `linear-gradient(90deg, transparent, ${theme.palette.primary.main}, transparent)`,
    borderRadius: '2px',
    animation: `${fadeIn} 1s ease-out 0.5s both`,
  },
}));

const HeroSubtitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.5rem',
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(4),
  maxWidth: '700px',
  margin: '0 auto',
  lineHeight: 1.6,
  animation: `${fadeInUp} 0.8s ease-out 0.2s both`,
  [theme.breakpoints.down('md')]: {
    fontSize: '1.1rem',
  },
}));

const ButtonContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  marginTop: theme.spacing(4),
  gap: theme.spacing(4),
  justifyContent: 'center',
  flexWrap: 'wrap',
  animation: `${fadeInUp} 0.8s ease-out 0.4s both`,
}));

const PrimaryButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(1.5, 4),
  fontSize: '1.1rem',
  textTransform: 'none',
  borderRadius: theme.shape.borderRadius * 2,
  transition: 'all 0.3s ease',
  position: 'relative',
  overflow: 'hidden',
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${
    theme.palette.primary.dark || theme.palette.primary.main
  } 100%)`,
  backgroundSize: '200% 200%',
  animation: `${gradientShift} 3s ease infinite`,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 0,
    height: 0,
    borderRadius: '50%',
    background: alpha(theme.palette.common.white, 0.3),
    transform: 'translate(-50%, -50%)',
    transition: 'width 0.6s, height 0.6s',
  },
  '&:hover': {
    transform: 'translateY(-2px) scale(1.05)',
    boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.4)}`,
    '&::before': {
      width: '300px',
      height: '300px',
    },
    '& .MuiButton-endIcon': {
      transform: 'translateX(4px)',
    },
  },
  '& .MuiButton-endIcon': {
    transition: 'transform 0.3s ease',
  },
}));

const SecondaryButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(1.5, 4),
  fontSize: '1.1rem',
  textTransform: 'none',
  borderRadius: theme.shape.borderRadius * 2,
  transition: 'all 0.3s ease',
  position: 'relative',
  borderWidth: 2,
  '&:hover': {
    transform: 'translateY(-2px) scale(1.05)',
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    borderWidth: 2,
    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
  },
}));

const FeatureCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s ease-in-out',
  borderRadius: theme.shape.borderRadius * 3,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: `linear-gradient(90deg, transparent, ${alpha(
      theme.palette.primary.main,
      0.1
    )}, transparent)`,
    transition: 'left 0.5s ease',
  },
  '&:hover': {
    transform: 'translateY(-8px) scale(1.02)',
    boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.25)}`,
    borderColor: alpha(theme.palette.primary.main, 0.4),
    '&::before': {
      left: '100%',
    },
  },
}));

const IconContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  marginBottom: theme.spacing(3),
  color: theme.palette.primary.main,
  animation: `${float} 3s ease-in-out infinite`,
}));

const PriceBox = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(4),
  textAlign: 'center',
  padding: theme.spacing(3, 4),
  borderRadius: theme.shape.borderRadius * 2,
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  border: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
  animation: `${fadeInUp} 0.8s ease-out 0.6s both`,
}));

const CallToActionBox = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(8),
  textAlign: 'center',
  padding: theme.spacing(4, 6),
  borderRadius: theme.shape.borderRadius * 3,
  backgroundSize: '200% 200%',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  position: 'relative',
  overflow: 'hidden',
  animation: `${fadeInUp} 0.8s ease-out 1s both`,
  transition: 'all 0.3s ease-in-out',
  [theme.breakpoints.down('md')]: {
    marginTop: theme.spacing(8),
    padding: theme.spacing(4),
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '-50%',
    right: '-50%',
    width: '200%',
    height: '200%',
    animation: `${pulse} 4s ease-in-out infinite`,
    pointerEvents: 'none',
  },
  '&:hover': {
    borderColor: alpha(theme.palette.primary.main, 0.4),
    boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.15)}`,
  },
}));

export function Home() {
  const navigate = useNavigate();

  const features = [
    {
      icon: <EmojiEvents sx={{ fontSize: 48 }} />,
      title: 'Multi-R1 Players',
      description:
        'Access to elite players with multiple Rank 1 Gladiator titles. Our network includes some of the most accomplished arena competitors in World of Warcraft Classic.',
    },
    {
      icon: <Star sx={{ fontSize: 48 }} />,
      title: 'Tournament Experience',
      description:
        'Connect with players who have extensive tournament experience. Learn from competitors who have proven themselves on the biggest stages in competitive arena play.',
    },
    {
      icon: <Groups sx={{ fontSize: 48 }} />,
      title: 'Elite Player Network',
      description:
        'Access to the best players across all classes and specializations. Our network includes top-tier competitors from the highest ranks of the arena ladder.',
    },
    {
      icon: <Speed sx={{ fontSize: 48 }} />,
      title: 'Fast & Efficient',
      description:
        'Quick and reliable boosting services. Get your arena rating up fast with professional gameplay and optimal strategies from elite players.',
    },
    {
      icon: <Security sx={{ fontSize: 48 }} />,
      title: 'Safe & Secure',
      description:
        'Trusted boosting service with secure methods. Your account safety is our top priority throughout the entire process.',
    },
  ];

  return (
    <AnimatedBackground>
      <Container maxWidth='lg' sx={{ py: { xs: 6, md: 10 } }}>
        <HeroContainer>
          <HeroTitle variant='h1'>Gladiator Guru</HeroTitle>
          <HeroSubtitle variant='h5'>
            Connect with the Best Players - Multi-R1 & Tournament Experience
          </HeroSubtitle>
          <PriceBox>
            <Typography
              variant='h3'
              sx={{
                fontWeight: 700,
                color: 'primary.main',
                mb: 1,
              }}
            >
              $30/hour
            </Typography>
            <Typography
              variant='body1'
              sx={{
                color: 'text.secondary',
              }}
            >
              Competitive rates for elite-level boosting
            </Typography>
          </PriceBox>
          <ButtonContainer>
            <PrimaryButton
              variant='contained'
              size='large'
              endIcon={<ArrowForward />}
              onClick={() => navigate(ROUTE_PATHS.home)}
            >
              Book a Boost
            </PrimaryButton>
            <SecondaryButton
              variant='outlined'
              size='large'
              onClick={() => navigate(ROUTE_PATHS.home)}
            >
              View Credentials
            </SecondaryButton>
          </ButtonContainer>
        </HeroContainer>

        {/* Features Section */}
        <Grid container spacing={4} sx={{ mt: 2 }}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <FeatureCard
                sx={{
                  animation: `${scaleIn} 0.6s ease-out ${
                    0.6 + index * 0.1
                  }s both`,
                }}
              >
                <CardContent sx={{ flexGrow: 1, p: 4 }}>
                  <IconContainer>{feature.icon}</IconContainer>
                  <Typography
                    variant='h5'
                    sx={{
                      fontWeight: 600,
                      mb: 2,
                      textAlign: 'center',
                    }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography
                    variant='body1'
                    sx={{
                      color: 'text.secondary',
                      mb: 3,
                      textAlign: 'center',
                      lineHeight: 1.7,
                    }}
                  >
                    {feature.description}
                  </Typography>
                </CardContent>
              </FeatureCard>
            </Grid>
          ))}
        </Grid>

        {/* Call to Action Section */}
        <CallToActionBox>
          <Typography
            variant='h4'
            sx={{
              fontWeight: 600,
              mb: 2,
              color: 'text.primary',
            }}
          >
            Ready to climb the arena ladder?
          </Typography>
          <Typography
            variant='body1'
            sx={{
              color: 'text.secondary',
              mb: 4,
              maxWidth: '600px',
              mx: 'auto',
            }}
          >
            Connect with elite players who have multiple Rank 1 Gladiator titles
            and extensive tournament experience. Our network of the best players
            in World of Warcraft Classic will help you achieve your arena goals.
            Book your boost today and experience elite-level gameplay.
          </Typography>
          <PrimaryButton
            variant='contained'
            size='large'
            endIcon={<ArrowForward />}
            onClick={() => navigate(ROUTE_PATHS.home)}
          >
            Get Started - $30/hour
          </PrimaryButton>
        </CallToActionBox>
      </Container>
    </AnimatedBackground>
  );
}
