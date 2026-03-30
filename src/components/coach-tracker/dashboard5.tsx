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

function PinnedCard({ c }: { c: typeof TEST_COACHES[0] }) {
  const clsColor = CLASS_COLORS[c.wowClass] || '#aaa';
  const isHorde = c.faction === 'Horde';
  const factionColor = isHorde ? '#e53935' : '#1e88e5';
  return (
    <div style={{
      width: 160, minWidth: 160, borderRadius: 10, overflow: 'hidden',
      background: '#111520', border: '1px solid #1e2235',
      flexShrink: 0,
    }}>
      {/* Color bar at top */}
      <div style={{ height: 4, background: `linear-gradient(90deg, ${clsColor}, ${factionColor})` }} />
      <div style={{ padding: '12px 12px 10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <span style={{ fontSize: 18, color: '#c8a830' }}>★</span>
          <span style={{
            fontSize: 9, padding: '2px 6px', borderRadius: 3, fontWeight: 700,
            background: isHorde ? 'rgba(229,57,53,0.15)' : 'rgba(30,136,229,0.15)',
            color: factionColor,
          }}>{c.faction}</span>
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#d8e0f4', lineHeight: 1.2, marginBottom: 3 }}>{c.alias}</div>
        <div style={{ fontSize: 11, color: clsColor, marginBottom: 8 }}>{c.wowClass}</div>
        <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginBottom: 8 }}>
          {c.brackets.map(b => (
            <span key={b} style={{
              display: 'inline-block', padding: '2px 6px', borderRadius: 12,
              background: '#0c0e18', border: '1px solid #1e2235',
              fontSize: 10, color: '#5060a0', fontWeight: 700,
            }}>{b}s</span>
          ))}
        </div>
        {c.pinNote && (
          <div style={{
            fontSize: 9, color: '#6070a0', fontStyle: 'italic', lineHeight: 1.4,
            borderTop: '1px solid #181c28', paddingTop: 7,
          }}>{c.pinNote}</div>
        )}
      </div>
    </div>
  );
}

