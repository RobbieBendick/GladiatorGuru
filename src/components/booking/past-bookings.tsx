import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  alpha,
  styled,
  CircularProgress,
  Chip,
  Card,
  CardContent,
  Grid,
  Button,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ROUTE_PATHS } from '../../schemas/route-paths';
import { API_BASE_URL } from '../../config/api';
import { getAuthToken } from '../../config/auth';
import { useUser } from '../../contexts/UserContext';
import { getClassColor, WowVersion } from '../../constants/wow-classes';
import { ArrowBack, Event, Schedule } from '@mui/icons-material';
import { getTimezoneAbbreviation } from '../../utils/timezone';

const PagePaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius * 3,
  backgroundColor:
    theme.palette.mode === 'light'
      ? theme.palette.background.paper
      : alpha(theme.palette.background.default, 0.5),
}));

const BookingCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
  },
}));

interface Booking {
  _id: string;
  characterName: string;
  characterRealm: string;
  version: string;
  bracket: string;
  hours: string;
  characterClass: string;
  characterSpec: string;
  availabilityStartDateTime: string;
  availabilityEndDateTime: string;
  discordUsername: string;
  goal?: string;
  status:
    | 'active'
    | 'pending'
    | 'accepted'
    | 'approved'
    | 'completed'
    | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'info';
    case 'pending':
      return 'warning';
    case 'accepted':
      return 'success';
    case 'approved':
      return 'success';
    case 'completed':
      return 'success';
    case 'cancelled':
      return 'error';
    default:
      return 'default';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'active':
      return 'Active';
    case 'pending':
      return 'Pending';
    case 'accepted':
      return 'Accepted';
    case 'approved':
      return 'Approved';
    case 'completed':
      return 'Completed';
    case 'cancelled':
      return 'Cancelled';
    default:
      return status;
  }
};

// Helper function to normalize class names
const normalizeClassName = (className: string): string => {
  return className.toLowerCase().replace(/\s+/g, '');
};

const getClassImagePath = (className: string): string => {
  const normalized = normalizeClassName(className);
  return `/class/64/${normalized}.png`;
};

const formatDateTime = (dateTimeString: string): string => {
  try {
    const date = new Date(dateTimeString);
    const formatted = date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    const timezone = getTimezoneAbbreviation();
    return `${formatted} ${timezone}`;
  } catch (error) {
    return dateTimeString;
  }
};

const getVersionImagePath = (version: WowVersion): string => {
  const normalized = version.toLowerCase();
  return `/wow-versions/${normalized}.png`;
};

const getVersionDisplayName = (version: WowVersion): string => {
  const versionNames: Record<WowVersion, string> = {
    TBC: 'Burning Crusade',
    MOP: 'Mists of Pandaria',
  };
  return versionNames[version] || version;
};

