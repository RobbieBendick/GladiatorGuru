import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { ROUTE_PATHS } from '../../schemas/route-paths';
import { isAuthenticated, isAdmin, getAuthToken } from '../../config/auth';
import { API_BASE_URL } from '../../config/api';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [isUserAdmin, setIsUserAdmin] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const hasToken = isAuthenticated();
      setAuthenticated(hasToken);

      if (hasToken) {
        // Check role from token first
        const tokenIsAdmin = isAdmin();

        // Also verify with backend to ensure token is valid and role is correct
        try {
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
            // The getMe endpoint returns the user object directly in data.data
            setIsUserAdmin(data.data?.role === 'admin');
          } else {
            setIsUserAdmin(false);
          }
        } catch (error) {
          // If backend check fails, fall back to token check
          setIsUserAdmin(tokenIsAdmin);
        }
      } else {
        setIsUserAdmin(false);
      }

      setLoading(false);
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!authenticated || !isUserAdmin) {
    return <Navigate to={ROUTE_PATHS.adminLogin} replace />;
  }

  return <>{children}</>;
}
