import { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  alpha,
  styled,
  Tabs,
  Tab,
  TextField,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  Divider,
  FormControlLabel,
  Switch,
  Chip,
} from '@mui/material';
import {
  Save,
  Person,
  Notifications,
  Schedule,
  Add,
  Delete,
} from '@mui/icons-material';
import { MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { AvailabilitySlot } from '../../contexts/UserContext';
import { API_BASE_URL } from '../../config/api';
import { getAuthToken } from '../../config/auth';
import { useUser } from '../../contexts/UserContext';
import { getTimezoneAbbreviation } from '../../utils/timezone';

const SettingsPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius * 3,
  backgroundColor:
    theme.palette.mode === 'light'
      ? alpha(theme.palette.background.default, 0.8)
      : alpha(theme.palette.background.default, 0.5),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
}));

const TabPanel = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3, 0),
}));

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <TabPanel>{children}</TabPanel>}
    </div>
  );
}

export function Settings() {
  const { user, refreshUser } = useUser();
  const [tabValue, setTabValue] = useState(0);
  const [coachAlias, setCoachAlias] = useState('');
  const [originalCoachAlias, setOriginalCoachAlias] = useState('');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [emailAddress, setEmailAddress] = useState('');
  const [originalEmailAddress, setOriginalEmailAddress] = useState('');
  const [jobAssignmentNotifications, setJobAssignmentNotifications] =
    useState(true);
  const [originalNotifications, setOriginalNotifications] = useState({
    email: true,
    jobAssignment: true,
  });
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [originalAvailability, setOriginalAvailability] = useState<
    AvailabilitySlot[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity?: 'success' | 'error' | 'warning' | 'info';
  }>({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'coach')) {
      const alias = user.coachAlias || '';
      setCoachAlias(alias);
      setOriginalCoachAlias(alias);
    }
    if (user?.availability) {
      setAvailability(user.availability);
      setOriginalAvailability(user.availability);
    } else {
      setAvailability([]);
      setOriginalAvailability([]);
    }
  }, [user]);

  // Check if user is admin or coach
  const isAdminOrCoach = user?.role === 'admin' || user?.role === 'coach';

  // Check if there are any changes
  const hasProfileChanges = coachAlias.trim() !== originalCoachAlias;
  const hasNotificationChanges =
    emailNotifications !== originalNotifications.email ||
    emailAddress.trim() !== originalEmailAddress ||
    jobAssignmentNotifications !== originalNotifications.jobAssignment;
  const hasAvailabilityChanges =
    JSON.stringify(availability) !== JSON.stringify(originalAvailability);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();

      if (!token) {
        setSnackbar({
          open: true,
          message: 'You must be logged in to update your profile',
          severity: 'error',
        });
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          coachAlias: coachAlias.trim() || null,
        }),
      });

      if (response.ok) {
        setSnackbar({
          open: true,
          message: 'Profile updated successfully!',
          severity: 'success',
        });
        // Update original value to match new value
        const newAlias = coachAlias.trim() || '';
        setOriginalCoachAlias(newAlias);
        // Refresh user context to get updated data
        await refreshUser();
      } else {
        const errorData = await response.json().catch(() => ({}));
        setSnackbar({
          open: true,
          message:
            errorData.errorMessage ||
            'Failed to update profile. Please try again.',
          severity: 'error',
        });
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setSnackbar({
        open: true,
        message: 'An error occurred. Please try again.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAvailability = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();

      if (!token) {
        setSnackbar({
          open: true,
          message: 'You must be logged in to update your availability',
          severity: 'error',
        });
        return;
      }

      // Validate availability slots
      for (let i = 0; i < availability.length; i++) {
        const slot = availability[i];
        const [startHours, startMinutes] = slot.startTime
          .split(':')
          .map(Number);
        const [endHours, endMinutes] = slot.endTime.split(':').map(Number);
        const startTotalMinutes = startHours * 60 + startMinutes;
        const endTotalMinutes = endHours * 60 + endMinutes;

        if (endTotalMinutes <= startTotalMinutes) {
          setSnackbar({
            open: true,
            message: `Time slot ${i + 1}: End time must be after start time`,
            severity: 'error',
          });
          return;
        }
      }

      // Get the coach's current timezone
      const coachTimezone = getTimezoneAbbreviation();

      const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          availability: availability,
          timezone: coachTimezone, // Save coach's timezone when setting availability
        }),
      });

      if (response.ok) {
        setSnackbar({
          open: true,
          message: 'Availability updated successfully!',
          severity: 'success',
        });
        setOriginalAvailability(availability);
        await refreshUser();
      } else {
        const errorData = await response.json().catch(() => ({}));
        setSnackbar({
          open: true,
          message:
            errorData.errorMessage ||
            'Failed to update availability. Please try again.',
          severity: 'error',
        });
      }
    } catch (error: any) {
      console.error('Error updating availability:', error);
      setSnackbar({
        open: true,
        message: 'An error occurred. Please try again.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();

      if (!token) {
        setSnackbar({
          open: true,
          message: 'You must be logged in to update your preferences',
          severity: 'error',
        });
        return;
      }

      // Validate email if notifications are enabled
      if (emailNotifications && emailAddress.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailAddress.trim())) {
          setSnackbar({
            open: true,
            message: 'Please enter a valid email address',
            severity: 'error',
          });
          return;
        }
      }

      // Save email to backend if notifications are enabled
      if (emailNotifications && emailAddress.trim()) {
        const profileResponse = await fetch(
          `${API_BASE_URL}/api/auth/profile`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            credentials: 'include',
            body: JSON.stringify({
              email: emailAddress.trim(),
            }),
          }
        );

        if (!profileResponse.ok) {
          const errorData = await profileResponse.json().catch(() => ({}));
          setSnackbar({
            open: true,
            message:
              errorData.errorMessage ||
              'Failed to save email address. Please try again.',
            severity: 'error',
          });
          return;
        }
      } else if (!emailNotifications) {
        // Clear email from backend if notifications are disabled
        const profileResponse = await fetch(
          `${API_BASE_URL}/api/auth/profile`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            credentials: 'include',
            body: JSON.stringify({
              email: null,
            }),
          }
        );
        // Don't fail if this fails, just log it
        if (!profileResponse.ok) {
          console.error('Failed to clear email address');
        }
      }

      // Save notification preferences to localStorage
      localStorage.setItem(
        'notification_preferences',
        JSON.stringify({
          email: emailNotifications,
          emailAddress: emailAddress.trim(),
          jobAssignment: jobAssignmentNotifications,
        })
      );

      setSnackbar({
        open: true,
        message: 'Notification preferences saved!',
        severity: 'success',
      });

      setOriginalNotifications({
        email: emailNotifications,
        jobAssignment: jobAssignmentNotifications,
      });
      setOriginalEmailAddress(emailAddress.trim());

      // Refresh user context to get updated email
      await refreshUser();
    } catch (error: any) {
      console.error('Error updating notifications:', error);
      setSnackbar({
        open: true,
        message: 'An error occurred. Please try again.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load email from user context if available
    if (user?.email) {
      setEmailAddress(user.email);
      setOriginalEmailAddress(user.email);
      setEmailNotifications(true);
      setOriginalNotifications(prev => ({ ...prev, email: true }));
    }

    // Load notification preferences from localStorage
    const savedPrefs = localStorage.getItem('notification_preferences');
    if (savedPrefs) {
      try {
        const prefs = JSON.parse(savedPrefs);
        // Only use localStorage prefs if user doesn't have email in profile
        if (!user?.email) {
          setEmailAddress(prefs.emailAddress || '');
          setOriginalEmailAddress(prefs.emailAddress || '');
        }
        setEmailNotifications(prefs.email ?? !!user?.email);
        setJobAssignmentNotifications(prefs.jobAssignment ?? true);
        setOriginalNotifications({
          email: prefs.email ?? !!user?.email,
          jobAssignment: prefs.jobAssignment ?? true,
        });
      } catch (e) {
        // Invalid JSON, use defaults
      }
    }
  }, [user]);

  return (
    <Container maxWidth='md' sx={{ px: { xs: 1, md: 3 } }} disableGutters>
      <SettingsPaper elevation={3}>
        <Typography
          variant='h2'
          sx={{
            fontWeight: 700,
            mb: 1,
            background: theme => theme.palette.text.primary,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: { xs: '2rem', md: '3rem' },
          }}
        >
          Settings
        </Typography>
        <Typography
          variant='body1'
          color='text.secondary'
          sx={{ mb: 3, fontSize: { xs: '1rem', md: '1.1rem' } }}
        >
          Manage your account settings and preferences
        </Typography>

        <Divider sx={{ mb: 3 }} />

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label='settings tabs'
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 600,
              },
            }}
          >
            <Tab
              icon={<Person />}
              iconPosition='start'
              label='Account'
              id='settings-tab-0'
            />
            {isAdminOrCoach && (
              <Tab
                icon={<Person />}
                iconPosition='start'
                label='Profile'
                id='settings-tab-1'
              />
            )}
            {isAdminOrCoach && (
              <Tab
                icon={<Notifications />}
                iconPosition='start'
                label='Notifications'
                id='settings-tab-2'
              />
            )}
            {isAdminOrCoach && (
              <Tab
                icon={<Schedule />}
                iconPosition='start'
                label='Availability'
                id='settings-tab-3'
              />
            )}
          </Tabs>
        </Box>

        {/* Account Tab */}
        <CustomTabPanel value={tabValue} index={0}>
          <Typography
            variant='h5'
            sx={{
              fontWeight: 600,
              mb: 3,
              fontSize: { xs: '1.25rem', md: '1.5rem' },
            }}
          >
            Account Information
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Box>
              <Typography
                variant='body2'
                color='text.secondary'
                sx={{ mb: 0.5 }}
              >
                Username
              </Typography>
              <Typography variant='body1' sx={{ fontWeight: 500 }}>
                {user?.username || 'N/A'}
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography
                variant='body2'
                color='text.secondary'
                sx={{ mb: 0.5 }}
              >
                Role
              </Typography>
              <Chip
                label={
                  user?.role === 'admin'
                    ? 'Admin'
                    : user?.role === 'coach'
                    ? 'Coach'
                    : 'User'
                }
                color={
                  user?.role === 'admin'
                    ? 'primary'
                    : user?.role === 'coach'
                    ? 'secondary'
                    : 'default'
                }
                size='small'
              />
            </Box>

            {user?.discordUsername && (
              <>
                <Divider />
                <Box>
                  <Typography
                    variant='body2'
                    color='text.secondary'
                    sx={{ mb: 0.5 }}
                  >
                    Discord Username
                  </Typography>
                  <Typography variant='body1' sx={{ fontWeight: 500 }}>
                    {user.discordUsername}
                  </Typography>
                </Box>
              </>
            )}
          </Box>
        </CustomTabPanel>

        {/* Profile Tab - Admin/Coach Only */}
        {isAdminOrCoach && (
          <CustomTabPanel value={tabValue} index={1}>
            <Typography
              variant='h5'
              sx={{
                fontWeight: 600,
                mb: 3,
                fontSize: { xs: '1.25rem', md: '1.5rem' },
              }}
            >
              Profile Information
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                label='Coach Alias'
                value={coachAlias}
                onChange={e => setCoachAlias(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && hasProfileChanges && !loading) {
                    handleSaveProfile();
                  }
                }}
                placeholder='Enter your coach alias (optional)'
                helperText='This alias will be displayed on your schedule instead of your username. Leave empty to use your username.'
                fullWidth
                inputProps={{
                  maxLength: 50,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: theme => theme.shape.borderRadius * 1.5,
                  },
                }}
              />

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant='contained'
                  startIcon={
                    loading ? <CircularProgress size={20} /> : <Save />
                  }
                  onClick={handleSaveProfile}
                  disabled={loading || !hasProfileChanges}
                  sx={{
                    textTransform: 'none',
                    borderRadius: theme => theme.shape.borderRadius * 1.5,
                  }}
                >
                  Save Changes
                </Button>
              </Box>
            </Box>
          </CustomTabPanel>
        )}

        {/* Notifications Tab - Admin/Coach Only */}
        {isAdminOrCoach && (
          <CustomTabPanel value={tabValue} index={2}>
            <Typography
              variant='h5'
              sx={{
                fontWeight: 600,
                mb: 3,
                fontSize: { xs: '1.25rem', md: '1.5rem' },
              }}
            >
              Notification Preferences
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: theme => theme.shape.borderRadius * 1.5,
                  border: theme =>
                    `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                }}
              >
                <FormControlLabel
                  control={
                    <Switch
                      checked={emailNotifications}
                      onChange={e => setEmailNotifications(e.target.checked)}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant='body1' sx={{ fontWeight: 500 }}>
                        Email Notifications
                      </Typography>
                      <Typography variant='body2' color='text.secondary'>
                        Receive email updates about your account and job
                        assignments
                      </Typography>
                    </Box>
                  }
                />
                {emailNotifications && (
                  <Box sx={{ mt: 2 }}>
                    <TextField
                      label='Email Address'
                      type='email'
                      value={emailAddress}
                      onChange={e => setEmailAddress(e.target.value)}
                      placeholder='Enter your email address'
                      helperText="We'll send notifications to this email address"
                      fullWidth
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: theme => theme.shape.borderRadius * 1.5,
                        },
                      }}
                    />
                  </Box>
                )}
              </Box>

              <Box
                sx={{
                  p: 2,
                  borderRadius: theme => theme.shape.borderRadius * 1.5,
                  border: theme =>
                    `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                }}
              >
                <FormControlLabel
                  control={
                    <Switch
                      checked={jobAssignmentNotifications}
                      onChange={e =>
                        setJobAssignmentNotifications(e.target.checked)
                      }
                    />
                  }
                  label={
                    <Box>
                      <Typography variant='body1' sx={{ fontWeight: 500 }}>
                        Job Assignment Notifications
                      </Typography>
                      <Typography variant='body2' color='text.secondary'>
                        Get notified when you're assigned to new coaching jobs
                      </Typography>
                    </Box>
                  }
                />
              </Box>

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant='contained'
                  startIcon={
                    loading ? <CircularProgress size={20} /> : <Save />
                  }
                  onClick={handleSaveNotifications}
                  disabled={loading || !hasNotificationChanges}
                  sx={{
                    textTransform: 'none',
                    borderRadius: theme => theme.shape.borderRadius * 1.5,
                  }}
                >
                  Save Changes
                </Button>
              </Box>
            </Box>
          </CustomTabPanel>
        )}

        {/* Availability Tab - Admin/Coach Only */}
        {isAdminOrCoach && (
          <CustomTabPanel value={tabValue} index={3}>
            <Typography
              variant='h5'
              sx={{
                fontWeight: 600,
                mb: 3,
                fontSize: { xs: '1.25rem', md: '1.5rem' },
              }}
            >
              Time Availability
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
              Set your recurring weekly availability. Bookings cannot be made
              outside of these time slots on your schedule.
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {availability.map((slot, index) => (
                <Box
                  key={index}
                  sx={{
                    p: 2,
                    borderRadius: theme => theme.shape.borderRadius * 1.5,
                    border: theme =>
                      `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                    display: 'flex',
                    gap: 2,
                    alignItems: 'center',
                    flexWrap: 'wrap',
                  }}
                >
                  <FormControl sx={{ minWidth: 150 }}>
                    <InputLabel>Day of Week</InputLabel>
                    <Select
                      value={slot.dayOfWeek}
                      label='Day of Week'
                      onChange={e => {
                        const newAvailability = [...availability];
                        newAvailability[index].dayOfWeek = Number(
                          e.target.value
                        );
                        setAvailability(newAvailability);
                      }}
                    >
                      <MenuItem value={0}>Sunday</MenuItem>
                      <MenuItem value={1}>Monday</MenuItem>
                      <MenuItem value={2}>Tuesday</MenuItem>
                      <MenuItem value={3}>Wednesday</MenuItem>
                      <MenuItem value={4}>Thursday</MenuItem>
                      <MenuItem value={5}>Friday</MenuItem>
                      <MenuItem value={6}>Saturday</MenuItem>
                    </Select>
                  </FormControl>

                  <TextField
                    label='Start Time'
                    type='time'
                    value={slot.startTime}
                    onChange={e => {
                      const newAvailability = [...availability];
                      newAvailability[index].startTime = e.target.value;
                      setAvailability(newAvailability);
                    }}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    inputProps={{
                      step: 300, // 5 minutes
                    }}
                    sx={{
                      minWidth: 150,
                      '& input[type="time"]::-webkit-calendar-picker-indicator':
                        {
                          filter: theme =>
                            theme.palette.mode === 'dark'
                              ? 'invert(1)'
                              : 'none',
                          cursor: 'pointer',
                          opacity: 1,
                        },
                      '& input[type="time"]': {
                        color: theme => theme.palette.text.primary,
                      },
                    }}
                  />

                  <TextField
                    label='End Time'
                    type='time'
                    value={slot.endTime}
                    onChange={e => {
                      const newAvailability = [...availability];
                      newAvailability[index].endTime = e.target.value;
                      setAvailability(newAvailability);
                    }}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    inputProps={{
                      step: 300, // 5 minutes
                    }}
                    sx={{
                      minWidth: 150,
                      '& input[type="time"]::-webkit-calendar-picker-indicator':
                        {
                          filter: theme =>
                            theme.palette.mode === 'dark'
                              ? 'invert(1)'
                              : 'none',
                          cursor: 'pointer',
                          opacity: 1,
                        },
                      '& input[type="time"]': {
                        color: theme => theme.palette.text.primary,
                      },
                    }}
                  />

                  <Button
                    variant='outlined'
                    color='error'
                    startIcon={<Delete />}
                    onClick={() => {
                      const newAvailability = availability.filter(
                        (_, i) => i !== index
                      );
                      setAvailability(newAvailability);
                    }}
                    sx={{ ml: 'auto' }}
                  >
                    Remove
                  </Button>
                </Box>
              ))}

              <Button
                variant='outlined'
                startIcon={<Add />}
                onClick={() => {
                  setAvailability([
                    ...availability,
                    { dayOfWeek: 1, startTime: '09:00', endTime: '17:00' },
                  ]);
                }}
                sx={{
                  alignSelf: 'flex-start',
                  textTransform: 'none',
                  borderRadius: theme => theme.shape.borderRadius * 1.5,
                }}
              >
                Add Time Slot
              </Button>

              {availability.length === 0 && (
                <Alert severity='info' sx={{ mt: 2 }}>
                  No availability slots set. Add time slots to restrict when
                  bookings can be made on your schedule.
                </Alert>
              )}

              <Box
                sx={{
                  display: 'flex',
                  gap: 2,
                  justifyContent: 'flex-end',
                  mt: 2,
                }}
              >
                <Button
                  variant='contained'
                  startIcon={
                    loading ? <CircularProgress size={20} /> : <Save />
                  }
                  onClick={handleSaveAvailability}
                  disabled={loading || !hasAvailabilityChanges}
                  sx={{
                    textTransform: 'none',
                    borderRadius: theme => theme.shape.borderRadius * 1.5,
                  }}
                >
                  Save Changes
                </Button>
              </Box>
            </Box>
          </CustomTabPanel>
        )}
      </SettingsPaper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