export function PastBookings() {
  const navigate = useNavigate();
  const { user, loading: userLoading } = useUser();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      if (userLoading) return;

      if (!user) {
        setError('Please log in to view your bookings');
        setLoading(false);
        return;
      }

      try {
        const token = getAuthToken();
        if (!token) {
          setError('Please log in to view your bookings');
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_BASE_URL}/api/bookings`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch bookings');
        }

        const data = await response.json();
        const allBookings = data.data || [];
        // Filter to show only current bookings: Active, Pending, Accepted, Approved
        // Exclude Completed and Cancelled
        const currentBookings = allBookings.filter(
          (booking: Booking) =>
            booking.status === 'active' ||
            booking.status === 'pending' ||
            booking.status === 'accepted' ||
            booking.status === 'approved'
        );
        setBookings(currentBookings);
      } catch (err: any) {
        console.error('Error fetching bookings:', err);
        setError(err.message || 'Failed to load bookings');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user, userLoading]);

  if (userLoading || loading) {
    return (
      <Container maxWidth='md' sx={{ py: 8 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '400px',
          }}
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth='md' sx={{ py: 8 }}>
        <PagePaper elevation={3}>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant='h5' color='error' sx={{ mb: 2 }}>
              {error}
            </Typography>
            <Button
              variant='contained'
              onClick={() => navigate(ROUTE_PATHS.login)}
              sx={{ mr: 2 }}
            >
              Go to Login
            </Button>
            <Button
              variant='outlined'
              onClick={() => navigate(ROUTE_PATHS.home)}
            >
              Go to Home
            </Button>
          </Box>
        </PagePaper>
      </Container>
    );
  }

  return (
    <Container maxWidth='md' sx={{ py: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(ROUTE_PATHS.home)}
          sx={{ mb: 2 }}
        >
          Back to Home
        </Button>
      </Box>

      <PagePaper elevation={3}>
        <Typography
          variant='h3'
          sx={{
            fontWeight: 700,
            mb: 1,
            color: 'text.primary',
          }}
        >
          Current Bookings
        </Typography>
        <Typography variant='body1' color='text.secondary' sx={{ mb: 4 }}>
          View your active coaching session bookings
        </Typography>

        {bookings.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Event sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant='h6' color='text.secondary' sx={{ mb: 2 }}>
              No current bookings
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
              You don't have any active bookings at the moment.
            </Typography>
            <Button
              variant='contained'
              onClick={() => navigate(ROUTE_PATHS.booking)}
            >
              Book a Coach
            </Button>
          </Box>
        ) : (
          <Box>
            {bookings.map(booking => (
              <BookingCard key={booking._id} elevation={2}>
                <CardContent>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      mb: 2,
                      flexWrap: 'wrap',
                      gap: 2,
                    }}
                  >
                    <Box>
                      <Typography
                        variant='h6'
                        sx={{
                          fontWeight: 600,
                          mb: 1,
                          color: booking.characterClass
                            ? getClassColor(booking.characterClass)
                            : 'text.primary',
                        }}
                      >
                        {booking.characterName} - {booking.characterRealm}
                      </Typography>
                      <Chip
                        label={getStatusLabel(booking.status)}
                        color={getStatusColor(booking.status) as any}
                        size='small'
                        sx={{ mb: 1 }}
                      />
                    </Box>
                    <Typography variant='body2' color='text.secondary'>
                      {formatDateTime(booking.createdAt)}
                    </Typography>
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          mb: 1,
                        }}
                      >
                        <img
                          src={getVersionImagePath(booking.version as any)}
                          alt={booking.version}
                          style={{ width: 24, height: 24 }}
                          onError={e => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <Typography variant='body2'>
                          <strong>Version:</strong>{' '}
                          {getVersionDisplayName(booking.version as any)}
                        </Typography>
                      </Box>
                    </Grid>

                    {booking.characterClass && (
                      <Grid item xs={12} sm={6}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            mb: 1,
                          }}
                        >
                          <img
                            src={getClassImagePath(booking.characterClass)}
                            alt={booking.characterClass}
                            style={{ width: 24, height: 24 }}
                            onError={e => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                          <Typography
                            variant='body2'
                            sx={{
                              color: getClassColor(booking.characterClass),
                            }}
                          >
                            <strong>Class:</strong> {booking.characterClass}
                            {booking.characterSpec &&
                              ` - ${booking.characterSpec}`}
                          </Typography>
                        </Box>
                      </Grid>
                    )}

                    {booking.bracket && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant='body2'>
                          <strong>Bracket:</strong> {booking.bracket}
                        </Typography>
                      </Grid>
                    )}

                    <Grid item xs={12} sm={6}>
                      <Typography variant='body2'>
                        <strong>Hours:</strong> {booking.hours}
                      </Typography>
                    </Grid>

                    <Grid item xs={12}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          mb: 1,
                        }}
                      >
                        <Schedule
                          sx={{ fontSize: 20, color: 'text.secondary' }}
                        />
                        <Typography variant='body2'>
                          <strong>Availability:</strong>{' '}
                          {formatDateTime(booking.availabilityStartDateTime)} -{' '}
                          {formatDateTime(booking.availabilityEndDateTime)}
                        </Typography>
                      </Box>
                    </Grid>

                    {booking.goal && (
                      <Grid item xs={12}>
                        <Typography variant='body2'>
                          <strong>Goal:</strong> {booking.goal}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </BookingCard>
            ))}
          </Box>
        )}
      </PagePaper>
    </Container>
  );
}
