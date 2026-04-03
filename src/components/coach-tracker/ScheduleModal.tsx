import { useState, useRef, useEffect } from 'react';
import { Coach, Session } from './useDashboardData';

interface Props {
  coaches: Coach[];
  onSave: (payload: Omit<Session, '_id'>) => Promise<void>;
  onClose: () => void;
  defaultCoachId?: string;
}

const CLASS_COLORS: Record<string, string> = {
  'Death Knight': '#C41E3A', 'Demon Hunter': '#A330C9', 'Druid': '#FF7C0A',
  'Evoker': '#33937F', 'Hunter': '#AAD372', 'Mage': '#3FC7EB', 'Monk': '#00FF98',
  'Paladin': '#F48CBA', 'Priest': '#FFFFFF', 'Rogue': '#FFF468',
  'Shaman': '#0070DD', 'Warlock': '#8788EE', 'Warrior': '#C69B6D',
};

const WOW_CLASSES = [
  'Death Knight', 'Demon Hunter', 'Druid', 'Evoker', 'Hunter',
  'Mage', 'Monk', 'Paladin', 'Priest', 'Rogue', 'Shaman', 'Warlock', 'Warrior',
];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DAY_ABBREVS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function localDateTimeValue() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  now.setMinutes(0, 0, 0);
  return now.toISOString().slice(0, 16);
}

function coachLabel(c: Coach) {
  return `${c.discord}${c.alias && c.alias !== c.discord ? ` (${c.alias})` : ''} — ${c.wowClass} ${c.faction}`;
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function parseDT(iso: string) {
  const [datePart, timePart] = iso.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hours, minutes] = timePart.split(':').map(Number);
  return { year, month: month - 1, day, hours, minutes };
}

