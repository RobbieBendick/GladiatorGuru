import React from 'react';

const CLASS_COLORS: Record<string, string> = {
  'Death Knight': '#C41E3A', 'Demon Hunter': '#A330C9', 'Druid': '#FF7C0A',
  'Evoker': '#33937F', 'Hunter': '#AAD372', 'Mage': '#3FC7EB', 'Monk': '#00FF98',
  'Paladin': '#F48CBA', 'Priest': '#FFFFFF', 'Rogue': '#FFF468',
  'Shaman': '#0070DD', 'Warlock': '#8788EE', 'Warrior': '#C69B6D',
};

const TEST_COACHES = [
  { _id: '1', discord: 'avectz', alias: 'avectz', faction: 'Horde', wowClass: 'Warlock', partner: 'hd / lock pri', hoursPrepaid: 0, hoursUsed: 0, brackets: ['3', '5'], pinned: true, pinNote: 'hot prospect, follow up Friday' },
  { _id: '2', discord: 'bromlette', alias: 'zomtini', faction: 'Horde', wowClass: 'Rogue', partner: '', hoursPrepaid: 1, hoursUsed: 1, brackets: ['2', '3'], pinned: true, pinNote: 'wants more sessions' },
  { _id: '3', discord: '2yr0x', alias: 'gertrudo', faction: 'Alliance', wowClass: 'Priest', partner: '3s or 5s iconz', hoursPrepaid: 5, hoursUsed: 2, brackets: ['3'], pinned: false, pinNote: '' },
  { _id: '4', discord: 'aari_ventures', alias: 'aari', faction: 'Alliance', wowClass: 'Warrior', partner: 'mageiden', hoursPrepaid: 0, hoursUsed: 0, brackets: ['2', '3'], pinned: false, pinNote: '' },
  { _id: '5', discord: 'ancientxo', alias: 'envenumn', faction: 'Alliance', wowClass: 'Rogue', partner: 'mageiden', hoursPrepaid: 3, hoursUsed: 1, brackets: ['3'], pinned: false, pinNote: '' },
  { _id: '6', discord: 'chadcow', alias: 'chadcow', faction: 'Horde', wowClass: 'Warrior', partner: 'famedemon/natty', hoursPrepaid: 0, hoursUsed: 0, brackets: ['5'], pinned: false, pinNote: '' },
  { _id: '7', discord: 'linkzq', alias: 'linkz', faction: 'Alliance', wowClass: 'Rogue', partner: 'many', hoursPrepaid: 10, hoursUsed: 0, brackets: ['2', '3', '5'], pinned: false, pinNote: '' },
  { _id: '8', discord: 'jandista', alias: 'jandista', faction: 'Alliance', wowClass: 'Mage', partner: 'joxi', hoursPrepaid: 2, hoursUsed: 0, brackets: ['3'], pinned: false, pinNote: '' },
];

const today = new Date();
const d1 = new Date(today); d1.setDate(today.getDate());
const d2 = new Date(today); d2.setDate(today.getDate() + 1);
const d3 = new Date(today); d3.setDate(today.getDate() + 2);

