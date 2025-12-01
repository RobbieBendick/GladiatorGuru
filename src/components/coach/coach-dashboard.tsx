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
  styled,
  CircularProgress,
  Chip,
  Card,
  CardContent,
  Grid,
  alpha,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  CalendarToday as CalendarIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { ROUTE_PATHS } from '../../schemas/route-paths';
import { getAuthToken, removeAuthToken, getUserId } from '../../config/auth';
import { API_BASE_URL } from '../../config/api';
import { formatDateRangeWithTimezone } from '../../utils/timezone';

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
  createdAt: string;
  updatedAt: string;
}

interface DashboardStats {
  total: number;
  pending: number;
  accepted: number;
  completed: number;
  cancelled: number;
}

export function CoachDashboard() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    pending: 0,
    accepted: 0,
    completed: 0,
    cancelled: 0,
  });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();

      const response = await fetch(`${API_BASE_URL}/api/coach/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.status === 401 || response.status === 403) {
        removeAuthToken();
        navigate(ROUTE_PATHS.home);
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setJobs(data.data.jobs || []);
        setStats(data.data.stats || stats);
      }
    } catch (error) {
      console.error('Error fetching coach dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();

      const url =
        statusFilter === 'all'
          ? `${API_BASE_URL}/api/coach/jobs`
          : `${API_BASE_URL}/api/coach/jobs?status=${statusFilter}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.status === 401 || response.status === 403) {
        removeAuthToken();
        navigate(ROUTE_PATHS.home);
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setJobs(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  useEffect(() => {
    if (statusFilter !== 'all') {
      fetchJobs();
    } else {
      fetchDashboard();
    }
  }, [statusFilter]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatAvailabilityRange = (
    startDateTime: string,
    endDateTime: string
  ) => {
    const startDate = new Date(startDateTime);
    const endDate = new Date(endDateTime);
    return formatDateRangeWithTimezone(startDate, endDate);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'success';
      case 'pending':
        return 'warning';
      case 'completed':
        return 'info';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading && jobs.length === 0) {
    return (
      <Container maxWidth='xl' sx={{ py: 4 }}>
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

  return (
    <Container maxWidth='xl' sx={{ py: 4 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <DashboardTitle variant='h2'>Coach Dashboard</DashboardTitle>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant='contained'
            color='primary'
            startIcon={<ScheduleIcon />}
            onClick={() => {
              const userId = getUserId();
              if (userId) {
                navigate(`/${userId}/schedule`);
              }
            }}
          >
            View My Schedule
          </Button>
          <Button
            variant='outlined'
            startIcon={<RefreshIcon />}
            onClick={() => {
              if (statusFilter === 'all') {
                fetchDashboard();
              } else {
                fetchJobs();
              }
            }}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography color='text.secondary' gutterBottom>
                Total Jobs
              </Typography>
              <Typography variant='h4'>{stats.total}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card
            sx={{
              backgroundColor: alpha('#ff9800', 0.1),
              border: '1px solid',
              borderColor: 'warning.main',
            }}
          >
            <CardContent>
              <Typography color='text.secondary' gutterBottom>
                Pending
              </Typography>
              <Typography variant='h4' color='warning.main'>
                {stats.pending}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card
            sx={{
              backgroundColor: alpha('#4caf50', 0.1),
              border: '1px solid',
              borderColor: 'success.main',
            }}
          >
            <CardContent>
              <Typography color='text.secondary' gutterBottom>
                Accepted
              </Typography>
              <Typography variant='h4' color='success.main'>
                {stats.accepted}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card
            sx={{
              backgroundColor: alpha('#2196f3', 0.1),
              border: '1px solid',
              borderColor: 'info.main',
            }}
          >
            <CardContent>
              <Typography color='text.secondary' gutterBottom>
                Completed
              </Typography>
              <Typography variant='h4' color='info.main'>
                {stats.completed}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card
            sx={{
              backgroundColor: alpha('#f44336', 0.1),
              border: '1px solid',
              borderColor: 'error.main',
            }}
          >
            <CardContent>
              <Typography color='text.secondary' gutterBottom>
                Cancelled
              </Typography>
              <Typography variant='h4' color='error.main'>
                {stats.cancelled}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <DashboardPaper elevation={3}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
          }}
        >
          <Typography variant='h5' sx={{ fontWeight: 600 }}>
            My Assigned Jobs
          </Typography>
          <FormControl size='small' sx={{ minWidth: 150 }}>
            <InputLabel>Filter by Status</InputLabel>
            <Select
              value={statusFilter}
              label='Filter by Status'
              onChange={e => setStatusFilter(e.target.value)}
            >
              <MenuItem value='all'>All</MenuItem>
              <MenuItem value='pending'>Pending</MenuItem>
              <MenuItem value='accepted'>Accepted</MenuItem>
              <MenuItem value='completed'>Completed</MenuItem>
              <MenuItem value='cancelled'>Cancelled</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : jobs.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CalendarIcon
              sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }}
            />
            <Typography variant='h6' color='text.secondary'>
              No jobs assigned yet
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
              Jobs assigned to you will appear here
            </Typography>
          </Box>
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
                  <TableCell>Availability</TableCell>
                  <TableCell>Discord</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {jobs.map(job => (
                  <TableRow key={job._id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant='body2' sx={{ fontWeight: 600 }}>
                          {job.characterName}
                        </Typography>
                        {job.characterClass && job.characterSpec && (
                          <Typography variant='caption' color='text.secondary'>
                            {job.characterClass} - {job.characterSpec}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>{job.characterRealm}</TableCell>
                    <TableCell>{job.version}</TableCell>
                    <TableCell>{job.bracket}</TableCell>
                    <TableCell>{job.hours}</TableCell>
                    <TableCell>
                      <Typography variant='body2' sx={{ fontSize: '0.875rem' }}>
                        {formatAvailabilityRange(
                          job.availabilityStartDateTime,
                          job.availabilityEndDateTime
                        )}
                      </Typography>
                    </TableCell>
                    <TableCell>{job.discordUsername}</TableCell>
                    <TableCell>
                      <Chip
                        label={job.status}
                        color={getStatusColor(job.status) as any}
                        size='small'
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        size='small'
                        variant='outlined'
                        onClick={() => navigate(`/job/${job._id}`)}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DashboardPaper>
    </Container>
  );
}