function buildDT(year: number, month: number, day: number, hours: number, minutes: number) {
  return (
    `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` +
    `T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
  );
}

function fmtDate(iso: string) {
  const { year, month, day } = parseDT(iso);
  const dow = new Date(year, month, day).getDay();
  return {
    dayShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dow],
    dayFull: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dow],
    monthShort: MONTH_NAMES[month].slice(0, 3),
    monthFull: MONTH_NAMES[month],
    day, year, dow,
  };
}

export function ScheduleModal({ coaches, onSave, onClose, defaultCoachId }: Props) {
  const defaultCoach = coaches.find(c => c._id === defaultCoachId) || null;

  const [query, setQuery] = useState(defaultCoach ? coachLabel(defaultCoach) : '');
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(defaultCoach);
  const [writeInMode, setWriteInMode] = useState(false);
  const [writeInName, setWriteInName] = useState('');
  const [writeInClass, setWriteInClass] = useState('Warrior');
  const [writeInFaction, setWriteInFaction] = useState<'Horde' | 'Alliance'>('Horde');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [bracket, setBracket] = useState<'2' | '3' | '5'>('3');
  const [dateTime, setDateTime] = useState(localDateTimeValue());
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [calMonth, setCalMonth] = useState(() => {
    const p = parseDT(localDateTimeValue());
    return { year: p.year, month: p.month };
  });

  const [calOpen, setCalOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current && !inputRef.current.contains(e.target as Node)
      ) setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);


  const sortedCoaches = [...coaches].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
  const filtered = query.trim()
    ? sortedCoaches.filter(c => {
        const q = query.toLowerCase();
        return (
          c.discord.toLowerCase().includes(q) ||
          (c.alias || '').toLowerCase().includes(q) ||
          (c.wowClass || '').toLowerCase().includes(q) ||
          (c.faction || '').toLowerCase().includes(q)
        );
      })
    : sortedCoaches;

  const handleSelectCoach = (c: Coach) => {
    setSelectedCoach(c); setQuery(coachLabel(c));
    setWriteInMode(false); setDropdownOpen(false);
  };
  const handleWriteIn = () => {
    setSelectedCoach(null); setWriteInName(query.trim());
    setWriteInMode(true); setDropdownOpen(false);
  };
  const handleQueryChange = (val: string) => {
    setQuery(val); setSelectedCoach(null);
    setWriteInMode(false); setDropdownOpen(true);
  };

  const canSave = writeInMode
    ? writeInName.trim().length > 0 && !!dateTime
    : !!selectedCoach && !!dateTime;

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    await onSave({
      coachId: writeInMode ? '' : selectedCoach!._id,
      discord: writeInMode ? writeInName.trim() : selectedCoach!.discord,
      wowClass: writeInMode ? writeInClass : selectedCoach!.wowClass,
      faction: writeInMode ? writeInFaction : selectedCoach!.faction,
      bracket,
      scheduledAt: new Date(dateTime).toISOString(),
      notes, userSlug: '', comp: '', pros: [], cons: [], takeaways: '', status: 'confirmed', assignedCoachIds: [], assignedCoachNames: [],
    });
    setSaving(false);
    onClose();
  };

  function prevMonth() {
    setCalMonth(p => p.month === 0 ? { year: p.year - 1, month: 11 } : { ...p, month: p.month - 1 });
  }
  function nextMonth() {
    setCalMonth(p => p.month === 11 ? { year: p.year + 1, month: 0 } : { ...p, month: p.month + 1 });
  }
  function selectDate(y: number, mo: number, d: number) {
    const p = parseDT(dateTime);
    setDateTime(buildDT(y, mo, d, p.hours, p.minutes));
    setCalMonth({ year: y, month: mo });
    setCalOpen(false);
  }
  function selectTime(h: number, m: number) {
    const p = parseDT(dateTime);
    setDateTime(buildDT(p.year, p.month, p.day, h, m));
  }

  const dtp = parseDT(dateTime);
  const fmt = fmtDate(dateTime);
  const today = new Date();

  // ── Styles ───────────────────────────────────────────────────────────────
  const overlayStyle: React.CSSProperties = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, backdropFilter: 'blur(4px)',
  };
  const modalStyle: React.CSSProperties = {
    background: '#141820', border: '1px solid #252a3a', borderRadius: 14,
    padding: '28px 32px', width: 480, maxWidth: '95vw',
    boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    maxHeight: '90vh', overflowY: 'auto',
  };
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 11, fontWeight: 600, color: '#505878',
    letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6,
  };
  const inputStyle: React.CSSProperties = {
    width: '100%', background: '#0e1118', border: '1px solid #252a3a',
    borderRadius: 8, color: '#c8d0e8', fontSize: 13, padding: '10px 12px',
    outline: 'none', boxSizing: 'border-box',
  };
  const navBtnStyle: React.CSSProperties = {
    background: 'none', border: '1px solid #252a3a', borderRadius: 6,
    color: '#7090c0', cursor: 'pointer', padding: '3px 11px', fontSize: 17, lineHeight: 1,
  };
  const spinBtnStyle: React.CSSProperties = {
    background: 'none', border: '1px solid #252a3a', borderRadius: 4,
    color: '#7090c0', cursor: 'pointer', padding: '2px 9px', fontSize: 10, lineHeight: 1.4,
  };

  // ── Full calendar grid ────────────────────────────────────────────────────
  const renderCalGrid = (compact = false) => {
    const { year, month } = calMonth;
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const cells: (number | null)[] = [
      ...Array(firstDay).fill(null),
      ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];
    while (cells.length % 7 !== 0) cells.push(null);
    const cellH = compact ? 28 : 32;

    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <button onClick={prevMonth} style={navBtnStyle}>‹</button>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#c8d0e8' }}>
            {MONTH_NAMES[month]} {year}
          </span>
          <button onClick={nextMonth} style={navBtnStyle}>›</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 4 }}>
          {DAY_ABBREVS.map(d => (
            <div key={d} style={{ textAlign: 'center', fontSize: 10, color: '#505878', fontWeight: 600, paddingBottom: 3 }}>{d}</div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
          {cells.map((day, i) => {
            if (!day) return <div key={`e${i}`} style={{ height: cellH }} />;
            const isSel = day === dtp.day && year === dtp.year && month === dtp.month;
            const isTod = day === today.getDate() && year === today.getFullYear() && month === today.getMonth();
            const isPast = new Date(year, month, day) < new Date(today.getFullYear(), today.getMonth(), today.getDate());
            return (
              <div
                key={day}
                onClick={() => !isPast && selectDate(year, month, day)}
                style={{
                  height: cellH, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: 6, cursor: isPast ? 'default' : 'pointer', fontSize: compact ? 11 : 12,
                  background: isSel ? '#4a6fa5' : 'transparent',
                  color: isSel ? '#fff' : isPast ? '#2a3048' : isTod ? '#7090c0' : '#c8d0e8',
                  fontWeight: isSel ? 700 : 400,
                  border: isTod && !isSel ? '1px solid rgba(74,111,165,0.4)' : '1px solid transparent',
                }}
                onMouseEnter={e => { if (!isPast && !isSel) e.currentTarget.style.background = 'rgba(74,111,165,0.2)'; }}
                onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = 'transparent'; }}
              >{day}</div>
            );
          })}
        </div>
      </div>
    );
  };

  // ── Time spinners — ALWAYS VISIBLE ───────────────────────────────────────
  const renderTimeSpinners = () => {
    const ampm = dtp.hours < 12 ? 'AM' : 'PM';
    const dispH = dtp.hours % 12 || 12;
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14,
        padding: '14px 0 4px',
        borderTop: '1px solid #1a1f30', marginTop: 12,
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
          <button style={spinBtnStyle} onClick={() => selectTime((dtp.hours + 1) % 24, dtp.minutes)}>▲</button>
          <div style={{ fontSize: 26, fontWeight: 700, color: '#c8d0e8', width: 40, textAlign: 'center', lineHeight: 1 }}>
            {String(dispH).padStart(2, '0')}
          </div>
          <button style={spinBtnStyle} onClick={() => selectTime((dtp.hours - 1 + 24) % 24, dtp.minutes)}>▼</button>
        </div>
        <span style={{ fontSize: 26, color: '#353d55', fontWeight: 300 }}>:</span>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
          <button style={spinBtnStyle} onClick={() => selectTime(dtp.hours, (dtp.minutes + 15) % 60)}>▲</button>
          <div style={{ fontSize: 26, fontWeight: 700, color: '#c8d0e8', width: 40, textAlign: 'center', lineHeight: 1 }}>
            {String(dtp.minutes).padStart(2, '0')}
          </div>
          <button style={spinBtnStyle} onClick={() => selectTime(dtp.hours, (dtp.minutes - 15 + 60) % 60)}>▼</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginLeft: 6 }}>
          {(['AM', 'PM'] as const).map(ap => {
            const isSel = ampm === ap;
            return (
              <button key={ap}
                onClick={() => selectTime(ap === 'AM' ? dtp.hours % 12 : (dtp.hours % 12) + 12, dtp.minutes)}
                style={{
                  padding: '5px 11px', borderRadius: 6, cursor: 'pointer', fontSize: 11, fontWeight: 700,
                  border: isSel ? '1px solid #4a6fa5' : '1px solid #252a3a',
                  background: isSel ? 'rgba(74,111,165,0.25)' : '#0e1118',
                  color: isSel ? '#a0c0f0' : '#404860',
                }}
              >{ap}</button>
            );
          })}
        </div>
      </div>
    );
  };

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // VIEW 3 — Week strip → full month
  //   Shows 7-day current week. Thin toggle above reveals full calendar.
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const renderDateView3 = () => {
    const selDate = new Date(dtp.year, dtp.month, dtp.day);
    const dow = selDate.getDay();
    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(selDate);
      d.setDate(selDate.getDate() - dow + i);
      return { year: d.getFullYear(), month: d.getMonth(), day: d.getDate(), dow: i };
    });

    return (
      <div style={{ background: '#0c0f17', border: '1px solid #252a3a', borderRadius: 10, overflow: 'hidden' }}>
        {/* Full month slides in from top */}
        <div style={{
          overflow: 'hidden', maxHeight: calOpen ? 300 : 0,
          transition: 'max-height 0.3s ease',
          padding: calOpen ? '14px 14px 0' : '0 14px',
        }}>
          {renderCalGrid(true)}
        </div>

        {/* Toggle bar */}
        <button
          onClick={() => setCalOpen(p => !p)}
          style={{
            width: '100%', background: 'transparent', border: 'none',
            borderBottom: '1px solid #1e2535',
            color: '#4a6fa5', fontSize: 10, fontWeight: 700, cursor: 'pointer',
            padding: '5px 0', letterSpacing: '0.08em', textTransform: 'uppercase',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}
        >
          <span style={{ display: 'inline-block', transform: calOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', fontSize: 8 }}>▲</span>
          {calOpen ? 'Hide month' : `${fmt.monthShort} ${fmt.year} · tap to expand`}
          <span style={{ display: 'inline-block', transform: calOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', fontSize: 8 }}>▲</span>
        </button>

        {/* Week strip */}
        <div style={{ display: 'flex', gap: 3, padding: '10px 10px 10px' }}>
          {weekDays.map(wd => {
            const isSel = wd.day === dtp.day && wd.month === dtp.month && wd.year === dtp.year;
            const isTod = wd.day === today.getDate() && wd.month === today.getMonth() && wd.year === today.getFullYear();
            const isPast = new Date(wd.year, wd.month, wd.day) < new Date(today.getFullYear(), today.getMonth(), today.getDate());
            return (
              <div key={wd.dow}
                onClick={() => !isPast && selectDate(wd.year, wd.month, wd.day)}
                style={{
                  flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                  padding: '7px 2px', borderRadius: 8, cursor: isPast ? 'default' : 'pointer', gap: 3,
                  border: isSel ? '1px solid #4a6fa5' : '1px solid transparent',
                  background: isSel ? 'rgba(74,111,165,0.2)' : 'transparent',
                }}
                onMouseEnter={e => { if (!isPast && !isSel) e.currentTarget.style.background = 'rgba(74,111,165,0.1)'; }}
                onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = 'transparent'; }}
              >
                <span style={{ fontSize: 9, fontWeight: 600, color: isSel ? '#7090c0' : '#404860', textTransform: 'uppercase' }}>
                  {DAY_ABBREVS[wd.dow]}
                </span>
                <span style={{ fontSize: 15, fontWeight: 700, lineHeight: 1, color: isSel ? '#fff' : isPast ? '#2a3048' : isTod ? '#7090c0' : '#c8d0e8' }}>
                  {wd.day}
                </span>
                {isTod && <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#4a6fa5' }} />}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#d0daf0' }}>Schedule Session</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#404860', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>×</button>
        </div>

        {/* Coach autocomplete */}
        <div style={{ marginBottom: 18, position: 'relative' }}>
          <label style={labelStyle}>Coach</label>
          <input
            ref={inputRef} type="text" value={query}
            onChange={e => handleQueryChange(e.target.value)}
            onFocus={() => setDropdownOpen(true)}
            placeholder="Search by name, class, faction..."
            style={{ ...inputStyle, paddingRight: 32 }}
            autoComplete="off"
          />
          {query && (
            <button
              onMouseDown={e => { e.preventDefault(); setQuery(''); setSelectedCoach(null); setWriteInMode(false); setDropdownOpen(true); inputRef.current?.focus(); }}
              style={{ position: 'absolute', right: 10, top: 32, background: 'none', border: 'none', color: '#404860', cursor: 'pointer', fontSize: 15, lineHeight: 1, padding: 0 }}
            >×</button>
          )}
          {dropdownOpen && (
            <div ref={dropdownRef} style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100, background: '#0e1118', border: '1px solid #252a3a', borderRadius: 8, marginTop: 4, maxHeight: 240, overflowY: 'auto', boxShadow: '0 12px 40px rgba(0,0,0,0.5)' }}>
              {filtered.length === 0 && !query.trim() && (
                <div style={{ padding: '10px 14px', color: '#404860', fontSize: 12 }}>Start typing to search...</div>
              )}
              {filtered.map(c => (
                <div key={c._id}
                  onMouseDown={e => { e.preventDefault(); handleSelectCoach(c); }}
                  style={{ padding: '9px 14px', cursor: 'pointer', fontSize: 13, color: selectedCoach?._id === c._id ? '#fff' : '#c8d0e8', background: selectedCoach?._id === c._id ? 'rgba(74,111,165,0.2)' : 'transparent', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid #161b28' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                  onMouseLeave={e => (e.currentTarget.style.background = selectedCoach?._id === c._id ? 'rgba(74,111,165,0.2)' : 'transparent')}
                >
                  {c.pinned && <span style={{ color: '#f0a500', fontSize: 11 }}>★</span>}
                  <span>{c.discord}{c.alias && c.alias !== c.discord ? ` (${c.alias})` : ''}</span>
                  <span style={{ marginLeft: 'auto', fontSize: 11, color: CLASS_COLORS[c.wowClass] || '#aaa', fontWeight: 600 }}>{c.wowClass}</span>
                  <span style={{ fontSize: 11, color: c.faction === 'Horde' ? '#ef5350' : '#42a5f5', fontWeight: 600 }}>{c.faction}</span>
                </div>
              ))}
              <div
                onMouseDown={e => { e.preventDefault(); handleWriteIn(); }}
                style={{ padding: '9px 14px', cursor: 'pointer', fontSize: 13, color: '#7090c0', borderTop: filtered.length > 0 ? '1px solid #252a3a' : 'none', display: 'flex', alignItems: 'center', gap: 8 }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(74,111,165,0.1)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <span style={{ fontSize: 15, lineHeight: 1 }}>＋</span>
                <span>{query.trim() ? `Write in "${query.trim()}"` : 'Write in a custom name...'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Coach chip */}
        {selectedCoach && !writeInMode && (
          <div style={{ marginTop: -10, marginBottom: 18, display: 'flex', gap: 8, alignItems: 'center', padding: '6px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: 6, border: '1px solid #1e2535' }}>
            <span style={{ fontSize: 12, color: CLASS_COLORS[selectedCoach.wowClass] || '#aaa', fontWeight: 700 }}>{selectedCoach.wowClass}</span>
            <span style={{ fontSize: 11, color: selectedCoach.faction === 'Horde' ? '#ef5350' : '#42a5f5', fontWeight: 600 }}>{selectedCoach.faction}</span>
            {selectedCoach.partner && <span style={{ fontSize: 11, color: '#404860' }}>w/ {selectedCoach.partner}</span>}
          </div>
        )}

        {/* Write-in fields */}
        {writeInMode && (
          <div style={{ marginTop: -10, marginBottom: 18, padding: '12px', background: 'rgba(74,111,165,0.06)', borderRadius: 8, border: '1px solid #252a3a' }}>
            <div style={{ marginBottom: 10 }}>
              <label style={labelStyle}>Name</label>
              <input type="text" value={writeInName} onChange={e => setWriteInName(e.target.value)} placeholder="Discord or in-game name..." style={inputStyle} autoFocus />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Class</label>
                <select value={writeInClass} onChange={e => setWriteInClass(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                  {WOW_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Faction</label>
                <div style={{ display: 'flex', gap: 6, height: 38 }}>
                  {(['Horde', 'Alliance'] as const).map(f => (
                    <button key={f} type="button" onClick={() => setWriteInFaction(f)}
                      style={{ flex: 1, borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 12, border: writeInFaction === f ? `1px solid ${f === 'Horde' ? '#ef5350' : '#42a5f5'}` : '1px solid #252a3a', background: writeInFaction === f ? f === 'Horde' ? 'rgba(239,83,80,0.15)' : 'rgba(66,165,245,0.15)' : '#0e1118', color: writeInFaction === f ? f === 'Horde' ? '#ef5350' : '#42a5f5' : '#404860', transition: 'all 0.15s' }}
                    >{f}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Date & Time ── */}
        <div style={{ marginBottom: 18 }}>
          <label style={labelStyle}>Date &amp; Time</label>
          {renderDateView3()}

          {/* Time spinners — always visible */}
          {renderTimeSpinners()}
        </div>

        {/* Bracket */}
        <div style={{ marginBottom: 18 }}>
          <label style={labelStyle}>Bracket</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {(['2', '3', '5'] as const).map(b => (
              <button key={b} type="button" onClick={() => setBracket(b)}
                style={{ flex: 1, padding: '10px', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 14, border: bracket === b ? '1px solid #4a6fa5' : '1px solid #252a3a', background: bracket === b ? 'rgba(74,111,165,0.2)' : '#0e1118', color: bracket === b ? '#7090c0' : '#404860', transition: 'all 0.15s' }}
              >{b}s</button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div style={{ marginBottom: 24 }}>
          <label style={labelStyle}>Notes (optional)</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="comp, goals, anything relevant..." rows={2} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }} />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '9px 20px', borderRadius: 8, border: '1px solid #252a3a', background: 'transparent', color: '#505878', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Cancel</button>
          <button onClick={handleSave} disabled={!canSave || saving}
            style={{ padding: '9px 24px', borderRadius: 8, border: 'none', background: canSave ? '#4a6fa5' : '#252a3a', color: canSave ? '#fff' : '#404860', cursor: canSave ? 'pointer' : 'default', fontSize: 13, fontWeight: 700, transition: 'all 0.15s' }}
          >{saving ? 'Saving...' : 'Schedule'}</button>
        </div>
      </div>
    </div>
  );
}
