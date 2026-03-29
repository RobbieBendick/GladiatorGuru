import { useState, useEffect, useRef, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuthToken, removeAuthToken } from '../../config/auth';
import { API_BASE_URL } from '../../config/api';
import { ROUTE_PATHS } from '../../schemas/route-paths';
import './coach-tracker.css';

const WOW_CLASSES = [
  'Death Knight', 'Demon Hunter', 'Druid', 'Evoker', 'Hunter',
  'Mage', 'Monk', 'Paladin', 'Priest', 'Rogue',
  'Shaman', 'Warlock', 'Warrior',
];

const CLASS_COLORS: Record<string, string> = {
  'Death Knight': '#C41E3A',
  'Demon Hunter': '#A330C9',
  'Druid': '#FF7C0A',
  'Evoker': '#33937F',
  'Hunter': '#AAD372',
  'Mage': '#3FC7EB',
  'Monk': '#00FF98',
  'Paladin': '#F48CBA',
  'Priest': '#FFFFFF',
  'Rogue': '#FFF468',
  'Shaman': '#0070DD',
  'Warlock': '#8788EE',
  'Warrior': '#C69B6D',
};

interface LogEntry {
  _id?: string;
  message: string;
  createdAt: string;
}

interface Coach {
  _id: string;
  discord: string;
  alias: string;
  faction: 'Horde' | 'Alliance';
  wowClass: string;
  partner: string;
  hoursPrepaid: number;
  hoursUsed: number;
  notes: string;
  activityLog: LogEntry[];
  brackets: string[];
  updatedAt: string;
  createdAt: string;
}

interface CoachForm {
  discord: string;
  alias: string;
  faction: 'Horde' | 'Alliance';
  wowClass: string;
  partner: string;
  hoursPrepaid: number;
  hoursUsed: number;
  notes: string;
  brackets: string[];
}

const emptyForm: CoachForm = {
  discord: '',
  alias: '',
  faction: 'Horde',
  wowClass: '',
  partner: '',
  hoursPrepaid: 0,
  hoursUsed: 0,
  notes: '',
  brackets: [],
};

