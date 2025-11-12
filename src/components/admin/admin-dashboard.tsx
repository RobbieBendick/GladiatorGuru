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
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Logout as LogoutIcon,
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
  availabilityDateTime: string;
  discordUsername: string;
  goal?: string;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export function AdminDashboard() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [updating, setUpdating] = useState<string | null>(null);

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
  }, [statusFilter]);

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
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
                  <TableCell>Created</TableCell>
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
                      {formatDate(job.availabilityDateTime)}
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
                    <TableCell>{formatDate(job.createdAt)}</TableCell>
                    <TableCell>
                      <IconButton
                        color='error'
                        onClick={() => handleDelete(job._id)}
                        disabled={updating === job._id}
                        size='small'
                      >
                        <DeleteIcon />
                      </IconButton>
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
