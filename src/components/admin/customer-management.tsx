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
  TextField,
  IconButton,
  styled,
  CircularProgress,
  Chip,
  Snackbar,
  Alert,
  InputAdornment,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
  AccountBalance as AccountBalanceIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
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

export function CustomerManagement() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCustomer, setEditingCustomer] = useState<string | null>(null);
  const [editData, setEditData] = useState<EditCustomerData | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
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

  const fetchCustomers = async () => {
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
        const customers = customersData.map((customer: any) => ({
          ...customer,
          lastBookingDate: new Date(customer.lastBookingDate),
          credit: customer.credit || 0,
        }));
        setCustomers(customers);
      } else {
        if (response.status === 401 || response.status === 403) {
          navigate(ROUTE_PATHS.login);
        } else {
          showSnackbar('Failed to fetch customers', 'error');
        }
      }
    } catch (error: any) {
      console.error('Error fetching customers:', error);
      showSnackbar('Failed to fetch customers', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer.discordUsername);
    setEditData({
      discordUsername: customer.discordUsername,
      characterName: customer.characterName,
      characterRealm: customer.characterRealm,
      credit: customer.credit || 0, // Store in minutes
    });
  };

  const handleCancel = () => {
    setEditingCustomer(null);
    setEditData(null);
  };

  const handleSave = async (customer: Customer) => {
    if (!editData) return;

    try {
      setSaving(customer.discordUsername);
      const token = getAuthToken();
      if (!token) {
        navigate(ROUTE_PATHS.login);
        return;
      }

      // Credit is already in minutes
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
        showSnackbar(
          `Customer ${customer.discordUsername} updated successfully`,
          'success'
        );
        // Update local state
        setCustomers(prev =>
          prev.map(c =>
            c.discordUsername === customer.discordUsername
              ? {
                  ...c,
                  characterName: editData.characterName.trim(),
                  characterRealm: editData.characterRealm.trim(),
                  credit: creditMinutes,
                }
              : c
          )
        );
        setEditingCustomer(null);
        setEditData(null);
      } else {
        const errorData = await response.json().catch(() => ({}));
        showSnackbar(errorData.message || 'Failed to update customer', 'error');
      }
    } catch (error: any) {
      console.error('Error updating customer:', error);
      showSnackbar('Failed to update customer', 'error');
    } finally {
      setSaving(null);
    }
  };

  const showSnackbar = (
    message: string,
    severity: 'success' | 'error' | 'warning' | 'info' = 'success'
  ) => {
    setSnackbar({ open: true, message, severity });
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

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

  return (
    <Container maxWidth='lg'>
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
            <DashboardTitle variant='h1'>Customer Management</DashboardTitle>
          </Box>
          <Button
            variant='outlined'
            startIcon={<RefreshIcon />}
            onClick={fetchCustomers}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>

        <Typography variant='body1' color='text.secondary' sx={{ mb: 3 }}>
          Manage customer information and credits. Credits are stored and
          displayed in minutes (e.g., 300 minutes = 5 hours).
        </Typography>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Discord Username</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Character Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Character Realm</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Last Booking</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align='right'>
                  Credit
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }} align='right'>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align='center'>
                    <Typography
                      variant='body2'
                      color='text.secondary'
                      sx={{ py: 3 }}
                    >
                      No customers found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                customers.map(customer => (
                  <TableRow key={customer.discordUsername} hover>
                    <TableCell>{customer.discordUsername}</TableCell>
                    <TableCell>
                      {editingCustomer === customer.discordUsername ? (
                        <TextField
                          size='small'
                          value={editData?.characterName || ''}
                          onChange={e =>
                            setEditData(prev =>
                              prev
                                ? { ...prev, characterName: e.target.value }
                                : null
                            )
                          }
                          fullWidth
                          sx={{ minWidth: 150 }}
                        />
                      ) : (
                        customer.characterName
                      )}
                    </TableCell>
                    <TableCell>
                      {editingCustomer === customer.discordUsername ? (
                        <TextField
                          size='small'
                          value={editData?.characterRealm || ''}
                          onChange={e =>
                            setEditData(prev =>
                              prev
                                ? { ...prev, characterRealm: e.target.value }
                                : null
                            )
                          }
                          fullWidth
                          sx={{ minWidth: 150 }}
                        />
                      ) : (
                        customer.characterRealm
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(customer.lastBookingDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell align='right'>
                      {editingCustomer === customer.discordUsername ? (
                        <TextField
                          size='small'
                          value={editData?.credit || 0}
                          onChange={e => {
                            const value = e.target.value;
                            setEditData(prev =>
                              prev
                                ? {
                                    ...prev,
                                    credit:
                                      value === ''
                                        ? 0
                                        : parseInt(value, 10) || 0,
                                  }
                                : null
                            );
                          }}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              handleSave(customer);
                            } else if (e.key === 'Escape') {
                              handleCancel();
                            }
                          }}
                          sx={{ width: 150 }}
                          type='number'
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position='end'>
                                min
                              </InputAdornment>
                            ),
                          }}
                          inputProps={{
                            step: 1,
                            min: 0,
                          }}
                          helperText={`= ${formatCredit(
                            editData?.credit || 0
                          )}`}
                          FormHelperTextProps={{
                            sx: { margin: 0, fontSize: '0.7rem' },
                          }}
                        />
                      ) : (
                        <Chip
                          label={`${customer.credit || 0} min (${formatCredit(
                            customer.credit
                          )})`}
                          color={
                            (customer.credit || 0) > 0 ? 'success' : 'default'
                          }
                          size='small'
                        />
                      )}
                    </TableCell>
                    <TableCell align='right'>
                      {editingCustomer === customer.discordUsername ? (
                        <Box
                          sx={{
                            display: 'flex',
                            gap: 1,
                            justifyContent: 'flex-end',
                          }}
                        >
                          <IconButton
                            size='small'
                            color='primary'
                            onClick={() => handleSave(customer)}
                            disabled={saving === customer.discordUsername}
                          >
                            <SaveIcon />
                          </IconButton>
                          <IconButton
                            size='small'
                            color='error'
                            onClick={handleCancel}
                            disabled={saving === customer.discordUsername}
                          >
                            <CancelIcon />
                          </IconButton>
                        </Box>
                      ) : (
                        <IconButton
                          size='small'
                          color='primary'
                          onClick={() => handleEdit(customer)}
                        >
                          <EditIcon />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
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