const TEST_SESSIONS = [
  { id: 's1', discord: 'avectz', faction: 'Horde', wowClass: 'Warlock', bracket: '3s', date: new Date(new Date(d1).setHours(14, 0, 0, 0)), notes: 'lock/pri comp' },
  { id: 's2', discord: 'bromlette', faction: 'Horde', wowClass: 'Rogue', bracket: '2s', date: new Date(new Date(d1).setHours(16, 0, 0, 0)), notes: '' },
  { id: 's3', discord: '2yr0x', faction: 'Alliance', wowClass: 'Priest', bracket: '3s', date: new Date(new Date(d2).setHours(13, 0, 0, 0)), notes: 'iconz comp review' },
  { id: 's4', discord: 'linkzq', faction: 'Alliance', wowClass: 'Rogue', bracket: '5s', date: new Date(new Date(d2).setHours(18, 0, 0, 0)), notes: '' },
  { id: 's5', discord: 'ancientxo', faction: 'Alliance', wowClass: 'Rogue', bracket: '3s', date: new Date(new Date(d3).setHours(15, 0, 0, 0)), notes: 'mageiden review' },
  { id: 's6', discord: 'chadcow', faction: 'Horde', wowClass: 'Warrior', bracket: '5s', date: new Date(new Date(d3).setHours(17, 0, 0, 0)), notes: '' },
];

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function fmtDate(d: Date) {
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function fmtTime(d: Date) {
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export function Dashboard4() {
  const now = new Date();
  const sessToday = TEST_SESSIONS.filter(s => isSameDay(s.date, now));
  const sortedCoaches = [...TEST_COACHES].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
  const sortedSessions = [...TEST_SESSIONS].sort((a, b) => a.date.getTime() - b.date.getTime());

  const thStyle: React.CSSProperties = {
    padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 500,
    color: '#383e52', letterSpacing: '0.03em',
    borderBottom: '1px solid #1a1c24',
  };

  const tdStyle: React.CSSProperties = {
    padding: '11px 16px', fontSize: 13, color: '#8898b8',
    borderBottom: '1px solid #141620',
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#0f0f0f',
      fontFamily: "'Segoe UI', system-ui, sans-serif", color: '#c0c8dc',
      padding: '32px 40px',
      maxWidth: 1200, margin: '0 auto',
    }}>
      {/* Top alert bar */}
      {sessToday.length > 0 && (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '6px 12px', borderRadius: 4,
          background: 'rgba(30,136,229,0.06)', border: '1px solid rgba(30,136,229,0.15)',
          marginBottom: 28,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#1e88e5', display: 'inline-block', flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: '#5090c8' }}>
            {sessToday.length} session{sessToday.length !== 1 ? 's' : ''} scheduled today
          </span>
        </div>
      )}

      {/* Upcoming sessions — compact pill row */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ fontSize: 11, color: '#2e3448', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12, fontWeight: 500 }}>
          Upcoming · next 3 days
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {sortedSessions.map(s => {
            const clsColor = CLASS_COLORS[s.wowClass] || '#aaa';
            return (
              <div key={s.id} style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '5px 10px 5px 8px', borderRadius: 20,
                background: '#131316', border: '1px solid #1c1e28',
              }}>
                <span style={{ width: 4, height: 4, borderRadius: '50%', background: clsColor, flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: '#7080a0' }}>{fmtDate(s.date)}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#b0bcd0' }}>{fmtTime(s.date)}</span>
                <span style={{ fontSize: 11, color: '#c8d0e0', fontWeight: 500 }}>{s.discord}</span>
                <span style={{
                  fontSize: 9, padding: '1px 5px', borderRadius: 3, fontWeight: 700,
                  background: s.faction === 'Horde' ? 'rgba(198,40,40,0.12)' : 'rgba(21,101,192,0.12)',
                  color: s.faction === 'Horde' ? '#e57373' : '#64b5f6',
                }}>{s.bracket}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Coach Table */}
      <div>
        <div style={{ fontSize: 11, color: '#2e3448', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12, fontWeight: 500 }}>
          Coaches · {TEST_COACHES.length} total
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thStyle}>Discord / Alias</th>
              <th style={thStyle}>Faction</th>
              <th style={thStyle}>Class</th>
              <th style={thStyle}>Partner</th>
              <th style={thStyle}>Hours</th>
              <th style={thStyle}>Brackets</th>
              <th style={thStyle}>Note</th>
            </tr>
          </thead>
          <tbody>
            {sortedCoaches.map(c => {
              const clsColor = CLASS_COLORS[c.wowClass] || '#aaa';
              return (
                <tr key={c._id}>
                  <td style={{ ...tdStyle }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {c.pinned && <span style={{ color: '#503880', fontSize: 11 }}>★</span>}
                      <div>
                        <div style={{ fontWeight: 500, color: '#c8d0e8', fontSize: 13 }}>{c.alias}</div>
                        {c.discord !== c.alias && <div style={{ fontSize: 10, color: '#303448' }}>{c.discord}</div>}
                      </div>
                    </div>
                  </td>
                  <td style={{ ...tdStyle }}>
                    <span style={{
                      fontSize: 11, color: c.faction === 'Horde' ? '#e57373' : '#64b5f6',
                    }}>{c.faction}</span>
                  </td>
                  <td style={{ ...tdStyle }}>
                    <span style={{ color: clsColor, fontSize: 12 }}>{c.wowClass}</span>
                  </td>
                  <td style={{ ...tdStyle, color: '#484e62', fontSize: 12 }}>
                    {c.partner || <span style={{ color: '#1e2230' }}>—</span>}
                  </td>
                  <td style={{ ...tdStyle }}>
                    {c.hoursPrepaid === 0 && c.hoursUsed === 0
                      ? <span style={{ color: '#202430' }}>—</span>
                      : <span style={{ color: '#5a6888', fontSize: 12 }}>{c.hoursUsed}/{c.hoursPrepaid}h</span>
                    }
                  </td>
                  <td style={{ ...tdStyle }}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {c.brackets.map(b => (
                        <span key={b} style={{
                          display: 'inline-block', padding: '2px 7px', borderRadius: 20,
                          border: '1px solid #1e2230', fontSize: 11,
                          color: '#4a5268', fontWeight: 500,
                        }}>{b}s</span>
                      ))}
                    </div>
                  </td>
                  <td style={{ ...tdStyle, fontSize: 11, color: '#3a4258', fontStyle: 'italic' }}>
                    {c.pinNote || <span style={{ color: '#181c26' }}>—</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
