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

function KanbanCard({ s }: { s: typeof TEST_SESSIONS[0] }) {
  const clsColor = CLASS_COLORS[s.wowClass] || '#aaa';
  const isHorde = s.faction === 'Horde';
  const factionColor = isHorde ? '#e53935' : '#1e88e5';
  return (
    <div style={{
      background: '#0e1016', borderRadius: 6, marginBottom: 8,
      borderLeft: `3px solid ${clsColor}`,
      padding: '10px 12px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#d8e0f0' }}>{s.discord}</span>
        <span style={{
          fontSize: 9, padding: '2px 5px', borderRadius: 3, fontWeight: 700,
          background: isHorde ? 'rgba(229,57,53,0.18)' : 'rgba(30,136,229,0.18)',
          color: factionColor, letterSpacing: '0.05em',
        }}>{s.faction.toUpperCase()}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
        <span style={{ fontSize: 16, fontWeight: 700, color: '#e8eeff' }}>{fmtTime(s.date)}</span>
        <span style={{
          fontSize: 10, padding: '2px 6px', borderRadius: 3,
          background: '#181c28', color: '#7080a0', fontWeight: 600, border: '1px solid #252840',
        }}>{s.bracket}</span>
      </div>
      <div style={{ fontSize: 11, color: clsColor, marginBottom: s.notes ? 5 : 0 }}>{s.wowClass}</div>
      {s.notes && (
        <div style={{ fontSize: 10, color: '#505870', fontStyle: 'italic', lineHeight: 1.4 }}>{s.notes}</div>
      )}
    </div>
  );
}