function TimelineDayGroup({ label, sessions }: { label: string; sessions: typeof TEST_SESSIONS }) {
  if (sessions.length === 0) return null;
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: '#405080', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10, paddingLeft: 24 }}>{label}</div>
      {sessions.map((s, i) => {
        const clsColor = CLASS_COLORS[s.wowClass] || '#aaa';
        const isHorde = s.faction === 'Horde';
        const factionColor = isHorde ? '#e53935' : '#1e88e5';
        const isLast = i === sessions.length - 1;
        return (
          <div key={s.id} style={{ display: 'flex', gap: 0, alignItems: 'flex-start' }}>
            {/* Timeline gutter */}
            <div style={{ width: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
              <div style={{
                width: 10, height: 10, borderRadius: '50%', marginTop: 4,
                background: clsColor, boxShadow: `0 0 6px ${clsColor}66`,
                flexShrink: 0, zIndex: 1,
              }} />
              {!isLast && <div style={{ width: 2, flex: 1, background: '#1a1e30', minHeight: 24, marginTop: 2 }} />}
            </div>
            {/* Content */}
            <div style={{
              flex: 1, marginBottom: isLast ? 0 : 8,
              background: '#0d0f1a', borderRadius: 8,
              border: '1px solid #181c2c', padding: '8px 12px',
              marginLeft: 6,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#c8d4ec' }}>{fmtTime(s.date)}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#d0daf0' }}>{s.discord}</span>
                <span style={{
                  fontSize: 9, padding: '1px 5px', borderRadius: 3, fontWeight: 700,
                  background: isHorde ? 'rgba(229,57,53,0.15)' : 'rgba(30,136,229,0.15)',
                  color: factionColor, marginLeft: 'auto',
                }}>{s.bracket}</span>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: clsColor }}>{s.wowClass}</span>
                {s.notes && <span style={{ fontSize: 10, color: '#3a4260', fontStyle: 'italic' }}>{s.notes}</span>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function Dashboard5() {
  const now = new Date();
  const d1Obj = new Date(now); d1Obj.setDate(now.getDate() + 1);
  const d2Obj = new Date(now); d2Obj.setDate(now.getDate() + 2);

  const sessToday = TEST_SESSIONS.filter(s => isSameDay(s.date, now)).sort((a, b) => a.date.getTime() - b.date.getTime());
  const sessTomorrow = TEST_SESSIONS.filter(s => isSameDay(s.date, d1Obj)).sort((a, b) => a.date.getTime() - b.date.getTime());
  const sessDay2 = TEST_SESSIONS.filter(s => isSameDay(s.date, d2Obj)).sort((a, b) => a.date.getTime() - b.date.getTime());

  const pinnedCoaches = TEST_COACHES.filter(c => c.pinned);
  const sortedCoaches = [...TEST_COACHES].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  const thStyle: React.CSSProperties = {
    padding: '9px 14px', textAlign: 'left', fontSize: 10, fontWeight: 700,
    color: '#384060', letterSpacing: '0.07em', textTransform: 'uppercase',
    borderBottom: '1px solid #161828',
  };
  const tdStyle: React.CSSProperties = {
    padding: '9px 14px', fontSize: 12, color: '#909ab8',
    borderBottom: '1px solid #10121c',
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#0c0e14',
      fontFamily: "'Segoe UI', system-ui, sans-serif", color: '#c0c8dc',
    }}>
      {/* Top header */}
      <div style={{
        padding: '16px 28px 14px', background: '#080a10',
        borderBottom: '1px solid #141826',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#c8d4f0', letterSpacing: '-0.01em' }}>Priority Board</div>
          <div style={{ fontSize: 10, color: '#283050', marginTop: 1 }}>WoW Coaching Tracker</div>
        </div>
        <div style={{ fontSize: 11, color: '#2a3050' }}>
          {now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </div>
      </div>

      <div style={{ padding: '24px 28px', display: 'grid', gridTemplateColumns: '1fr 340px', gap: 28 }}>
        {/* LEFT COLUMN */}
        <div>
          {/* Pinned coaches scroll row */}
          <div style={{ marginBottom: 28 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14,
            }}>
              <span style={{ fontSize: 16, color: '#c8a830' }}>★</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#384060', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Pinned Coaches</span>
              <span style={{
                fontSize: 10, padding: '1px 6px', borderRadius: 10,
                background: 'rgba(200,168,48,0.1)', color: '#c8a830', fontWeight: 700,
              }}>{pinnedCoaches.length}</span>
            </div>
            <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 6 }}>
              {pinnedCoaches.map(c => <PinnedCard key={c._id} c={c} />)}
              {pinnedCoaches.length === 0 && (
                <div style={{ fontSize: 12, color: '#252838', padding: '20px 0' }}>No pinned coaches</div>
              )}
            </div>
          </div>

          {/* Coach Table */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#384060', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>All Coaches</div>
            <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid #161828' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#090b12' }}>
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
                    const isHorde = c.faction === 'Horde';
                    const factionColor = isHorde ? '#e53935' : '#1e88e5';
                    return (
                      <tr key={c._id} style={{
                        background: c.pinned
                          ? 'linear-gradient(90deg, rgba(200,168,48,0.04) 0%, transparent 80%)'
                          : i % 2 === 0 ? '#0c0e14' : '#0a0b12',
                      }}>
                        <td style={{ ...tdStyle }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{
                              width: 3, height: 30, borderRadius: 2, background: clsColor, flexShrink: 0,
                              boxShadow: `0 0 4px ${clsColor}55`,
                            }} />
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                {c.pinned && <span style={{ color: '#c8a830', fontSize: 10 }}>★</span>}
                                <span style={{ fontWeight: 600, color: '#d0daf0', fontSize: 13 }}>{c.alias}</span>
                              </div>
                              {c.discord !== c.alias && <div style={{ fontSize: 10, color: '#2e3450' }}>{c.discord}</div>}
                            </div>
                          </div>
                        </td>
                        <td style={{ ...tdStyle }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            fontSize: 11, fontWeight: 600, color: factionColor,
                          }}>
                            <span style={{ width: 5, height: 5, borderRadius: '50%', background: factionColor, display: 'inline-block' }} />
                            {c.faction}
                          </span>
                        </td>
                        <td style={{ ...tdStyle, color: clsColor, fontWeight: 600, fontSize: 12 }}>{c.wowClass}</td>
                        <td style={{ ...tdStyle, color: '#505878', fontSize: 11 }}>{c.partner || <span style={{ color: '#1e2230' }}>—</span>}</td>
                        <td style={{ ...tdStyle }}>
                          {c.hoursPrepaid === 0 && c.hoursUsed === 0
                            ? <span style={{ color: '#22263a' }}>—</span>
                            : (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                                <span style={{ fontSize: 12, color: '#5060a0' }}>{c.hoursUsed}</span>
                                <span style={{ fontSize: 10, color: '#2e3450' }}>/</span>
                                <span style={{ fontSize: 12, color: '#7080c0' }}>{c.hoursPrepaid}h</span>
                              </span>
                            )
                          }
                        </td>
                        <td style={{ ...tdStyle }}>
                          <div style={{ display: 'flex', gap: 3 }}>
                            {c.brackets.map(b => (
                              <span key={b} style={{
                                display: 'inline-block', padding: '2px 7px', borderRadius: 4,
                                background: '#111420', border: '1px solid #1c2030',
                                fontSize: 10, color: '#5060a0', fontWeight: 700,
                              }}>{b}s</span>
                            ))}
                          </div>
                        </td>
                        <td style={{ ...tdStyle, fontSize: 10, color: '#404870', fontStyle: 'italic', maxWidth: 170 }}>
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

        {/* RIGHT COLUMN - Timeline */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#384060', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16 }}>Schedule</div>
          <TimelineDayGroup label={`Today · ${fmtDate(now)}`} sessions={sessToday} />
          <TimelineDayGroup label={`Tomorrow · ${fmtDate(d1Obj)}`} sessions={sessTomorrow} />
          <TimelineDayGroup label={fmtDate(d2Obj)} sessions={sessDay2} />
          {sessToday.length + sessTomorrow.length + sessDay2.length === 0 && (
            <div style={{ fontSize: 12, color: '#1e2230', padding: '20px 0' }}>No sessions scheduled</div>
          )}
        </div>
      </div>
    </div>
  );
}
