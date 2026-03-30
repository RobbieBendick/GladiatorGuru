import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { COMP_GUIDES, CompGuide } from './comp-guides-data';

export default function CompGuidesSection() {
  const navigate = useNavigate();
  const [activeId, setActiveId] = useState<string>(COMP_GUIDES[0].id);
  const guide = COMP_GUIDES.find(g => g.id === activeId)!;

  return (
    <div style={s.root}>
      {/* Header */}
      <div style={s.pageHeader}>
        <div style={s.pageHeaderInner}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => navigate('/guides')} style={{ padding: '6px 14px', borderRadius: 7, border: '1px solid #1e2630', background: 'transparent', color: '#475569', fontSize: 11, fontWeight: 600, cursor: 'pointer', letterSpacing: '0.04em' }}>
                📖 Spec Guides
              </button>
              <button style={{ padding: '6px 14px', borderRadius: 7, border: '1px solid rgba(96,165,250,0.4)', background: 'rgba(37,99,235,0.12)', color: '#60a5fa', fontSize: 11, fontWeight: 700, cursor: 'default', letterSpacing: '0.04em' }}>
                ⚔️ Comp Guides
              </button>
            </div>
          </div>
          <p style={s.eyebrow}>Knowledge Base</p>
          <h1 style={s.pageTitle}>Comp Guides</h1>
          <p style={s.pageSubtitle}>How each comp is designed to win — the gameplan, win conditions, and what to watch for.</p>
        </div>
      </div>

      {/* Comp picker */}
      <div style={s.picker}>
        {COMP_GUIDES.map(g => (
          <button
            key={g.id}
            onClick={() => setActiveId(g.id)}
            style={{
              ...s.tab,
              ...(activeId === g.id ? { ...s.tabActive, borderColor: g.color, color: g.color } : {}),
            }}
          >
            <span style={{ fontSize: 18 }}>{g.icon}</span>
            <div>
              <div style={s.tabName}>{g.name}</div>
              <div style={s.tabBracket}>{g.bracket}</div>
            </div>
          </button>
        ))}
        <div style={s.comingSoon}>
          <span style={{ fontSize: 16, opacity: 0.25 }}>🔒</span>
          <div>
            <div style={s.tabName}>More comps</div>
            <div style={s.tabBracket}>coming soon</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={s.content}>
        <CompGuideDetail guide={guide} />
      </div>
    </div>
  );
}

