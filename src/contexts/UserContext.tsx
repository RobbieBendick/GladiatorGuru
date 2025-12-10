import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import { getAuthToken, removeAuthToken } from '../config/auth';
import { API_BASE_URL } from '../config/api';

export interface AvailabilitySlot {
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  startTime: string; // Format: "HH:mm" (e.g., "09:00")
  endTime: string; // Format: "HH:mm" (e.g., "17:00")
}

export interface User {
  id: string;
  username: string;
  role: string;
  discordId?: string;
  discordUsername?: string;
  coachAlias?: string;
  email?: string;
  timezone?: string;
  availability?: AvailabilitySlot[];
  usedPromoCode?: string;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    console.log('fetchUser called');
    setLoading(true);
    const token = getAuthToken();
    console.log('Token from localStorage:', token ? 'exists' : 'missing');
    if (!token) {
      console.log('No token found, setting user to null');
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        console.log('User data fetched:', data.data);
        setUser(data.data);
      } else {
        // Token might be invalid, clear it
        const errorData = await response.json().catch(() => ({}));
        console.error(
          'Failed to fetch user:',
          response.status,
          response.statusText,
          errorData
        );
        removeAuthToken();
        setUser(null);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    console.log('UserContext mounted, fetching user...');
    fetchUser();
  }, []);

  // Also listen for storage events (in case token is set in another tab/window)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_token' && e.newValue) {
        console.log('Token detected in storage, refreshing user...');
        fetchUser();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const logout = useCallback(() => {
    removeAuthToken();
    setUser(null);
    // Optionally call logout endpoint
    fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    }).catch(console.error);
  }, []);

  const contextValue = useMemo(
    () => ({
      user,
      loading,
      refreshUser: fetchUser,
      logout,
    }),
    [user, loading, fetchUser, logout]
  );

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
