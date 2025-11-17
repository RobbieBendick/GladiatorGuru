import { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  alpha,
  styled,
  CircularProgress,
  Button,
  Chip,
  Divider,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  ArrowBack,
  CalendarToday,
  AccessTime,
  Person,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { ROUTE_PATHS } from '../../schemas/route-paths';
import { API_BASE_URL } from '../../config/api';
import { getAuthToken, isAdmin } from '../../config/auth';

const DetailsPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius * 3,
  backgroundColor:
    theme.palette.mode === 'light'
      ? alpha(theme.palette.background.default, 0.8)
      : alpha(theme.palette.background.default, 0.5),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
}));

const DetailRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(2),
  padding: theme.spacing(1.5),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.background.default, 0.6),
}));

interface Job {
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
  adminNotes?: string;
  status?:
    | 'pending'
    | 'accepted'
    | 'approved'
    | 'rejected'
    | 'completed'
    | 'cancelled';
  coachIds?: string[];
}

interface Coach {
  _id: string;
  username: string;
  name?: string;
  role: string;
}

export function JobDetails() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  const [_coaches, setCoaches] = useState<Coach[]>([]);
  const [_availableCoaches, setAvailableCoaches] = useState<Coach[]>([]);
  const [_selectedCoachIds, setSelectedCoachIds] = useState<string[]>([]);
  const [_assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [_assigning, setAssigning] = useState(false);
  const [formData, setFormData] = useState<Job | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchJobDetails();
    checkAdminStatus();
  }, [id]);

  useEffect(() => {
    if (isUserAdmin) {
      fetchAvailableCoaches();
    }
  }, [isUserAdmin]);

  const checkAdminStatus = async () => {
    try {
      const tokenIsAdmin = isAdmin();
      if (tokenIsAdmin) {
        // Verify with backend
        const token = getAuthToken();
        const response = await fetch(`${API_BASE_URL}/api/admin/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setIsUserAdmin(data.data?.role === 'admin');
        } else {
          setIsUserAdmin(false);
        }
      } else {
        setIsUserAdmin(false);
      }
    } catch (error) {
      setIsUserAdmin(false);
    }
  };

  useEffect(() => {
    if (job && job.coachIds && job.coachIds.length > 0) {
      fetchCoachesForJob(job);
    } else {
      setCoaches([]);
    }
  }, [job]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!id) {
        setError('Job ID is required');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/jobs/${id}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setJob(data.data || data);
      } else if (response.status === 404) {
        setError('Job not found');
      } else {
        setError('Failed to load job details');
      }
    } catch (err: any) {
      console.error('Error fetching job details:', err);
      setError(err.message || 'Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  const fetchCoachesForJob = async (jobData: Job) => {
    if (!jobData || !jobData.coachIds || jobData.coachIds.length === 0) {
      return;
    }

    try {
      const token = getAuthToken();
      const coachPromises = jobData.coachIds!.map(async (coachId: string) => {
        try {
          const response = await fetch(
            `${API_BASE_URL}/api/admin/users/${coachId}`,
            {
              headers: {
                Authorization: token ? `Bearer ${token}` : '',
                'Content-Type': 'application/json',
              },
              credentials: 'include',
            }
          );
          if (response.ok) {
            const data = await response.json();
            return Array.isArray(data.data) ? data.data[0] : data.data;
          }
          return null;
        } catch (err) {
          console.error(`Error fetching coach ${coachId}:`, err);
          return null;
        }
      });

      const fetchedCoaches = await Promise.all(coachPromises);
      setCoaches(
        fetchedCoaches.filter((coach): coach is Coach => coach !== null)
      );
    } catch (err: any) {
      console.error('Error fetching coaches:', err);
    }
  };

  const fetchAvailableCoaches = async () => {
    try {
      const token = getAuthToken();
      // Fetch both coaches and admins
      const [coachesResponse, adminsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/admin/users?role=coach`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }),
        fetch(`${API_BASE_URL}/api/admin/users?role=admin`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }),
      ]);

      const allUsers: Coach[] = [];

      if (coachesResponse.ok) {
        const coachesData = await coachesResponse.json();
        if (coachesData.data) {
          allUsers.push(...coachesData.data);
        }
      }

      if (adminsResponse.ok) {
        const adminsData = await adminsResponse.json();
        if (adminsData.data) {
          allUsers.push(...adminsData.data);
        }
      }

      setAvailableCoaches(allUsers);
    } catch (error) {
      console.error('Error fetching available coaches and admins:', error);
    }
  };

  // Intentionally unused - reserved for future admin coach assignment feature
  // @ts-ignore - intentionally unused for future feature
  const _handleOpenAssignDialog = () => {
    if (!job) return;
    setSelectedCoachIds(job.coachIds || []);
    setAssignDialogOpen(true);
  };

  // @ts-ignore - intentionally unused for future feature
  const _handleCloseAssignDialog = () => {
    setAssignDialogOpen(false);
    setSelectedCoachIds([]);
  };

  // @ts-ignore - intentionally unused for future feature
  const _handleAssignCoaches = async () => {
    if (!job || !id) return;

    try {
      setAssigning(true);
      const token = getAuthToken();

      const response = await fetch(
        `${API_BASE_URL}/api/admin/jobs/${id}/coaches`,
        {
          method: 'PATCH',
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ coachIds: _selectedCoachIds }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const updatedJob = data.data || data;
        setJob(updatedJob);
        setFormData(updatedJob);
        // Refresh coaches display
        if (updatedJob.coachIds && updatedJob.coachIds.length > 0) {
          fetchCoachesForJob(updatedJob);
        } else {
          setCoaches([]);
        }
        setSnackbar({
          open: true,
          message: 'Coaches assigned successfully',
          severity: 'success',
        });
        _handleCloseAssignDialog();
      } else {
        const errorData = await response.json().catch(() => ({}));
        setSnackbar({
          open: true,
          message: errorData.message || 'Failed to assign coaches',
          severity: 'error',
        });
      }
    } catch (err: any) {
      console.error('Error assigning coaches:', err);
      setSnackbar({
        open: true,
        message: 'Failed to assign coaches',
        severity: 'error',
      });
    } finally {
      setAssigning(false);
    }
  };

  const handleUpdateJob = async () => {
    if (!job || !id || !formData) return;

    try {
      setIsSubmitting(true);
      const token = getAuthToken();

      const response = await fetch(`${API_BASE_URL}/api/admin/jobs/${id}`, {
        method: 'PATCH',
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        const updatedJob = data.data || data;
        setJob(updatedJob);
        setSnackbar({
          open: true,
          message: 'Job updated successfully',
          severity: 'success',
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        setSnackbar({
          open: true,
          message: errorData.message || 'Failed to update job',
          severity: 'error',
        });
      }
    } catch (err: any) {
      console.error('Error updating job:', err);
      setSnackbar({
        open: true,
        message: 'Failed to update job',
        severity: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'accepted':
      case 'approved':
        return 'success';
      case 'completed':
        return 'info';
      case 'rejected':
      case 'cancelled':
        return 'error';
      default:
        return 'warning';
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'accepted':
        return 'Accepted';
      case 'approved':
        return 'Approved';
      case 'completed':
        return 'Completed';
      case 'rejected':
        return 'Rejected';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Pending';
    }
  };

  if (loading) {
    return (
      <Container maxWidth='lg'>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '50vh',
          }}
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !job) {
    return (
      <Container maxWidth='lg'>
        <Box sx={{ mb: 3 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate(ROUTE_PATHS.home)}
            sx={{ mb: 2 }}
          >
            Back to Home
          </Button>
        </Box>
        <DetailsPaper elevation={3}>
          <Typography variant='h4' color='error' gutterBottom>
            Error
          </Typography>
          <Typography variant='body1' color='text.secondary'>
            {error || 'Job not found'}
          </Typography>
        </DetailsPaper>
      </Container>
    );
  }

  return (
    <Container maxWidth='lg'>
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          sx={{ mb: 2 }}
        >
          Back
        </Button>
      </Box>

      <DetailsPaper elevation={3}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Typography variant='h3' sx={{ fontWeight: 700 }}>
            Job Details
          </Typography>
          <Chip
            label={getStatusLabel(job.status)}
            color={getStatusColor(job.status) as any}
            sx={{ fontSize: '0.9rem', padding: '4px 8px' }}
          />
        </Box>

        <Divider
          sx={{
            mb: 3,
            borderColor: theme => alpha(theme.palette.text.primary, 0.3),
          }}
        />

        <Box sx={{ mb: 3 }}>
          <Typography
            variant='h5'
            sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}
          >
            Character Information
          </Typography>

          <DetailRow>
            <Person sx={{ color: 'text.primary' }} />
            <Box>
              <Typography variant='body2' color='text.secondary'>
                Character Name
              </Typography>
              <Typography variant='h6'>{job.characterName}</Typography>
            </Box>
          </DetailRow>

          <DetailRow sx={{ gap: 1 }}>
            <Typography
              variant='body2'
              color='text.secondary'
              sx={{ minWidth: 10 }}
            >
              Realm:
            </Typography>
            <Typography variant='body1' sx={{ fontWeight: 500 }}>
              {job.characterRealm}
            </Typography>
          </DetailRow>

          {job.characterClass && (
            <DetailRow sx={{ gap: 1 }}>
              <Typography
                variant='body2'
                color='text.secondary'
                sx={{ minWidth: 10 }}
              >
                Class:
              </Typography>
              <Typography variant='body1' sx={{ fontWeight: 500 }}>
                {job.characterClass}
              </Typography>
            </DetailRow>
          )}

          {job.characterSpec && (
            <DetailRow>
              <Typography
                variant='body2'
                color='text.secondary'
                sx={{ minWidth: 10 }}
              >
                Spec:
              </Typography>
              <Typography variant='body1' sx={{ fontWeight: 500 }}>
                {job.characterSpec}
              </Typography>
            </DetailRow>
          )}
        </Box>

        <Divider
          sx={{
            my: 3,
            borderColor: theme => alpha(theme.palette.text.primary, 0.3),
          }}
        />

        <Box sx={{ mb: 3 }}>
          <Typography
            variant='h5'
            sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}
          >
            Session Details
          </Typography>

          <DetailRow>
            <CalendarToday sx={{ color: 'text.primary' }} />
            <Box>
              <Typography variant='body2' color='text.secondary'>
                Start Time
              </Typography>
              <Typography variant='body1' sx={{ fontWeight: 500 }}>
                {formatDateTime(job.availabilityStartDateTime)}
              </Typography>
            </Box>
          </DetailRow>

          <DetailRow>
            <AccessTime sx={{ color: 'text.primary' }} />
            <Box>
              <Typography variant='body2' color='text.secondary'>
                End Time
              </Typography>
              <Typography variant='body1' sx={{ fontWeight: 500 }}>
                {formatDateTime(job.availabilityEndDateTime)}
              </Typography>
            </Box>
          </DetailRow>

          <DetailRow sx={{ gap: 1 }}>
            <Typography
              variant='body2'
              color='text.secondary'
              sx={{ minWidth: 10 }}
            >
              Version:
            </Typography>
            <Typography variant='body1' sx={{ fontWeight: 500 }}>
              {job.version}
            </Typography>
          </DetailRow>

          {job.bracket && (
            <DetailRow sx={{ gap: 1 }}>
              <Typography
                variant='body2'
                color='text.secondary'
                sx={{ minWidth: 10 }}
              >
                Bracket:
              </Typography>
              <Typography variant='body1' sx={{ fontWeight: 500 }}>
                {job.bracket}
              </Typography>
            </DetailRow>
          )}

          <DetailRow sx={{ gap: 1 }}>
            <Typography
              variant='body2'
              color='text.secondary'
              sx={{ minWidth: 10 }}
            >
              Hours:
            </Typography>
            <Typography variant='body1' sx={{ fontWeight: 500 }}>
              {job.hours}
            </Typography>
          </DetailRow>
        </Box>

        <Divider
          sx={{
            my: 3,
            borderColor: theme => alpha(theme.palette.text.primary, 0.3),
          }}
        />

        <Box sx={{ mb: 3 }}>
          <Typography
            variant='h5'
            sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}
          >
            Contact Information
          </Typography>

          <DetailRow sx={{ gap: 1 }}>
            <Typography
              variant='body2'
              color='text.secondary'
              sx={{ minWidth: 10 }}
            >
              Discord:
            </Typography>
            <Typography variant='body1' sx={{ fontWeight: 500 }}>
              {job.discordUsername}
            </Typography>
          </DetailRow>
        </Box>

        {job.goal && (
          <>
            <Divider
              sx={{
                my: 3,
                borderColor: theme => alpha(theme.palette.text.primary, 0.3),
              }}
            />
            <Box>
              <Typography
                variant='h5'
                sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}
              >
                Admin Notes (Admin)
              </Typography>
              <Typography variant='body1' sx={{ lineHeight: 1.8 }}>
                {job.goal}
              </Typography>
            </Box>
          </>
        )}

        {isUserAdmin && (
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant='contained'
              onClick={handleUpdateJob}
              disabled={isSubmitting}
              sx={{
                minWidth: 150,
                background: theme =>
                  `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${
                    theme.palette.primary.dark || theme.palette.primary.main
                  } 100%)`,
              }}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        )}
      </DetailsPaper>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open && !!snackbar.message && snackbar.message.trim() !== ''}
        autoHideDuration={6000}
        onClose={() =>
          setSnackbar({ open: false, message: '', severity: 'success' })
        }
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() =>
            setSnackbar({ open: false, message: '', severity: 'success' })
          }
          severity={snackbar.severity || 'success'}
          variant='filled'
          sx={{ width: '100%', color: 'white' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