function CompGuideDetail({ guide }: { guide: CompGuide }) {
  return (
    <div style={{ display: 'grid', gap: 16, maxWidth: 860, margin: '0 auto' }}>

      {/* Hero card */}
      <div style={{ ...s.card, borderTop: `3px solid ${guide.color}` }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' as const }}>
          <div style={{ fontSize: 40 }}>{guide.icon}</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <span style={{ fontSize: 26, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.02em' }}>{guide.name}</span>
              <span style={{ fontSize: 12, color: '#475569', background: '#1e2630', padding: '2px 9px', borderRadius: 20, fontWeight: 600 }}>{guide.bracket}</span>
            </div>
            <div style={{ fontSize: 13, color: '#64748b', marginBottom: 10 }}>{guide.fullName}</div>
            <div style={{ fontSize: 13, fontStyle: 'italic', color: guide.color, opacity: 0.9 }}>{guide.tagline}</div>
          </div>
        </div>
        <p style={{ margin: '16px 0 0', fontSize: 14, color: '#8899bb', lineHeight: 1.7 }}>{guide.description}</p>
      </div>

      {/* Win Condition */}
      <div style={{ ...s.card, background: '#0a1520', borderColor: '#1a3050' }}>
        <SectionLabel label="Win Condition" color="#60a5fa" />
        <p style={{ margin: '10px 0 0', fontSize: 14, color: '#93c5fd', lineHeight: 1.7 }}>{guide.winCondition}</p>
      </div>

      {/* How it works */}
      <div style={s.card}>
        <SectionLabel label="How It Works" color={guide.color} />
        <ol style={{ margin: '12px 0 0', padding: '0 0 0 20px' }}>
          {guide.howItWorks.map((step, i) => (
            <li key={i} style={{ fontSize: 13, color: '#8899bb', lineHeight: 1.65, marginBottom: i < guide.howItWorks.length - 1 ? 10 : 0 }}>
              {step}
            </li>
          ))}
        </ol>
      </div>

      {/* Strengths + Weaknesses */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{ ...s.card, background: '#0a1410', borderColor: '#143020' }}>
          <SectionLabel label="Strengths" color="#4ade80" />
          <ul style={{ margin: '10px 0 0', padding: 0, listStyle: 'none' }}>
            {guide.strengths.map((str, i) => (
              <li key={i} style={{ display: 'flex', gap: 8, fontSize: 12, color: '#86efac', lineHeight: 1.6, marginBottom: i < guide.strengths.length - 1 ? 8 : 0 }}>
                <span style={{ color: '#4ade80', flexShrink: 0, marginTop: 2 }}>✓</span>
                <span style={{ color: '#8899bb' }}>{str}</span>
              </li>
            ))}
          </ul>
        </div>
        <div style={{ ...s.card, background: '#160f0a', borderColor: '#301a0e' }}>
          <SectionLabel label="Weaknesses" color="#fb923c" />
          <ul style={{ margin: '10px 0 0', padding: 0, listStyle: 'none' }}>
            {guide.weaknesses.map((w, i) => (
              <li key={i} style={{ display: 'flex', gap: 8, fontSize: 12, color: '#fdba74', lineHeight: 1.6, marginBottom: i < guide.weaknesses.length - 1 ? 8 : 0 }}>
                <span style={{ color: '#fb923c', flexShrink: 0, marginTop: 2 }}>→</span>
                <span style={{ color: '#8899bb' }}>{w}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ label, color }: { label: string; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ width: 3, height: 16, borderRadius: 2, background: color, flexShrink: 0 }} />
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color }}>{label}</span>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s: Record<string, React.CSSProperties> = {
  root: {
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    background: '#0a0c0e',
    color: '#e2e8f0',
    minHeight: '100vh',
    padding: '0 0 80px',
  },
  pageHeader: {
    borderBottom: '1px solid #1e2630',
    padding: '48px 32px 32px',
    background: 'linear-gradient(180deg, #0d1117 0%, #0a0c0e 100%)',
  },
  pageHeaderInner: { maxWidth: 960, margin: '0 auto' },
  eyebrow: {
    fontSize: 11, fontWeight: 600, letterSpacing: '0.12em',
    textTransform: 'uppercase', color: '#60a5fa', marginBottom: 8,
  },
  pageTitle: { fontSize: 36, fontWeight: 700, color: '#f1f5f9', letterSpacing: '-0.02em', margin: '0 0 10px' },
  pageSubtitle: { fontSize: 15, color: '#64748b', lineHeight: 1.6, margin: 0 },

  picker: {
    maxWidth: 960, margin: '24px auto 0', padding: '0 32px',
    display: 'flex', gap: 10, flexWrap: 'wrap' as const,
  },
  tab: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 16px', background: '#111720',
    border: '1px solid #1e2630', borderRadius: 10,
    cursor: 'pointer', color: '#94a3b8',
    transition: 'all 0.15s', textAlign: 'left' as const,
  },
  tabActive: { background: '#0d1520' },
  tabName: { fontSize: 13, fontWeight: 600, color: 'inherit' },
  tabBracket: { fontSize: 11, color: '#475569', marginTop: 1 },
  comingSoon: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 16px', background: '#0d0f12',
    border: '1px dashed #1e2630', borderRadius: 10, color: '#334155',
  },

  content: {
    maxWidth: 960, margin: '24px auto 0', padding: '0 32px',
  },

  card: {
    background: '#111720', border: '1px solid #1e2630',
    borderRadius: 12, padding: '18px 20px',
  },
};
