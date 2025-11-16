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
  styled,
  CircularProgress,
  Chip,
} from '@mui/material';
import { ArrowBack, CalendarToday } from '@mui/icons-material';
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

interface Coach {
  _id: string;
  username: string;
  name?: string;
  email?: string;
  role: string;
  createdAt?: string;
}

export function CoachList() {
  const navigate = useNavigate();
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCoaches = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      console.log('api base url', API_BASE_URL);

      const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
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

      const data = await response.json();

      if (data.data) {
        // Filter to show only admins and coaches (users with role 'admin' or 'coach')
        // Note: You can add 'coach' role to your User model if needed
        const coachUsers = Array.isArray(data.data)
          ? data.data.filter(
              (user: Coach) => user.role === 'admin' || user.role === 'coach'
            )
          : [];
        setCoaches(coachUsers);
      }
    } catch (error) {
      console.error('Error fetching coaches:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoaches();
  }, []);

  const handleViewSchedule = (coachId: string) => {
    navigate(`/${coachId}/schedule`);
  };

  return (
    <Container maxWidth='xl' sx={{ py: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(ROUTE_PATHS.admin)}
          sx={{ mb: 2 }}
        >
          Back to Dashboard
        </Button>
      </Box>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
        }}
      >
        <DashboardTitle variant='h2'>Coaches & Admins</DashboardTitle>
      </Box>

      <DashboardPaper>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : coaches.length === 0 ? (
          <Typography
            variant='body1'
            color='text.secondary'
            sx={{ textAlign: 'center', py: 4 }}
          >
            No coaches found
          </Typography>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Username</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {coaches.map(coach => (
                  <TableRow key={coach._id}>
                    <TableCell>
                      <Typography
                        variant='body2'
                        sx={{
                          fontFamily: 'monospace',
                          fontSize: '0.85rem',
                          color: 'text.secondary',
                        }}
                      >
                        {coach._id}
                      </Typography>
                    </TableCell>
                    <TableCell>{coach.username}</TableCell>
                    <TableCell>{coach.name || '-'}</TableCell>
                    <TableCell>{coach.email || '-'}</TableCell>
                    <TableCell>
                      <Chip
                        label={coach.role}
                        size='small'
                        color={
                          coach.role === 'admin'
                            ? 'error'
                            : coach.role === 'coach'
                            ? 'primary'
                            : 'default'
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant='outlined'
                        size='small'
                        startIcon={<CalendarToday />}
                        onClick={() => handleViewSchedule(coach._id)}
                      >
                        View Schedule
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DashboardPaper>

      <Box sx={{ mt: 3 }}>
        <Typography variant='body2' color='text.secondary'>
          <strong>Tip:</strong> You can also access a coach's schedule directly
          by visiting:{' '}
          <code>
            /#/{'{'}coachId{'}'}/schedule
          </code>
        </Typography>
      </Box>
    </Container>
  );
}