export function CoachTracker() {
  const navigate = useNavigate();
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [form, setForm] = useState<CoachForm>({ ...emptyForm });
  const [editing, setEditing] = useState<string | null>(null);
  const [viewing, setViewing] = useState<string | null>(null);
  const [factionFilter, setFactionFilter] = useState('All');
  const [classFilter, setClassFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('ct-pinned');
      return new Set(saved ? JSON.parse(saved) : []);
    } catch { return new Set(); }
  });
  const [pinNotes, setPinNotes] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('ct-pin-notes');
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });
  const [pinNoteTimes, setPinNoteTimes] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('ct-pin-note-times');
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });
  const [logCoach, setLogCoach] = useState<Coach | null>(null);
  const [logMessage, setLogMessage] = useState('');
  const [logSending, setLogSending] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);
  const justEnteredEditRef = useRef(false);

  const authHeaders = () => {
    const token = getAuthToken();
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  };

  const handleAuthError = (status: number) => {
    if (status === 401 || status === 403) {
      removeAuthToken();
      navigate(ROUTE_PATHS.login);
      return true;
    }
    return false;
  };

  const fetchCoaches = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/coach-tracker/coaches`, {
        headers: authHeaders(),
        credentials: 'include',
      });

      if (handleAuthError(response.status)) return;

      const data = await response.json();
      if (data.data) {
        setCoaches(data.data);
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (justEnteredEditRef.current) return;
    if (!form.discord.trim() || !form.wowClass) return;

    try {
      if (editing) {
        const response = await fetch(`${API_BASE_URL}/api/coach-tracker/coaches/${editing}`, {
          method: 'PATCH',
          headers: authHeaders(),
          credentials: 'include',
          body: JSON.stringify(form),
        });
        if (handleAuthError(response.status)) return;
      } else {
        const response = await fetch(`${API_BASE_URL}/api/coach-tracker/coaches`, {
          method: 'POST',
          headers: authHeaders(),
          credentials: 'include',
          body: JSON.stringify(form),
        });
        if (handleAuthError(response.status)) return;
      }

      setForm({ ...emptyForm });
      setEditing(null);
      setViewing(null);
      await fetchCoaches();
    } catch (error) {
      console.error('Error saving coach:', error);
    }
  };

  const viewCoach = (coach: Coach) => {
    setForm({
      discord: coach.discord,
      alias: coach.alias,
      faction: coach.faction,
      wowClass: coach.wowClass,
      partner: coach.partner,
      hoursPrepaid: coach.hoursPrepaid,
      hoursUsed: coach.hoursUsed,
      notes: coach.notes,
      brackets: coach.brackets || [],
    });
    setViewing(coach._id);
    setEditing(null);
  };

  const startEdit = () => {
    if (viewing) {
      justEnteredEditRef.current = true;
      setEditing(viewing);
      setViewing(null);
      setTimeout(() => { justEnteredEditRef.current = false; }, 300);
    }
  };

  const cancelEdit = () => {
    setForm({ ...emptyForm });
    setEditing(null);
    setViewing(null);
  };

  const deleteCoach = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/coach-tracker/coaches/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
        credentials: 'include',
      });
      if (handleAuthError(response.status)) return;
      if (editing === id || viewing === id) cancelEdit();
      await fetchCoaches();
    } catch (error) {
      console.error('Error deleting coach:', error);
    }
  };

  const openLog = (coach: Coach) => {
    setLogCoach(coach);
    setLogMessage('');
    setTimeout(() => logEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  };

  const closeLog = () => {
    setLogCoach(null);
    setLogMessage('');
  };

  const togglePin = (id: string) => {
    setPinnedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localStorage.setItem('ct-pinned', JSON.stringify([...next]));
      return next;
    });
  };

  const savePinNote = (id: string, note: string) => {
    const now = Date.now();
    setPinNotes(prev => {
      const next = { ...prev, [id]: note };
      localStorage.setItem('ct-pin-notes', JSON.stringify(next));
      return next;
    });
    setPinNoteTimes(prev => {
      const next = { ...prev, [id]: now };
      localStorage.setItem('ct-pin-note-times', JSON.stringify(next));
      return next;
    });
  };

  const sendLogEntry = async () => {
    if (!logCoach || !logMessage.trim()) return;
    setLogSending(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/coach-tracker/coaches/${logCoach._id}/log`,
        {
          method: 'POST',
          headers: authHeaders(),
          credentials: 'include',
          body: JSON.stringify({ message: logMessage.trim() }),
        }
      );
      if (handleAuthError(response.status)) return;
      const data = await response.json();
      if (data.data) {
        setLogCoach(data.data);
        setCoaches(prev => prev.map(c => (c._id === data.data._id ? data.data : c)));
      }
      setLogMessage('');
      setTimeout(() => logEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    } catch (error) {
      console.error('Error adding log entry:', error);
    } finally {
      setLogSending(false);
    }
  };

  const filtered = coaches
    .filter(c => {
      if (factionFilter !== 'All' && c.faction !== factionFilter) return false;
      if (classFilter !== 'All' && c.wowClass !== classFilter) return false;
      if (
        search &&
        !c.discord.toLowerCase().includes(search.toLowerCase()) &&
        !(c.alias || '').toLowerCase().includes(search.toLowerCase()) &&
        !(c.partner || '').toLowerCase().includes(search.toLowerCase())
      )
        return false;
      return true;
    })
    .sort((a, b) => {
      const aPinned = pinnedIds.has(a._id) ? 0 : 1;
      const bPinned = pinnedIds.has(b._id) ? 0 : 1;
      if (aPinned !== bPinned) return aPinned - bPinned;
      const aTime = Math.max(
        new Date(a.updatedAt || a.createdAt || 0).getTime(),
        pinNoteTimes[a._id] || 0
      );
      const bTime = Math.max(
        new Date(b.updatedAt || b.createdAt || 0).getTime(),
        pinNoteTimes[b._id] || 0
      );
      return bTime - aTime;
    });

  const hordeCount = coaches.filter(c => c.faction === 'Horde').length;
  const allianceCount = coaches.filter(c => c.faction === 'Alliance').length;

  const exportData = () => {
    const payload = {
      coaches,
      pinned: [...pinnedIds],
      pinNotes,
      pinNoteTimes,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wow-coaches-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const raw = JSON.parse(evt.target?.result as string);

        // Support both old format (plain array) and new format (object with coaches + local state)
        const coachList = Array.isArray(raw) ? raw : raw.coaches;
        if (!Array.isArray(coachList)) throw new Error('Invalid format');

        const response = await fetch(`${API_BASE_URL}/api/coach-tracker/coaches/import`, {
          method: 'POST',
          headers: authHeaders(),
          credentials: 'include',
          body: JSON.stringify({ coaches: coachList }),
        });
        if (handleAuthError(response.status)) return;

        // Restore local state (pins, notes, times) if present in export
        if (!Array.isArray(raw)) {
          if (raw.pinned) {
            const newPinned = new Set<string>(raw.pinned);
            setPinnedIds(newPinned);
            localStorage.setItem('ct-pinned', JSON.stringify([...newPinned]));
          }
          if (raw.pinNotes) {
            setPinNotes(raw.pinNotes);
            localStorage.setItem('ct-pin-notes', JSON.stringify(raw.pinNotes));
          }
          if (raw.pinNoteTimes) {
            setPinNoteTimes(raw.pinNoteTimes);
            localStorage.setItem('ct-pin-note-times', JSON.stringify(raw.pinNoteTimes));
          }
        }

        await fetchCoaches();
      } catch {
        alert('Invalid JSON file. Make sure it was exported from Coach Tracker.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  if (loading) {
    return (
      <div className="coach-tracker">
        <div className="empty-state">Loading coaches...</div>
      </div>
    );
  }

  return (
    <div className="coach-tracker">
      <div className="ct-header">
        <h1>WoW Coach Tracker</h1>
        <div className="faction-counts">
          <span className="horde-badge">{hordeCount} Horde</span>
          <span className="alliance-badge">{allianceCount} Alliance</span>
          <span className="total-badge">{coaches.length} Total</span>
        </div>
        <div className="data-actions">
          <button type="button" className="btn-secondary" onClick={exportData}>
            Export JSON
          </button>
          <label className="btn-secondary" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}>
            Import JSON
            <input type="file" accept=".json" onChange={importData} hidden />
          </label>
        </div>
      </div>

      <form onSubmit={handleSubmit} className={`coach-form ${viewing ? 'viewing' : ''}`}>
        <h2>{viewing ? 'Viewing Coach' : editing ? 'Edit Coach' : 'Add Coach'}</h2>
        <div className="form-row">
          <label>
            Discord
            <input
              type="text"
              placeholder="username#1234"
              value={form.discord}
              onChange={e => setForm(f => ({ ...f, discord: e.target.value }))}
              disabled={!!viewing}
              required
            />
          </label>
          <label>
            Alias / Character Name
            <input
              type="text"
              placeholder="In-game name"
              value={form.alias}
              onChange={e => setForm(f => ({ ...f, alias: e.target.value }))}
              disabled={!!viewing}
            />
          </label>
          <label>
            Faction
            <div className="faction-toggle">
              <button
                type="button"
                className={`faction-btn horde ${form.faction === 'Horde' ? 'active' : ''}`}
                onClick={() => !viewing && setForm(f => ({ ...f, faction: 'Horde' }))}
                disabled={!!viewing}
              >
                Horde
              </button>
              <button
                type="button"
                className={`faction-btn alliance ${form.faction === 'Alliance' ? 'active' : ''}`}
                onClick={() => !viewing && setForm(f => ({ ...f, faction: 'Alliance' }))}
                disabled={!!viewing}
              >
                Alliance
              </button>
            </div>
          </label>
        </div>
        <div className="form-row">
          <label>
            Class
            <select
              value={form.wowClass}
              onChange={e => setForm(f => ({ ...f, wowClass: e.target.value }))}
              disabled={!!viewing}
              required
            >
              <option value="">Select class...</option>
              {WOW_CLASSES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>
          <label>
            Coaching With
            <input
              type="text"
              placeholder="Partner / group name"
              value={form.partner}
              onChange={e => setForm(f => ({ ...f, partner: e.target.value }))}
              disabled={!!viewing}
            />
          </label>
        </div>
        <div className="form-row">
          <label>
            Hours Prepaid
            <input
              type="number"
              min="0"
              step="0.5"
              placeholder="0"
              value={form.hoursPrepaid || ''}
              onChange={e => setForm(f => ({ ...f, hoursPrepaid: parseFloat(e.target.value) || 0 }))}
              disabled={!!viewing}
            />
          </label>
          <label>
            Hours Used
            <input
              type="number"
              min="0"
              step="0.5"
              placeholder="0"
              value={form.hoursUsed || ''}
              onChange={e => setForm(f => ({ ...f, hoursUsed: parseFloat(e.target.value) || 0 }))}
              disabled={!!viewing}
            />
          </label>
        </div>
        <div className="form-row full">
          <label>
            Notes
            <textarea
              placeholder="Any extra info..."
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              disabled={!!viewing}
              rows={2}
            />
          </label>
        </div>
        <div className="form-actions">
          {viewing ? (
            <>
              <button type="button" className="btn-primary" onClick={startEdit}>
                Edit
              </button>
              <button type="button" className="btn-secondary" onClick={cancelEdit}>
                Close
              </button>
            </>
          ) : (
            <>
              <button type="submit" className="btn-primary">
                {editing ? 'Save Changes' : 'Add Coach'}
              </button>
              {editing && (
                <>
                  <button type="button" className="btn-secondary" onClick={cancelEdit}>
                    Cancel
                  </button>
                  <button type="button" className="btn-new" onClick={() => { setEditing(null); setViewing(null); setForm({ ...emptyForm }); }}>
                    + New
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </form>

      <div className="filters">
        <div className="filter-group">
          <label>Filter Faction</label>
          <div className="filter-buttons">
            {['All', 'Horde', 'Alliance'].map(f => (
              <button
                key={f}
                className={`filter-btn ${f.toLowerCase()} ${factionFilter === f ? 'active' : ''}`}
                onClick={() => setFactionFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="filter-group">
          <label>Filter Class</label>
          <select value={classFilter} onChange={e => setClassFilter(e.target.value)}>
            <option value="All">All Classes</option>
            {WOW_CLASSES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>Search</label>
          <input
            type="text"
            placeholder="Search discord or partner..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          {coaches.length === 0
            ? 'No coaches added yet. Add your first one above!'
            : 'No coaches match your filters.'}
        </div>
      ) : (
        <div className="coach-table-wrap">
          <table className="coach-table">
            <thead>
              <tr>
                <th>Discord</th>
                <th>Faction</th>
                <th>Class</th>
                <th>Coaching With</th>
                <th>Hours</th>
                <th>Bracket</th>
                <th></th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(coach => (
                <tr
                  key={coach._id}
                  className={`${coach.faction.toLowerCase()} clickable ${viewing === coach._id ? 'selected' : ''} ${pinnedIds.has(coach._id) ? 'pinned-row' : ''}`}
                  onClick={() => viewCoach(coach)}
                >
                  <td className="discord-cell">
                    {coach.discord}
                    {coach.alias && <span className="alias">{coach.alias}</span>}
                  </td>
                  <td>
                    <span className={`faction-tag ${coach.faction.toLowerCase()}`}>
                      {coach.faction}
                    </span>
                  </td>
                  <td>
                    <span
                      className="class-tag"
                      style={{ color: CLASS_COLORS[coach.wowClass] || '#fff' }}
                    >
                      {coach.wowClass}
                    </span>
                  </td>
                  <td>{coach.partner || '\u2014'}</td>
                  <td className="hours-cell">
                    {coach.hoursPrepaid > 0 ? (
                      <span
                        className={`hours-tag ${
                          coach.hoursPrepaid - (coach.hoursUsed || 0) <= 0 ? 'depleted' : 'remaining'
                        }`}
                      >
                        {coach.hoursUsed || 0}/{coach.hoursPrepaid}h
                      </span>
                    ) : (
                      '\u2014'
                    )}
                    {coach.notes && <span className="has-notes" title={coach.notes}>*</span>}
                  </td>
                  <td className="bracket-cell" onClick={e => e.stopPropagation()}>
                    <div className="bracket-group">
                      {(['2', '3', '5'] as const).map(b => {
                        const active = (coach.brackets || []).includes(b);
                        return (
                          <button
                            key={b}
                            className={`bracket-btn ${active ? 'active' : ''}`}
                            onClick={async e => {
                              e.stopPropagation();
                              const next = active
                                ? (coach.brackets || []).filter(x => x !== b)
                                : [...(coach.brackets || []), b];
                              setCoaches(prev => prev.map(c =>
                                c._id === coach._id ? { ...c, brackets: next } : c
                              ));
                              fetch(`${API_BASE_URL}/api/coach-tracker/coaches/${coach._id}`, {
                                method: 'PATCH',
                                headers: authHeaders(),
                                credentials: 'include',
                                body: JSON.stringify({ brackets: next }),
                              });
                            }}
                          >
                            {b}s
                          </button>
                        );
                      })}
                    </div>
                  </td>
                  <td className="pin-note-cell">
                    {pinnedIds.has(coach._id) && (
                      <input
                        className="pin-note-input"
                        type="text"
                        placeholder="why pinned..."
                        value={pinNotes[coach._id] || ''}
                        onClick={e => e.stopPropagation()}
                        onChange={e => { e.stopPropagation(); savePinNote(coach._id, e.target.value); }}
                        maxLength={80}
                      />
                    )}
                  </td>
                  <td className="actions-cell">
                    <button
                      className={`btn-icon pin ${pinnedIds.has(coach._id) ? 'pinned' : ''}`}
                      onClick={e => { e.stopPropagation(); togglePin(coach._id); }}
                      title={pinnedIds.has(coach._id) ? 'Unpin' : 'Pin to top'}
                    >
                      {pinnedIds.has(coach._id) ? '★' : '☆'}
                    </button>
                    <button
                      className="btn-icon log"
                      onClick={e => { e.stopPropagation(); openLog(coach); }}
                      title="Activity Log"
                    >
                      Log{coach.activityLog?.length ? ` (${coach.activityLog.length})` : ''}
                    </button>
                    {confirmDeleteId === coach._id ? (
                      <span className="delete-confirm" onClick={e => e.stopPropagation()}>
                        <span className="delete-confirm-label">Sure?</span>
                        <button
                          className="btn-icon delete confirm-yes"
                          onClick={e => { e.stopPropagation(); setConfirmDeleteId(null); deleteCoach(coach._id); }}
                        >
                          Yes
                        </button>
                        <button
                          className="btn-icon confirm-no"
                          onClick={e => { e.stopPropagation(); setConfirmDeleteId(null); }}
                        >
                          No
                        </button>
                      </span>
                    ) : (
                      <button
                        className="btn-icon delete"
                        onClick={e => { e.stopPropagation(); setConfirmDeleteId(coach._id); }}
                        title="Delete"
                      >
                        Del
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Activity Log Modal */}
      {logCoach && (
        <div className="log-overlay" onClick={closeLog}>
          <div className="log-modal" onClick={e => e.stopPropagation()}>
            <div className="log-header">
              <div className="log-title">
                <span className="log-icon">💬</span>
                <h3>{logCoach.discord}</h3>
                <span className={`faction-tag ${logCoach.faction.toLowerCase()}`}>
                  {logCoach.faction}
                </span>
              </div>
              <button className="log-close" onClick={closeLog}>✕</button>
            </div>

            <div className="log-messages">
              {(!logCoach.activityLog || logCoach.activityLog.length === 0) && (
                <div className="log-empty">No activity yet. Add your first note below.</div>
              )}
              {logCoach.activityLog?.map((entry, i) => (
                <div key={entry._id || i} className="log-entry">
                  <div className="log-entry-message">{entry.message}</div>
                  <div className="log-entry-time">
                    {new Date(entry.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}{' '}
                    at{' '}
                    {new Date(entry.createdAt).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              ))}
              <div ref={logEndRef} />
            </div>

            <div className="log-input-area">
              <input
                type="text"
                className="log-input"
                placeholder="What happened..."
                value={logMessage}
                onChange={e => setLogMessage(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendLogEntry();
                  }
                }}
                disabled={logSending}
                autoFocus
              />
              <button
                className="log-send"
                onClick={sendLogEntry}
                disabled={logSending || !logMessage.trim()}
              >
                {logSending ? '...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
