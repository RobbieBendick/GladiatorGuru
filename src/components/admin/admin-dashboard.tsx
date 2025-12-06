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
  Checkbox,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  PersonAdd as PersonAddIcon,
  DeleteSweep as DeleteSweepIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { ROUTE_PATHS } from '../../schemas/route-paths';
import { getAuthToken, removeAuthToken } from '../../config/auth';
import { API_BASE_URL } from '../../config/api';
import { formatDateRangeWithTimezone } from '../../utils/timezone';
import { JOB_STATUS_FILTER_OPTIONS } from '../../constants/job-status';

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
  status: 'pending' | 'accepted' | 'approved' | 'completed' | 'cancelled';
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
  // Initialize status filter from localStorage or default to 'active'
  const [statusFilter, setStatusFilter] = useState<string>(() => {
    const savedFilter = localStorage.getItem('adminDashboardStatusFilter');
    return savedFilter || 'active';
  });
  const [updating, setUpdating] = useState<string | null>(null);
  const [assignCoachDialogOpen, setAssignCoachDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedCoachIds, setSelectedCoachIds] = useState<string[]>([]);
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedJobIds, setSelectedJobIds] = useState<Set<string>>(new Set());
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();

      // For 'all' and 'active' filters, we need to fetch all jobs and filter client-side
      // For other statuses, we can use the API filter
      const url =
        statusFilter === 'all' || statusFilter === 'active'
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
        navigate(ROUTE_PATHS.login);
        return;
      }

      const data = await response.json();

      if (data.data) {
        const fetchedJobs = data.data;

        // Filter for active jobs (pending, accepted, approved)
        if (statusFilter === 'active') {
          const activeJobs = fetchedJobs.filter(
            (job: Job) =>
              job.status === 'pending' ||
              job.status === 'accepted' ||
              job.status === 'approved'
          );
          setJobs(activeJobs);
        } else {
          // For 'all' or specific status, show all fetched jobs
          setJobs(fetchedJobs);
        }
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

  // Save status filter to localStorage whenever it changes
  useEffect(() => {
    if (statusFilter) {
      localStorage.setItem('adminDashboardStatusFilter', statusFilter);
    }
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
        navigate(ROUTE_PATHS.login);
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
        navigate(ROUTE_PATHS.login);
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

  const handleToggleDeleteMode = () => {
    setDeleteMode(!deleteMode);
    setSelectedJobIds(new Set());
  };

  const handleToggleJobSelection = (jobId: string) => {
    setSelectedJobIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(jobId)) {
        newSet.delete(jobId);
      } else {
        newSet.add(jobId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedJobIds.size === jobs.length) {
      setSelectedJobIds(new Set());
    } else {
      setSelectedJobIds(new Set(jobs.map(job => job._id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedJobIds.size === 0) return;

    const jobIdsArray = Array.from(selectedJobIds);

    try {
      setUpdating('bulk');
      const token = getAuthToken();

      // Delete jobs in parallel
      const deletePromises = jobIdsArray.map(jobId =>
        fetch(`${API_BASE_URL}/api/admin/jobs/${jobId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        })
      );

      const responses = await Promise.all(deletePromises);

      // Check for auth errors
      const hasAuthError = responses.some(
        r => r.status === 401 || r.status === 403
      );

      if (hasAuthError) {
        removeAuthToken();
        navigate(ROUTE_PATHS.login);
        return;
      }

      // Refresh jobs list
      await fetchJobs();
      setBulkDeleteDialogOpen(false);
      setSelectedJobIds(new Set());
      setDeleteMode(false);
    } catch (error) {
      console.error('Error deleting jobs:', error);
    } finally {
      setUpdating(null);
    }
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
        navigate(ROUTE_PATHS.login);
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

  const formatAvailabilityRange = (
    startDateTime: string,
    endDateTime: string
  ) => {
    const startDate = new Date(startDateTime);
    const endDate = new Date(endDateTime);
    return formatDateRangeWithTimezone(startDate, endDate);
  };

  const formatCreatedAt = (createdAt?: string) => {
    if (!createdAt) return '-';
    const date = new Date(createdAt);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
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
          {deleteMode ? (
            <>
              <Button
                variant='contained'
                color='error'
                startIcon={<DeleteSweepIcon />}
                onClick={() => setBulkDeleteDialogOpen(true)}
                disabled={selectedJobIds.size === 0 || updating === 'bulk'}
              >
                Delete Selected ({selectedJobIds.size})
              </Button>
              <Button
                variant='outlined'
                startIcon={<CancelIcon />}
                onClick={handleToggleDeleteMode}
                disabled={updating === 'bulk'}
              >
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button
                variant='outlined'
                startIcon={<DeleteSweepIcon />}
                onClick={handleToggleDeleteMode}
                color='error'
              >
                Delete Mode
              </Button>
              <Button
                variant='outlined'
                startIcon={<RefreshIcon />}
                onClick={fetchJobs}
                disabled={loading}
              >
                Refresh
              </Button>
            </>
          )}
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
            {JOB_STATUS_FILTER_OPTIONS.map(option => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
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
                  {deleteMode && (
                    <TableCell padding='checkbox'>
                      <Checkbox
                        indeterminate={
                          selectedJobIds.size > 0 &&
                          selectedJobIds.size < jobs.length
                        }
                        checked={
                          jobs.length > 0 && selectedJobIds.size === jobs.length
                        }
                        onChange={handleSelectAll}
                      />
                    </TableCell>
                  )}
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
                  <TableCell>Created At</TableCell>
                  <TableCell>Coaches</TableCell>
                  {!deleteMode && <TableCell>Actions</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {jobs.map(job => (
                  <TableRow
                    key={job._id}
                    onClick={
                      deleteMode ? undefined : () => navigate(`/job/${job._id}`)
                    }
                    sx={{
                      cursor: deleteMode ? 'default' : 'pointer',
                      backgroundColor: selectedJobIds.has(job._id)
                        ? 'action.selected'
                        : 'transparent',
                      '&:hover': {
                        backgroundColor: deleteMode
                          ? selectedJobIds.has(job._id)
                            ? 'action.selected'
                            : 'action.hover'
                          : 'action.hover',
                      },
                    }}
                  >
                    {deleteMode && (
                      <TableCell padding='checkbox'>
                        <Checkbox
                          checked={selectedJobIds.has(job._id)}
                          onChange={() => handleToggleJobSelection(job._id)}
                          onClick={e => e.stopPropagation()}
                        />
                      </TableCell>
                    )}
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
                    <TableCell
                      onClick={e => e.stopPropagation()}
                      sx={{ cursor: 'default' }}
                    >
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
                        <MenuItem value='approved'>Approved</MenuItem>
                        <MenuItem value='completed'>Completed</MenuItem>
                        <MenuItem value='cancelled'>Cancelled</MenuItem>
                      </Select>
                    </TableCell>
                    <TableCell>{formatCreatedAt(job.createdAt)}</TableCell>
                    <TableCell
                      onClick={e => e.stopPropagation()}
                      sx={{ cursor: 'default' }}
                    >
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
                    {!deleteMode && (
                      <TableCell
                        onClick={e => e.stopPropagation()}
                        sx={{ cursor: 'default' }}
                      >
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
                    )}
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

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog
        open={bulkDeleteDialogOpen}
        onClose={() => setBulkDeleteDialogOpen(false)}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>Delete Selected Jobs</DialogTitle>
        <DialogContent>
          <Typography variant='body1' sx={{ mb: 2 }}>
            Are you sure you want to delete {selectedJobIds.size} job
            {selectedJobIds.size !== 1 ? 's' : ''}? This action cannot be
            undone.
          </Typography>
          <Typography variant='body2' color='error'>
            This will permanently delete the selected job
            {selectedJobIds.size !== 1 ? 's' : ''}.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setBulkDeleteDialogOpen(false)}
            disabled={updating === 'bulk'}
          >
            Cancel
          </Button>
          <Button
            onClick={handleBulkDelete}
            variant='contained'
            color='error'
            disabled={updating === 'bulk'}
            startIcon={
              updating === 'bulk' ? (
                <CircularProgress size={16} color='inherit' />
              ) : (
                <DeleteIcon />
              )
            }
          >
            {updating === 'bulk'
              ? 'Deleting...'
              : `Delete ${selectedJobIds.size} Job${
                  selectedJobIds.size !== 1 ? 's' : ''
                }`}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
