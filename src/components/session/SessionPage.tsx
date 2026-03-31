import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { API_BASE_URL } from '../../config/api';
import { findCompGuide, CompGuide, COMP_GUIDES } from '../guides/comp-guides-data';
import type { RoleNote } from '../guides/comp-guides-data';
import { useUser } from '../../contexts/UserContext';
import { getAuthToken } from '../../config/auth';

const CLASS_COLORS: Record<string, string> = {
  'Death Knight': '#C41E3A', 'Demon Hunter': '#A330C9', 'Druid': '#FF7C0A',
  'Evoker': '#33937F', 'Hunter': '#AAD372', 'Mage': '#3FC7EB', 'Monk': '#00FF98',
  'Paladin': '#F48CBA', 'Priest': '#FFFFFF', 'Rogue': '#FFF468',
  'Shaman': '#0070DD', 'Warlock': '#8788EE', 'Warrior': '#C69B6D',
};

interface SessionData {
  _id: string;
  coachId: string;
  discord: string;
  wowClass: string;
  faction: 'Horde' | 'Alliance';
  bracket: '2' | '3' | '5';
  scheduledAt: string;
  notes: string;
  userSlug: string;
  comp: string;
  pros: string[];
  cons: string[];
  takeaways: string;
}

function fmtDateTime(d: Date) {
  return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) +
    ' at ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

// ─── Comp Guide Panel ─────────────────────────────────────────────────────────

