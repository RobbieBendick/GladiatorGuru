import { useState, useEffect, useRef, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuthToken, removeAuthToken } from '../../config/auth';
import { API_BASE_URL } from '../../config/api';
import { ROUTE_PATHS } from '../../schemas/route-paths';
import './coach-tracker.css';

// Format a decimal hours value to friendly string e.g. 1.5 → "1h 30m"
const fmtHours = (h: number): string => {
  const totalMins = Math.round(h * 60);
  const hrs = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  if (hrs === 0) return `${mins}m`;
  if (mins === 0) return `${hrs}h`;
  return `${hrs}h ${mins}m`;
};


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
  pinned: boolean;
  pinNote: string;
  inactive: boolean;
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
  const [submitError, setSubmitError] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleteAllStep, setDeleteAllStep] = useState(0); // 0=idle, 1=first confirm, 2=second confirm
  const pinNoteDebounceRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const [schedulesOpen, setSchedulesOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [staff, setStaff] = useState<{ _id: string; username: string; coachAlias?: string; discordUsername?: string; role: string }[]>([]);
  const [logCoach, setLogCoach] = useState<Coach | null>(null);
  const [logMessage, setLogMessage] = useState('');
  const [logSending, setLogSending] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);
  const justEnteredEditRef = useRef(false);
  const [hoursPickerOpen, setHoursPickerOpen] = useState<'hoursPrepaid'|'hoursUsed'|null>(null);
  const [jsonMode, setJsonMode] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const [jsonError, setJsonError] = useState('');

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
    setSubmitError('');

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
        if (!response.ok) {
          const data = await response.json();
          setSubmitError(data?.validationErrors?.message || 'Failed to add coach.');
          return;
        }
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

  const deleteAll = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/coach-tracker/coaches`, {
        method: 'DELETE',
        headers: authHeaders(),
        credentials: 'include',
      });
      if (handleAuthError(response.status)) return;
      setDeleteAllStep(0);
      cancelEdit();
      await fetchCoaches();
    } catch (error) {
      console.error('Error deleting all coaches:', error);
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

  const togglePin = (coach: Coach) => {
    const next = !coach.pinned;
    setCoaches(prev => prev.map(c => c._id === coach._id ? { ...c, pinned: next } : c));
    fetch(`${API_BASE_URL}/api/coach-tracker/coaches/${coach._id}`, {
      method: 'PATCH',
      headers: authHeaders(),
      credentials: 'include',
      body: JSON.stringify({ pinned: next }),
    }).catch(err => console.error('Error toggling pin:', err));
  };

  const toggleInactive = (coach: Coach) => {
    const next = !coach.inactive;
    setCoaches(prev => prev.map(c => c._id === coach._id ? { ...c, inactive: next } : c));
    fetch(`${API_BASE_URL}/api/coach-tracker/coaches/${coach._id}`, {
      method: 'PATCH',
      headers: authHeaders(),
      credentials: 'include',
      body: JSON.stringify({ inactive: next }),
    }).catch(err => console.error('Error toggling inactive:', err));
  };

  const savePinNote = (id: string, note: string) => {
    // Optimistic local update
    setCoaches(prev => prev.map(c => c._id === id ? { ...c, pinNote: note } : c));
    // Debounce the API call so we don't fire on every keystroke
    if (pinNoteDebounceRef.current[id]) clearTimeout(pinNoteDebounceRef.current[id]);
    pinNoteDebounceRef.current[id] = setTimeout(() => {
      fetch(`${API_BASE_URL}/api/coach-tracker/coaches/${id}`, {
        method: 'PATCH',
        headers: authHeaders(),
        credentials: 'include',
        body: JSON.stringify({ pinNote: note }),
      }).catch(err => console.error('Error saving pin note:', err));
    }, 600);
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
      if (a.inactive !== b.inactive) return a.inactive ? 1 : -1;
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      const aTime = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const bTime = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return bTime - aTime;
    });

  const hordeCount = coaches.filter(c => c.faction === 'Horde').length;
  const allianceCount = coaches.filter(c => c.faction === 'Alliance').length;

  const exportData = () => {
    const blob = new Blob([JSON.stringify(coaches, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wow-coaches-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const openSchedules = async () => {
    setSchedulesOpen(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/public/staff`);
      const data = await res.json();
      if (data.data) setStaff(data.data);
    } catch (err) {
      console.error('Error fetching staff:', err);
    }
  };

  const copyLink = (id: string) => {
    const url = `${window.location.origin}${window.location.pathname}#/schedule/${id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const importData = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const raw = JSON.parse(evt.target?.result as string);

        // Support plain array export
        const coachList = Array.isArray(raw) ? raw : null;
        if (!Array.isArray(coachList)) throw new Error('Invalid format');

        const response = await fetch(`${API_BASE_URL}/api/coach-tracker/coaches/import`, {
          method: 'POST',
          headers: authHeaders(),
          credentials: 'include',
          body: JSON.stringify({ coaches: coachList }),
        });
        if (handleAuthError(response.status)) return;

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

  const applyJson = () => {
    setJsonError('');
    try {
      const parsed = JSON.parse(jsonInput);
      setForm(f => ({
        ...f,
        discord: parsed.discord || f.discord,
        alias: parsed.alias || parsed.character || parsed.char || f.alias,
        faction: ['Horde', 'Alliance'].includes(parsed.faction) ? parsed.faction : f.faction,
        wowClass: WOW_CLASSES.includes(parsed.wowClass || parsed.class) ? (parsed.wowClass || parsed.class) : f.wowClass,
        partner: parsed.partner || f.partner,
        hoursPrepaid: parsed.hoursPrepaid ?? f.hoursPrepaid,
        hoursUsed: parsed.hoursUsed ?? f.hoursUsed,
        notes: parsed.notes || f.notes,
        brackets: Array.isArray(parsed.brackets) ? parsed.brackets : f.brackets,
      }));
      setJsonMode(false);
      setJsonInput('');
    } catch {
      setJsonError('Invalid JSON — check the format and try again.');
    }
  };

  // ── Hours picker helpers ──────────────────────────────────────────────────
  const getH = (v: number) => Math.floor(Math.round(v * 60) / 60);
  const getM = (v: number) => Math.round(v * 60) % 60;
  const fromHM = (h: number, m: number) => h + m / 60;

  const renderHoursSection = () => {
    const fields: { key: 'hoursPrepaid' | 'hoursUsed'; label: string }[] = [
      { key: 'hoursPrepaid', label: 'Hours Prepaid' },
      { key: 'hoursUsed', label: 'Hours Used' },
    ];
    return (
      <div className="form-row">
        {fields.map(({ key, label }) => (
          <label key={key} style={{ position: 'relative' }}>
            {label}
            <button type="button" className="hui-picker-btn" disabled={!!viewing}
              onClick={() => setHoursPickerOpen(hoursPickerOpen === key ? null : key)}>
              <span className="hui-picker-icon">⏱</span>
              <span className="hui-picker-val">{form[key] > 0 ? fmtHours(form[key]) : '—'}</span>
              <span className="hui-picker-arrow">▾</span>
            </button>
            {hoursPickerOpen === key && (
              <div className="hui-popover">
                <div className="hui-pop-col">
                  <div className="hui-pop-col-head">hr</div>
                  <div className="hui-pop-scroll">
                    {Array.from({ length: 21 }, (_, i) => (
                      <div key={i} className={`hui-pop-item ${getH(form[key]) === i ? 'sel' : ''}`}
                        onClick={() => { setForm(f => ({ ...f, [key]: fromHM(i, getM(f[key])) })); }}>
                        {i}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="hui-pop-sep" />
                <div className="hui-pop-col">
                  <div className="hui-pop-col-head">min</div>
                  <div className="hui-pop-scroll">
                    {[0, 10, 20, 30, 40, 50].map(m => (
                      <div key={m} className={`hui-pop-item ${getM(form[key]) === m ? 'sel' : ''}`}
                        onClick={() => { setForm(f => ({ ...f, [key]: fromHM(getH(f[key]), m) })); setHoursPickerOpen(null); }}>
                        {String(m).padStart(2, '0')}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </label>
        ))}
      </div>
    );
  };

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
          <button type="button" className="btn-secondary" onClick={() => navigate('/admin/dashboard3')} style={{ borderColor: 'rgba(0,210,140,0.3)', color: '#00d28c' }}>
            Dashboard
          </button>
          <button type="button" className="btn-secondary" onClick={openSchedules} style={{ borderColor: 'rgba(138,99,255,0.4)', color: '#a07ef5' }}>
            Schedules
          </button>
          <button type="button" className="btn-secondary" onClick={exportData}>
            Export JSON
          </button>
          <label className="btn-secondary" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}>
            Import JSON
            <input type="file" accept=".json" onChange={importData} hidden />
          </label>
          {deleteAllStep === 0 && (
            <button type="button" className="btn-delete-all" onClick={() => setDeleteAllStep(1)}>
              Delete All
            </button>
          )}
          {deleteAllStep === 1 && (
            <span className="delete-all-confirm">
              <span className="delete-all-label">Are you sure?</span>
              <button type="button" className="btn-delete-all confirm" onClick={() => setDeleteAllStep(2)}>Yes, delete all</button>
              <button type="button" className="btn-secondary" onClick={() => setDeleteAllStep(0)}>Cancel</button>
            </span>
          )}
          {deleteAllStep === 2 && (
            <span className="delete-all-confirm">
              <span className="delete-all-label">This cannot be undone.</span>
              <button type="button" className="btn-delete-all confirm" onClick={deleteAll}>Confirm delete all</button>
              <button type="button" className="btn-secondary" onClick={() => setDeleteAllStep(0)}>Cancel</button>
            </span>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className={`coach-form ${viewing ? 'viewing' : ''}`}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h2 style={{ margin: 0 }}>{viewing ? 'Viewing Coach' : editing ? 'Edit Coach' : 'Add Coach'}</h2>
          {!viewing && !editing && (
            <button type="button" onClick={() => { setJsonMode(m => !m); setJsonError(''); }} style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 6, cursor: 'pointer', background: jsonMode ? 'rgba(138,99,255,0.15)' : 'transparent', border: '1px solid rgba(138,99,255,0.35)', color: '#a07ef5' }}>
              {jsonMode ? '✕ Cancel JSON' : '{ } Paste JSON'}
            </button>
          )}
        </div>
        {jsonMode && (
          <div style={{ marginBottom: 14 }}>
            <textarea
              placeholder={'{\n  "discord": "username",\n  "alias": "CharName",\n  "faction": "Horde",\n  "wowClass": "Warrior",\n  "brackets": ["3"]\n}'}
              value={jsonInput}
              onChange={e => setJsonInput(e.target.value)}
              rows={7}
              style={{ width: '100%', background: '#0a0c14', border: '1px solid rgba(138,99,255,0.3)', borderRadius: 7, color: '#c0b8f0', fontSize: 12, padding: '10px 12px', fontFamily: 'monospace', boxSizing: 'border-box', resize: 'vertical', outline: 'none' }}
              autoFocus
            />
            {jsonError && <div style={{ fontSize: 11, color: '#ef5350', marginTop: 4 }}>{jsonError}</div>}
            <button type="button" onClick={applyJson} style={{ marginTop: 8, fontSize: 12, fontWeight: 700, padding: '6px 16px', borderRadius: 6, cursor: 'pointer', background: 'rgba(138,99,255,0.2)', border: '1px solid rgba(138,99,255,0.4)', color: '#a07ef5' }}>
              Apply JSON →
            </button>
          </div>
        )}
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
        {renderHoursSection()}
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
        {submitError && <div style={{ fontSize: 12, color: '#ef5350', marginBottom: 8, padding: '6px 10px', background: 'rgba(239,83,80,0.08)', borderRadius: 6, border: '1px solid rgba(239,83,80,0.2)' }}>{submitError}</div>}
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
                  className={`${coach.faction.toLowerCase()} clickable ${viewing === coach._id ? 'selected' : ''} ${coach.pinned ? 'pinned-row' : ''}`}
                  onClick={() => viewCoach(coach)}
                  style={coach.inactive ? { opacity: 0.4 } : undefined}
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
                        {fmtHours(coach.hoursUsed || 0)}/{fmtHours(coach.hoursPrepaid)}
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
                    {coach.pinned && (
                      <input
                        className="pin-note-input"
                        type="text"
                        placeholder="why pinned..."
                        value={coach.pinNote || ''}
                        onClick={e => e.stopPropagation()}
                        onChange={e => { e.stopPropagation(); savePinNote(coach._id, e.target.value); }}
                        maxLength={80}
                      />
                    )}
                  </td>
                  <td className="actions-cell">
                    <button
                      className={`btn-icon pin ${coach.pinned ? 'pinned' : ''}`}
                      onClick={e => { e.stopPropagation(); togglePin(coach); }}
                      title={coach.pinned ? 'Unpin' : 'Pin to top'}
                    >
                      {coach.pinned ? '★' : '☆'}
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
                    <button
                      className="btn-icon"
                      onClick={e => { e.stopPropagation(); toggleInactive(coach); }}
                      title={coach.inactive ? 'Mark active' : 'Mark inactive'}
                      style={{ color: coach.inactive ? '#00d28c' : '#604878', borderColor: coach.inactive ? 'rgba(0,210,140,0.3)' : 'rgba(80,60,100,0.4)', background: coach.inactive ? 'rgba(0,210,140,0.08)' : 'transparent' }}
                    >
                      {coach.inactive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Schedules Modal */}
      {schedulesOpen && (
        <div className="log-overlay" onClick={() => setSchedulesOpen(false)}>
          <div className="log-modal" style={{ maxWidth: 600, width: '95%' }} onClick={e => e.stopPropagation()}>
            <div className="log-header">
              <div className="log-title">
                <span className="log-icon">🗓</span>
                <h3>Coach Booking Links</h3>
                <span style={{ fontSize: 12, color: '#6b7280', marginLeft: 8 }}>{staff.length} coaches</span>
              </div>
              <button className="log-close" onClick={() => setSchedulesOpen(false)}>✕</button>
            </div>
            <div className="log-messages" style={{ maxHeight: 460 }}>
              {staff.length === 0 && (
                <div className="log-empty">Loading...</div>
              )}
              {staff
                .slice()
                .sort((a, b) => (a.coachAlias || a.username).localeCompare(b.coachAlias || b.username))
                .map(member => {
                  const displayName = member.coachAlias || member.username;
                  const link = `${window.location.origin}${window.location.pathname}#/schedule/${member._id}`;
                  const copied = copiedId === member._id;
                  return (
                    <div key={member._id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid #1a1f30' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                          <span style={{ fontWeight: 600, color: '#e2e8f0', fontSize: 14 }}>
                            {displayName}
                          </span>
                          {member.discordUsername && (
                            <span style={{ fontSize: 12, color: '#6b7280' }}>{member.discordUsername}</span>
                          )}
                          <span style={{ fontSize: 11, padding: '1px 6px', borderRadius: 4, background: member.role === 'admin' ? 'rgba(240,68,56,0.15)' : 'rgba(138,99,255,0.15)', color: member.role === 'admin' ? '#f04438' : '#a07ef5', border: `1px solid ${member.role === 'admin' ? 'rgba(240,68,56,0.3)' : 'rgba(138,99,255,0.3)'}` }}>
                            {member.role}
                          </span>
                        </div>
                        <div style={{ fontSize: 11, color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {link}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                        <button
                          className="btn-secondary"
                          style={{ fontSize: 12, padding: '4px 10px', minWidth: 64, borderColor: copied ? 'rgba(0,210,140,0.5)' : undefined, color: copied ? '#00d28c' : undefined }}
                          onClick={() => copyLink(member._id)}
                        >
                          {copied ? '✓ Copied' : 'Copy'}
                        </button>
                        <a
                          href={`#/schedule/${member._id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-secondary"
                          style={{ fontSize: 12, padding: '4px 10px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
                        >
                          Open
                        </a>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
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
