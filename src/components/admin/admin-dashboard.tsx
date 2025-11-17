import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  styled,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  OutlinedInput,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Logout as LogoutIcon,
  People as PeopleIcon,
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { ROUTE_PATHS } from '../../schemas/route-paths';
import { getAuthToken, removeAuthToken } from '../../config/auth';
import { API_BASE_URL } from '../../config/api';

const DashboardPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 2,
}));

const DashboardTitle = styled(Typography)(({ theme }) => ({
  fontSize: '2rem',
  fontWeight: 700,
  marginBottom: theme.spacing(2),
  color: theme.palette.text.primary,
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
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
  coachIds?: string[];
  createdAt: string;
  updatedAt: string;
}

interface Coach {
  _id: string;
  username: string;
  name?: string;
  role: string;
}

export function AdminDashboard() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [updating, setUpdating] = useState<string | null>(null);
  const [assignCoachDialogOpen, setAssignCoachDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedCoachIds, setSelectedCoachIds] = useState<string[]>([]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();

      const url =
        statusFilter === 'all'
          ? `${API_BASE_URL}/api/admin/jobs`
          : `${API_BASE_URL}/api/admin/jobs?status=${statusFilter}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.status === 401 || response.status === 403) {
        // Unauthorized - redirect to login
        removeAuthToken();
        navigate(ROUTE_PATHS.adminLogin);
        return;
      }

      const data = await response.json();

      if (data.data) {
        setJobs(data.data);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchCoaches();
  }, [statusFilter]);

  const fetchCoaches = async () => {
    try {
      const token = getAuthToken();
      // Fetch both coaches and admins
      const [coachesResponse, adminsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/admin/users?role=coach`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }),
        fetch(`${API_BASE_URL}/api/admin/users?role=admin`, {
          headers: {
            Authorization: `Bearer ${token}`,
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

      setCoaches(allUsers);
    } catch (error) {
      console.error('Error fetching coaches and admins:', error);
    }
  };

  const handleStatusChange = async (jobId: string, newStatus: string) => {
    try {
      setUpdating(jobId);
      const token = getAuthToken();

      const response = await fetch(
        `${API_BASE_URL}/api/admin/jobs/${jobId}/status`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (response.status === 401 || response.status === 403) {
        removeAuthToken();
        navigate(ROUTE_PATHS.adminLogin);
        return;
      }

      if (response.ok) {
        await fetchJobs();
      }
    } catch (error) {
      console.error('Error updating job status:', error);
    } finally {
      setUpdating(null);
    }
  };

  const handleDelete = async (jobId: string) => {
    if (!window.confirm('Are you sure you want to delete this job?')) {
      return;
    }

    try {
      setUpdating(jobId);
      const token = getAuthToken();

      const response = await fetch(`${API_BASE_URL}/api/admin/jobs/${jobId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.status === 401 || response.status === 403) {
        removeAuthToken();
        navigate(ROUTE_PATHS.adminLogin);
        return;
      }

      if (response.ok) {
        await fetchJobs();
      }
    } catch (error) {
      console.error('Error deleting job:', error);
    } finally {
      setUpdating(null);
    }
  };

  const handleLogout = () => {
    removeAuthToken();
    navigate(ROUTE_PATHS.adminLogin);
  };

  const handleOpenAssignCoachDialog = (job: Job) => {
    setSelectedJob(job);
    setSelectedCoachIds(job.coachIds || []);
    setAssignCoachDialogOpen(true);
  };

  const handleCloseAssignCoachDialog = () => {
    setAssignCoachDialogOpen(false);
    setSelectedJob(null);
    setSelectedCoachIds([]);
  };

  const handleAssignCoaches = async () => {
    if (!selectedJob) return;

    try {
      setUpdating(selectedJob._id);
      const token = getAuthToken();

      const response = await fetch(
        `${API_BASE_URL}/api/admin/jobs/${selectedJob._id}/coaches`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ coachIds: selectedCoachIds }),
        }
      );

      if (response.status === 401 || response.status === 403) {
        removeAuthToken();
        navigate(ROUTE_PATHS.adminLogin);
        return;
      }

      if (response.ok) {
        await fetchJobs();
        handleCloseAssignCoachDialog();
      }
    } catch (error) {
      console.error('Error assigning coaches:', error);
    } finally {
      setUpdating(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatAvailabilityRange = (
    startDateTime: string,
    endDateTime: string
  ) => {
    const startDate = new Date(startDateTime);
    const endDate = new Date(endDateTime);

    // Check if both dates are on the same day
    const isSameDay =
      startDate.getFullYear() === endDate.getFullYear() &&
      startDate.getMonth() === endDate.getMonth() &&
      startDate.getDate() === endDate.getDate();

    if (isSameDay) {
      // Same day: show date once, then time range
      const dateStr = startDate.toLocaleDateString();
      const startTime = startDate.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
      const endTime = endDate.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
      return `${dateStr} ${startTime} - ${endTime}`;
    } else {
      // Different days: show full date range
      return `${formatDate(startDateTime)} - ${formatDate(endDateTime)}`;
    }
  };

  return (
    <Container maxWidth='xl' sx={{ py: 4 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
        }}
      >
        <DashboardTitle variant='h2'>Admin Dashboard</DashboardTitle>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button
            variant='outlined'
            startIcon={<PeopleIcon />}
            onClick={() => navigate('/admin/coaches')}
          >
            View Coaches
          </Button>
          <Button
            variant='outlined'
            startIcon={<RefreshIcon />}
            onClick={fetchJobs}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            variant='outlined'
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            color='error'
          >
            Logout
          </Button>
        </Box>
      </Box>

      <Box sx={{ mb: 3 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Status</InputLabel>
          <Select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            label='Filter by Status'
          >
            <MenuItem value='all'>All</MenuItem>
            <MenuItem value='pending'>Pending</MenuItem>
            <MenuItem value='accepted'>Accepted</MenuItem>
            <MenuItem value='completed'>Completed</MenuItem>
            <MenuItem value='cancelled'>Cancelled</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <DashboardPaper>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : jobs.length === 0 ? (
          <Typography
            variant='body1'
            color='text.secondary'
            sx={{ textAlign: 'center', py: 4 }}
          >
            No jobs found
          </Typography>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Character</TableCell>
                  <TableCell>Realm</TableCell>
                  <TableCell>Version</TableCell>
                  <TableCell>Bracket</TableCell>
                  <TableCell>Hours</TableCell>
                  <TableCell>Class/Spec</TableCell>
                  <TableCell>Discord</TableCell>
                  <TableCell>Availability</TableCell>
                  <TableCell>Goal</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Coaches</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {jobs.map(job => (
                  <TableRow key={job._id}>
                    <TableCell>{job.characterName}</TableCell>
                    <TableCell>{job.characterRealm}</TableCell>
                    <TableCell>{job.version}</TableCell>
                    <TableCell>{job.bracket}</TableCell>
                    <TableCell>{job.hours}</TableCell>
                    <TableCell>
                      {job.characterClass} / {job.characterSpec}
                    </TableCell>
                    <TableCell>{job.discordUsername}</TableCell>
                    <TableCell>
                      {formatAvailabilityRange(
                        job.availabilityStartDateTime,
                        job.availabilityEndDateTime
                      )}
                    </TableCell>
                    <TableCell>{job.goal || '-'}</TableCell>
                    <TableCell>
                      <Select
                        value={job.status}
                        onChange={e =>
                          handleStatusChange(job._id, e.target.value)
                        }
                        size='small'
                        disabled={updating === job._id}
                      >
                        <MenuItem value='pending'>Pending</MenuItem>
                        <MenuItem value='accepted'>Accepted</MenuItem>
                        <MenuItem value='completed'>Completed</MenuItem>
                        <MenuItem value='cancelled'>Cancelled</MenuItem>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {job.coachIds && job.coachIds.length > 0 ? (
                          job.coachIds.map((coachId: string) => {
                            const coach = coaches.find(c => c._id === coachId);
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
                                variant='outlined'
                                color={
                                  coach?.role === 'admin'
                                    ? 'secondary'
                                    : 'default'
                                }
                              />
                            );
                          })
                        ) : (
                          <Typography variant='body2' color='text.secondary'>
                            No coaches/admins
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          variant='outlined'
                          color='primary'
                          onClick={() => handleOpenAssignCoachDialog(job)}
                          disabled={updating === job._id}
                          size='small'
                          startIcon={<PersonAddIcon />}
                          sx={{ textTransform: 'none' }}
                        >
                          Assign
                        </Button>
                        <IconButton
                          color='error'
                          onClick={() => handleDelete(job._id)}
                          disabled={updating === job._id}
                          size='small'
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DashboardPaper>

      {/* Assign Coaches Dialog */}
      <Dialog
        open={assignCoachDialogOpen}
        onClose={handleCloseAssignCoachDialog}
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
                    const coach = coaches.find(c => c._id === coachId);
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
              {coaches.map(coach => (
                <MenuItem key={coach._id} value={coach._id}>
                  {coach.username} {coach.name && `(${coach.name})`}{' '}
                  {coach.role === 'admin' && '- Admin'}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAssignCoachDialog}>Cancel</Button>
          <Button
            onClick={handleAssignCoaches}
            variant='contained'
            disabled={updating === selectedJob?._id}
          >
            Assign
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