export function Dashboard3() {
  const now = new Date();
  const d0Obj = now;
  const d1Obj = new Date(now); d1Obj.setDate(now.getDate() + 1);
  const d2Obj = new Date(now); d2Obj.setDate(now.getDate() + 2);

  const sessToday = TEST_SESSIONS.filter(s => isSameDay(s.date, d0Obj)).sort((a, b) => a.date.getTime() - b.date.getTime());
  const sessTomorrow = TEST_SESSIONS.filter(s => isSameDay(s.date, d1Obj)).sort((a, b) => a.date.getTime() - b.date.getTime());
  const sessDay2 = TEST_SESSIONS.filter(s => isSameDay(s.date, d2Obj)).sort((a, b) => a.date.getTime() - b.date.getTime());

  const sortedCoaches = [...TEST_COACHES].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  const columns = [
    { label: 'Today', date: fmtDate(d0Obj), sessions: sessToday, headerColor: '#1a3a5c', accentColor: '#1e88e5' },
    { label: 'Tomorrow', date: fmtDate(d1Obj), sessions: sessTomorrow, headerColor: '#2a2040', accentColor: '#8b60d0' },
    { label: fmtDate(d2Obj), date: '', sessions: sessDay2, headerColor: '#1a3028', accentColor: '#2a8a5a' },
  ];

  const thStyle: React.CSSProperties = {
    padding: '8px 12px', textAlign: 'left', fontSize: 10, fontWeight: 700,
    color: '#404860', letterSpacing: '0.07em', textTransform: 'uppercase',
    borderBottom: '1px solid #151828',
  };
  const tdStyle: React.CSSProperties = {
    padding: '8px 12px', fontSize: 12, color: '#a0aac0',
    borderBottom: '1px solid #111420',
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#0a0a0f',
      fontFamily: "'Segoe UI', system-ui, sans-serif", color: '#c0c8dc',
    }}>
      {/* Header bar */}
      <div style={{
        padding: '12px 24px', background: '#080810',
        borderBottom: '1px solid #141520', display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: '#8090c0', letterSpacing: '0.05em' }}>WoW COACHING</span>
        <span style={{ fontSize: 11, color: '#282e40' }}>3-Day Kanban</span>
        <span style={{ marginLeft: 'auto', fontSize: 11, color: '#303550' }}>
          {now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </span>
      </div>

      <div style={{ padding: '20px 24px' }}>
        {/* Kanban Columns */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 32 }}>
          {columns.map(col => (
            <div key={col.label} style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{
                padding: '10px 14px', borderRadius: '8px 8px 0 0',
                background: col.headerColor, borderBottom: `2px solid ${col.accentColor}`,
                display: 'flex', alignItems: 'baseline', gap: 8,
              }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: col.accentColor }}>{col.label}</span>
                {col.date && <span style={{ fontSize: 10, color: `${col.accentColor}88` }}>{col.date}</span>}
                <span style={{
                  marginLeft: 'auto', fontSize: 10, fontWeight: 700,
                  background: `${col.accentColor}22`, color: col.accentColor,
                  padding: '1px 6px', borderRadius: 10,
                }}>{col.sessions.length}</span>
              </div>
              <div style={{
                flex: 1, background: '#0c0c14', borderRadius: '0 0 8px 8px',
                border: `1px solid #151825`, borderTop: 'none',
                padding: '10px 10px',
                minHeight: 120,
              }}>
                {col.sessions.length === 0
                  ? <div style={{ fontSize: 11, color: '#252838', textAlign: 'center', paddingTop: 24 }}>No sessions</div>
                  : col.sessions.map(s => <KanbanCard key={s.id} s={s} />)
                }
              </div>
            </div>
          ))}
        </div>

        {/* Coach Table */}
        <div style={{ fontSize: 11, fontWeight: 700, color: '#303550', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>Roster</div>
        <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid #151825' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#080810' }}>
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
              {sortedCoaches.map((c, i) => {
                const clsColor = CLASS_COLORS[c.wowClass] || '#aaa';
                return (
                  <tr key={c._id} style={{ background: i % 2 === 0 ? '#0a0a0f' : '#090910' }}>
                    <td style={{ ...tdStyle }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          width: 3, height: 28, borderRadius: 2,
                          background: clsColor, flexShrink: 0,
                        }} />
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            {c.pinned && <span style={{ color: '#7060b0', fontSize: 10 }}>★</span>}
                            <span style={{ fontWeight: 600, color: '#d0d8ec', fontSize: 12 }}>{c.alias}</span>
                          </div>
                          {c.discord !== c.alias && <div style={{ fontSize: 10, color: '#303450' }}>{c.discord}</div>}
                        </div>
                      </div>
                    </td>
                    <td style={{ ...tdStyle }}>
                      <span style={{
                        fontSize: 10, padding: '2px 7px', borderRadius: 3, fontWeight: 700,
                        background: c.faction === 'Horde' ? 'rgba(229,57,53,0.14)' : 'rgba(30,136,229,0.14)',
                        color: c.faction === 'Horde' ? '#ef5350' : '#42a5f5',
                      }}>{c.faction}</span>
                    </td>
                    <td style={{ ...tdStyle, color: clsColor, fontWeight: 600, fontSize: 12 }}>{c.wowClass}</td>
                    <td style={{ ...tdStyle, color: '#505870', fontSize: 11 }}>{c.partner || <span style={{ color: '#20253a' }}>—</span>}</td>
                    <td style={{ ...tdStyle }}>
                      {c.hoursPrepaid === 0 && c.hoursUsed === 0
                        ? <span style={{ color: '#282e40' }}>—</span>
                        : <span style={{ color: '#6070a0', fontSize: 11 }}>{c.hoursUsed}/{c.hoursPrepaid}h</span>
                      }
                    </td>
                    <td style={{ ...tdStyle }}>
                      <div style={{ display: 'flex', gap: 3 }}>
                        {c.brackets.map(b => (
                          <span key={b} style={{
                            display: 'inline-block', padding: '1px 6px', borderRadius: 3,
                            background: '#141828', border: '1px solid #1e2238',
                            fontSize: 10, color: '#6070a0', fontWeight: 700,
                          }}>{b}s</span>
                        ))}
                      </div>
                    </td>
                    <td style={{ ...tdStyle, fontSize: 10, color: '#404860', fontStyle: 'italic', maxWidth: 180 }}>
                      {c.pinNote || <span style={{ color: '#181c28' }}>—</span>}
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
