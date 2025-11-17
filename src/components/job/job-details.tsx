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
  Avatar,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  OutlinedInput,
} from '@mui/material';
import {
  ArrowBack,
  CalendarToday,
  AccessTime,
  Edit,
  Save,
  Cancel,
  PersonAdd,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { ROUTE_PATHS } from '../../schemas/route-paths';
import { API_BASE_URL } from '../../config/api';
import { isAdmin, getAuthToken } from '../../config/auth';

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
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState<Partial<Job>>({});
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity?: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  const [availableCoaches, setAvailableCoaches] = useState<Coach[]>([]);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedCoachIds, setSelectedCoachIds] = useState<string[]>([]);
  const [assigning, setAssigning] = useState(false);

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
        const jobData = data.data || data;
        setJob(jobData);
        setFormData(jobData);
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

  const handleOpenAssignDialog = () => {
    if (!job) return;
    setSelectedCoachIds(job.coachIds || []);
    setAssignDialogOpen(true);
  };

  const handleCloseAssignDialog = () => {
    setAssignDialogOpen(false);
    setSelectedCoachIds([]);
  };

  const handleAssignCoaches = async () => {
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
          body: JSON.stringify({ coachIds: selectedCoachIds }),
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
        handleCloseAssignDialog();
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

  const handleEdit = () => {
    if (!isUserAdmin) {
      return;
    }
    setIsEditMode(true);
    setFormData(job ? { ...job } : {});
  };

  const handleCancel = () => {
    setIsEditMode(false);
    setFormData(job ? { ...job } : {});
  };

  const handleInputChange = (
    field: keyof Job,
    value: string | string[] | undefined
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    if (!id || !formData) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/jobs/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        const updatedJob = data.data || data;
        setJob(updatedJob);
        setFormData(updatedJob);
        setIsEditMode(false);
        setSnackbar({
          open: true,
          message: 'Job updated successfully',
          severity: 'success',
        });
        // Refresh coaches if coachIds changed
        if (updatedJob.coachIds && updatedJob.coachIds.length > 0) {
          fetchCoachesForJob(updatedJob);
        } else {
          setCoaches([]);
        }
      } else {
        const errorData = await response.json();
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
    }
  };

  const formatDateTimeForInput = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
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
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              flexWrap: 'wrap',
            }}
          >
            {coaches.length > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography
                  variant='body2'
                  color='text.secondary'
                  sx={{ mr: 0.5 }}
                >
                  Assigned Coaches:
                </Typography>
                {coaches.map(coach => (
                  <Chip
                    key={coach._id}
                    avatar={
                      <Avatar
                        sx={{ bgcolor: 'primary.main', width: 24, height: 24 }}
                      >
                        {coach.username.charAt(0).toUpperCase()}
                      </Avatar>
                    }
                    label={coach.name || coach.username}
                    size='small'
                    sx={{
                      fontSize: '0.85rem',
                      '& .MuiChip-label': {
                        px: 1,
                      },
                    }}
                  />
                ))}
              </Box>
            )}
            {isEditMode ? (
              <FormControl size='small' sx={{ minWidth: 120 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status || 'pending'}
                  label='Status'
                  onChange={e => handleInputChange('status', e.target.value)}
                >
                  <MenuItem value='pending'>Pending</MenuItem>
                  <MenuItem value='accepted'>Accepted</MenuItem>
                  <MenuItem value='approved'>Approved</MenuItem>
                  <MenuItem value='rejected'>Rejected</MenuItem>
                  <MenuItem value='completed'>Completed</MenuItem>
                  <MenuItem value='cancelled'>Cancelled</MenuItem>
                </Select>
              </FormControl>
            ) : (
              <Chip
                label={getStatusLabel(job.status)}
                color={getStatusColor(job.status) as any}
                sx={{ fontSize: '0.9rem', padding: '4px 8px' }}
              />
            )}
            {isUserAdmin && !isEditMode && (
              <>
                <Button
                  startIcon={<PersonAdd />}
                  onClick={handleOpenAssignDialog}
                  variant='outlined'
                  color='primary'
                >
                  Assign
                </Button>
                <Button
                  startIcon={<Edit />}
                  onClick={handleEdit}
                  variant='outlined'
                  color='primary'
                >
                  Edit
                </Button>
              </>
            )}
            {isUserAdmin && isEditMode && (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  startIcon={<Save />}
                  onClick={handleSave}
                  variant='contained'
                  color='primary'
                >
                  Save
                </Button>
                <Button
                  startIcon={<Cancel />}
                  onClick={handleCancel}
                  variant='outlined'
                  color='secondary'
                >
                  Cancel
                </Button>
              </Box>
            )}
          </Box>
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

          <DetailRow sx={{ gap: 1 }}>
            <Typography
              variant='body2'
              color='text.secondary'
              sx={{ minWidth: 10 }}
            >
              Name:
            </Typography>
            {isEditMode ? (
              <TextField
                size='small'
                value={formData.characterName || ''}
                onChange={e =>
                  handleInputChange('characterName', e.target.value)
                }
                sx={{ flex: 1 }}
              />
            ) : (
              <Typography variant='h6' sx={{ fontWeight: 500 }}>
                {job.characterName}
              </Typography>
            )}
          </DetailRow>

          <DetailRow sx={{ gap: 1 }}>
            <Typography
              variant='body2'
              color='text.secondary'
              sx={{ minWidth: 10 }}
            >
              Realm:
            </Typography>
            {isEditMode ? (
              <TextField
                size='small'
                value={formData.characterRealm || ''}
                onChange={e =>
                  handleInputChange('characterRealm', e.target.value)
                }
                sx={{ flex: 1 }}
              />
            ) : (
              <Typography variant='body1' sx={{ fontWeight: 500 }}>
                {job.characterRealm}
              </Typography>
            )}
          </DetailRow>

          {(job.characterClass || isEditMode) && (
            <DetailRow sx={{ gap: 1 }}>
              <Typography
                variant='body2'
                color='text.secondary'
                sx={{ minWidth: 10 }}
              >
                Class:
              </Typography>
              {isEditMode ? (
                <TextField
                  size='small'
                  value={formData.characterClass || ''}
                  onChange={e =>
                    handleInputChange('characterClass', e.target.value)
                  }
                  sx={{ flex: 1 }}
                />
              ) : (
                <Typography variant='body1' sx={{ fontWeight: 500 }}>
                  {job.characterClass}
                </Typography>
              )}
            </DetailRow>
          )}

          {(job.characterSpec || isEditMode) && (
            <DetailRow sx={{ gap: 1 }}>
              <Typography
                variant='body2'
                color='text.secondary'
                sx={{ minWidth: 10 }}
              >
                Spec:
              </Typography>
              {isEditMode ? (
                <TextField
                  size='small'
                  value={formData.characterSpec || ''}
                  onChange={e =>
                    handleInputChange('characterSpec', e.target.value)
                  }
                  sx={{ flex: 1 }}
                />
              ) : (
                <Typography variant='body1' sx={{ fontWeight: 500 }}>
                  {job.characterSpec}
                </Typography>
              )}
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
            <Box sx={{ flex: 1 }}>
              <Typography
                variant='body2'
                color='text.secondary'
                sx={{ mb: 0.5 }}
              >
                Start Time
              </Typography>
              {isEditMode ? (
                <TextField
                  fullWidth
                  type='datetime-local'
                  size='small'
                  value={
                    formData.availabilityStartDateTime
                      ? formatDateTimeForInput(
                          formData.availabilityStartDateTime
                        )
                      : ''
                  }
                  onChange={e => {
                    const date = new Date(e.target.value);
                    handleInputChange(
                      'availabilityStartDateTime',
                      date.toISOString()
                    );
                  }}
                />
              ) : (
                <Typography variant='body1' sx={{ fontWeight: 500 }}>
                  {formatDateTime(job.availabilityStartDateTime)}
                </Typography>
              )}
            </Box>
          </DetailRow>

          <DetailRow>
            <AccessTime sx={{ color: 'text.primary' }} />
            <Box sx={{ flex: 1 }}>
              <Typography
                variant='body2'
                color='text.secondary'
                sx={{ mb: 0.5 }}
              >
                End Time
              </Typography>
              {isEditMode ? (
                <TextField
                  fullWidth
                  type='datetime-local'
                  size='small'
                  value={
                    formData.availabilityEndDateTime
                      ? formatDateTimeForInput(formData.availabilityEndDateTime)
                      : ''
                  }
                  onChange={e => {
                    const date = new Date(e.target.value);
                    handleInputChange(
                      'availabilityEndDateTime',
                      date.toISOString()
                    );
                  }}
                />
              ) : (
                <Typography variant='body1' sx={{ fontWeight: 500 }}>
                  {formatDateTime(job.availabilityEndDateTime)}
                </Typography>
              )}
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
            {isEditMode ? (
              <TextField
                size='small'
                value={formData.version || ''}
                onChange={e => handleInputChange('version', e.target.value)}
                sx={{ flex: 1 }}
              />
            ) : (
              <Typography variant='body1' sx={{ fontWeight: 500 }}>
                {job.version}
              </Typography>
            )}
          </DetailRow>

          {(job.bracket || isEditMode) && (
            <DetailRow sx={{ gap: 1 }}>
              <Typography
                variant='body2'
                color='text.secondary'
                sx={{ minWidth: 10 }}
              >
                Bracket:
              </Typography>
              {isEditMode ? (
                <TextField
                  size='small'
                  value={formData.bracket || ''}
                  onChange={e => handleInputChange('bracket', e.target.value)}
                  sx={{ flex: 1 }}
                />
              ) : (
                <Typography variant='body1' sx={{ fontWeight: 500 }}>
                  {job.bracket}
                </Typography>
              )}
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
            {isEditMode ? (
              <TextField
                size='small'
                type='number'
                inputProps={{ step: 0.5, min: 0.5, max: 5 }}
                value={formData.hours || ''}
                onChange={e => handleInputChange('hours', e.target.value)}
                sx={{ flex: 1 }}
              />
            ) : (
              <Typography variant='body1' sx={{ fontWeight: 500 }}>
                {job.hours}
              </Typography>
            )}
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
            {isEditMode ? (
              <TextField
                size='small'
                value={formData.discordUsername || ''}
                onChange={e =>
                  handleInputChange('discordUsername', e.target.value)
                }
                sx={{ flex: 1 }}
              />
            ) : (
              <Typography variant='body1' sx={{ fontWeight: 500 }}>
                {job.discordUsername}
              </Typography>
            )}
          </DetailRow>
        </Box>

        {(job.goal || isEditMode) && (
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
                Goal
              </Typography>
              {isEditMode ? (
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  value={formData.goal || ''}
                  onChange={e => handleInputChange('goal', e.target.value)}
                />
              ) : (
                <Typography variant='body1' sx={{ lineHeight: 1.8 }}>
                  {job.goal}
                </Typography>
              )}
            </Box>
          </>
        )}
      </DetailsPaper>

      {/* Assign Coaches Dialog */}
      <Dialog
        open={assignDialogOpen}
        onClose={handleCloseAssignDialog}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>Assign Coaches/Admins to Job</DialogTitle>
        <DialogContent>
          <Typography variant='body2' sx={{ mb: 2, color: 'text.secondary' }}>
            Select coaches or admins for this job. Multiple people can be
            assigned (e.g., for 3v3 games requiring 2 coaches).
          </Typography>
          <FormControl fullWidth>
            <InputLabel>Coaches/Admins</InputLabel>
            <Select
              multiple
              value={selectedCoachIds}
              onChange={e => setSelectedCoachIds(e.target.value as string[])}
              input={<OutlinedInput label='Coaches/Admins' />}
              renderValue={selected => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {(selected as string[]).map(coachId => {
                    const coach = availableCoaches.find(c => c._id === coachId);
                    return (
                      <Chip
                        key={coachId}
                        label={
                          coach
                            ? `${coach.username}${
                                coach.role === 'admin' ? ' (Admin)' : ''
                              }`
                            : coachId
                        }
                        size='small'
                        color={
                          coach?.role === 'admin' ? 'secondary' : 'default'
                        }
                      />
                    );
                  })}
                </Box>
              )}
            >
              {availableCoaches.map(coach => (
                <MenuItem key={coach._id} value={coach._id}>
                  {coach.username} {coach.name && `(${coach.name})`}{' '}
                  {coach.role === 'admin' && '- Admin'}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAssignDialog}>Cancel</Button>
          <Button
            onClick={handleAssignCoaches}
            variant='contained'
            disabled={assigning}
          >
            Assign
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
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
