import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuthToken, removeAuthToken } from '../../config/auth';
import { API_BASE_URL } from '../../config/api';
import { ROUTE_PATHS } from '../../schemas/route-paths';

export interface LogEntry { message: string; createdAt: string; }
export interface Coach {
  _id: string;
  discord: string;
  alias: string;
  faction: 'Horde' | 'Alliance';
  wowClass: string;
  partner: string;
  hoursPrepaid: number;
  hoursUsed: number;
  brackets: string[];
  pinned: boolean;
  pinNote: string;
  activityLog: LogEntry[];
  updatedAt: string;
  createdAt: string;
}

export interface Session {
  _id: string;
  coachId: string;
  discord: string;
  wowClass: string;
  faction: 'Horde' | 'Alliance';
  bracket: '2' | '3' | '5';
  scheduledAt: string;
  notes: string;
}

export function useDashboardData() {
  const navigate = useNavigate();
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  const authHeaders = () => ({
    Authorization: `Bearer ${getAuthToken()}`,
    'Content-Type': 'application/json',
  });

  const handleAuthError = (status: number) => {
    if (status === 401 || status === 403) { removeAuthToken(); navigate(ROUTE_PATHS.login); return true; }
    return false;
  };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [cRes, sRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/coach-tracker/coaches`, { headers: authHeaders(), credentials: 'include' }),
        fetch(`${API_BASE_URL}/api/coach-tracker/sessions`, { headers: authHeaders(), credentials: 'include' }),
      ]);
      if (handleAuthError(cRes.status) || handleAuthError(sRes.status)) return;
      const [cData, sData] = await Promise.all([cRes.json(), sRes.json()]);
      if (cData.data) setCoaches(cData.data);
      if (sData.data) setSessions(sData.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, []);

  const createSession = async (payload: Omit<Session, '_id'>) => {
    const res = await fetch(`${API_BASE_URL}/api/coach-tracker/sessions`, {
      method: 'POST', headers: authHeaders(), credentials: 'include',
      body: JSON.stringify(payload),
    });
    if (handleAuthError(res.status)) return;
    await fetchAll();
  };

  const deleteSession = async (id: string) => {
    const res = await fetch(`${API_BASE_URL}/api/coach-tracker/sessions/${id}`, {
      method: 'DELETE', headers: authHeaders(), credentials: 'include',
    });
    if (handleAuthError(res.status)) return;
    setSessions(prev => prev.filter(s => s._id !== id));
  };

  return { coaches, sessions, loading, fetchAll, createSession, deleteSession };
}
