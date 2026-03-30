import { useState } from 'react';
import { useDashboardData, Session } from './useDashboardData';
import { ScheduleModal } from './ScheduleModal';

const CLASS_COLORS: Record<string, string> = {
  'Death Knight': '#C41E3A', 'Demon Hunter': '#A330C9', 'Druid': '#FF7C0A',
  'Evoker': '#33937F', 'Hunter': '#AAD372', 'Mage': '#3FC7EB', 'Monk': '#00FF98',
  'Paladin': '#F48CBA', 'Priest': '#FFFFFF', 'Rogue': '#FFF468',
  'Shaman': '#0070DD', 'Warlock': '#8788EE', 'Warrior': '#C69B6D',
};

function fmtDate(d: Date) { return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }); }
function fmtTime(d: Date) { return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }); }

export function Dashboard2() {
  const { coaches, sessions, loading, createSession, deleteSession } = useDashboardData();
  const [showModal, setShowModal] = useState(false);
  const now = new Date();

  const pinned = coaches.filter(c => c.pinned);
  const all = [...coaches].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
  const hoursRemaining = coaches.reduce((sum, c) => sum + Math.max(0, c.hoursPrepaid - (c.hoursUsed || 0)), 0);

  const stats = [
    { label: 'Total Coaches', value: coaches.length, color: '#4a6fa5' },
    { label: 'Pinned / Queued', value: pinned.length, color: '#7c5cbf' },
    { label: 'Upcoming Sessions', value: sessions.length, color: '#2a8a5a' },
    { label: 'Hours Remaining', value: `${hoursRemaining}h`, color: '#a06030' },
  ];

  const th: React.CSSProperties = {
    padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600,
    color: '#505870', letterSpacing: '0.05em', borderBottom: '1px solid #1c2035',
  };
  const td: React.CSSProperties = {
    padding: '10px 14px', fontSize: 12, color: '#a8b2cc', borderBottom: '1px solid #161828',
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#111318', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#505070', fontFamily: 'system-ui' }}>Loading...</div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#111318', fontFamily: "'Segoe UI', system-ui, sans-serif", color: '#c0c8dc', padding: '24px 28px' }}>
      {showModal && <ScheduleModal coaches={coaches} onSave={createSession} onClose={() => setShowModal(false)} />}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#d8e0f0', letterSpacing: '-0.01em' }}>WoW Coaching Dashboard</h1>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: '#404860' }}>
            {now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <button onClick={() => setShowModal(true)} style={{
          padding: '9px 18px', borderRadius: 8, border: 'none', background: '#4a6fa5',
          color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
        }}>+ Schedule Session</button>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 28, flexWrap: 'wrap' }}>
        {stats.map(s => (
          <div key={s.label} style={{ flex: '1 1 140px', minWidth: 140, padding: '16px 18px', borderRadius: 12, background: '#161a24', border: `1px solid ${s.color}28` }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: '#505870', marginTop: 5, fontWeight: 500 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Upcoming Sessions */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#404860', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 12 }}>Upcoming Sessions</div>
        {sessions.length === 0 ? (
          <div style={{ fontSize: 13, color: '#252838', padding: '16px 0' }}>No sessions scheduled — <span style={{ cursor: 'pointer', color: '#4a6fa5', textDecoration: 'underline' }} onClick={() => setShowModal(true)}>schedule one</span></div>
        ) : (
          <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 8 }}>
            {sessions.map(s => {
              const date = new Date(s.scheduledAt);
              const factionColor = s.faction === 'Horde' ? '#e53935' : '#1e88e5';
              const factionBg = s.faction === 'Horde' ? 'rgba(229,57,53,0.08)' : 'rgba(30,136,229,0.08)';
              const clsColor = CLASS_COLORS[s.wowClass] || '#aaa';
              return (
                <div key={s._id} style={{
                  minWidth: 200, maxWidth: 220, borderRadius: 12, background: '#161a24',
                  border: '1px solid #1e2235', borderTop: `3px solid ${factionColor}`,
                  padding: '14px 16px', flexShrink: 0, position: 'relative',
                }}>
                  <button onClick={() => deleteSession(s._id)} title="Remove" style={{
                    position: 'absolute', top: 8, right: 8, background: 'none', border: 'none',
                    color: '#303448', cursor: 'pointer', fontSize: 14, lineHeight: 1, padding: '2px 4px',
                  }}>×</button>
                  <div style={{ fontSize: 11, color: factionColor, fontWeight: 700, marginBottom: 4 }}>{fmtDate(date)}</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: '#d0d8ec', lineHeight: 1.1 }}>{fmtTime(date)}</div>
                  <div style={{ marginTop: 10, fontSize: 13, fontWeight: 600, color: '#c8d0e8' }}>{s.discord}</div>
                  <div style={{ marginTop: 4, display: 'flex', gap: 6, alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: clsColor, fontWeight: 600 }}>{s.wowClass}</span>
                    <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 20, background: factionBg, color: factionColor, fontWeight: 700 }}>{s.bracket}s</span>
                  </div>
                  {s.notes && <div style={{ marginTop: 8, fontSize: 10, color: '#50587a', fontStyle: 'italic', lineHeight: 1.4 }}>{s.notes}</div>}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pinned */}
      {pinned.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#404860', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 12 }}>★ Pinned / Queued</div>
          <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 8 }}>
            {pinned.map(c => {
              const factionColor = c.faction === 'Horde' ? '#e53935' : '#1e88e5';
              const factionBg = c.faction === 'Horde' ? 'rgba(229,57,53,0.08)' : 'rgba(30,136,229,0.08)';
              const clsColor = CLASS_COLORS[c.wowClass] || '#aaa';
              const lastLog = c.activityLog?.slice(-1)[0];
              return (
                <div key={c._id} style={{
                  minWidth: 210, maxWidth: 230, borderRadius: 12, background: '#161a24',
                  border: '1px solid #1e2235', borderTop: `3px solid ${factionColor}`, padding: '14px 16px', flexShrink: 0,
                }}>
                  <div style={{ fontSize: 11, color: factionColor, fontWeight: 700, marginBottom: 6 }}>{c.faction}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#d0d8ec' }}>{c.discord}</div>
                  {c.alias && c.alias !== c.discord && <div style={{ fontSize: 10, color: '#404860', marginTop: 1 }}>{c.alias}</div>}
                  <div style={{ marginTop: 8, display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, color: clsColor, fontWeight: 600 }}>{c.wowClass}</span>
                    {c.brackets.map(b => (
                      <span key={b} style={{ fontSize: 10, padding: '1px 6px', borderRadius: 20, background: factionBg, color: factionColor, fontWeight: 700 }}>{b}s</span>
                    ))}
                  </div>
                  {c.pinNote && <div style={{ marginTop: 8, fontSize: 10, color: '#7060a0', fontStyle: 'italic', lineHeight: 1.4 }}>{c.pinNote}</div>}
                  {lastLog && <div style={{ marginTop: 8, fontSize: 10, color: '#40485e', borderTop: '1px solid #1c2035', paddingTop: 8, lineHeight: 1.4 }}>{lastLog.message}</div>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Full Table */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#404860', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 12 }}>All Coaches</div>
        <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid #1c2035', background: '#13161e' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#0f1118' }}>
                <th style={th}>Discord / Alias</th><th style={th}>Faction</th><th style={th}>Class</th>
                <th style={th}>Partner</th><th style={th}>Hours</th><th style={th}>Brackets</th><th style={th}>Note</th>
              </tr>
            </thead>
            <tbody>
              {all.map(c => {
                const clsColor = CLASS_COLORS[c.wowClass] || '#aaa';
                const factionColor = c.faction === 'Horde' ? '#e53935' : '#1e88e5';
                return (
                  <tr key={c._id} style={{ borderLeft: c.pinned ? '2px solid rgba(240,165,0,0.4)' : undefined }}>
                    <td style={td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {c.pinned && <span style={{ color: '#f0a500', fontSize: 11 }}>★</span>}
                        <div>
                          <div style={{ fontWeight: 600, color: '#d0d8ec', fontSize: 13 }}>{c.discord}</div>
                          {c.alias && c.alias !== c.discord && <div style={{ fontSize: 10, color: '#40486a' }}>{c.alias}</div>}
                        </div>
                      </div>
                    </td>
                    <td style={td}><span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 20, fontWeight: 700, background: c.faction === 'Horde' ? 'rgba(229,57,53,0.12)' : 'rgba(30,136,229,0.12)', color: factionColor }}>{c.faction}</span></td>
                    <td style={td}><span style={{ color: clsColor, fontWeight: 600, fontSize: 12 }}>{c.wowClass}</span></td>
                    <td style={{ ...td, color: '#606a88', fontSize: 11 }}>{c.partner || <span style={{ color: '#282e40' }}>—</span>}</td>
                    <td style={td}>{c.hoursPrepaid === 0 ? <span style={{ color: '#303448' }}>—</span> : <span style={{ color: c.hoursUsed >= c.hoursPrepaid ? '#e53935' : '#7080a8', fontSize: 12 }}>{c.hoursUsed}/{c.hoursPrepaid}h</span>}</td>
                    <td style={td}><div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>{c.brackets.map(b => <span key={b} style={{ padding: '2px 7px', borderRadius: 20, background: '#1c2035', border: '1px solid #252840', fontSize: 11, color: '#7080a8', fontWeight: 600 }}>{b}s</span>)}</div></td>
                    <td style={{ ...td, fontSize: 11, color: '#50587a', fontStyle: 'italic', maxWidth: 200 }}>{c.pinNote || <span style={{ color: '#20253a' }}>—</span>}</td>
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
