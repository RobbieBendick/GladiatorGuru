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
  queued: boolean;
  activityLog: LogEntry[];
  updatedAt: string;
  createdAt: string;
}

export interface Session {
  _id: string;
  coachId: string;
  assignedCoachIds: string[];
  assignedCoachNames: string[];
  discord: string;
  wowClass: string;
  faction: 'Horde' | 'Alliance';
  bracket: '2' | '3' | '5';
  scheduledAt: string;
  notes: string;
  userSlug: string;
  comp: string;
  pros: string[];
  cons: string[];
  takeaways: string;
  status: 'pending' | 'confirmed';
}

export function useDashboardData() {
  const navigate = useNavigate();
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [pastSessions, setPastSessions] = useState<Session[]>([]);
  const [requests, setRequests] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [pastLoading, setPastLoading] = useState(false);

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
      const [cRes, sRes, rRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/coach-tracker/coaches`, { headers: authHeaders(), credentials: 'include' }),
        fetch(`${API_BASE_URL}/api/coach-tracker/sessions`, { headers: authHeaders(), credentials: 'include' }),
        fetch(`${API_BASE_URL}/api/coach-tracker/requests`, { headers: authHeaders(), credentials: 'include' }),
      ]);
      if (handleAuthError(cRes.status) || handleAuthError(sRes.status)) return;
      const [cData, sData, rData] = await Promise.all([cRes.json(), sRes.json(), rRes.json()]);
      if (cData.data) setCoaches(cData.data);
      if (sData.data) setSessions(sData.data);
      if (rData.data) setRequests(rData.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, []);

  const fetchPastSessions = useCallback(async () => {
    setPastLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/coach-tracker/sessions?past=true`, { headers: authHeaders(), credentials: 'include' });
      if (handleAuthError(res.status)) return;
      const data = await res.json();
      if (data.data) setPastSessions(data.data);
    } catch (e) { console.error(e); }
    finally { setPastLoading(false); }
  }, []);

  const createSession = async (payload: Omit<Session, '_id'>) => {
    const res = await fetch(`${API_BASE_URL}/api/coach-tracker/sessions`, {
      method: 'POST', headers: authHeaders(), credentials: 'include',
      body: JSON.stringify(payload),
    });
    if (handleAuthError(res.status)) return;
    await fetchAll();
  };

  const toggleQueued = (coach: Coach) => {
    const next = !coach.queued;
    setCoaches(prev => prev.map(c => c._id === coach._id ? { ...c, queued: next } : c));
    fetch(`${API_BASE_URL}/api/coach-tracker/coaches/${coach._id}`, {
      method: 'PATCH', headers: authHeaders(), credentials: 'include',
      body: JSON.stringify({ queued: next }),
    }).catch(err => console.error('Error toggling queue:', err));
  };

  const togglePin = (coach: Coach) => {
    const next = !coach.pinned;
    setCoaches(prev => prev.map(c => c._id === coach._id ? { ...c, pinned: next } : c));
    fetch(`${API_BASE_URL}/api/coach-tracker/coaches/${coach._id}`, {
      method: 'PATCH', headers: authHeaders(), credentials: 'include',
      body: JSON.stringify({ pinned: next }),
    }).catch(err => console.error('Error toggling pin:', err));
  };

  const deleteSession = async (id: string) => {
    const res = await fetch(`${API_BASE_URL}/api/coach-tracker/sessions/${id}`, {
      method: 'DELETE', headers: authHeaders(), credentials: 'include',
    });
    if (handleAuthError(res.status)) return;
    setSessions(prev => prev.filter(s => s._id !== id));
  };

  const updateSession = async (id: string, payload: Partial<Session>): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}/api/coach-tracker/sessions/${id}`, {
      method: 'PATCH', headers: authHeaders(), credentials: 'include',
      body: JSON.stringify(payload),
    });
    if (handleAuthError(res.status)) return;
    const data = await res.json();
    if (data.data) {
      setSessions(prev => prev.map(s => s._id === id ? { ...s, ...data.data } : s));
    }
  };

  const acceptRequest = async (id: string, extra: Partial<Session> = {}) => {
    const res = await fetch(`${API_BASE_URL}/api/coach-tracker/sessions/${id}`, {
      method: 'PATCH', headers: authHeaders(), credentials: 'include',
      body: JSON.stringify({ status: 'confirmed', ...extra }),
    });
    if (handleAuthError(res.status)) return;
    setRequests(prev => prev.filter(r => r._id !== id));
    await fetchAll();
  };

  const declineRequest = async (id: string) => {
    const res = await fetch(`${API_BASE_URL}/api/coach-tracker/sessions/${id}`, {
      method: 'DELETE', headers: authHeaders(), credentials: 'include',
    });
    if (handleAuthError(res.status)) return;
    setRequests(prev => prev.filter(r => r._id !== id));
  };

  return { coaches, sessions, pastSessions, requests, loading, pastLoading, fetchAll, fetchPastSessions, createSession, deleteSession, toggleQueued, togglePin, updateSession, acceptRequest, declineRequest };
}
