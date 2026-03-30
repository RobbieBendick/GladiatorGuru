import { useState } from 'react';
import { useDashboardData, Coach, Session } from './useDashboardData';
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

function SessionCard({ s, onDelete }: { s: Session; onDelete: () => void }) {
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
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: clsColor }}>{s.wowClass}</span>
        <span style={{ padding: '1px 6px', borderRadius: 3, background: '#181c28', color: '#7080a0', fontWeight: 600, border: '1px solid #252840', fontSize: 10 }}>{s.bracket}s</span>
      </div>
      {s.notes && <div style={{ fontSize: 10, color: '#505870', fontStyle: 'italic', lineHeight: 1.4, marginTop: 5 }}>{s.notes}</div>}
    </div>
  );
}

function CoachCard({ c }: { c: Coach }) {
  const clsColor = CLASS_COLORS[c.wowClass] || '#aaa';
  const isHorde = c.faction === 'Horde';
  const factionColor = isHorde ? '#e53935' : '#1e88e5';
  const hoursLeft = Math.max(0, c.hoursPrepaid - (c.hoursUsed || 0));
  return (
    <div style={{ background: '#0e1016', borderRadius: 6, marginBottom: 8, borderLeft: `3px solid ${clsColor}`, padding: '10px 12px', boxShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#d8e0f0' }}>{c.discord}</span>
        <span style={{ fontSize: 9, padding: '2px 5px', borderRadius: 3, fontWeight: 700, background: isHorde ? 'rgba(229,57,53,0.18)' : 'rgba(30,136,229,0.18)', color: factionColor }}>{c.faction.toUpperCase()}</span>
      </div>
      <div style={{ fontSize: 11, color: clsColor, marginBottom: 5 }}>{c.wowClass}</div>
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {c.brackets.map(b => <span key={b} style={{ padding: '1px 6px', borderRadius: 3, background: '#181c28', color: '#6070a0', fontWeight: 600, border: '1px solid #252840', fontSize: 10 }}>{b}s</span>)}
        {c.hoursPrepaid > 0 && <span style={{ padding: '1px 6px', borderRadius: 3, fontSize: 10, fontWeight: 700, background: hoursLeft === 0 ? 'rgba(229,57,53,0.15)' : 'rgba(42,138,90,0.15)', color: hoursLeft === 0 ? '#ef5350' : '#4caf80' }}>{c.hoursUsed}/{c.hoursPrepaid}h</span>}
      </div>
      {c.pinNote && <div style={{ fontSize: 10, color: '#7060a0', fontStyle: 'italic', lineHeight: 1.4, marginTop: 6 }}>{c.pinNote}</div>}
    </div>
  );
}

export function Dashboard3() {
  const { coaches, sessions, loading, createSession, deleteSession } = useDashboardData();
  const [showModal, setShowModal] = useState(false);
  const now = new Date();
  const d1 = new Date(now); d1.setDate(now.getDate() + 1);
  const d2 = new Date(now); d2.setDate(now.getDate() + 2);

  const sessToday = sessions.filter(s => isSameDay(new Date(s.scheduledAt), now)).sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
  const sessTomorrow = sessions.filter(s => isSameDay(new Date(s.scheduledAt), d1)).sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
  const sessDay2 = sessions.filter(s => isSameDay(new Date(s.scheduledAt), d2)).sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

  const pinned = coaches.filter(c => c.pinned);
  const withHours = coaches.filter(c => !c.pinned && c.hoursPrepaid > 0);
  const others = coaches.filter(c => !c.pinned && c.hoursPrepaid === 0);

  const sessionColumns = [
    { label: 'Today', date: fmtDate(now), sessions: sessToday, accentColor: '#1e88e5', headerBg: '#111a28' },
    { label: 'Tomorrow', date: fmtDate(d1), sessions: sessTomorrow, accentColor: '#8b60d0', headerBg: '#181228' },
    { label: fmtDate(d2), date: '', sessions: sessDay2, accentColor: '#2a8a5a', headerBg: '#101e18' },
  ];

  const coachColumns = [
    { label: '★ Pinned', coaches: pinned, accentColor: '#c8a830', headerBg: '#1e1a2c' },
    { label: 'Has Hours', coaches: withHours, accentColor: '#2a8a5a', headerBg: '#121e18' },
    { label: 'Others', coaches: others, accentColor: '#3a4a70', headerBg: '#111520' },
  ];

  const thStyle: React.CSSProperties = { padding: '8px 12px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#404860', letterSpacing: '0.07em', textTransform: 'uppercase', borderBottom: '1px solid #151828' };
  const tdStyle: React.CSSProperties = { padding: '8px 12px', fontSize: 12, color: '#a0aac0', borderBottom: '1px solid #111420' };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#505070', fontFamily: 'system-ui' }}>Loading...</div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', fontFamily: "'Segoe UI', system-ui, sans-serif", color: '#c0c8dc' }}>
      {showModal && <ScheduleModal coaches={coaches} onSave={createSession} onClose={() => setShowModal(false)} />}

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
          <button onClick={() => setShowModal(true)} style={{ marginLeft: 8, padding: '7px 16px', borderRadius: 8, border: 'none', background: '#4a6fa5', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>+ Session</button>
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
                  : col.sessions.map(s => <SessionCard key={s._id} s={s} onDelete={() => deleteSession(s._id)} />)
                }
              </div>
            </div>
          ))}
        </div>

        {/* Coach kanban */}
        <div style={{ fontSize: 11, fontWeight: 700, color: '#303550', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>Coaches</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 28 }}>
          {coachColumns.map(col => (
            <div key={col.label}>
              <div style={{ padding: '9px 14px', borderRadius: '8px 8px 0 0', background: col.headerBg, borderBottom: `2px solid ${col.accentColor}`, display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: col.accentColor }}>{col.label}</span>
                <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, background: `${col.accentColor}22`, color: col.accentColor, padding: '1px 6px', borderRadius: 10 }}>{col.coaches.length}</span>
              </div>
              <div style={{ background: '#0c0c14', borderRadius: '0 0 8px 8px', border: '1px solid #151825', borderTop: 'none', padding: '10px', minHeight: 80 }}>
                {col.coaches.length === 0
                  ? <div style={{ fontSize: 11, color: '#1e2230', textAlign: 'center', paddingTop: 20 }}>None</div>
                  : col.coaches.map(c => <CoachCard key={c._id} c={c} />)
                }
              </div>
            </div>
          ))}
        </div>

        {/* Full roster table */}
        <div style={{ fontSize: 11, fontWeight: 700, color: '#303550', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>Full Roster</div>
        <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid #151825' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ background: '#080810' }}>
              <th style={thStyle}>Discord</th><th style={thStyle}>Faction</th><th style={thStyle}>Class</th>
              <th style={thStyle}>Partner</th><th style={thStyle}>Hours</th><th style={thStyle}>Brackets</th><th style={thStyle}>Note</th>
            </tr></thead>
            <tbody>
              {[...coaches].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0)).map((c, i) => {
                const clsColor = CLASS_COLORS[c.wowClass] || '#aaa';
                return (
                  <tr key={c._id} style={{ background: i % 2 === 0 ? '#0a0a0f' : '#090910', borderLeft: c.pinned ? '2px solid rgba(200,168,48,0.3)' : undefined }}>
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
