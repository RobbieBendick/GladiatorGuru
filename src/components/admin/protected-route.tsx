import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { ROUTE_PATHS } from '../../schemas/route-paths';
import { isAuthenticated, getUserRole, getAuthToken } from '../../config/auth';
import { API_BASE_URL } from '../../config/api';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('admin' | 'coach' | 'user')[];
  requireAuthOnly?: boolean; // If true, only require authentication, no role check
}

export function ProtectedRoute({
  children,
  allowedRoles = ['admin'],
  requireAuthOnly = false,
}: ProtectedRouteProps) {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const hasToken = isAuthenticated();
      setAuthenticated(hasToken);

      if (hasToken) {
        // Check role from token first
        const tokenRole = getUserRole();

        // Also verify with backend to ensure token is valid and role is correct
        try {
          const token = getAuthToken();
          // Try admin endpoint first, then coach endpoint if needed
          let response = await fetch(`${API_BASE_URL}/api/admin/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          });

          if (
            !response.ok &&
            (tokenRole === 'coach' || allowedRoles.includes('coach'))
          ) {
            // Try coach endpoint if admin endpoint fails and user might be a coach
            response = await fetch(`${API_BASE_URL}/api/coach/me`, {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              credentials: 'include',
            });
          }

          if (response.ok) {
            const data = await response.json();
            // Both endpoints return role in data.data.role
            setUserRole(data.data?.role || tokenRole);
          } else {
            setUserRole(null);
          }
        } catch (error) {
          // If backend check fails, fall back to token check
          setUserRole(tokenRole);
        }
      } else {
        setUserRole(null);
      }

      setLoading(false);
    };

    checkAuth();
  }, [allowedRoles]);

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

  // If requireAuthOnly is true, only check authentication, not role
  if (requireAuthOnly) {
    if (!authenticated) {
      // Pass the current location as a redirect parameter
      const redirectTo = encodeURIComponent(
        location.pathname + location.search
      );
      return (
        <Navigate to={`${ROUTE_PATHS.login}?redirect=${redirectTo}`} replace />
      );
    }
    return <>{children}</>;
  }

  if (!authenticated || !userRole || !allowedRoles.includes(userRole as any)) {
    // Redirect to login with redirect parameter
    const redirectTo = encodeURIComponent(location.pathname + location.search);
    return (
      <Navigate to={`${ROUTE_PATHS.login}?redirect=${redirectTo}`} replace />
    );
  }

  return <>{children}</>;
}
