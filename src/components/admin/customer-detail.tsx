import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  TextField,
  styled,
  CircularProgress,
  Chip,
  Snackbar,
  Alert,
  InputAdornment,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  ArrowBack as ArrowBackIcon,
  AccountBalance as AccountBalanceIcon,
} from '@mui/icons-material';
import { ROUTE_PATHS } from '../../schemas/route-paths';
import { getAuthToken } from '../../config/auth';
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

interface Customer {
  discordUsername: string;
  characterName: string;
  characterRealm: string;
  lastBookingDate: Date;
  credit?: number; // Credit in minutes
}

interface EditCustomerData {
  discordUsername: string;
  characterName: string;
  characterRealm: string;
  credit: number;
}

export function CustomerDetail() {
  const { discordUsername } = useParams<{ discordUsername: string }>();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<EditCustomerData | null>(null);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity?: 'success' | 'error' | 'warning' | 'info';
  }>({ open: false, message: '', severity: 'success' });

  // Format credit from minutes to readable format (e.g., "4h 30m")
  const formatCredit = (minutes: number | undefined): string => {
    if (minutes === undefined || minutes === null || minutes === 0) {
      return '0m';
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours === 0) {
      return `${remainingMinutes}m`;
    } else if (remainingMinutes === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${remainingMinutes}m`;
    }
  };

  const fetchCustomer = async () => {
    if (!discordUsername) return;

    try {
      setLoading(true);
      const token = getAuthToken();
      if (!token) {
        navigate(ROUTE_PATHS.login);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/customers`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        const customersData = data.data || [];
        const foundCustomer = customersData.find(
          (c: any) =>
            c.discordUsername?.toLowerCase() ===
            decodeURIComponent(discordUsername).toLowerCase()
        );

        if (foundCustomer) {
          setCustomer({
            ...foundCustomer,
            lastBookingDate: new Date(foundCustomer.lastBookingDate),
            credit: foundCustomer.credit || 0,
          });
        } else {
          showSnackbar('Customer not found', 'error');
          navigate(ROUTE_PATHS.customerManagement);
        }
      } else {
        if (response.status === 401 || response.status === 403) {
          navigate(ROUTE_PATHS.login);
        } else {
          showSnackbar('Failed to fetch customer', 'error');
        }
      }
    } catch (error: any) {
      console.error('Error fetching customer:', error);
      showSnackbar('Failed to fetch customer', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if (!customer) return;
    setEditing(true);
    setEditData({
      discordUsername: customer.discordUsername,
      characterName: customer.characterName,
      characterRealm: customer.characterRealm,
      credit: customer.credit || 0,
    });
  };

  const handleCancel = () => {
    setEditing(false);
    setEditData(null);
  };

  const handleSave = async () => {
    if (!editData || !customer) return;

    try {
      setSaving(true);
      const token = getAuthToken();
      if (!token) {
        navigate(ROUTE_PATHS.login);
        return;
      }

      const creditMinutes = Math.round(editData.credit);

      const response = await fetch(
        `${API_BASE_URL}/api/admin/customers/${encodeURIComponent(
          customer.discordUsername
        )}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            characterName: editData.characterName.trim(),
            characterRealm: editData.characterRealm.trim(),
            credit: creditMinutes,
          }),
        }
      );

      if (response.ok) {
        showSnackbar('Customer updated successfully', 'success');
        setCustomer({
          ...customer,
          characterName: editData.characterName.trim(),
          characterRealm: editData.characterRealm.trim(),
          credit: creditMinutes,
        });
        setEditing(false);
        setEditData(null);
      } else {
        const errorData = await response.json().catch(() => ({}));
        showSnackbar(errorData.message || 'Failed to update customer', 'error');
      }
    } catch (error: any) {
      console.error('Error updating customer:', error);
      showSnackbar('Failed to update customer', 'error');
    } finally {
      setSaving(false);
    }
  };

  const showSnackbar = (
    message: string,
    severity: 'success' | 'error' | 'warning' | 'info' = 'success'
  ) => {
    setSnackbar({ open: true, message, severity });
  };

  useEffect(() => {
    fetchCustomer();
  }, [discordUsername]);

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

  if (!customer) {
    return (
      <Container maxWidth='lg'>
        <Box sx={{ mb: 3 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(ROUTE_PATHS.customerManagement)}
            sx={{ mb: 2 }}
          >
            Back to Customers
          </Button>
        </Box>
        <DashboardPaper elevation={3}>
          <Typography variant='h4' color='error' gutterBottom>
            Customer Not Found
          </Typography>
          <Typography variant='body1' color='text.secondary'>
            The customer you're looking for doesn't exist.
          </Typography>
        </DashboardPaper>
      </Container>
    );
  }

  return (
    <Container maxWidth='lg'>
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(ROUTE_PATHS.customerManagement)}
          sx={{ mb: 2 }}
        >
          Back to Customers
        </Button>
      </Box>

      <DashboardPaper elevation={3}>
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <AccountBalanceIcon sx={{ fontSize: '2.5rem' }} />
            <DashboardTitle variant='h1'>
              {editing ? 'Edit Customer' : 'Customer Details'}
            </DashboardTitle>
          </Box>
          {!editing ? (
            <Button
              variant='contained'
              startIcon={<EditIcon />}
              onClick={handleEdit}
            >
              Edit
            </Button>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant='outlined'
                startIcon={<CancelIcon />}
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                variant='contained'
                startIcon={<SaveIcon />}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </Box>
          )}
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant='h6' gutterBottom sx={{ fontWeight: 600 }}>
                  Discord Username
                </Typography>
                <Typography variant='body1' color='text.secondary'>
                  {customer.discordUsername}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant='h6' gutterBottom sx={{ fontWeight: 600 }}>
                  Last Booking
                </Typography>
                <Typography variant='body1' color='text.secondary'>
                  {new Date(customer.lastBookingDate).toLocaleDateString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant='h6' gutterBottom sx={{ fontWeight: 600 }}>
                  Character Name
                </Typography>
                {editing ? (
                  <TextField
                    fullWidth
                    value={editData?.characterName || ''}
                    onChange={e =>
                      setEditData(prev =>
                        prev ? { ...prev, characterName: e.target.value } : null
                      )
                    }
                    variant='outlined'
                    sx={{ mt: 1 }}
                  />
                ) : (
                  <Typography variant='body1' color='text.secondary'>
                    {customer.characterName || 'N/A'}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant='h6' gutterBottom sx={{ fontWeight: 600 }}>
                  Character Realm
                </Typography>
                {editing ? (
                  <TextField
                    fullWidth
                    value={editData?.characterRealm || ''}
                    onChange={e =>
                      setEditData(prev =>
                        prev
                          ? { ...prev, characterRealm: e.target.value }
                          : null
                      )
                    }
                    variant='outlined'
                    sx={{ mt: 1 }}
                  />
                ) : (
                  <Typography variant='body1' color='text.secondary'>
                    {customer.characterRealm || 'N/A'}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant='h6' gutterBottom sx={{ fontWeight: 600 }}>
                  Credit
                </Typography>
                {editing ? (
                  <Box sx={{ mt: 1 }}>
                    <TextField
                      fullWidth
                      value={editData?.credit || 0}
                      onChange={e => {
                        const value = e.target.value;
                        setEditData(prev =>
                          prev
                            ? {
                                ...prev,
                                credit:
                                  value === '' ? 0 : parseInt(value, 10) || 0,
                              }
                            : null
                        );
                      }}
                      type='number'
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position='end'>min</InputAdornment>
                        ),
                      }}
                      inputProps={{
                        step: 1,
                        min: 0,
                      }}
                      helperText={`= ${formatCredit(editData?.credit || 0)}`}
                      FormHelperTextProps={{
                        sx: { fontSize: '0.875rem' },
                      }}
                    />
                  </Box>
                ) : (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      mt: 1,
                    }}
                  >
                    <Chip
                      label={`${customer.credit || 0} min`}
                      color={(customer.credit || 0) > 0 ? 'success' : 'default'}
                      size='medium'
                    />
                    <Typography variant='body1' color='text.secondary'>
                      ({formatCredit(customer.credit)})
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </DashboardPaper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
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
