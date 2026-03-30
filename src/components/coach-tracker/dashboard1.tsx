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

function fmtTime(d: Date) {
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function BracketBadge({ b }: { b: string }) {
  return (
    <span style={{
      display: 'inline-block', padding: '1px 5px', marginRight: 2,
      background: '#1e2230', border: '1px solid #333', borderRadius: 3,
      fontSize: 10, color: '#9aa3b8', fontWeight: 600, letterSpacing: '0.04em',
    }}>{b}s</span>
  );
}

function HoursDisplay({ prep, used }: { prep: number; used: number }) {
  if (prep === 0 && used === 0) return <span style={{ color: '#444' }}>—</span>;
  return <span style={{ color: '#7c8aaa', fontSize: 11 }}>{used}/{prep}h</span>;
}

export function Dashboard1() {
  const now = new Date();
  const d0Label = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const d1Obj = new Date(now); d1Obj.setDate(now.getDate() + 1);
  const d2Obj = new Date(now); d2Obj.setDate(now.getDate() + 2);
  const d1Label = d1Obj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const d2Label = d2Obj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  const sessToday = TEST_SESSIONS.filter(s => isSameDay(s.date, now));
  const sessTomorrow = TEST_SESSIONS.filter(s => isSameDay(s.date, d1Obj));
  const sessDay2 = TEST_SESSIONS.filter(s => isSameDay(s.date, d2Obj));

  const pinnedCoaches = TEST_COACHES.filter(c => c.pinned);
  const sortedCoaches = [...TEST_COACHES].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  const thStyle: React.CSSProperties = {
    padding: '6px 10px', textAlign: 'left', fontSize: 10, fontWeight: 700,
    color: '#4a5270', letterSpacing: '0.08em', textTransform: 'uppercase',
    borderBottom: '1px solid #1a1d2a', whiteSpace: 'nowrap',
  };

  const tdStyle: React.CSSProperties = {
    padding: '7px 10px', fontSize: 12, color: '#b0b8cc',
    borderBottom: '1px solid #13151e', whiteSpace: 'nowrap',
  };

  function SessionGroup({ label, sessions }: { label: string; sessions: typeof TEST_SESSIONS }) {
    if (sessions.length === 0) return null;
    return (
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: '#3a4060', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4, paddingLeft: 2 }}>{label}</div>
        {sessions.map(s => (
          <div key={s.id} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '5px 6px', marginBottom: 2, borderRadius: 4,
            background: '#0e1018', borderLeft: `2px solid ${CLASS_COLORS[s.wowClass] || '#555'}`,
          }}>
            <span style={{ fontSize: 10, color: '#6a7590', minWidth: 40 }}>{fmtTime(s.date)}</span>
            <span style={{ fontSize: 11, color: '#d0d6e8', fontWeight: 600, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.discord}</span>
            <span style={{
              fontSize: 9, padding: '1px 4px', borderRadius: 2, fontWeight: 700,
              background: s.faction === 'Horde' ? 'rgba(229,57,53,0.15)' : 'rgba(30,136,229,0.15)',
              color: s.faction === 'Horde' ? '#e57373' : '#64b5f6',
            }}>{s.bracket}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex', minHeight: '100vh', background: '#0d0d0f',
      fontFamily: "'Segoe UI', system-ui, sans-serif", color: '#c0c8dc',
    }}>
      {/* LEFT SIDEBAR */}
      <div style={{
        width: 300, minWidth: 300, background: '#080810', borderRight: '1px solid #151820',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '14px 14px 10px', borderBottom: '1px solid #151820',
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#4a5580', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Command Center</div>
          <div style={{ fontSize: 9, color: '#2e3450', marginTop: 2, letterSpacing: '0.06em' }}>WoW Coaching Tracker</div>
        </div>

        {/* Pinned Coaches */}
        <div style={{ padding: '10px 10px 6px', borderBottom: '1px solid #101220' }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: '#3a4060', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>★ Pinned</div>
          {pinnedCoaches.map(c => (
            <div key={c._id} style={{
              padding: '6px 8px', marginBottom: 4, borderRadius: 4,
              background: '#0c0e18', border: '1px solid #1a1d2a',
              borderLeft: `3px solid ${CLASS_COLORS[c.wowClass] || '#555'}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#d0d8ec' }}>{c.alias}</span>
                <span style={{
                  fontSize: 9, padding: '1px 5px', borderRadius: 2, fontWeight: 700,
                  background: c.faction === 'Horde' ? 'rgba(229,57,53,0.2)' : 'rgba(30,136,229,0.2)',
                  color: c.faction === 'Horde' ? '#ef5350' : '#42a5f5',
                }}>{c.faction}</span>
              </div>
              <div style={{ fontSize: 10, color: CLASS_COLORS[c.wowClass] || '#aaa', marginTop: 1 }}>{c.wowClass}</div>
              {c.pinNote && <div style={{ fontSize: 9, color: '#5a6280', marginTop: 3, fontStyle: 'italic', lineHeight: 1.3 }}>{c.pinNote}</div>}
            </div>
          ))}
        </div>

        {/* Upcoming Sessions */}
        <div style={{ flex: 1, overflow: 'auto', padding: '10px 10px' }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: '#3a4060', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Upcoming Sessions</div>
          <SessionGroup label={`Today · ${d0Label}`} sessions={sessToday} />
          <SessionGroup label={`Tomorrow · ${d1Label}`} sessions={sessTomorrow} />
          <SessionGroup label={d2Label} sessions={sessDay2} />
        </div>
      </div>

      {/* RIGHT MAIN - COACH TABLE */}
      <div style={{ flex: 1, overflow: 'auto', padding: '16px 20px' }}>
        <div style={{ marginBottom: 14 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#7080a0', letterSpacing: '0.05em', textTransform: 'uppercase' }}>All Coaches</span>
          <span style={{ marginLeft: 8, fontSize: 11, color: '#2e3450' }}>{TEST_COACHES.length} total</span>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'auto' }}>
          <thead>
            <tr style={{ background: '#0a0b10' }}>
              <th style={thStyle}>#</th>
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
            {sortedCoaches.map((c, i) => (
              <tr key={c._id} style={{ background: c.pinned ? '#0d0f18' : i % 2 === 0 ? '#0d0d0f' : '#0b0b0e' }}>
                <td style={{ ...tdStyle, color: '#2e3450', width: 24 }}>{i + 1}</td>
                <td style={{ ...tdStyle }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    {c.pinned && <span style={{ color: '#7060a0', fontSize: 10 }}>★</span>}
                    <div>
                      <div style={{ fontWeight: 600, color: '#d0d8ec', fontSize: 12 }}>{c.alias}</div>
                      {c.discord !== c.alias && <div style={{ fontSize: 10, color: '#3a4260' }}>{c.discord}</div>}
                    </div>
                  </div>
                </td>
                <td style={{ ...tdStyle }}>
                  <span style={{
                    fontSize: 10, padding: '2px 6px', borderRadius: 2, fontWeight: 700,
                    background: c.faction === 'Horde' ? 'rgba(229,57,53,0.15)' : 'rgba(30,136,229,0.15)',
                    color: c.faction === 'Horde' ? '#ef5350' : '#42a5f5',
                  }}>{c.faction}</span>
                </td>
                <td style={{ ...tdStyle, color: CLASS_COLORS[c.wowClass] || '#aaa', fontWeight: 600, fontSize: 12 }}>{c.wowClass}</td>
                <td style={{ ...tdStyle, color: '#606880', fontSize: 11 }}>{c.partner || <span style={{ color: '#2a2e3a' }}>—</span>}</td>
                <td style={{ ...tdStyle }}><HoursDisplay prep={c.hoursPrepaid} used={c.hoursUsed} /></td>
                <td style={{ ...tdStyle }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    {c.brackets.map(b => <BracketBadge key={b} b={b} />)}
                  </div>
                </td>
                <td style={{ ...tdStyle, fontSize: 10, color: '#4a5270', fontStyle: 'italic', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {c.pinNote || <span style={{ color: '#1e2030' }}>—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