function CompGuidePanel({ guide }: { guide: CompGuide }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ marginBottom: 20, borderRadius: 12, border: `1px solid #1e2a3a`, overflow: 'hidden' }}>
      {/* Header / toggle */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px', background: '#0d1520', border: 'none', cursor: 'pointer',
          color: '#c8d8f0', textAlign: 'left',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20 }}>{guide.icon}</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: guide.color }}>{guide.name} Comp Guide</div>
            <div style={{ fontSize: 11, color: '#7a8aa8', marginTop: 1 }}>{guide.fullName} · {guide.bracket}</div>
          </div>
        </div>
        <span style={{ color: '#334155', fontSize: 14, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
      </button>

      {open && (
        <div style={{ padding: '0 20px 20px', background: '#0a0e18', borderTop: '1px solid #1a2030' }}>
          {/* Win condition */}
          <div style={{ marginBottom: 14, padding: '12px 14px', background: '#0a1520', borderRadius: 8, border: '1px solid #1a3050' }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#60a5fa', marginBottom: 6 }}>Win Condition</div>
            <p style={{ margin: 0, fontSize: 13, color: '#a0bcd8', lineHeight: 1.65 }}>{guide.winCondition}</p>
          </div>

          {/* How it works */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8a9ab8', marginBottom: 8 }}>How It Works</div>
            <div style={{ display: 'grid', gap: 6 }}>
              {guide.howItWorks.map((step, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <div style={{ minWidth: 20, height: 20, borderRadius: '50%', background: `${guide.color}18`, border: `1px solid ${guide.color}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: guide.color, flexShrink: 0, marginTop: 1 }}>
                    {i + 1}
                  </div>
                  <span style={{ fontSize: 12, color: '#8a9ab8', lineHeight: 1.65 }}>{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Key Abilities */}
          {guide.keyAbilities && guide.keyAbilities.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#a78bfa', marginBottom: 8 }}>✨ Key Abilities</div>
              <div style={{ display: 'grid', gap: 7 }}>
                {guide.keyAbilities.map(ability => (
                  <div key={ability.name} style={{ background: '#07090f', border: `1px solid ${ability.color}22`, borderLeft: `3px solid ${ability.color}`, borderRadius: 8, padding: '9px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
                      <span style={{ fontSize: 14 }}>{ability.icon}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#d0daf0' }}>{ability.name}</span>
                      <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 20, background: `${ability.color}15`, color: ability.color, border: `1px solid ${ability.color}25` }}>{ability.who}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: 11, color: '#8090b0', lineHeight: 1.6 }}>{ability.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Role Notes */}
          {guide.roleNotes && guide.roleNotes.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8a9ab8', marginBottom: 8 }}>🌳 Role Breakdown</div>
              {guide.roleNotes.map((rn: RoleNote) => (
                <div key={rn.who} style={{ marginBottom: 8, background: `${rn.color}08`, border: `1px solid ${rn.color}20`, borderLeft: `3px solid ${rn.color}`, borderRadius: 8, padding: '10px 13px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <span style={{ fontSize: 13 }}>{rn.icon}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: rn.color }}>{rn.who}</span>
                  </div>
                  {rn.points.map((pt, i) => (
                    <div key={i} style={{ display: 'flex', gap: 7, marginBottom: i < rn.points.length - 1 ? 6 : 0 }}>
                      <span style={{ color: rn.color, opacity: 0.6, flexShrink: 0 }}>›</span>
                      <p style={{ margin: 0, fontSize: 11, color: '#8090b0', lineHeight: 1.65 }}>{pt}</p>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* Strengths + Weaknesses */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div style={{ padding: '10px 12px', background: '#0a1410', borderRadius: 8, border: '1px solid #143020' }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#4ade80', marginBottom: 7 }}>Strengths</div>
              {guide.strengths.map((str, i) => (
                <div key={i} style={{ display: 'flex', gap: 6, fontSize: 12, lineHeight: 1.55, marginBottom: i < guide.strengths.length - 1 ? 6 : 0 }}>
                  <span style={{ color: '#4ade80', flexShrink: 0 }}>✓</span>
                  <span style={{ color: '#8a9ab8' }}>{str}</span>
                </div>
              ))}
            </div>
            <div style={{ padding: '10px 12px', background: '#160f0a', borderRadius: 8, border: '1px solid #301a0e' }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#fb923c', marginBottom: 7 }}>Weaknesses</div>
              {guide.weaknesses.map((w, i) => (
                <div key={i} style={{ display: 'flex', gap: 6, fontSize: 12, lineHeight: 1.55, marginBottom: i < guide.weaknesses.length - 1 ? 6 : 0 }}>
                  <span style={{ color: '#fb923c', flexShrink: 0 }}>→</span>
                  <span style={{ color: '#8a9ab8' }}>{w}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function SessionPage() {
  const { sessionId } = useParams<{ userSlug: string; sessionId: string }>();
  const { user } = useUser();
  const isAdmin = user?.role === 'admin';

  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Edit mode state
  const [editMode, setEditMode] = useState(false);
  const [editComp, setEditComp] = useState('');
  const [editCompCustom, setEditCompCustom] = useState('');
  const [editPros, setEditPros] = useState<string[]>([]);
  const [editCons, setEditCons] = useState<string[]>([]);
  const [editTakeaways, setEditTakeaways] = useState('');
  const [editNewPro, setEditNewPro] = useState('');
  const [editNewCon, setEditNewCon] = useState('');
  const [saving, setSaving] = useState(false);

  const knownComps = COMP_GUIDES.map(g => g.name);

  const startEdit = () => {
    if (!session) return;
    const c = session.comp || '';
    const isKnown = knownComps.some(n => n.toLowerCase() === c.toLowerCase());
    setEditComp(isKnown ? c.toUpperCase() : c ? '__other__' : '');
    setEditCompCustom(!isKnown ? c : '');
    setEditPros([...(session.pros || [])]);
    setEditCons([...(session.cons || [])]);
    setEditTakeaways(session.takeaways || '');
    setEditMode(true);
  };

  const cancelEdit = () => setEditMode(false);

  const saveEdit = async () => {
    if (!session) return;
    setSaving(true);
    const comp = editComp === '__other__' ? editCompCustom : editComp;
    const payload = { comp, pros: editPros, cons: editCons, takeaways: editTakeaways };
    try {
      const res = await fetch(`${API_BASE_URL}/api/coach-tracker/sessions/${session._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getAuthToken()}` },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.data) setSession(prev => prev ? { ...prev, ...data.data } : prev);
      setEditMode(false);
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  useEffect(() => {
    if (!sessionId) { setNotFound(true); setLoading(false); return; }
    fetch(`${API_BASE_URL}/api/sessions/${sessionId}`)
      .then(res => {
        if (res.status === 404) { setNotFound(true); setLoading(false); return null; }
        return res.json();
      })
      .then(data => {
        if (!data) return;
        if (data.data) { setSession(data.data); } else { setNotFound(true); }
        setLoading(false);
      })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [sessionId]);

  const pageStyle: React.CSSProperties = {
    minHeight: '100vh',
    background: '#0c0e14',
    fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
    color: '#c8d0e8',
  };

  const containerStyle: React.CSSProperties = {
    maxWidth: 700,
    margin: '0 auto',
    padding: '0 20px 60px',
  };

  if (loading) {
    return (
      <div style={pageStyle}>
        <div style={{ ...containerStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#4a6fa5', letterSpacing: '-0.02em', marginBottom: 16 }}>GladiatorGuru</div>
            <div style={{ fontSize: 13, color: '#303550' }}>Loading session...</div>
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !session) {
    return (
      <div style={pageStyle}>
        <div style={{ ...containerStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#4a6fa5', letterSpacing: '-0.02em', marginBottom: 24 }}>GladiatorGuru</div>
            <div style={{ fontSize: 48, marginBottom: 16 }}>404</div>
            <div style={{ fontSize: 16, color: '#505878', marginBottom: 8 }}>Session not found</div>
            <div style={{ fontSize: 13, color: '#303550' }}>This session may have been removed or the link is invalid.</div>
          </div>
        </div>
      </div>
    );
  }

  const clsColor = CLASS_COLORS[session.wowClass] || '#aaa';
  const factionColor = session.faction === 'Horde' ? '#ef5350' : '#42a5f5';
  const factionBg = session.faction === 'Horde' ? 'rgba(239,83,80,0.14)' : 'rgba(66,165,245,0.14)';
  const date = new Date(session.scheduledAt);
  const hasTakeaways = (session.pros && session.pros.length > 0) ||
    (session.cons && session.cons.length > 0) ||
    (session.takeaways && session.takeaways.trim().length > 0);

  const compGuide = session.comp ? findCompGuide(session.comp) : null;

  return (
    <div style={pageStyle}>
      {/* Top branding bar */}
      <div style={{ borderBottom: '1px solid #141826', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <span style={{ fontSize: 22, fontWeight: 800, color: '#4a6fa5', letterSpacing: '-0.01em' }}>GladiatorGuru</span>
        {isAdmin && !editMode && (
          <button
            onClick={startEdit}
            style={{ position: 'absolute', right: 20, padding: '6px 14px', borderRadius: 7, border: '1px solid rgba(74,111,165,0.4)', background: 'rgba(74,111,165,0.1)', color: '#6080b0', fontSize: 11, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.04em' }}
          >✏️ Edit</button>
        )}
        {isAdmin && editMode && (
          <div style={{ position: 'absolute', right: 20, display: 'flex', gap: 8 }}>
            <button onClick={cancelEdit} style={{ padding: '6px 14px', borderRadius: 7, border: '1px solid #252a3a', background: 'transparent', color: '#505878', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
            <button onClick={saveEdit} disabled={saving} style={{ padding: '6px 16px', borderRadius: 7, border: 'none', background: '#4a6fa5', color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>{saving ? 'Saving…' : '✓ Save'}</button>
          </div>
        )}
      </div>

      <div style={containerStyle}>
        {/* Session header card */}
        <div style={{ marginTop: 36, marginBottom: 28, padding: '24px 28px', background: '#10121c', borderRadius: 14, border: '1px solid #1a1e2e', borderTop: `3px solid ${clsColor}` }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#e0e8ff', marginBottom: 6 }}>{session.discord}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: clsColor, marginBottom: 10 }}>{session.wowClass}</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 4, fontWeight: 700, background: factionBg, color: factionColor }}>{session.faction}</span>
                <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 4, fontWeight: 700, background: '#181c2c', color: '#6070a0', border: '1px solid #252840' }}>{session.bracket}v{session.bracket}</span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 13, color: '#505878', marginBottom: 4 }}>Session Date</div>
              <div style={{ fontSize: 14, color: '#8090c0', fontWeight: 600 }}>{fmtDateTime(date)}</div>
            </div>
          </div>
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #1a1e2e', fontSize: 13 }}>
            <span style={{ color: '#505878', fontWeight: 600, marginRight: 8 }}>Comp Played:</span>
            {editMode ? (
              <span style={{ display: 'inline-flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <select value={editComp} onChange={e => { setEditComp(e.target.value); if (e.target.value !== '__other__') setEditCompCustom(''); }}
                  style={{ background: '#0e1118', border: '1px solid #252a3a', borderRadius: 6, color: '#c8d0e8', fontSize: 12, padding: '4px 8px', cursor: 'pointer' }}>
                  <option value="">None</option>
                  {knownComps.map(n => <option key={n} value={n}>{n}</option>)}
                  <option value="__other__">Other...</option>
                </select>
                {editComp === '__other__' && (
                  <input value={editCompCustom} onChange={e => setEditCompCustom(e.target.value)} placeholder="comp name..."
                    style={{ background: '#0e1118', border: '1px solid #252a3a', borderRadius: 6, color: '#c8d0e8', fontSize: 12, padding: '4px 8px', width: 120 }} />
                )}
              </span>
            ) : (
              <span style={{ color: '#a0b0d0', fontWeight: 700 }}>{session.comp || <span style={{ color: '#303550', fontStyle: 'italic' }}>not set</span>}</span>
            )}
          </div>
        </div>

        {/* Comp guide (collapsible) */}
        {compGuide && <CompGuidePanel guide={compGuide} />}

        {!hasTakeaways ? (
          <div style={{ textAlign: 'center', padding: '48px 24px', background: '#10121c', borderRadius: 12, border: '1px solid #1a1e2e' }}>
            <div style={{ fontSize: 32, marginBottom: 16, opacity: 0.4 }}>📋</div>
            <div style={{ fontSize: 15, color: '#404860', lineHeight: 1.6 }}>Takeaways haven't been added yet, check back soon.</div>
          </div>
        ) : (
          <div>
            {/* Section title */}
            <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 3, height: 16, borderRadius: 2, background: '#4a6fa5' }} />
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#4a6fa5' }}>Your Session Feedback</span>
            </div>

            {/* Pros */}
            {(editMode || (session.pros && session.pros.length > 0)) && (
              <div style={{ marginBottom: 20, padding: '22px 24px', background: '#0a1410', borderRadius: 12, border: '1px solid #14281e' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <div style={{ width: 4, height: 20, borderRadius: 2, background: '#2ea86a' }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#2ea86a', letterSpacing: '0.04em', textTransform: 'uppercase' }}>What You Did Well</span>
                </div>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                  {(editMode ? editPros : session.pros).map((p, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
                      <span style={{ color: '#2ea86a', fontSize: 16, lineHeight: 1.4, flexShrink: 0 }}>✓</span>
                      <span style={{ fontSize: 14, color: '#a0d8a8', lineHeight: 1.5, flex: 1 }}>{p}</span>
                      {editMode && (
                        <button onClick={() => setEditPros(prev => prev.filter((_, j) => j !== i))}
                          style={{ background: 'none', border: 'none', color: '#404860', cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: '0 4px', flexShrink: 0 }}>×</button>
                      )}
                    </li>
                  ))}
                </ul>
                {editMode && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                    <input value={editNewPro} onChange={e => setEditNewPro(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && editNewPro.trim()) { setEditPros(p => [...p, editNewPro.trim()]); setEditNewPro(''); }}}
                      placeholder="Add a pro..." style={{ flex: 1, background: '#0e1118', border: '1px solid #252a3a', borderRadius: 6, color: '#c8d0e8', fontSize: 13, padding: '7px 10px', outline: 'none' }} />
                    <button onClick={() => { if (editNewPro.trim()) { setEditPros(p => [...p, editNewPro.trim()]); setEditNewPro(''); }}}
                      style={{ padding: '7px 14px', borderRadius: 6, border: '1px solid rgba(0,180,80,0.3)', background: 'rgba(0,180,80,0.08)', color: '#50c878', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>Add</button>
                  </div>
                )}
              </div>
            )}

            {/* Cons */}
            {(editMode || (session.cons && session.cons.length > 0)) && (
              <div style={{ marginBottom: 20, padding: '22px 24px', background: '#140e0a', borderRadius: 12, border: '1px solid #28180e' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <div style={{ width: 4, height: 20, borderRadius: 2, background: '#d46a3a' }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#d46a3a', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Areas to Improve</span>
                </div>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                  {(editMode ? editCons : session.cons).map((c, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
                      <span style={{ color: '#d46a3a', fontSize: 16, lineHeight: 1.4, flexShrink: 0 }}>→</span>
                      <span style={{ fontSize: 14, color: '#d4a080', lineHeight: 1.5, flex: 1 }}>{c}</span>
                      {editMode && (
                        <button onClick={() => setEditCons(prev => prev.filter((_, j) => j !== i))}
                          style={{ background: 'none', border: 'none', color: '#404860', cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: '0 4px', flexShrink: 0 }}>×</button>
                      )}
                    </li>
                  ))}
                </ul>
                {editMode && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                    <input value={editNewCon} onChange={e => setEditNewCon(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && editNewCon.trim()) { setEditCons(p => [...p, editNewCon.trim()]); setEditNewCon(''); }}}
                      placeholder="Add a con..." style={{ flex: 1, background: '#0e1118', border: '1px solid #252a3a', borderRadius: 6, color: '#c8d0e8', fontSize: 13, padding: '7px 10px', outline: 'none' }} />
                    <button onClick={() => { if (editNewCon.trim()) { setEditCons(p => [...p, editNewCon.trim()]); setEditNewCon(''); }}}
                      style={{ padding: '7px 14px', borderRadius: 6, border: '1px solid rgba(220,80,60,0.3)', background: 'rgba(220,80,60,0.08)', color: '#e07060', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>Add</button>
                  </div>
                )}
              </div>
            )}

            {/* Coach Notes */}
            {(editMode || (session.takeaways && session.takeaways.trim().length > 0)) && (
              <div style={{ marginBottom: 20, padding: '22px 24px', background: '#0e1018', borderRadius: 12, border: '1px solid #1a1e2c' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <div style={{ width: 4, height: 20, borderRadius: 2, background: '#4a6fa5' }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#4a6fa5', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Coach Notes</span>
                </div>
                {editMode ? (
                  <textarea value={editTakeaways} onChange={e => setEditTakeaways(e.target.value)}
                    placeholder="Overall session notes, advice, next steps..."
                    rows={4}
                    style={{ width: '100%', background: '#0a0c14', border: '1px solid #252a3a', borderRadius: 8, color: '#c8d0e8', fontSize: 14, padding: '10px 12px', outline: 'none', boxSizing: 'border-box', resize: 'vertical', lineHeight: 1.7 }} />
                ) : (
                  <p style={{ margin: 0, fontSize: 14, color: '#a0aac8', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{session.takeaways}</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: 40, textAlign: 'center', fontSize: 11, color: '#252840' }}>
          Powered by <span style={{ color: '#3a5080', fontWeight: 600 }}>GladiatorGuru</span> · WoW Arena Coaching
        </div>
      </div>
    </div>
  );
}
