import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { API_BASE_URL } from '../../config/api';

// ── Types ─────────────────────────────────────────────────────────────────
interface CoachInfo { alias: string; wowClass: string; faction: 'Horde' | 'Alliance'; brackets: string[]; }
interface SelDate { year: number; month: number; day: number; }
interface TimeSlot { hours: number; minutes: number; label: string; date: SelDate; }
interface FormData { discord: string; wowClass: string; faction: 'Horde' | 'Alliance'; bracket: string; notes: string; }

// ── Constants ─────────────────────────────────────────────────────────────
const CLASS_COLORS: Record<string, string> = {
  'Death Knight': '#C41E3A', 'Demon Hunter': '#A330C9', 'Druid': '#FF7C0A',
  'Evoker': '#33937F', 'Hunter': '#AAD372', 'Mage': '#3FC7EB', 'Monk': '#00FF98',
  'Paladin': '#F48CBA', 'Priest': '#FFFFFF', 'Rogue': '#FFF468',
  'Shaman': '#0070DD', 'Warlock': '#8788EE', 'Warrior': '#C69B6D',
};
const WOW_CLASSES = ['Death Knight','Demon Hunter','Druid','Evoker','Hunter','Mage','Monk','Paladin','Priest','Rogue','Shaman','Warlock','Warrior'];
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAY_ABBREVS = ['Su','Mo','Tu','We','Th','Fr','Sa'];

// ── Helpers ───────────────────────────────────────────────────────────────
// Returns slots in a 12-hour window starting from the next 30-min boundary after now.
// Each slot carries its calendar date so we can group with a divider.
function getWindowSlots(bookedISOs: string[]): TimeSlot[] {
  const now = new Date();
  // Round up to next 30-min boundary
  const startMs = Math.ceil(now.getTime() / (30 * 60 * 1000)) * (30 * 60 * 1000);
  // End = 3:00 AM two days from now
  const endMs = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 3, 0).getTime();
  const slots: TimeSlot[] = [];
  for (let t = startMs; t <= endMs; t += 30 * 60 * 1000) {
    const d = new Date(t);
    const date: SelDate = { year: d.getFullYear(), month: d.getMonth(), day: d.getDate() };
    const h = d.getHours();
    const m = d.getMinutes();
    const blocked = bookedISOs.some(iso => { const b = new Date(iso).getTime(); return t >= b && t < b + 3600000; });
    if (!blocked) {
      const ampm = h < 12 ? 'AM' : 'PM';
      const hour = h % 12 || 12;
      slots.push({ hours: h, minutes: m, label: `${hour}:${String(m).padStart(2,'0')} ${ampm}`, date });
    }
  }
  return slots;
}

function fmtDate(d: SelDate) {
  const dow = new Date(d.year, d.month, d.day).getDay();
  return {
    short: `${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][dow]}, ${MONTH_NAMES[d.month].slice(0,3)} ${d.day}`,
    full: `${['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][dow]}, ${MONTH_NAMES[d.month]} ${d.day}, ${d.year}`,
    dow,
  };
}

