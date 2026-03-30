import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuthToken, removeAuthToken } from '../../config/auth';
import { API_BASE_URL } from '../../config/api';
import { ROUTE_PATHS } from '../../schemas/route-paths';

const CLASS_COLORS: Record<string, string> = {
  'Death Knight': '#C41E3A', 'Demon Hunter': '#A330C9', 'Druid': '#FF7C0A',
  'Evoker': '#33937F', 'Hunter': '#AAD372', 'Mage': '#3FC7EB', 'Monk': '#00FF98',
  'Paladin': '#F48CBA', 'Priest': '#FFFFFF', 'Rogue': '#FFF468',
  'Shaman': '#0070DD', 'Warlock': '#8788EE', 'Warrior': '#C69B6D',
};

interface LogEntry { message: string; createdAt: string; }
interface Coach {
  _id: string;
  discord: string;
  alias: string;
  faction: 'Horde' | 'Alliance';
  wowClass: string;
  partner: string;
  hoursPrepaid: number;
  hoursUsed: number;
  brackets: string[];
  pinned: boolean;
  pinNote: string;
  activityLog: LogEntry[];
  updatedAt: string;
  createdAt: string;
}

function fmtRelative(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function PinnedCard({ c }: { c: Coach }) {
  const clsColor = CLASS_COLORS[c.wowClass] || '#aaa';
  const isHorde = c.faction === 'Horde';
  const factionColor = isHorde ? '#e53935' : '#1e88e5';
  return (
    <div style={{
      width: 160, minWidth: 160, borderRadius: 10, overflow: 'hidden',
      background: '#111520', border: '1px solid #1e2235', flexShrink: 0,
    }}>
      <div style={{ height: 4, background: `linear-gradient(90deg, ${clsColor}, ${factionColor})` }} />
      <div style={{ padding: '12px 12px 10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <span style={{ fontSize: 18, color: '#c8a830' }}>★</span>
          <span style={{
            fontSize: 9, padding: '2px 6px', borderRadius: 3, fontWeight: 700,
            background: isHorde ? 'rgba(229,57,53,0.15)' : 'rgba(30,136,229,0.15)', color: factionColor,
          }}>{c.faction}</span>
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#d8e0f4', lineHeight: 1.2, marginBottom: 3 }}>{c.discord}</div>
        <div style={{ fontSize: 11, color: clsColor, marginBottom: 8 }}>{c.wowClass}</div>
        <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginBottom: 8 }}>
          {c.brackets.map(b => (
            <span key={b} style={{
              padding: '2px 6px', borderRadius: 12, background: '#0c0e18',
              border: '1px solid #1e2235', fontSize: 10, color: '#5060a0', fontWeight: 700,
            }}>{b}s</span>
          ))}
        </div>
        {c.pinNote && (
          <div style={{ fontSize: 9, color: '#6070a0', fontStyle: 'italic', lineHeight: 1.4, borderTop: '1px solid #181c28', paddingTop: 7 }}>{c.pinNote}</div>
        )}
      </div>
    </div>
  );
}

export function Dashboard5() {
  const navigate = useNavigate();
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const now = new Date();

  const authHeaders = () => ({
    Authorization: `Bearer ${getAuthToken()}`,
    'Content-Type': 'application/json',
  });

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/coach-tracker/coaches`, {
          headers: authHeaders(), credentials: 'include',
        });
        if (res.status === 401 || res.status === 403) {
          removeAuthToken(); navigate(ROUTE_PATHS.login); return;
        }
        const data = await res.json();
        if (data.data) setCoaches(data.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetch_();
  }, []);

  const pinned = coaches.filter(c => c.pinned);
  const sorted = [...coaches].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  // Flatten all log entries across all coaches, sorted most recent first
  const recentActivity: { entry: LogEntry; coach: Coach }[] = [];
  coaches.forEach(c => {
    (c.activityLog || []).forEach(e => recentActivity.push({ entry: e, coach: c }));
  });
  recentActivity.sort((a, b) => new Date(b.entry.createdAt).getTime() - new Date(a.entry.createdAt).getTime());
  const feed = recentActivity.slice(0, 20);

  const thStyle: React.CSSProperties = {
    padding: '9px 14px', textAlign: 'left', fontSize: 10, fontWeight: 700,
    color: '#384060', letterSpacing: '0.07em', textTransform: 'uppercase',
    borderBottom: '1px solid #161828',
  };
  const tdStyle: React.CSSProperties = {
    padding: '9px 14px', fontSize: 12, color: '#909ab8', borderBottom: '1px solid #10121c',
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0c0e14', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#384060', fontFamily: 'system-ui' }}>
      Loading...
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#0c0e14', fontFamily: "'Segoe UI', system-ui, sans-serif", color: '#c0c8dc' }}>
      {/* Header */}
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

      <div style={{ padding: '24px 28px', display: 'grid', gridTemplateColumns: '1fr 320px', gap: 28 }}>
        {/* LEFT */}
        <div>
          {/* Pinned strip */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <span style={{ fontSize: 16, color: '#c8a830' }}>★</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#384060', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Pinned Coaches</span>
              <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 10, background: 'rgba(200,168,48,0.1)', color: '#c8a830', fontWeight: 700 }}>{pinned.length}</span>
            </div>
            <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 6 }}>
              {pinned.length === 0
                ? <div style={{ fontSize: 12, color: '#252838', padding: '20px 0' }}>No pinned coaches</div>
                : pinned.map(c => <PinnedCard key={c._id} c={c} />)
              }
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
                  {sorted.map((c, i) => {
                    const clsColor = CLASS_COLORS[c.wowClass] || '#aaa';
                    const isHorde = c.faction === 'Horde';
                    const factionColor = isHorde ? '#e53935' : '#1e88e5';
                    return (
                      <tr key={c._id} style={{
                        background: c.pinned ? 'linear-gradient(90deg, rgba(200,168,48,0.04) 0%, transparent 80%)' : i % 2 === 0 ? '#0c0e14' : '#0a0b12',
                      }}>
                        <td style={tdStyle}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 3, height: 30, borderRadius: 2, background: clsColor, flexShrink: 0, boxShadow: `0 0 4px ${clsColor}55` }} />
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                {c.pinned && <span style={{ color: '#c8a830', fontSize: 10 }}>★</span>}
                                <span style={{ fontWeight: 600, color: '#d0daf0', fontSize: 13 }}>{c.discord}</span>
                              </div>
                              {c.alias && c.alias !== c.discord && <div style={{ fontSize: 10, color: '#2e3450' }}>{c.alias}</div>}
                            </div>
                          </div>
                        </td>
                        <td style={tdStyle}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: factionColor }}>
                            <span style={{ width: 5, height: 5, borderRadius: '50%', background: factionColor, display: 'inline-block' }} />
                            {c.faction}
                          </span>
                        </td>
                        <td style={{ ...tdStyle, color: clsColor, fontWeight: 600 }}>{c.wowClass}</td>
                        <td style={{ ...tdStyle, color: '#505878', fontSize: 11 }}>{c.partner || <span style={{ color: '#1e2230' }}>—</span>}</td>
                        <td style={tdStyle}>
                          {c.hoursPrepaid === 0
                            ? <span style={{ color: '#22263a' }}>—</span>
                            : <span style={{ fontSize: 12, color: c.hoursUsed >= c.hoursPrepaid ? '#ef5350' : '#5060a0' }}>{c.hoursUsed}/{c.hoursPrepaid}h</span>
                          }
                        </td>
                        <td style={tdStyle}>
                          <div style={{ display: 'flex', gap: 3 }}>
                            {c.brackets.map(b => (
                              <span key={b} style={{ padding: '2px 7px', borderRadius: 4, background: '#111420', border: '1px solid #1c2030', fontSize: 10, color: '#5060a0', fontWeight: 700 }}>{b}s</span>
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

        {/* RIGHT — Activity Feed */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#384060', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16 }}>Activity Feed</div>
          {feed.length === 0 ? (
            <div style={{ fontSize: 12, color: '#1e2230', padding: '20px 0' }}>No activity yet</div>
          ) : feed.map(({ entry, coach }, i) => {
            const clsColor = CLASS_COLORS[coach.wowClass] || '#aaa';
            const isLast = i === feed.length - 1;
            return (
              <div key={`${coach._id}-${entry.createdAt}`} style={{ display: 'flex', gap: 0, alignItems: 'flex-start' }}>
                {/* Timeline gutter */}
                <div style={{ width: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                  <div style={{
                    width: 10, height: 10, borderRadius: '50%', marginTop: 5,
                    background: clsColor, boxShadow: `0 0 5px ${clsColor}55`, flexShrink: 0, zIndex: 1,
                  }} />
                  {!isLast && <div style={{ width: 2, flex: 1, background: '#1a1e30', minHeight: 16, marginTop: 2 }} />}
                </div>
                {/* Card */}
                <div style={{
                  flex: 1, marginBottom: isLast ? 0 : 8,
                  background: '#0d0f1a', borderRadius: 8,
                  border: '1px solid #181c2c', padding: '8px 12px', marginLeft: 6,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#c0c8e8' }}>{coach.discord}</span>
                    <span style={{ fontSize: 10, color: '#2e3450' }}>{fmtRelative(entry.createdAt)}</span>
                  </div>
                  <div style={{ fontSize: 11, color: '#505878', lineHeight: 1.4 }}>{entry.message}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
