import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboardData, Session, Coach } from './useDashboardData';
import { ScheduleModal } from './ScheduleModal';

const CLASS_COLORS: Record<string, string> = {
  'Death Knight': '#C41E3A', 'Demon Hunter': '#A330C9', 'Druid': '#FF7C0A',
  'Evoker': '#33937F', 'Hunter': '#AAD372', 'Mage': '#3FC7EB', 'Monk': '#00FF98',
  'Paladin': '#F48CBA', 'Priest': '#FFFFFF', 'Rogue': '#FFF468',
  'Shaman': '#0070DD', 'Warlock': '#8788EE', 'Warrior': '#C69B6D',
};

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function fmtTime(d: Date) { return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }); }
function fmtDate(d: Date) { return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }); }

// --- TakeawaysModal ---
interface TakeawaysModalProps {
  session: Session;
  onClose: () => void;
  onSave: (id: string, payload: Partial<Session>) => Promise<void>;
}

function TakeawaysModal({ session, onClose, onSave }: TakeawaysModalProps) {
  const defaultSlug = session.discord.toLowerCase().replace(/\s+/g, '-');
  const [userSlug, setUserSlug] = useState(session.userSlug || '');
  const [comp, setComp] = useState(session.comp || '');
  const [pros, setPros] = useState<string[]>(session.pros || []);
  const [cons, setCons] = useState<string[]>(session.cons || []);
  const [takeaways, setTakeaways] = useState(session.takeaways || '');
  const [newPro, setNewPro] = useState('');
  const [newCon, setNewCon] = useState('');
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const slugForLink = userSlug || defaultSlug;
  const shareUrl = `https://gladiatorguru.com/#/user/${slugForLink}/${session._id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave(session._id, { userSlug, comp, pros, cons, takeaways });
    setSaving(false);
    onClose();
  };

  const date = new Date(session.scheduledAt);
  const clsColor = CLASS_COLORS[session.wowClass] || '#aaa';
  const factionColor = session.faction === 'Horde' ? '#ef5350' : '#42a5f5';

  const overlayStyle: React.CSSProperties = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1100, backdropFilter: 'blur(4px)',
  };
  const modalStyle: React.CSSProperties = {
    background: '#141820', border: '1px solid #252a3a', borderRadius: 14,
    padding: '28px 32px', width: 520, maxWidth: '95vw', maxHeight: '90vh',
    overflowY: 'auto', boxShadow: '0 24px 80px rgba(0,0,0,0.7)',
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  };
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 11, fontWeight: 600, color: '#505878',
    letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6,
  };
  const inputStyle: React.CSSProperties = {
    width: '100%', background: '#0e1118', border: '1px solid #252a3a',
    borderRadius: 8, color: '#c8d0e8', fontSize: 13, padding: '9px 12px',
    outline: 'none', boxSizing: 'border-box',
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#d0daf0' }}>Session Takeaways</h3>
            <div style={{ fontSize: 12, color: '#404860', marginTop: 2 }}>{session.discord}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#404860', cursor: 'pointer', fontSize: 20, lineHeight: 1 }}>×</button>
        </div>

        {/* Session info */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 20, padding: '10px 14px', background: '#0c0e16', borderRadius: 8, border: '1px solid #1a1e2e' }}>
          <span style={{ fontSize: 13, color: '#c8d0e8', fontWeight: 600 }}>{fmtDate(date)}</span>
          <span style={{ fontSize: 11, color: '#404860' }}>{fmtTime(date)}</span>
          <span style={{ fontSize: 11, color: clsColor, fontWeight: 600 }}>{session.wowClass}</span>
          <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 3, fontWeight: 700, background: session.faction === 'Horde' ? 'rgba(229,57,53,0.18)' : 'rgba(30,136,229,0.18)', color: factionColor }}>{session.faction}</span>
          <span style={{ padding: '1px 6px', borderRadius: 3, background: '#181c28', color: '#7080a0', fontWeight: 600, border: '1px solid #252840', fontSize: 10 }}>{session.bracket}s</span>
        </div>

        {/* Shareable link */}
        <div style={{ marginBottom: 18 }}>
          <label style={labelStyle}>Shareable Link</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input readOnly value={shareUrl} style={{ ...inputStyle, flex: 1, color: '#505878', fontSize: 11 }} />
            <button onClick={handleCopy} style={{ padding: '9px 14px', borderRadius: 8, border: '1px solid #252a3a', background: copied ? 'rgba(0,210,140,0.15)' : '#0e1118', color: copied ? '#00d28c' : '#7090c0', cursor: 'pointer', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        {/* User Slug */}
        <div style={{ marginBottom: 18 }}>
          <label style={labelStyle}>Link Slug (default: discord name)</label>
          <input
            value={userSlug}
            onChange={e => setUserSlug(e.target.value)}
            placeholder={defaultSlug}
            style={inputStyle}
          />
        </div>

        {/* Comp */}
        <div style={{ marginBottom: 18 }}>
          <label style={labelStyle}>Comp Played</label>
          <input
            value={comp}
            onChange={e => setComp(e.target.value)}
            placeholder="e.g. RMP, TSG, Jungle"
            style={inputStyle}
          />
        </div>

        {/* Pros */}
        <div style={{ marginBottom: 18 }}>
          <label style={labelStyle}>What You Did Well (Pros)</label>
          {pros.map((p, i) => (
            <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 6 }}>
              <span style={{ flex: 1, fontSize: 13, color: '#a0e0a0', background: '#0a1810', border: '1px solid #1a3020', borderRadius: 6, padding: '7px 10px' }}>{p}</span>
              <button onClick={() => setPros(prev => prev.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', color: '#404860', cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: '0 4px' }}>×</button>
            </div>
          ))}
          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
            <input value={newPro} onChange={e => setNewPro(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && newPro.trim()) { setPros(p => [...p, newPro.trim()]); setNewPro(''); } }} placeholder="Add a pro..." style={{ ...inputStyle, flex: 1 }} />
            <button onClick={() => { if (newPro.trim()) { setPros(p => [...p, newPro.trim()]); setNewPro(''); } }} style={{ padding: '9px 14px', borderRadius: 8, border: '1px solid rgba(0,180,80,0.3)', background: 'rgba(0,180,80,0.08)', color: '#50c878', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>Add</button>
          </div>
        </div>

        {/* Cons */}
        <div style={{ marginBottom: 18 }}>
          <label style={labelStyle}>Areas to Improve (Cons)</label>
          {cons.map((c, i) => (
            <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 6 }}>
              <span style={{ flex: 1, fontSize: 13, color: '#e0a080', background: '#180f0a', border: '1px solid #301a10', borderRadius: 6, padding: '7px 10px' }}>{c}</span>
              <button onClick={() => setCons(prev => prev.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', color: '#404860', cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: '0 4px' }}>×</button>
            </div>
          ))}
          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
            <input value={newCon} onChange={e => setNewCon(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && newCon.trim()) { setCons(p => [...p, newCon.trim()]); setNewCon(''); } }} placeholder="Add a con..." style={{ ...inputStyle, flex: 1 }} />
            <button onClick={() => { if (newCon.trim()) { setCons(p => [...p, newCon.trim()]); setNewCon(''); } }} style={{ padding: '9px 14px', borderRadius: 8, border: '1px solid rgba(220,80,60,0.3)', background: 'rgba(220,80,60,0.08)', color: '#e07060', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>Add</button>
          </div>
        </div>

        {/* Takeaways */}
        <div style={{ marginBottom: 24 }}>
          <label style={labelStyle}>General Notes</label>
          <textarea
            value={takeaways}
            onChange={e => setTakeaways(e.target.value)}
            placeholder="Overall session notes, advice, next steps..."
            rows={3}
            style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
          />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '9px 20px', borderRadius: 8, border: '1px solid #252a3a', background: 'transparent', color: '#505878', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Cancel</button>
          <button onClick={handleSave} disabled={saving} style={{ padding: '9px 24px', borderRadius: 8, border: 'none', background: '#4a6fa5', color: '#fff', cursor: saving ? 'default' : 'pointer', fontSize: 13, fontWeight: 700 }}>
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- SessionCard ---
function SessionCard({ s, onDelete, onTakeaways }: { s: Session; onDelete: () => void; onTakeaways: () => void }) {
  const clsColor = CLASS_COLORS[s.wowClass] || '#aaa';
  const isHorde = s.faction === 'Horde';
  const factionColor = isHorde ? '#e53935' : '#1e88e5';
  const date = new Date(s.scheduledAt);
  return (
    <div style={{
      background: '#0e1016', borderRadius: 6, marginBottom: 8,
      borderLeft: `3px solid ${clsColor}`, padding: '10px 12px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.4)', position: 'relative',
    }}>
      <button onClick={onDelete} style={{ position: 'absolute', top: 6, right: 6, background: 'none', border: 'none', color: '#303448', cursor: 'pointer', fontSize: 14, lineHeight: 1 }}>×</button>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4, paddingRight: 14 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#d8e0f0' }}>{s.discord}</span>
        <span style={{ fontSize: 9, padding: '2px 5px', borderRadius: 3, fontWeight: 700, background: isHorde ? 'rgba(229,57,53,0.18)' : 'rgba(30,136,229,0.18)', color: factionColor }}>{s.faction.toUpperCase()}</span>
      </div>
      <div style={{ fontSize: 16, fontWeight: 700, color: '#e8eeff', marginBottom: 4 }}>{fmtTime(date)}</div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: clsColor }}>{s.wowClass}</span>
        <span style={{ padding: '1px 6px', borderRadius: 3, background: '#181c28', color: '#7080a0', fontWeight: 600, border: '1px solid #252840', fontSize: 10 }}>{s.bracket}s</span>
      </div>
      {s.notes && <div style={{ fontSize: 10, color: '#505870', fontStyle: 'italic', lineHeight: 1.4, marginTop: 2, marginBottom: 6 }}>{s.notes}</div>}
      <button
        onClick={e => { e.stopPropagation(); onTakeaways(); }}
        style={{ marginTop: 4, padding: '3px 10px', borderRadius: 5, background: 'rgba(74,111,165,0.12)', border: '1px solid rgba(74,111,165,0.3)', color: '#6080b0', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}
      >Takeaways</button>
    </div>
  );
}


export function Dashboard3() {
  const navigate = useNavigate();
  const { coaches, sessions, loading, createSession, deleteSession, toggleQueued, togglePin, updateSession } = useDashboardData();
  const [showModal, setShowModal] = useState(false);
  const [selectedCoachId, setSelectedCoachId] = useState<string | null>(null);
  const [takeawaysSession, setTakeawaysSession] = useState<Session | null>(null);
  const now = new Date();
  const d1 = new Date(now); d1.setDate(now.getDate() + 1);
  const d2 = new Date(now); d2.setDate(now.getDate() + 2);

  const sessToday = sessions.filter(s => isSameDay(new Date(s.scheduledAt), now)).sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
  const sessTomorrow = sessions.filter(s => isSameDay(new Date(s.scheduledAt), d1)).sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
  const sessDay2 = sessions.filter(s => isSameDay(new Date(s.scheduledAt), d2)).sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

  const queued = coaches.filter(c => c.queued);

  const sessionColumns = [
    { label: 'Today', date: fmtDate(now), sessions: sessToday, accentColor: '#1e88e5', headerBg: '#111a28' },
    { label: 'Tomorrow', date: fmtDate(d1), sessions: sessTomorrow, accentColor: '#8b60d0', headerBg: '#181228' },
    { label: fmtDate(d2), date: '', sessions: sessDay2, accentColor: '#2a8a5a', headerBg: '#101e18' },
  ];

  const thStyle: React.CSSProperties = { padding: '8px 12px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#404860', letterSpacing: '0.07em', textTransform: 'uppercase', borderBottom: '1px solid #151828' };
  const tdStyle: React.CSSProperties = { padding: '8px 12px', fontSize: 12, color: '#a0aac0', borderBottom: '1px solid #111420' };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#505070', fontFamily: 'system-ui' }}>Loading...</div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', fontFamily: "'Segoe UI', system-ui, sans-serif", color: '#c0c8dc' }}>
      {showModal && (
        <ScheduleModal
          coaches={coaches}
          onSave={createSession}
          onClose={() => { setShowModal(false); setSelectedCoachId(null); }}
          defaultCoachId={selectedCoachId || undefined}
        />
      )}
      {takeawaysSession && (
        <TakeawaysModal
          session={takeawaysSession}
          onClose={() => setTakeawaysSession(null)}
          onSave={updateSession}
        />
      )}

      {/* Header */}
      <div style={{ padding: '12px 24px', background: '#080810', borderBottom: '1px solid #141520', display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: '#8090c0', letterSpacing: '0.05em' }}>WoW COACHING</span>
        <span style={{ fontSize: 11, color: '#282e40' }}>Kanban View</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 16, alignItems: 'center' }}>
          {[{ label: 'Coaches', val: coaches.length, color: '#4a6fa5' }, { label: 'Sessions', val: sessions.length, color: '#2a8a5a' }].map(s => (
            <div key={s.label} style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: 9, color: '#303550' }}>{s.label}</div>
            </div>
          ))}
          <button onClick={() => navigate('/admin/coach-tracker')} style={{ marginLeft: 8, padding: '7px 16px', borderRadius: 8, border: '1px solid rgba(0,210,140,0.3)', background: 'transparent', color: '#00d28c', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Coach Tracker</button>
          <button onClick={() => { setSelectedCoachId(null); setShowModal(true); }} style={{ marginLeft: 4, padding: '7px 16px', borderRadius: 8, border: 'none', background: '#4a6fa5', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>+ Session</button>
        </div>
        <span style={{ fontSize: 11, color: '#303550' }}>{now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
      </div>

      <div style={{ padding: '20px 24px' }}>
        {/* Sessions kanban */}
        <div style={{ fontSize: 11, fontWeight: 700, color: '#303550', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>Upcoming Sessions</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 28 }}>
          {sessionColumns.map(col => (
            <div key={col.label}>
              <div style={{ padding: '9px 14px', borderRadius: '8px 8px 0 0', background: col.headerBg, borderBottom: `2px solid ${col.accentColor}`, display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: col.accentColor }}>{col.label}</span>
                {col.date && <span style={{ fontSize: 10, color: `${col.accentColor}88` }}>{col.date}</span>}
                <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, background: `${col.accentColor}22`, color: col.accentColor, padding: '1px 6px', borderRadius: 10 }}>{col.sessions.length}</span>
              </div>
              <div style={{ background: '#0c0c14', borderRadius: '0 0 8px 8px', border: '1px solid #151825', borderTop: 'none', padding: '10px', minHeight: 80 }}>
                {col.sessions.length === 0
                  ? <div style={{ fontSize: 11, color: '#1e2230', textAlign: 'center', paddingTop: 20 }}>None</div>
                  : col.sessions.map(s => (
                    <SessionCard
                      key={s._id}
                      s={s}
                      onDelete={() => deleteSession(s._id)}
                      onTakeaways={() => setTakeawaysSession(s)}
                    />
                  ))
                }
              </div>
            </div>
          ))}
        </div>

        {/* Daily Queue */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#303550', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Today's Queue</span>
            <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 10, background: 'rgba(0,210,140,0.1)', color: '#00d28c', fontWeight: 700 }}>{queued.length}</span>
            <span style={{ fontSize: 10, color: '#252838' }}>· toggle from roster below</span>
          </div>
          {queued.length === 0 ? (
            <div style={{ fontSize: 12, color: '#1e2230', padding: '14px 0' }}>No one queued for today — hit <span style={{ color: '#00d28c', fontWeight: 600 }}>+Q</span> on a coach below</div>
          ) : (
            <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4 }}>
              {queued.map(c => {
                const clsColor = CLASS_COLORS[c.wowClass] || '#aaa';
                const factionColor = c.faction === 'Horde' ? '#e53935' : '#1e88e5';
                return (
                  <div key={c._id} style={{ minWidth: 170, maxWidth: 180, borderRadius: 10, background: '#0c0e16', border: '1px solid #1a2030', borderTop: '3px solid #00d28c', padding: '12px 14px', flexShrink: 0, position: 'relative' }}>
                    <button onClick={() => toggleQueued(c)} title="Remove from queue" style={{ position: 'absolute', top: 7, right: 8, background: 'none', border: 'none', color: '#252838', cursor: 'pointer', fontSize: 14, lineHeight: 1 }}>×</button>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#d8e0f4', marginBottom: 4, paddingRight: 16 }}>{c.discord}</div>
                    <div style={{ fontSize: 11, color: clsColor, marginBottom: 6 }}>{c.wowClass}</div>
                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', alignItems: 'center' }}>
                      <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 3, fontWeight: 700, background: c.faction === 'Horde' ? 'rgba(229,57,53,0.15)' : 'rgba(30,136,229,0.15)', color: factionColor }}>{c.faction}</span>
                      {c.brackets.map(b => <span key={b} style={{ padding: '1px 6px', borderRadius: 3, background: '#141828', border: '1px solid #1e2238', fontSize: 10, color: '#5060a0', fontWeight: 700 }}>{b}s</span>)}
                    </div>
                    {c.pinNote && <div style={{ marginTop: 8, fontSize: 9, color: '#505878', fontStyle: 'italic', lineHeight: 1.4 }}>{c.pinNote}</div>}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Full roster table */}
        <div style={{ fontSize: 11, fontWeight: 700, color: '#303550', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>Full Roster</div>
        <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid #151825' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ background: '#080810' }}>
              <th style={thStyle}></th><th style={thStyle}></th><th style={thStyle}>Discord</th><th style={thStyle}>Faction</th><th style={thStyle}>Class</th>
              <th style={thStyle}>Partner</th><th style={thStyle}>Hours</th><th style={thStyle}>Brackets</th><th style={thStyle}>Note</th><th style={thStyle}></th>
            </tr></thead>
            <tbody>
              {[...coaches].sort((a, b) => (b.queued ? 1 : 0) - (a.queued ? 1 : 0) || (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0)).map((c: Coach, i: number) => {
                const clsColor = CLASS_COLORS[c.wowClass] || '#aaa';
                return (
                  <tr key={c._id} style={{ background: c.queued ? 'rgba(0,210,140,0.04)' : i % 2 === 0 ? '#0a0a0f' : '#090910', borderLeft: c.queued ? '2px solid rgba(0,210,140,0.35)' : c.pinned ? '2px solid rgba(200,168,48,0.3)' : undefined }}>
                    <td style={{ ...tdStyle, width: 40, textAlign: 'center' }}>
                      <button
                        onClick={() => toggleQueued(c)}
                        title={c.queued ? 'Remove from queue' : 'Add to queue'}
                        style={{
                          background: c.queued ? 'rgba(0,210,140,0.15)' : 'transparent',
                          border: `1px solid ${c.queued ? 'rgba(0,210,140,0.4)' : '#1e2238'}`,
                          borderRadius: 5, color: c.queued ? '#00d28c' : '#303550',
                          fontSize: 10, fontWeight: 700, cursor: 'pointer',
                          padding: '3px 7px', lineHeight: 1, transition: 'all 0.15s',
                        }}
                      >{c.queued ? '✓Q' : '+Q'}</button>
                    </td>
                    <td style={{ ...tdStyle, width: 32, textAlign: 'center' }}>
                      <button
                        onClick={() => togglePin(c)}
                        title={c.pinned ? 'Unpin' : 'Pin'}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, lineHeight: 1, color: c.pinned ? '#c8a830' : '#252838', padding: '2px 4px' }}
                      >{c.pinned ? '★' : '☆'}</button>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 3, height: 28, borderRadius: 2, background: clsColor }} />
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            {c.pinned && <span style={{ color: '#c8a830', fontSize: 10 }}>★</span>}
                            <span style={{ fontWeight: 600, color: '#d0d8ec', fontSize: 12 }}>{c.discord}</span>
                          </div>
                          {c.alias && c.alias !== c.discord && <div style={{ fontSize: 10, color: '#303450' }}>{c.alias}</div>}
                        </div>
                      </div>
                    </td>
                    <td style={tdStyle}><span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 3, fontWeight: 700, background: c.faction === 'Horde' ? 'rgba(229,57,53,0.14)' : 'rgba(30,136,229,0.14)', color: c.faction === 'Horde' ? '#ef5350' : '#42a5f5' }}>{c.faction}</span></td>
                    <td style={{ ...tdStyle, color: clsColor, fontWeight: 600 }}>{c.wowClass}</td>
                    <td style={{ ...tdStyle, color: '#505870', fontSize: 11 }}>{c.partner || <span style={{ color: '#20253a' }}>—</span>}</td>
                    <td style={tdStyle}>{c.hoursPrepaid === 0 ? <span style={{ color: '#282e40' }}>—</span> : <span style={{ color: c.hoursUsed >= c.hoursPrepaid ? '#ef5350' : '#6070a0', fontSize: 11 }}>{c.hoursUsed}/{c.hoursPrepaid}h</span>}</td>
                    <td style={tdStyle}><div style={{ display: 'flex', gap: 3 }}>{c.brackets.map(b => <span key={b} style={{ padding: '1px 6px', borderRadius: 3, background: '#141828', border: '1px solid #1e2238', fontSize: 10, color: '#6070a0', fontWeight: 700 }}>{b}s</span>)}</div></td>
                    <td style={{ ...tdStyle, fontSize: 10, color: '#404860', fontStyle: 'italic', maxWidth: 180 }}>{c.pinNote || <span style={{ color: '#181c28' }}>—</span>}</td>
                    <td style={{ ...tdStyle, textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <button
                        onClick={e => { e.stopPropagation(); setSelectedCoachId(c._id); setShowModal(true); }}
                        style={{ padding: '3px 10px', borderRadius: 5, background: 'rgba(74,111,165,0.15)', border: '1px solid rgba(74,111,165,0.4)', color: '#7090c0', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}
                      >+ Session</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
