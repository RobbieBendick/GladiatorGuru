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
  TextField,
  MenuItem,
  Grid,
  ToggleButtonGroup,
  ToggleButton,
  useTheme,
  InputAdornment,
} from '@mui/material';
import {
  ArrowBack,
  CalendarToday,
  AccessTime,
  Person,
  Edit,
  Save,
  Close,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { ROUTE_PATHS } from '../../schemas/route-paths';
import { API_BASE_URL } from '../../config/api';
import { getAuthToken, isAdmin } from '../../config/auth';
import {
  Class,
  getAvailableVersions,
  getClassesForVersion,
  getSpecsForClass,
  getClassColor,
  WowVersion,
} from '../../constants/wow-classes';

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

// Styled TextField with red required asterisk (matching booking form)
const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiInputLabel-asterisk': {
    color: theme.palette.error.main,
  },
}));

// Styled MenuItem with image (matching booking form)
const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  padding: theme.spacing(1.5, 2),
  '& img': {
    width: 32,
    height: 32,
    objectFit: 'contain',
  },
}));

// Helper functions for images (matching booking form)
const normalizeClassName = (className: string): string => {
  return className.toLowerCase().replace(/\s+/g, '');
};

const normalizeSpecName = (specName: string): string => {
  const normalized = specName.toLowerCase().replace(/\s+/g, '');
  const specNameMap: Record<string, string> = {
    marksmanship: 'marksman',
    beastmastery: 'beastmastery',
    feralcombat: 'feral',
  };
  return specNameMap[normalized] || normalized;
};

const getClassImagePath = (className: string): string => {
  const normalized = normalizeClassName(className);
  return `/class/64/${normalized}.png`;
};

