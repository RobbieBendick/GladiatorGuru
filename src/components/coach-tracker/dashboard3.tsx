import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboardData, Session, Coach } from './useDashboardData';
import { ScheduleModal } from './ScheduleModal';
import { COMP_GUIDES } from '../guides/comp-guides-data';
import { API_BASE_URL } from '../../config/api';

const CLASS_COLORS: Record<string, string> = {
  'Death Knight': '#C41E3A', 'Demon Hunter': '#A330C9', 'Druid': '#FF7C0A',
  'Evoker': '#33937F', 'Hunter': '#AAD372', 'Mage': '#3FC7EB', 'Monk': '#00FF98',
  'Paladin': '#F48CBA', 'Priest': '#FFFFFF', 'Rogue': '#FFF468',
  'Shaman': '#0070DD', 'Warlock': '#8788EE', 'Warrior': '#C69B6D',
};

const WOW_CLASSES_LIST = ['Death Knight','Demon Hunter','Druid','Evoker','Hunter','Mage','Monk','Paladin','Priest','Rogue','Shaman','Warlock','Warrior'];

interface StaffMember { _id: string; username: string; coachAlias?: string; discordUsername?: string; role: string; }

// ─── EditSessionModal ───────────────────────────────────────────────────────
function EditSessionModal({ session, staff, onClose, onSave }: {
  session: Session;
  staff: StaffMember[];
  onClose: () => void;
  onSave: (id: string, payload: Partial<Session>) => Promise<void>;
}) {
  const toLocalDT = (iso: string) => {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const [discord, setDiscord] = useState(session.discord);
  const [scheduledAt, setScheduledAt] = useState(toLocalDT(session.scheduledAt));
  const [wowClass, setWowClass] = useState(session.wowClass);
  const [bracket, setBracket] = useState<'2'|'3'|'5'>(session.bracket);
  const [faction, setFaction] = useState<'Horde'|'Alliance'>(session.faction);
  const [notes, setNotes] = useState(session.notes || '');
  const [assignedIds, setAssignedIds] = useState<string[]>(session.assignedCoachIds || []);
  const [coachSearch, setCoachSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const coachName = (s: StaffMember) => s.coachAlias || s.username;
  const isAssigned = (id: string) => assignedIds.includes(id);

  const toggle = (id: string) => {
    setAssignedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const filteredStaff = staff.filter(s => {
    const q = coachSearch.toLowerCase();
    return (s.coachAlias || s.username).toLowerCase().includes(q) || (s.discordUsername || '').toLowerCase().includes(q);
  });

  const handleSave = async () => {
    setSaving(true);
    const names = assignedIds.map(id => {
      const m = staff.find(s => s._id === id);
      return m ? coachName(m) : '';
    }).filter(Boolean);
    await onSave(session._id, {
      discord, scheduledAt: new Date(scheduledAt).toISOString(),
      wowClass, bracket, faction, notes,
      assignedCoachIds: assignedIds,
      assignedCoachNames: names,
    });
    setSaving(false);
    onClose();
  };

  const inp: React.CSSProperties = { width: '100%', background: '#0a0c14', border: '1px solid #1e2235', borderRadius: 7, color: '#d0d8f0', fontSize: 13, padding: '9px 11px', outline: 'none', boxSizing: 'border-box' };
  const lbl: React.CSSProperties = { display: 'block', fontSize: 10, fontWeight: 700, color: '#505878', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 };

  // ── selected coaches chip row (shared) ────────────────────────────────
  const renderSelected = () => assignedIds.length === 0 ? null : (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 8 }}>
      {assignedIds.map(id => {
        const m = staff.find(s => s._id === id);
        if (!m) return null;
        return (
          <span key={id} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 20, background: 'rgba(74,111,165,0.18)', border: '1px solid rgba(74,111,165,0.35)', fontSize: 11, color: '#90b0e0', fontWeight: 600 }}>
            {coachName(m)}
            <button onClick={() => toggle(id)} style={{ background: 'none', border: 'none', color: '#506080', cursor: 'pointer', fontSize: 13, lineHeight: 1, padding: 0, marginLeft: 1 }}>×</button>
          </span>
        );
      })}
    </div>
  );

  // ── Coach picker — avatar initials bubbles ────────────────────────────
  const renderCoachPicker = () => (
      <div>
        <label style={lbl}>Coaches <span style={{ fontWeight: 400, color: '#303550', textTransform: 'none', letterSpacing: 0, marginLeft: 6 }}>{assignedIds.length} selected</span></label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {staff.map(s => {
            const active = isAssigned(s._id);
            const initials = coachName(s).slice(0, 2).toUpperCase();
            const hue = (coachName(s).charCodeAt(0) * 37 + coachName(s).charCodeAt(1||0) * 13) % 360;
            return (
              <div key={s._id} onClick={() => toggle(s._id)}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, cursor: 'pointer', width: 56 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: active ? `hsl(${hue},55%,28%)` : '#111628', border: active ? `2px solid hsl(${hue},65%,50%)` : '2px solid #1e2235', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: active ? `hsl(${hue},80%,78%)` : '#404860', transition: 'all 0.15s', boxShadow: active ? `0 0 10px hsl(${hue},60%,30%)` : 'none', position: 'relative' }}>
                  {initials}
                  {active && <div style={{ position: 'absolute', bottom: -2, right: -2, width: 14, height: 14, borderRadius: '50%', background: '#4a6fa5', border: '2px solid #0e1120', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ color: '#fff', fontSize: 8, lineHeight: 1 }}>✓</span></div>}
                </div>
                <span style={{ fontSize: 9, color: active ? '#90b0e0' : '#404860', fontWeight: 600, textAlign: 'center', lineHeight: 1.2, maxWidth: 56, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{coachName(s)}</span>
              </div>
            );
          })}
        </div>
        {assignedIds.length > 0 && <button onClick={() => setAssignedIds([])} style={{ marginTop: 8, fontSize: 10, color: '#404860', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Clear all</button>}
      </div>
  );


  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={onClose}>
      <div style={{ background: '#0e1120', border: '1px solid #1e2235', borderRadius: 14, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', padding: 24 }}
        onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#c0ccf0' }}>Edit Session</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#505878', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>×</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Discord */}
          <div>
            <label style={lbl}>Discord</label>
            <input value={discord} onChange={e => setDiscord(e.target.value)} style={inp} placeholder="username#0000" />
          </div>

          {/* Date/Time */}
          <div>
            <label style={lbl}>Date &amp; Time</label>
            <input type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)} style={{ ...inp, colorScheme: 'dark' }} />
          </div>

          {/* Class + Bracket row */}
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 2 }}>
              <label style={lbl}>Class</label>
              <select value={wowClass} onChange={e => setWowClass(e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
                {WOW_CLASSES_LIST.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={lbl}>Bracket</label>
              <div style={{ display: 'flex', gap: 5, height: 38 }}>
                {(['2','3','5'] as const).map(b => (
                  <button key={b} onClick={() => setBracket(b)}
                    style={{ flex: 1, borderRadius: 7, cursor: 'pointer', fontWeight: 700, fontSize: 13, border: bracket === b ? '1px solid #4a6fa5' : '1px solid #1e2235', background: bracket === b ? 'rgba(74,111,165,0.2)' : '#0a0c14', color: bracket === b ? '#90b0e0' : '#505878', transition: 'all 0.12s' }}>
                    {b}s
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Faction */}
          <div>
            <label style={lbl}>Faction</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['Horde','Alliance'] as const).map(f => (
                <button key={f} onClick={() => setFaction(f)}
                  style={{ flex: 1, padding: '8px', borderRadius: 7, cursor: 'pointer', fontWeight: 700, fontSize: 12, border: faction === f ? `1px solid ${f === 'Horde' ? '#e53935' : '#1e88e5'}` : '1px solid #1e2235', background: faction === f ? (f === 'Horde' ? 'rgba(229,57,53,0.15)' : 'rgba(30,136,229,0.15)') : '#0a0c14', color: faction === f ? (f === 'Horde' ? '#e57373' : '#64b5f6') : '#505878', transition: 'all 0.12s' }}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label style={lbl}>Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} style={{ ...inp, resize: 'vertical', lineHeight: 1.5 }} placeholder="comp, goals, anything relevant..." />
          </div>

          {/* Coach picker — varies by view */}
          {renderCoachPicker()}
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 22, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '9px 20px', borderRadius: 8, border: '1px solid #1e2235', background: 'transparent', color: '#505878', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Cancel</button>
          <button onClick={handleSave} disabled={saving} style={{ padding: '9px 24px', borderRadius: 8, border: 'none', background: '#4a6fa5', color: '#fff', cursor: saving ? 'default' : 'pointer', fontSize: 13, fontWeight: 700 }}>
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function fmtTime(d: Date) { return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }); }
function fmtDate(d: Date) { return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }); }

// --- TakeawaysModal ---
interface TakeawaysModalProps {
  session: Session;
  coaches: Coach[];
  onClose: () => void;
  onSave: (id: string, payload: Partial<Session>) => Promise<void>;
}

function TakeawaysModal({ session, coaches, onClose, onSave }: TakeawaysModalProps) {
  const defaultSlug = session.discord.toLowerCase().replace(/\s+/g, '-');
  const [userSlug, setUserSlug] = useState(session.userSlug || '');
  const [linkedCoachId, setLinkedCoachId] = useState(session.coachId || '');
  const knownComps = COMP_GUIDES.map(g => g.name);
  const existingComp = session.comp || '';
  const isKnown = knownComps.includes(existingComp.toUpperCase()) || knownComps.some(n => n.toLowerCase() === existingComp.toLowerCase());
  const [compSelect, setCompSelect] = useState(isKnown ? existingComp.toUpperCase() : existingComp ? '__other__' : '');
  const [compCustom, setCompCustom] = useState(!isKnown ? existingComp : '');
  const comp = compSelect === '__other__' ? compCustom : compSelect;
  const [pros, setPros] = useState<string[]>(session.pros || []);
  const [cons, setCons] = useState<string[]>(session.cons || []);
  const [takeaways, setTakeaways] = useState(session.takeaways || '');
  const [newPro, setNewPro] = useState('');
  const [newCon, setNewCon] = useState('');
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const [jsonError, setJsonError] = useState('');
  const [jsonOpen, setJsonOpen] = useState(false);

  const handleApplyJson = () => {
    setJsonError('');
    try {
      const parsed = JSON.parse(jsonInput.trim());
      if (parsed.comp !== undefined) {
        const c = String(parsed.comp).toUpperCase();
        if (knownComps.includes(c)) { setCompSelect(c); setCompCustom(''); }
        else { setCompSelect('__other__'); setCompCustom(String(parsed.comp)); }
      }
      if (Array.isArray(parsed.pros)) setPros(parsed.pros.map(String));
      if (Array.isArray(parsed.cons)) setCons(parsed.cons.map(String));
      if (parsed.takeaways !== undefined) setTakeaways(String(parsed.takeaways));
      if (parsed.notes !== undefined) setTakeaways(String(parsed.notes));
      setJsonOpen(false);
      setJsonInput('');
    } catch {
      setJsonError('Invalid JSON — check formatting and try again');
    }
  };

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
    await onSave(session._id, { userSlug, comp, pros, cons, takeaways, coachId: linkedCoachId });
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

        {/* Link to Coach */}
        {coaches.length > 0 && (
          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>Link to Coach (roster)</label>
            <select
              value={linkedCoachId}
              onChange={e => setLinkedCoachId(e.target.value)}
              style={{ ...inputStyle, cursor: 'pointer' }}
            >
              <option value="">No coach linked</option>
              {[...coaches].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0)).map(c => (
                <option key={c._id} value={c._id}>
                  {c.pinned ? '★ ' : ''}{c.discord}{c.alias && c.alias !== c.discord ? ` (${c.alias})` : ''} — {c.wowClass}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* JSON Import */}
        <div style={{ marginBottom: 18 }}>
          <button
            type="button"
            onClick={() => { setJsonOpen(o => !o); setJsonError(''); }}
            style={{
              width: '100%', padding: '9px 14px', borderRadius: 8, cursor: 'pointer',
              border: '1px dashed #2a3048', background: jsonOpen ? 'rgba(100,120,200,0.08)' : 'transparent',
              color: '#6070a0', fontSize: 12, fontWeight: 600, textAlign: 'left',
              display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.15s',
            }}
          >
            <span style={{ fontSize: 14 }}>{jsonOpen ? '▾' : '▸'}</span>
            <span>Import from AI JSON</span>
            <span style={{ marginLeft: 'auto', fontSize: 10, color: '#404860', fontWeight: 400 }}>paste JSON → auto-fills fields</span>
          </button>

          {jsonOpen && (
            <div style={{ marginTop: 8, padding: '14px', background: '#0a0c14', border: '1px solid #1e2535', borderRadius: 8 }}>
              <div style={{ marginBottom: 10, padding: '10px 12px', background: '#0d1020', borderRadius: 6, border: '1px solid #1a2030' }}>
                <div style={{ fontSize: 10, color: '#404860', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 6 }}>Expected format</div>
                <pre style={{ margin: 0, fontSize: 11, color: '#50607a', lineHeight: 1.6, fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>{`{
  "comp": "WMD",
  "pros": ["good positioning", "cc chains"],
  "cons": ["missed trinket", "bad peel timing"],
  "takeaways": "focus on trinket usage next session"
}`}</pre>
              </div>
              <textarea
                value={jsonInput}
                onChange={e => { setJsonInput(e.target.value); setJsonError(''); }}
                placeholder="Paste JSON from AI here..."
                rows={5}
                style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5, fontFamily: 'monospace', fontSize: 12, marginBottom: 8 }}
              />
              {jsonError && (
                <div style={{ fontSize: 11, color: '#e07060', marginBottom: 8, padding: '6px 10px', background: 'rgba(220,80,60,0.08)', borderRadius: 6, border: '1px solid rgba(220,80,60,0.2)' }}>
                  {jsonError}
                </div>
              )}
              <button
                type="button"
                onClick={handleApplyJson}
                disabled={!jsonInput.trim()}
                style={{
                  padding: '8px 18px', borderRadius: 8, border: 'none', cursor: jsonInput.trim() ? 'pointer' : 'default',
                  background: jsonInput.trim() ? 'rgba(100,120,220,0.2)' : '#1a1e2e',
                  color: jsonInput.trim() ? '#8090d0' : '#404860',
                  fontSize: 12, fontWeight: 700, transition: 'all 0.15s',
                }}
              >Apply JSON</button>
            </div>
          )}
        </div>

        {/* Comp */}
        <div style={{ marginBottom: 18 }}>
          <label style={labelStyle}>Comp Played</label>
          <select
            value={compSelect}
            onChange={e => { setCompSelect(e.target.value); if (e.target.value !== '__other__') setCompCustom(''); }}
            style={{ ...inputStyle, cursor: 'pointer' }}
          >
            <option value="">Select comp...</option>
            {knownComps.map(n => (
              <option key={n} value={n}>{n} — {COMP_GUIDES.find(g => g.name === n)?.fullName ?? n}</option>
            ))}
            <option value="__other__">Other (type below)</option>
          </select>
          {compSelect === '__other__' && (
            <input
              value={compCustom}
              onChange={e => setCompCustom(e.target.value)}
              placeholder="e.g. RMP, TSG, Jungle..."
              style={{ ...inputStyle, marginTop: 8 }}
              autoFocus
            />
          )}
          {compSelect && compSelect !== '__other__' && (
            <div style={{ marginTop: 6, fontSize: 11, color: '#505878', display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ color: '#4ade80' }}>✓</span> Guide available — will show on the shareable link
            </div>
          )}
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
function SessionCard({ s, onDelete, onTakeaways, onEdit }: { s: Session; onDelete: () => void; onTakeaways: () => void; onEdit: () => void }) {
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
      {s.assignedCoachNames?.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6, flexWrap: 'wrap' }}>
          {s.assignedCoachNames.map(n => {
            const hue = (n.charCodeAt(0) * 37 + (n.charCodeAt(1) || 0) * 13) % 360;
            return (
              <div key={n} title={n} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: `hsl(${hue},45%,22%)`, border: `1.5px solid hsl(${hue},55%,40%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 800, color: `hsl(${hue},75%,70%)`, flexShrink: 0 }}>
                  {n.slice(0, 2).toUpperCase()}
                </div>
                <span style={{ fontSize: 9, color: `hsl(${hue},50%,55%)`, fontWeight: 600 }}>{n}</span>
              </div>
            );
          })}
        </div>
      )}
      {s.notes && <div style={{ fontSize: 10, color: '#505870', fontStyle: 'italic', lineHeight: 1.4, marginTop: 2, marginBottom: 6 }}>{s.notes}</div>}
      <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
        <button
          onClick={e => { e.stopPropagation(); onEdit(); }}
          style={{ padding: '3px 10px', borderRadius: 5, background: 'rgba(100,80,200,0.1)', border: '1px solid rgba(100,80,200,0.25)', color: '#8878d0', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}
        >Edit</button>
        <button
          onClick={e => { e.stopPropagation(); onTakeaways(); }}
          style={{ padding: '3px 10px', borderRadius: 5, background: 'rgba(74,111,165,0.12)', border: '1px solid rgba(74,111,165,0.3)', color: '#6080b0', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}
        >Takeaways</button>
      </div>
    </div>
  );
}


export function Dashboard3() {
  const navigate = useNavigate();
  const { coaches, sessions, requests, pastSessions, pastLoading, loading, createSession, deleteSession, toggleQueued, togglePin, updateSession, fetchPastSessions, acceptRequest, declineRequest } = useDashboardData();
  const [showModal, setShowModal] = useState(false);
  const [selectedCoachId, setSelectedCoachId] = useState<string | null>(null);
  const [takeawaysSession, setTakeawaysSession] = useState<Session | null>(null);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [completedOpen, setCompletedOpen] = useState(false);
  const [pastLoaded, setPastLoaded] = useState(false);
  const [reqView, setReqView] = useState<1|2|3|4>(1);
  const [reqPanelOpen, setReqPanelOpen] = useState(true);
  const [selectedReq, setSelectedReq] = useState<Session | null>(null);
  const [acceptingIds, setAcceptingIds] = useState<string[]>([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/public/staff`)
      .then(r => r.json())
      .then(d => { if (d.data) setStaff(d.data); })
      .catch(() => {});
  }, []);
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

  const handleAccept = async (r: Session) => {
    setAcceptingIds(p => [...p, r._id]);
    await acceptRequest(r._id);
    setAcceptingIds(p => p.filter(id => id !== r._id));
    if (selectedReq?._id === r._id) setSelectedReq(null);
  };
  const handleDecline = async (r: Session) => {
    await declineRequest(r._id);
    if (selectedReq?._id === r._id) setSelectedReq(null);
  };

  const reqFmtTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const reqAcceptBtn = (r: Session, compact = false) => {
    const loading = acceptingIds.includes(r._id);
    return (
      <button onClick={() => handleAccept(r)} disabled={loading}
        style={{ padding: compact ? '3px 10px' : '7px 16px', borderRadius: 6, border: 'none', background: 'rgba(0,200,100,0.18)', color: '#00d28c', fontSize: compact ? 10 : 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
        {loading ? '...' : compact ? '✓ Accept' : '✓ Convert to Session'}
      </button>
    );
  };
  const reqDeclineBtn = (r: Session, compact = false) => (
    <button onClick={() => handleDecline(r)}
      style={{ padding: compact ? '3px 10px' : '7px 14px', borderRadius: 6, border: '1px solid #252030', background: 'transparent', color: '#604060', fontSize: compact ? 10 : 12, fontWeight: 700, cursor: 'pointer' }}>
      {compact ? '✗' : 'Decline'}
    </button>
  );

  // ── VIEW 1 — Compact inbox rows ──────────────────────────────────────────
  const renderReqV1 = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {requests.map((r, i) => {
        const clsColor = CLASS_COLORS[r.wowClass] || '#aaa';
        const isHorde = r.faction === 'Horde';
        return (
          <div key={r._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 14px', background: i % 2 === 0 ? '#0c0c14' : '#0a0a10', borderBottom: '1px solid #111420' }}>
            <div style={{ width: 3, height: 32, borderRadius: 2, background: clsColor, flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#d0d8f0' }}>{r.discord}</span>
              {r.notes && <span style={{ fontSize: 10, color: '#404860', marginLeft: 8, fontStyle: 'italic' }}>{r.notes.slice(0,40)}{r.notes.length > 40 ? '…' : ''}</span>}
            </div>
            <span style={{ fontSize: 11, color: clsColor, flexShrink: 0 }}>{r.wowClass}</span>
            <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 3, fontWeight: 700, background: isHorde ? 'rgba(229,57,53,0.15)' : 'rgba(30,136,229,0.15)', color: isHorde ? '#ef5350' : '#42a5f5', flexShrink: 0 }}>{r.faction}</span>
            <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 3, background: '#181c28', color: '#7080a0', border: '1px solid #252840', flexShrink: 0 }}>{r.bracket}s</span>
            <span style={{ fontSize: 11, color: '#505878', flexShrink: 0 }}>{reqFmtTime(r.scheduledAt)}</span>
            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
              {reqAcceptBtn(r, true)}
              {reqDeclineBtn(r, true)}
            </div>
          </div>
        );
      })}
    </div>
  );

  // ── VIEW 2 — Request cards grid ──────────────────────────────────────────
  const renderReqV2 = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10, padding: '4px 0' }}>
      {requests.map(r => {
        const clsColor = CLASS_COLORS[r.wowClass] || '#aaa';
        const isHorde = r.faction === 'Horde';
        return (
          <div key={r._id} style={{ background: '#0c0c14', border: `1px solid #1a1e2c`, borderLeft: `3px solid ${clsColor}`, borderRadius: 8, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#d0d8f0' }}>{r.discord}</span>
              <span style={{ fontSize: 9, padding: '2px 5px', borderRadius: 3, fontWeight: 700, background: isHorde ? 'rgba(229,57,53,0.18)' : 'rgba(30,136,229,0.18)', color: isHorde ? '#ef5350' : '#42a5f5' }}>{r.faction.toUpperCase()}</span>
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: clsColor }}>{r.wowClass}</span>
              <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 3, background: '#181c28', color: '#7080a0', border: '1px solid #252840' }}>{r.bracket}s</span>
            </div>
            <div style={{ fontSize: 11, color: '#4a5878' }}>🕐 {reqFmtTime(r.scheduledAt)}</div>
            {r.notes && <div style={{ fontSize: 11, color: '#404860', fontStyle: 'italic', lineHeight: 1.4, borderTop: '1px solid #111420', paddingTop: 6 }}>{r.notes}</div>}
            <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
              {reqAcceptBtn(r)}
              {reqDeclineBtn(r)}
            </div>
          </div>
        );
      })}
    </div>
  );

  // ── VIEW 3 — Two panel: list + detail ────────────────────────────────────
  const renderReqV3 = () => {
    const active = selectedReq || requests[0] || null;
    const clsColor = active ? CLASS_COLORS[active.wowClass] || '#aaa' : '#aaa';
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 0, border: '1px solid #151825', borderRadius: 8, overflow: 'hidden', minHeight: 200 }}>
        {/* Left list */}
        <div style={{ background: '#080810', borderRight: '1px solid #151825', overflowY: 'auto' }}>
          {requests.map(r => {
            const cc = CLASS_COLORS[r.wowClass] || '#aaa';
            const isActive = (selectedReq || requests[0])?._id === r._id;
            return (
              <div key={r._id} onClick={() => setSelectedReq(r)}
                style={{ padding: '10px 14px', borderBottom: '1px solid #111420', cursor: 'pointer', background: isActive ? '#111828' : 'transparent', borderLeft: `2px solid ${isActive ? cc : 'transparent'}` }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: isActive ? '#d0d8f0' : '#808898' }}>{r.discord}</div>
                <div style={{ fontSize: 10, color: cc, marginTop: 2 }}>{r.wowClass} · {r.bracket}s</div>
                <div style={{ fontSize: 10, color: '#303550', marginTop: 1 }}>{new Date(r.scheduledAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}</div>
              </div>
            );
          })}
        </div>
        {/* Right detail */}
        <div style={{ background: '#0c0c14', padding: '18px 20px' }}>
          {!active ? (
            <div style={{ color: '#303550', fontSize: 13, paddingTop: 40, textAlign: 'center' }}>Select a request</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#d0d8f0' }}>{active.discord}</div>
                  <div style={{ fontSize: 11, color: '#404860', marginTop: 2 }}>Requested · {reqFmtTime(active.scheduledAt)}</div>
                </div>
                <span style={{ fontSize: 9, padding: '3px 8px', borderRadius: 4, fontWeight: 700, background: active.faction === 'Horde' ? 'rgba(229,57,53,0.18)' : 'rgba(30,136,229,0.18)', color: active.faction === 'Horde' ? '#ef5350' : '#42a5f5' }}>{active.faction.toUpperCase()}</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <span style={{ fontSize: 12, color: clsColor }}>{active.wowClass}</span>
                <span style={{ fontSize: 11, padding: '1px 8px', borderRadius: 4, background: '#181c28', color: '#7080a0', border: '1px solid #252840' }}>{active.bracket}s</span>
              </div>
              {active.notes && (
                <div style={{ background: '#080810', border: '1px solid #151825', borderRadius: 6, padding: '10px 12px', fontSize: 12, color: '#606880', lineHeight: 1.5, fontStyle: 'italic' }}>
                  "{active.notes}"
                </div>
              )}
              <div style={{ display: 'flex', gap: 8, paddingTop: 8, borderTop: '1px solid #111420' }}>
                {reqAcceptBtn(active)}
                {reqDeclineBtn(active)}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ── VIEW 4 — Timeline / feed ─────────────────────────────────────────────
  const renderReqV4 = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {requests.map(r => {
        const clsColor = CLASS_COLORS[r.wowClass] || '#aaa';
        const initials = r.discord.slice(0, 2).toUpperCase();
        const hue = (r.discord.charCodeAt(0) * 37 + (r.discord.charCodeAt(1) || 0) * 13) % 360;
        const isHorde = r.faction === 'Horde';
        return (
          <div key={r._id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: `hsl(${hue},45%,18%)`, border: `2px solid hsl(${hue},55%,35%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: `hsl(${hue},70%,65%)`, flexShrink: 0 }}>
              {initials}
            </div>
            <div style={{ flex: 1, background: '#0c0c14', border: '1px solid #151825', borderRadius: 8, padding: '10px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#d0d8f0' }}>{r.discord}</span>
                <span style={{ fontSize: 10, color: '#303550' }}>{reqFmtTime(r.scheduledAt)}</span>
              </div>
              <div style={{ display: 'flex', gap: 6, marginBottom: r.notes ? 8 : 10, alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: clsColor }}>{r.wowClass}</span>
                <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 3, background: '#181c28', color: '#7080a0', border: '1px solid #252840' }}>{r.bracket}s</span>
                <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 3, fontWeight: 700, background: isHorde ? 'rgba(229,57,53,0.15)' : 'rgba(30,136,229,0.15)', color: isHorde ? '#ef5350' : '#42a5f5' }}>{r.faction}</span>
              </div>
              {r.notes && <div style={{ fontSize: 11, color: '#505870', fontStyle: 'italic', lineHeight: 1.4, marginBottom: 8 }}>{r.notes}</div>}
              <div style={{ display: 'flex', gap: 6 }}>
                {reqAcceptBtn(r, true)}
                {reqDeclineBtn(r, true)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

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
          coaches={coaches}
          onClose={() => setTakeawaysSession(null)}
          onSave={updateSession}
        />
      )}
      {editingSession && (
        <EditSessionModal
          session={editingSession}
          staff={staff}
          onClose={() => setEditingSession(null)}
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
          <button onClick={() => setReqPanelOpen(p => !p)} style={{ marginLeft: 8, padding: '7px 16px', borderRadius: 8, border: '1px solid rgba(220,160,80,0.3)', background: reqPanelOpen ? 'rgba(220,160,80,0.1)' : 'transparent', color: '#d4a040', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            📬 Requests
            {requests.length > 0 && <span style={{ background: '#d4a040', color: '#0a0a0f', borderRadius: 10, padding: '1px 6px', fontSize: 10, fontWeight: 800 }}>{requests.length}</span>}
          </button>
          <button onClick={() => navigate('/guides')} style={{ padding: '7px 16px', borderRadius: 8, border: '1px solid rgba(100,150,255,0.3)', background: 'transparent', color: '#7090d0', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>📚 Guides</button>
          <button onClick={() => navigate('/admin/coach-tracker')} style={{ marginLeft: 4, padding: '7px 16px', borderRadius: 8, border: '1px solid rgba(0,210,140,0.3)', background: 'transparent', color: '#00d28c', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Coach Tracker</button>
          <button onClick={() => { setSelectedCoachId(null); setShowModal(true); }} style={{ marginLeft: 4, padding: '7px 16px', borderRadius: 8, border: 'none', background: '#4a6fa5', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>+ Session</button>
        </div>
        <span style={{ fontSize: 11, color: '#303550' }}>{now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
      </div>

      <div style={{ padding: '20px 24px' }}>

        {/* ── Booking Requests Panel ──────────────────────────────────── */}
        {reqPanelOpen && (
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#d4a040', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Booking Requests</span>
              <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 10, background: 'rgba(212,160,64,0.15)', color: '#d4a040', fontWeight: 700 }}>{requests.length}</span>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
                {([1,2,3,4] as const).map(v => (
                  <button key={v} onClick={() => setReqView(v)}
                    style={{ padding: '4px 10px', borderRadius: 5, border: reqView === v ? '1px solid #d4a040' : '1px solid #1e2235', background: reqView === v ? 'rgba(212,160,64,0.15)' : 'transparent', color: reqView === v ? '#d4a040' : '#404860', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                    V{v}
                  </button>
                ))}
              </div>
            </div>
            {requests.length === 0 ? (
              <div style={{ fontSize: 12, color: '#252838', padding: '18px 0', textAlign: 'center', border: '1px solid #111420', borderRadius: 8 }}>No pending requests</div>
            ) : (
              reqView === 1 ? renderReqV1() :
              reqView === 2 ? renderReqV2() :
              reqView === 3 ? renderReqV3() :
              renderReqV4()
            )}
          </div>
        )}

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
                      onEdit={() => setEditingSession(s)}
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

        {/* ── Completed Sessions ──────────────────────────────────────── */}
        <div style={{ marginTop: 32, paddingBottom: 40 }}>
          <button
            onClick={() => {
              const next = !completedOpen;
              setCompletedOpen(next);
              if (next && !pastLoaded) { fetchPastSessions(); setPastLoaded(true); }
            }}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10,
              padding: '12px 18px', background: '#0d1018', border: '1px solid #1a1e2e',
              borderRadius: completedOpen ? '10px 10px 0 0' : 10, cursor: 'pointer',
              color: '#505878', fontSize: 12, fontWeight: 700,
            }}
          >
            <span style={{ color: completedOpen ? '#6080b0' : '#404860', fontSize: 13 }}>{completedOpen ? '▾' : '▸'}</span>
            <span style={{ color: '#6070a0', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Completed Sessions</span>
            {pastLoaded && !pastLoading && (
              <span style={{ marginLeft: 6, padding: '1px 8px', borderRadius: 10, background: '#141828', color: '#404860', fontSize: 10 }}>{pastSessions.length}</span>
            )}
            <span style={{ marginLeft: 'auto', fontSize: 10, color: '#282e42', fontWeight: 400 }}>click to expand</span>
          </button>

          {completedOpen && (
            <div style={{ border: '1px solid #1a1e2e', borderTop: 'none', borderRadius: '0 0 10px 10px', background: '#0a0c14', overflow: 'hidden' }}>
              {pastLoading ? (
                <div style={{ padding: '24px', textAlign: 'center', color: '#303550', fontSize: 12 }}>Loading...</div>
              ) : pastSessions.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: '#303550', fontSize: 12 }}>No completed sessions yet</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {['Date', 'Coach', 'Class', 'Bracket', 'Comp', 'Status', ''].map(h => (
                        <th key={h} style={{ padding: '8px 14px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#303550', letterSpacing: '0.07em', textTransform: 'uppercase', borderBottom: '1px solid #141828' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pastSessions.map(s => {
                      const clsColor = CLASS_COLORS[s.wowClass] || '#aaa';
                      const hasTakeaways = (s.pros?.length || 0) > 0 || (s.cons?.length || 0) > 0 || s.takeaways?.trim();
                      const linkedCoach = coaches.find(c => c._id === s.coachId);
                      return (
                        <tr key={s._id} style={{ borderBottom: '1px solid #0e1018' }}>
                          <td style={{ padding: '9px 14px', fontSize: 11, color: '#505878', whiteSpace: 'nowrap' }}>
                            {new Date(s.scheduledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                          <td style={{ padding: '9px 14px', fontSize: 12, color: '#a0aac0', fontWeight: 600 }}>
                            {s.discord}
                            {linkedCoach && <div style={{ fontSize: 10, color: '#404860' }}>→ {linkedCoach.discord}</div>}
                          </td>
                          <td style={{ padding: '9px 14px', fontSize: 11, color: clsColor, fontWeight: 600 }}>{s.wowClass}</td>
                          <td style={{ padding: '9px 14px' }}>
                            <span style={{ fontSize: 10, padding: '1px 7px', borderRadius: 3, background: '#141828', color: '#505878', border: '1px solid #1e2238', fontWeight: 700 }}>{s.bracket}s</span>
                          </td>
                          <td style={{ padding: '9px 14px', fontSize: 11, color: '#6070a0' }}>{s.comp || <span style={{ color: '#20253a' }}>—</span>}</td>
                          <td style={{ padding: '9px 14px' }}>
                            {hasTakeaways
                              ? <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, background: 'rgba(0,180,100,0.1)', color: '#2ea86a', border: '1px solid rgba(0,180,100,0.2)', fontWeight: 700 }}>✓ Done</span>
                              : <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, background: '#0e1118', color: '#303550', border: '1px solid #1a1e2e', fontWeight: 700 }}>Pending</span>
                            }
                          </td>
                          <td style={{ padding: '9px 14px', textAlign: 'right' }}>
                            <button
                              onClick={() => setTakeawaysSession(s)}
                              style={{ padding: '3px 12px', borderRadius: 5, background: 'rgba(74,111,165,0.12)', border: '1px solid rgba(74,111,165,0.3)', color: '#6080b0', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}
                            >Takeaways</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