// ── Main Component ────────────────────────────────────────────────────────
export function CoachBookingPage() {
  const { coachId } = useParams<{ coachId: string }>();
  const today = new Date();

  // Data
  const [coach, setCoach] = useState<CoachInfo | null>(null);
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  // Selection
  const [selDate, setSelDate] = useState<SelDate | null>(null);
  const [selSlot, setSelSlot] = useState<TimeSlot | null>(null);
  const [deadExpanded, setDeadExpanded] = useState(false);

  // Form
  const [form, setForm] = useState<FormData>({ discord: '', wowClass: 'Warrior', faction: 'Horde', bracket: '3', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!coachId) return;
    setLoading(true);
    fetch(`${API_BASE_URL}/api/public/schedule/${coachId}`)
      .then(r => r.json())
      .then(json => {
        if (json.data) {
          setCoach(json.data.coach);
          setBookedTimes(json.data.bookedTimes || []);
        } else setFetchError('Coach not found.');
      })
      .catch(() => setFetchError('Could not load coach data.'))
      .finally(() => setLoading(false));
  }, [coachId]);

  function pickSlot(slot: TimeSlot) {
    setSelDate(slot.date);
    setSelSlot(slot);
  }

  async function handleSubmit() {
    if (!selDate || !selSlot || !form.discord.trim()) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      // hours:24 = midnight = start of next day; JS Date handles this correctly
      const scheduledAt = new Date(selDate.year, selDate.month, selDate.day, selSlot.hours, selSlot.minutes).toISOString();
      const res = await fetch(`${API_BASE_URL}/api/public/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coachId, scheduledAt, ...form }),
      });
      const json = await res.json();
      if (res.ok) setSubmitted(true);
      else setSubmitError(json.errorMessage || 'Something went wrong. Try again.');
    } catch {
      setSubmitError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const windowSlots = getWindowSlots(bookedTimes);
  const canSubmit = !!selDate && !!selSlot && form.discord.trim().length > 0;

  // ── Shared styles ────────────────────────────────────────────────────────
  const C = {
    bg: '#0e1118', surface: '#141820', border: '#2e3550',
    blue: '#4a6fa5', blueLight: '#90b0e0', blueGlow: 'rgba(74,111,165,0.25)',
    text: '#dde3f5', muted: '#8892b0', faint: '#3d4560',
    horde: '#f07070', alliance: '#60b8f8',
  };
  const pill = (active: boolean): React.CSSProperties => ({
    padding: '7px 14px', borderRadius: 20, fontSize: 12, fontWeight: active ? 700 : 500, cursor: 'pointer',
    border: active ? `1px solid ${C.blue}` : `1px solid ${C.border}`,
    background: active ? C.blueGlow : C.bg,
    color: active ? '#b8d4ff' : C.muted, transition: 'all 0.12s',
  });
  const inputSt: React.CSSProperties = { width: '100%', background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 13, padding: '10px 12px', outline: 'none', boxSizing: 'border-box' };
  const labelSt: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 600, color: C.muted, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 5 };
  const cardSt: React.CSSProperties = { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 };

  // ── Shared render blocks ──────────────────────────────────────────────────

  const renderCoachBadge = (compact = false) => {
    if (!coach) return null;
    const classColor = CLASS_COLORS[coach.wowClass] || '#aaa';
    const factionColor = coach.faction === 'Horde' ? C.horde : C.alliance;
    if (compact) return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, marginBottom: 14 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: classColor, flexShrink: 0 }} />
        <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{coach.alias}</span>
        <span style={{ fontSize: 11, color: classColor, fontWeight: 600 }}>{coach.wowClass}</span>
        <span style={{ fontSize: 11, color: factionColor, fontWeight: 600, marginLeft: 'auto' }}>{coach.faction}</span>
      </div>
    );
    return (
      <div style={{ ...cardSt, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 44, height: 44, borderRadius: 10, background: `${classColor}22`, border: `2px solid ${classColor}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>⚔️</div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{coach.alias}</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 3 }}>
            <span style={{ fontSize: 11, color: classColor, fontWeight: 600 }}>{coach.wowClass}</span>
            <span style={{ fontSize: 11, color: factionColor, fontWeight: 600 }}>{coach.faction}</span>
            {coach.brackets?.length > 0 && <span style={{ fontSize: 11, color: C.muted }}>{coach.brackets.map(b => `${b}s`).join(' · ')}</span>}
          </div>
        </div>
        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Session</div>
          <div style={{ fontSize: 13, color: C.blueLight, fontWeight: 700 }}>60 min</div>
        </div>
      </div>
    );
  };

  const isDeadHour = (s: TimeSlot) => s.hours >= 3 && s.hours < 12;

  const renderSlotPanel = () => {
    if (windowSlots.length === 0) return (
      <div style={{ ...cardSt, color: C.muted, fontSize: 13, textAlign: 'center', padding: 24 }}>No available slots in the next 12 hours.</div>
    );

    // Group by calendar day
    const groups: { key: string; date: SelDate; slots: TimeSlot[] }[] = [];
    windowSlots.forEach(slot => {
      const key = `${slot.date.year}-${slot.date.month}-${slot.date.day}`;
      const last = groups[groups.length - 1];
      if (last?.key === key) last.slots.push(slot);
      else groups.push({ key, date: slot.date, slots: [slot] });
    });

    const deadSlots = windowSlots.filter(isDeadHour);
    const deadCount = deadSlots.length;
    const deadFirst = deadSlots[0];
    const deadLast = deadSlots[deadSlots.length - 1];
    const deadRange = deadCount > 0 ? `${deadFirst.label} – ${deadLast.label}` : '';

    const slotBtn = (slot: TimeSlot) => {
      const active = selSlot?.hours === slot.hours && selSlot?.minutes === slot.minutes && selDate?.day === slot.date.day && selDate?.month === slot.date.month;
      return <button key={`${slot.date.day}-${slot.hours}-${slot.minutes}`} onClick={() => pickSlot(slot)} style={pill(active)}>{slot.label}</button>;
    };

    const renderGroup = (group: typeof groups[0], gi: number) => {
      const d = new Date(group.date.year, group.date.month, group.date.day);
      const dowName = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][d.getDay()];
      const dead = group.slots.filter(isDeadHour);
      const groupDead = dead.length > 0;

      const header = (
        <div key="hdr" style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 12 }}>
          {gi === 0
            ? <span style={{ fontSize: 11, fontWeight: 700, color: C.blueLight, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Today</span>
            : <><div style={{ flex: 1, height: 1, background: C.border }} /><span style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{dowName}, {MONTH_NAMES[group.date.month].slice(0,3)} {group.date.day}</span><div style={{ flex: 1, height: 1, background: C.border }} /></>
          }
          {gi === 0 && <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{dowName}, {MONTH_NAMES[group.date.month].slice(0,3)} {group.date.day}</span>}
        </div>
      );

      const visibleSlots = deadExpanded ? group.slots : group.slots.filter(s => !isDeadHour(s));

      return (
        <div key={group.key} style={{ marginTop: gi > 0 ? 14 : 0 }}>
          {header}
          {groupDead && (
            <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
              {([{ label: 'Active', val: false }, { label: 'All Hours', val: true }] as const).map(opt => (
                <button key={String(opt.val)} onClick={() => setDeadExpanded(opt.val)}
                  style={{ padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, cursor: 'pointer', border: deadExpanded === opt.val ? `1px solid ${C.blue}` : `1px solid ${C.border}`, background: deadExpanded === opt.val ? C.blueGlow : 'transparent', color: deadExpanded === opt.val ? C.blueLight : C.faint, transition: 'all 0.12s' }}>
                  {opt.label}
                </button>
              ))}
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
            {visibleSlots.map(slotBtn)}
          </div>
        </div>
      );
    };

    return (
      <div style={cardSt}>
        {groups.map((group, gi) => renderGroup(group, gi))}
      </div>
    );
  };

  const renderBookingForm = (inline = false) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {selDate && selSlot && (
        <div style={{ padding: '8px 12px', background: C.blueGlow, border: `1px solid ${C.blue}44`, borderRadius: 8, fontSize: 12, color: '#a0c0f0', fontWeight: 600 }}>
          📅 {fmtDate(selDate).short} · ⏰ {selSlot.label}
        </div>
      )}
      <div>
        <label style={labelSt}>Discord Username</label>
        <input value={form.discord} onChange={e => setForm(p => ({...p, discord: e.target.value}))} placeholder="yourname#0000" style={inputSt} />
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <div style={{ flex: 2 }}>
          <label style={labelSt}>Class</label>
          <select value={form.wowClass} onChange={e => setForm(p => ({...p, wowClass: e.target.value}))} style={{ ...inputSt, cursor: 'pointer' }}>
            {WOW_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelSt}>Faction</label>
          <div style={{ display: 'flex', gap: 5, height: 40 }}>
            {(['Horde','Alliance'] as const).map(f => (
              <button key={f} onClick={() => setForm(p => ({...p, faction: f}))} style={{ flex: 1, borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 11, border: form.faction === f ? `1px solid ${f === 'Horde' ? C.horde : C.alliance}` : `1px solid ${C.border}`, background: form.faction === f ? (f === 'Horde' ? 'rgba(239,83,80,0.15)' : 'rgba(66,165,245,0.15)') : C.bg, color: form.faction === f ? (f === 'Horde' ? C.horde : C.alliance) : C.muted }}>{f}</button>
            ))}
          </div>
        </div>
      </div>
      <div>
        <label style={labelSt}>Bracket</label>
        <div style={{ display: 'flex', gap: 8 }}>
          {['2','3','5'].map(b => (
            <button key={b} onClick={() => setForm(p => ({...p, bracket: b}))} style={{ flex: 1, padding: '9px', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 14, border: form.bracket === b ? `1px solid ${C.blue}` : `1px solid ${C.border}`, background: form.bracket === b ? C.blueGlow : C.bg, color: form.bracket === b ? C.blueLight : C.muted, transition: 'all 0.15s' }}>{b}s</button>
          ))}
        </div>
      </div>
      <div>
        <label style={labelSt}>Notes (optional)</label>
        <textarea value={form.notes} onChange={e => setForm(p => ({...p, notes: e.target.value}))} placeholder="comp, goals, anything relevant..." rows={2} style={{ ...inputSt, resize: 'vertical', lineHeight: 1.5 }} />
      </div>
      {submitError && <div style={{ fontSize: 12, color: '#ef5350', padding: '6px 10px', background: 'rgba(239,83,80,0.1)', borderRadius: 6, border: '1px solid rgba(239,83,80,0.3)' }}>{submitError}</div>}
      <button onClick={handleSubmit} disabled={!canSubmit || submitting} style={{ padding: '12px', borderRadius: 8, border: 'none', background: canSubmit ? C.blue : '#1e2438', color: canSubmit ? '#fff' : C.muted, fontWeight: 700, fontSize: 14, cursor: canSubmit ? 'pointer' : 'default', transition: 'all 0.15s' }}>
        {submitting ? 'Booking...' : 'Confirm Booking'}
      </button>
    </div>
  );

  const renderSuccess = () => (
    <div style={{ textAlign: 'center', padding: '48px 24px' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
      <div style={{ fontSize: 20, fontWeight: 700, color: C.text, marginBottom: 8 }}>You're booked!</div>
      <div style={{ fontSize: 13, color: C.muted, maxWidth: 300, margin: '0 auto' }}>
        {selDate && selSlot && <><strong style={{ color: C.blueLight }}>{fmtDate(selDate).full}</strong> at <strong style={{ color: C.blueLight }}>{selSlot.label}</strong>.</>}
        <br /><br />Your coach will reach out on Discord to confirm.
      </div>
    </div>
  );

  // ── Page wrapper ──────────────────────────────────────────────────────────
  const font = "'Segoe UI', system-ui, sans-serif";

  if (loading) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.muted, fontFamily: font }}>
      Loading...
    </div>
  );
  if (fetchError) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef5350', fontFamily: font }}>
      {fetchError}
    </div>
  );

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // VIEW 3 — Two column: date+time left · coach info + form right
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const renderView3 = () => (
    <div style={{ maxWidth: 820, margin: '0 auto', fontFamily: font, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
      {/* Left: 12-hour rolling slot window */}
      <div style={{ flex: 1 }}>
        {renderSlotPanel()}
      </div>
      {/* Right: Coach info + form */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {renderCoachBadge()}
        <div style={{ ...cardSt, opacity: selSlot ? 1 : 0.5, pointerEvents: selSlot ? 'auto' : 'none', transition: 'opacity 0.2s' }}>
          <label style={{ ...labelSt, marginBottom: 14 }}>Your Info</label>
          {submitted ? renderSuccess() : renderBookingForm()}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ padding: '24px 16px 60px', fontFamily: font, minHeight: '80vh', color: C.text }}>
      {renderView3()}
    </div>
  );
}
