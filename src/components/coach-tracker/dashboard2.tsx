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

export function Dashboard2() {
  const now = new Date();
  const sortedCoaches = [...TEST_COACHES].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
  const sessToday = TEST_SESSIONS.filter(s => isSameDay(s.date, now));

  const stats = [
    { label: 'Total Coaches', value: TEST_COACHES.length, color: '#4a6fa5' },
    { label: 'Pinned', value: TEST_COACHES.filter(c => c.pinned).length, color: '#7c5cbf' },
    { label: 'Sessions Today', value: sessToday.length, color: '#2a8a5a' },
    { label: 'Sessions This Week', value: TEST_SESSIONS.length, color: '#a06030' },
  ];

  const thStyle: React.CSSProperties = {
    padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600,
    color: '#505870', letterSpacing: '0.05em',
    borderBottom: '1px solid #1c2035',
  };

  const tdStyle: React.CSSProperties = {
    padding: '10px 14px', fontSize: 12, color: '#a8b2cc',
    borderBottom: '1px solid #161828',
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#111318',
      fontFamily: "'Segoe UI', system-ui, sans-serif", color: '#c0c8dc',
      padding: '24px 28px',
    }}>
      {/* Title */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#d8e0f0', letterSpacing: '-0.01em' }}>WoW Coaching Dashboard</h1>
        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#404860' }}>Overview · {now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      {/* Stat Chips */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 28, flexWrap: 'wrap' }}>
        {stats.map(s => (
          <div key={s.label} style={{
            flex: '1 1 140px', minWidth: 140, padding: '16px 18px', borderRadius: 12,
            background: '#161a24', border: `1px solid ${s.color}28`,
            boxShadow: `0 0 0 1px ${s.color}14 inset`,
          }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: '#505870', marginTop: 5, fontWeight: 500 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Session Cards Row */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#404860', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 12 }}>Upcoming Sessions</div>
        <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 8 }}>
          {TEST_SESSIONS.map(s => {
            const isHorde = s.faction === 'Horde';
            const factionColor = isHorde ? '#e53935' : '#1e88e5';
            const factionBg = isHorde ? 'rgba(229,57,53,0.08)' : 'rgba(30,136,229,0.08)';
            const clsColor = CLASS_COLORS[s.wowClass] || '#aaa';
            return (
              <div key={s.id} style={{
                minWidth: 200, maxWidth: 220, borderRadius: 12,
                background: '#161a24', border: `1px solid #1e2235`,
                borderTop: `3px solid ${factionColor}`,
                padding: '14px 16px', flexShrink: 0,
              }}>
                <div style={{ fontSize: 11, color: factionColor, fontWeight: 700, marginBottom: 4, letterSpacing: '0.04em' }}>
                  {fmtDate(s.date)}
                </div>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#d0d8ec', lineHeight: 1.1 }}>{fmtTime(s.date)}</div>
                <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#c8d0e8' }}>{s.discord}</span>
                </div>
                <div style={{ marginTop: 4, display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: clsColor, fontWeight: 600 }}>{s.wowClass}</span>
                  <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 20, background: factionBg, color: factionColor, fontWeight: 700 }}>{s.bracket}</span>
                </div>
                {s.notes && <div style={{ marginTop: 8, fontSize: 10, color: '#50587a', fontStyle: 'italic', lineHeight: 1.4 }}>{s.notes}</div>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Coach Table */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#404860', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 12 }}>All Coaches</div>
        <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid #1c2035', background: '#13161e' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#0f1118' }}>
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
              {sortedCoaches.map((c) => {
                const clsColor = CLASS_COLORS[c.wowClass] || '#aaa';
                const factionColor = c.faction === 'Horde' ? '#e53935' : '#1e88e5';
                return (
                  <tr key={c._id} style={{ background: c.pinned ? '#14172200' : undefined }}>
                    <td style={{ ...tdStyle }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {c.pinned && (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            width: 18, height: 18, borderRadius: '50%', background: '#1e1a30',
                            fontSize: 9, color: '#9060d0',
                          }}>★</span>
                        )}
                        <div>
                          <div style={{ fontWeight: 600, color: '#d0d8ec', fontSize: 13 }}>{c.alias}</div>
                          {c.discord !== c.alias && <div style={{ fontSize: 10, color: '#40486a' }}>{c.discord}</div>}
                        </div>
                      </div>
                    </td>
                    <td style={{ ...tdStyle }}>
                      <span style={{
                        fontSize: 11, padding: '3px 8px', borderRadius: 20, fontWeight: 700,
                        background: c.faction === 'Horde' ? 'rgba(229,57,53,0.12)' : 'rgba(30,136,229,0.12)',
                        color: factionColor,
                      }}>{c.faction}</span>
                    </td>
                    <td style={{ ...tdStyle }}>
                      <span style={{ color: clsColor, fontWeight: 600, fontSize: 12 }}>{c.wowClass}</span>
                    </td>
                    <td style={{ ...tdStyle, color: '#606a88', fontSize: 11 }}>{c.partner || <span style={{ color: '#282e40' }}>—</span>}</td>
                    <td style={{ ...tdStyle }}>
                      {c.hoursPrepaid === 0 && c.hoursUsed === 0
                        ? <span style={{ color: '#303448' }}>—</span>
                        : <span style={{ color: '#7080a8', fontSize: 12 }}>{c.hoursUsed}/{c.hoursPrepaid}h</span>
                      }
                    </td>
                    <td style={{ ...tdStyle }}>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {c.brackets.map(b => (
                          <span key={b} style={{
                            display: 'inline-block', padding: '2px 7px', borderRadius: 20,
                            background: '#1c2035', border: '1px solid #252840',
                            fontSize: 11, color: '#7080a8', fontWeight: 600,
                          }}>{b}s</span>
                        ))}
                      </div>
                    </td>
                    <td style={{ ...tdStyle, fontSize: 11, color: '#50587a', fontStyle: 'italic', maxWidth: 200 }}>
                      {c.pinNote || <span style={{ color: '#20253a' }}>—</span>}
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