const getSpecImagePath = (className: string, specName: string): string => {
  const normalizedClass = normalizeClassName(className);
  const normalizedSpec = normalizeSpecName(specName);
  return `/spec/${normalizedClass}/${normalizedSpec}.png`;
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

const DISCORD_LOGO_PATH = '/discord.png';

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
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [availableCoaches, setAvailableCoaches] = useState<Coach[]>([]);
  const [formData, setFormData] = useState<Job | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const theme = useTheme();
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

  useEffect(() => {
    if (isEditMode && isUserAdmin) {
      fetchAvailableCoaches();
    }
  }, [isEditMode, isUserAdmin]);

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
    // Initialize formData when job loads
    if (job) {
      setFormData({ ...job });
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

  // Helper functions for date/time parsing
  const parseDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return {
      date: `${year}-${month}-${day}`,
      time: `${hours}:${minutes}`,
    };
  };

  const handleEdit = () => {
    if (job) {
      setFormData({ ...job });
      setIsEditMode(true);
    }
  };

  const handleCancel = () => {
    if (job) {
      setFormData({ ...job });
      setIsEditMode(false);
    }
  };

  const handleFieldChange =
    (field: keyof Job) =>
    (event: React.ChangeEvent<HTMLInputElement | { value: unknown }>) => {
      const value =
        typeof event.target.value === 'string'
          ? event.target.value
          : String(event.target.value);
      setFormData(prev => {
        if (!prev) return null;
        const newData = { ...prev, [field]: value };

        // Reset dependent fields when version or class changes
        if (field === 'version') {
          newData.characterClass = '';
          newData.characterSpec = '';
        } else if (field === 'characterClass') {
          newData.characterSpec = '';
        }

        return newData;
      });
    };

  const handleCoachSelection = (event: any) => {
    const value = event.target.value;
    setFormData(prev => {
      if (!prev) return null;
      // Multi-select returns an array
      const selectedIds = typeof value === 'string' ? value.split(',') : value;
      return {
        ...prev,
        coachIds: Array.isArray(selectedIds) ? selectedIds : [],
      };
    });
  };

  const handleDateTimeChange =
    (field: 'availabilityStartDateTime' | 'availabilityEndDateTime') =>
    (dateField: 'date' | 'time') =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (!formData) return;

      const currentDateTime = formData[field] || new Date().toISOString();
      const { date: currentDate, time: currentTime } =
        parseDateTime(currentDateTime);

      const newValue = event.target.value;
      const newDate = dateField === 'date' ? newValue : currentDate;
      const newTime = dateField === 'time' ? newValue : currentTime;

      const newDateTime = `${newDate}T${newTime}`;

      setFormData(prev => {
        if (!prev) return null;
        return { ...prev, [field]: newDateTime };
      });
    };

  const handleUpdateJob = async () => {
    if (!job || !id || !formData) return;

    try {
      setIsSubmitting(true);
      const token = getAuthToken();

      // Prepare job update data (excluding coachIds)
      const { coachIds, _id, ...jobUpdateData } = formData;

      // Update the job (excluding coachIds)
      const response = await fetch(`${API_BASE_URL}/api/admin/jobs/${id}`, {
        method: 'PATCH',
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(jobUpdateData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        setSnackbar({
          open: true,
          message: errorData.message || 'Failed to update job',
          severity: 'error',
        });
        return;
      }

      // Update coaches separately if coachIds are provided
      if (coachIds !== undefined) {
        const coachesResponse = await fetch(
          `${API_BASE_URL}/api/admin/jobs/${id}/coaches`,
          {
            method: 'PATCH',
            headers: {
              Authorization: token ? `Bearer ${token}` : '',
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ coachIds: coachIds || [] }),
          }
        );

        if (!coachesResponse.ok) {
          const errorData = await coachesResponse.json().catch(() => ({}));
          setSnackbar({
            open: true,
            message: errorData.message || 'Failed to update coaches',
            severity: 'error',
          });
          return;
        }
      }

      // Fetch updated job data
      const updatedResponse = await fetch(`${API_BASE_URL}/api/jobs/${id}`, {
        credentials: 'include',
      });

      if (updatedResponse.ok) {
        const data = await updatedResponse.json();
        const updatedJob = data.data || data;
        setJob(updatedJob);
        setFormData(updatedJob);
        setIsEditMode(false);
        // Refresh coaches display
        if (updatedJob.coachIds && updatedJob.coachIds.length > 0) {
          fetchCoachesForJob(updatedJob);
        } else {
          setCoaches([]);
        }
        setSnackbar({
          open: true,
          message: 'Job updated successfully',
          severity: 'success',
        });
      } else {
        setSnackbar({
          open: true,
          message: 'Job updated but failed to refresh data',
          severity: 'warning',
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

  // MenuProps for select dropdowns (matching booking form)
  const getMenuProps = () => ({
    PaperProps: {
      sx: {
        backgroundColor: theme.palette.mode === 'light' ? '#f5f5f5' : undefined,
      },
    },
  });

  const versions = getAvailableVersions();

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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {isEditMode && formData ? (
              <StyledTextField
                select
                label='Status'
                value={formData.status || 'pending'}
                onChange={handleFieldChange('status')}
                sx={{ minWidth: 150 }}
                SelectProps={{
                  MenuProps: getMenuProps(),
                  renderValue: (value: unknown) => {
                    const status = value as string;
                    return (
                      <Chip
                        label={getStatusLabel(status)}
                        color={getStatusColor(status) as any}
                        size='small'
                        sx={{ fontSize: '0.875rem' }}
                      />
                    );
                  },
                }}
              >
                <MenuItem value='pending'>
                  <Chip
                    label='Pending'
                    color='warning'
                    size='small'
                    sx={{ fontSize: '0.875rem' }}
                  />
                </MenuItem>
                <MenuItem value='accepted'>
                  <Chip
                    label='Accepted'
                    color='success'
                    size='small'
                    sx={{ fontSize: '0.875rem' }}
                  />
                </MenuItem>
                <MenuItem value='approved'>
                  <Chip
                    label='Approved'
                    color='success'
                    size='small'
                    sx={{ fontSize: '0.875rem' }}
                  />
                </MenuItem>
                <MenuItem value='completed'>
                  <Chip
                    label='Completed'
                    color='info'
                    size='small'
                    sx={{ fontSize: '0.875rem' }}
                  />
                </MenuItem>
                <MenuItem value='rejected'>
                  <Chip
                    label='Rejected'
                    color='error'
                    size='small'
                    sx={{ fontSize: '0.875rem' }}
                  />
                </MenuItem>
                <MenuItem value='cancelled'>
                  <Chip
                    label='Cancelled'
                    color='error'
                    size='small'
                    sx={{ fontSize: '0.875rem' }}
                  />
                </MenuItem>
              </StyledTextField>
            ) : (
              <Chip
                label={getStatusLabel(job.status)}
                color={getStatusColor(job.status) as any}
                sx={{ fontSize: '0.9rem', padding: '4px 8px' }}
              />
            )}
            {isUserAdmin && !isEditMode && (
              <Button
                variant='outlined'
                startIcon={<Edit />}
                onClick={handleEdit}
                sx={{ textTransform: 'none' }}
              >
                Edit
              </Button>
            )}
            {isUserAdmin && isEditMode && (
              <>
                <Button
                  variant='outlined'
                  color='error'
                  startIcon={<Close />}
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  sx={{ textTransform: 'none' }}
                >
                  Discard Changes
                </Button>
                <Button
                  variant='contained'
                  startIcon={
                    isSubmitting ? (
                      <CircularProgress size={20} color='inherit' />
                    ) : (
                      <Save />
                    )
                  }
                  onClick={handleUpdateJob}
                  disabled={isSubmitting}
                  sx={{
                    textTransform: 'none',
                    background: theme =>
                      `linear-gradient(135deg, ${
                        theme.palette.primary.main
                      } 0%, ${
                        theme.palette.primary.dark || theme.palette.primary.main
                      } 100%)`,
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: theme =>
                        `0 8px 24px ${alpha(theme.palette.primary.main, 0.4)}`,
                    },
                    transition: 'all 0.3s ease-in-out',
                  }}
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </>
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

          {isEditMode && formData ? (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <StyledTextField
                  fullWidth
                  label='Character Name'
                  value={formData.characterName || ''}
                  onChange={handleFieldChange('characterName')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <StyledTextField
                  fullWidth
                  label='Character Realm'
                  value={formData.characterRealm || ''}
                  onChange={handleFieldChange('characterRealm')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <StyledTextField
                  fullWidth
                  select
                  label='Character Class (Optional)'
                  value={formData.characterClass || ''}
                  onChange={handleFieldChange('characterClass')}
                  disabled={!formData.version}
                  SelectProps={{
                    native: false,
                    renderValue: (value: unknown) => {
                      if (!value || typeof value !== 'string') return '';
                      return (
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                        >
                          <img
                            src={getClassImagePath(value)}
                            alt={value}
                            style={{
                              width: 24,
                              height: 24,
                              objectFit: 'contain',
                            }}
                            onError={e => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                          <Typography sx={{ color: getClassColor(value) }}>
                            {value}
                          </Typography>
                        </Box>
                      );
                    },
                  }}
                >
                  {formData.version
                    ? getClassesForVersion(formData.version as WowVersion).map(
                        (classData: Class) => (
                          <StyledMenuItem
                            key={classData.name}
                            value={classData.name}
                          >
                            <img
                              src={getClassImagePath(classData.name)}
                              alt={classData.name}
                              onError={e => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                            <Typography
                              sx={{ color: getClassColor(classData.name) }}
                            >
                              {classData.name}
                            </Typography>
                          </StyledMenuItem>
                        )
                      )
                    : [
                        <MenuItem key='none' value='' disabled>
                          Select a version first
                        </MenuItem>,
                      ]}
                </StyledTextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <StyledTextField
                  fullWidth
                  select
                  label='Character Spec (Optional)'
                  value={formData.characterSpec || ''}
                  onChange={handleFieldChange('characterSpec')}
                  disabled={!formData.characterClass}
                  SelectProps={{
                    native: false,
                    renderValue: (value: unknown) => {
                      if (
                        !value ||
                        typeof value !== 'string' ||
                        !formData.characterClass
                      )
                        return '';
                      return (
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                        >
                          <img
                            src={getSpecImagePath(
                              formData.characterClass,
                              value
                            )}
                            alt={value}
                            style={{
                              width: 24,
                              height: 24,
                              objectFit: 'contain',
                            }}
                            onError={e => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                          <Typography>{value}</Typography>
                        </Box>
                      );
                    },
                  }}
                >
                  {formData.characterClass
                    ? getSpecsForClass(
                        formData.version as WowVersion,
                        formData.characterClass
                      ).map((spec: string) => (
                        <StyledMenuItem key={spec} value={spec}>
                          <img
                            src={getSpecImagePath(
                              formData.characterClass,
                              spec
                            )}
                            alt={spec}
                            onError={e => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                          <Typography>{spec}</Typography>
                        </StyledMenuItem>
                      ))
                    : [
                        <MenuItem key='none' value='' disabled>
                          Select a class first
                        </MenuItem>,
                      ]}
                </StyledTextField>
              </Grid>
            </Grid>
          ) : (
            <>
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
            </>
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

          {isEditMode && formData ? (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <StyledTextField
                  fullWidth
                  select
                  label='Game Version'
                  value={formData.version || ''}
                  onChange={handleFieldChange('version')}
                  SelectProps={{
                    native: false,
                    MenuProps: getMenuProps(),
                    renderValue: (value: unknown) => {
                      if (!value || typeof value !== 'string') return '';
                      const version = value as WowVersion;
                      return (
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                        >
                          <img
                            src={getVersionImagePath(version)}
                            alt={getVersionDisplayName(version)}
                            style={{
                              width: 24,
                              height: 24,
                              objectFit: 'contain',
                            }}
                            onError={e => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                          <Typography>
                            {getVersionDisplayName(version)}
                          </Typography>
                        </Box>
                      );
                    },
                  }}
                >
                  {versions.map((version: WowVersion) => (
                    <StyledMenuItem key={version} value={version}>
                      <img
                        src={getVersionImagePath(version)}
                        alt={getVersionDisplayName(version)}
                        onError={e => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <Typography>{getVersionDisplayName(version)}</Typography>
                    </StyledMenuItem>
                  ))}
                </StyledTextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <StyledTextField
                  fullWidth
                  type='date'
                  label='Start Date'
                  value={parseDateTime(formData.availabilityStartDateTime).date}
                  onChange={handleDateTimeChange('availabilityStartDateTime')(
                    'date'
                  )}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <StyledTextField
                  fullWidth
                  type='time'
                  label='Start Time'
                  value={parseDateTime(formData.availabilityStartDateTime).time}
                  onChange={handleDateTimeChange('availabilityStartDateTime')(
                    'time'
                  )}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <StyledTextField
                  fullWidth
                  type='date'
                  label='End Date'
                  value={parseDateTime(formData.availabilityEndDateTime).date}
                  onChange={handleDateTimeChange('availabilityEndDateTime')(
                    'date'
                  )}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <StyledTextField
                  fullWidth
                  type='time'
                  label='End Time'
                  value={parseDateTime(formData.availabilityEndDateTime).time}
                  onChange={handleDateTimeChange('availabilityEndDateTime')(
                    'time'
                  )}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <StyledTextField
                  fullWidth
                  select
                  label='Bracket (Optional)'
                  value={formData.bracket || ''}
                  onChange={handleFieldChange('bracket')}
                  SelectProps={{ MenuProps: getMenuProps() }}
                >
                  <MenuItem value=''>None</MenuItem>
                  <MenuItem value='2v2'>2v2</MenuItem>
                  <MenuItem value='3v3'>3v3</MenuItem>
                </StyledTextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant='body2' sx={{ mb: 1 }}>
                  Hours
                </Typography>
                <ToggleButtonGroup
                  value={formData.hours || ''}
                  exclusive
                  onChange={(_, newValue) => {
                    if (newValue !== null && formData) {
                      setFormData({ ...formData, hours: newValue });
                    }
                  }}
                  fullWidth
                  sx={{
                    '& .MuiToggleButtonGroup-grouped': {
                      border: `1px solid ${alpha(
                        theme.palette.primary.main,
                        0.3
                      )}`,
                      padding: theme.spacing(1.5, 2),
                      textTransform: 'none',
                      '&:not(:first-of-type)': {
                        marginTop: 1,
                        borderTop: `1px solid ${alpha(
                          theme.palette.primary.main,
                          0.3
                        )}`,
                      },
                      '&.Mui-selected': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        borderColor: theme.palette.primary.main,
                      },
                    },
                  }}
                >
                  {[1, 2, 3, 4, 5].map(hours => (
                    <ToggleButton key={hours} value={String(hours)}>
                      {hours} Hour{hours > 1 ? 's' : ''}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </Grid>
            </Grid>
          ) : (
            <>
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
            </>
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
            Contact Information
          </Typography>

          {isEditMode && formData ? (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <StyledTextField
                  fullWidth
                  label='Discord Username'
                  value={formData.discordUsername || ''}
                  onChange={handleFieldChange('discordUsername')}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position='start'>
                        <img
                          src={DISCORD_LOGO_PATH}
                          alt='Discord'
                          style={{
                            width: 24,
                            height: 24,
                            objectFit: 'contain',
                          }}
                          onError={e => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
          ) : (
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
          )}
        </Box>

        {isUserAdmin && (
          <>
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
                Assigned Coaches/Admins
              </Typography>

              {isEditMode && formData ? (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <StyledTextField
                      fullWidth
                      select
                      SelectProps={{
                        multiple: true,
                        MenuProps: getMenuProps(),
                        renderValue: (selected: unknown) => {
                          const selectedIds = selected as string[];
                          if (!selectedIds || selectedIds.length === 0) {
                            return (
                              <Typography color='text.secondary'>
                                None selected
                              </Typography>
                            );
                          }
                          return (
                            <Box
                              sx={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: 0.5,
                              }}
                            >
                              {selectedIds.map((coachId: string) => {
                                const coach = availableCoaches.find(
                                  c => c._id === coachId
                                );
                                return (
                                  <Chip
                                    key={coachId}
                                    label={
                                      coach?.username || coach?.name || coachId
                                    }
                                    size='small'
                                    sx={{ fontSize: '0.75rem' }}
                                  />
                                );
                              })}
                            </Box>
                          );
                        },
                      }}
                      value={formData.coachIds || []}
                      onChange={handleCoachSelection}
                      label='Select Coaches/Admins'
                    >
                      {availableCoaches.map((coach: Coach) => (
                        <MenuItem key={coach._id} value={coach._id}>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                            }}
                          >
                            <Typography>
                              {coach.username || coach.name || coach._id}
                            </Typography>
                            <Chip
                              label={coach.role}
                              size='small'
                              color={
                                coach.role === 'admin' ? 'primary' : 'default'
                              }
                              sx={{ fontSize: '0.7rem', height: 20 }}
                            />
                          </Box>
                        </MenuItem>
                      ))}
                    </StyledTextField>
                  </Grid>
                </Grid>
              ) : (
                <>
                  {coaches.length > 0 ? (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {coaches.map((coach: Coach) => (
                        <Chip
                          key={coach._id}
                          label={`${
                            coach.username || coach.name || coach._id
                          } (${coach.role})`}
                          sx={{ fontSize: '0.875rem' }}
                        />
                      ))}
                    </Box>
                  ) : (
                    <Typography variant='body2' color='text.secondary'>
                      No coaches/admins assigned
                    </Typography>
                  )}
                </>
              )}
            </Box>
          </>
        )}

        {(job.goal || (isEditMode && formData)) && (
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
                Goal (Optional)
              </Typography>
              {isEditMode && formData ? (
                <StyledTextField
                  fullWidth
                  label='Goal (Optional)'
                  value={formData.goal || ''}
                  onChange={handleFieldChange('goal')}
                  multiline
                  rows={3}
                  placeholder='e.g., Gladiator, 2200 elite set, etc.'
                />
              ) : job.goal ? (
                <Typography variant='body1' sx={{ lineHeight: 1.8 }}>
                  {job.goal}
                </Typography>
              ) : null}
            </Box>
          </>
        )}
      </DetailsPaper>

      {/* Snackbar */}
      <Snackbar
        open={
          snackbar.open && !!snackbar.message && snackbar.message.trim() !== ''
        }
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
