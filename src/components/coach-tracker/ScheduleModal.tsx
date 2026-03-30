import { useState } from 'react';
import { Coach, Session } from './useDashboardData';

interface Props {
  coaches: Coach[];
  onSave: (payload: Omit<Session, '_id'>) => Promise<void>;
  onClose: () => void;
}

const CLASS_COLORS: Record<string, string> = {
  'Death Knight': '#C41E3A', 'Demon Hunter': '#A330C9', 'Druid': '#FF7C0A',
  'Evoker': '#33937F', 'Hunter': '#AAD372', 'Mage': '#3FC7EB', 'Monk': '#00FF98',
  'Paladin': '#F48CBA', 'Priest': '#FFFFFF', 'Rogue': '#FFF468',
  'Shaman': '#0070DD', 'Warlock': '#8788EE', 'Warrior': '#C69B6D',
};

function localDateTimeValue() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  now.setMinutes(0, 0, 0);
  return now.toISOString().slice(0, 16);
}

export function ScheduleModal({ coaches, onSave, onClose }: Props) {
  const [coachId, setCoachId] = useState('');
  const [bracket, setBracket] = useState<'2' | '3' | '5'>('3');
  const [dateTime, setDateTime] = useState(localDateTimeValue());
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const selectedCoach = coaches.find(c => c._id === coachId) || null;

  const handleSave = async () => {
    if (!selectedCoach || !dateTime) return;
    setSaving(true);
    await onSave({
      coachId: selectedCoach._id,
      discord: selectedCoach.discord,
      wowClass: selectedCoach.wowClass,
      faction: selectedCoach.faction,
      bracket,
      scheduledAt: new Date(dateTime).toISOString(),
      notes,
    });
    setSaving(false);
    onClose();
  };

  const overlayStyle: React.CSSProperties = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, backdropFilter: 'blur(4px)',
  };
  const modalStyle: React.CSSProperties = {
    background: '#141820', border: '1px solid #252a3a', borderRadius: 14,
    padding: '28px 32px', width: 440, maxWidth: '95vw',
    boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
    fontFamily: "'Segoe UI', system-ui, sans-serif",
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

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#d0daf0' }}>Schedule Session</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#404860', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>×</button>
        </div>

        {/* Coach picker */}
        <div style={{ marginBottom: 18 }}>
          <label style={labelStyle}>Coach</label>
          <select
            value={coachId}
            onChange={e => setCoachId(e.target.value)}
            style={{ ...inputStyle, cursor: 'pointer' }}
          >
            <option value="">Select a coach...</option>
            {[...coaches].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0)).map(c => (
              <option key={c._id} value={c._id}>
                {c.pinned ? '★ ' : ''}{c.discord}{c.alias && c.alias !== c.discord ? ` (${c.alias})` : ''} — {c.wowClass} {c.faction}
              </option>
            ))}
          </select>
          {selectedCoach && (
            <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: CLASS_COLORS[selectedCoach.wowClass] || '#aaa', fontWeight: 600 }}>{selectedCoach.wowClass}</span>
              <span style={{ fontSize: 11, color: selectedCoach.faction === 'Horde' ? '#ef5350' : '#42a5f5', fontWeight: 600 }}>{selectedCoach.faction}</span>
              {selectedCoach.partner && <span style={{ fontSize: 11, color: '#404860' }}>w/ {selectedCoach.partner}</span>}
            </div>
          )}
        </div>

        {/* Date/Time */}
        <div style={{ marginBottom: 18 }}>
          <label style={labelStyle}>Date & Time</label>
          <input
            type="datetime-local"
            value={dateTime}
            onChange={e => setDateTime(e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* Bracket */}
        <div style={{ marginBottom: 18 }}>
          <label style={labelStyle}>Bracket</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {(['2', '3', '5'] as const).map(b => (
              <button
                key={b}
                type="button"
                onClick={() => setBracket(b)}
                style={{
                  flex: 1, padding: '10px', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 14,
                  border: bracket === b ? '1px solid #4a6fa5' : '1px solid #252a3a',
                  background: bracket === b ? 'rgba(74,111,165,0.2)' : '#0e1118',
                  color: bracket === b ? '#7090c0' : '#404860',
                  transition: 'all 0.15s',
                }}
              >{b}s</button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div style={{ marginBottom: 24 }}>
          <label style={labelStyle}>Notes (optional)</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="comp, goals, anything relevant..."
            rows={2}
            style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
          />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{
            padding: '9px 20px', borderRadius: 8, border: '1px solid #252a3a',
            background: 'transparent', color: '#505878', cursor: 'pointer', fontSize: 13, fontWeight: 600,
          }}>Cancel</button>
          <button
            onClick={handleSave}
            disabled={!coachId || !dateTime || saving}
            style={{
              padding: '9px 24px', borderRadius: 8, border: 'none',
              background: coachId && dateTime ? '#4a6fa5' : '#252a3a',
              color: coachId && dateTime ? '#fff' : '#404860',
              cursor: coachId && dateTime ? 'pointer' : 'default',
              fontSize: 13, fontWeight: 700, transition: 'all 0.15s',
            }}
          >{saving ? 'Saving...' : 'Schedule'}</button>
        </div>
      </div>
    </div>
  );
}
