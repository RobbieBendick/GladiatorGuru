import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { COMP_GUIDES, CompGuide, KeyAbility } from './comp-guides-data';

export default function CompGuidesSection() {
  const navigate = useNavigate();
  const [activeId, setActiveId] = useState<string>(COMP_GUIDES[0].id);
  const guide = COMP_GUIDES.find(g => g.id === activeId)!;

  return (
    <div style={s.root}>
      {/* Header */}
      <div style={s.pageHeader}>
        <div style={s.pageHeaderInner}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            <button onClick={() => navigate('/guides')} style={s.navTabInactive}>📖 Spec Guides</button>
            <button style={s.navTabActive}>⚔️ Comp Guides</button>
          </div>
          <p style={s.eyebrow}>Knowledge Base</p>
          <h1 style={s.pageTitle}>Comp Guides</h1>
          <p style={s.pageSubtitle}>How each comp is designed to win — gameplan, win conditions, and key abilities.</p>
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
              ...(activeId === g.id ? { ...s.tabActive, borderColor: g.color, color: g.color, background: `${g.color}12` } : {}),
            }}
          >
            <span style={{ fontSize: 20 }}>{g.icon}</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'inherit' }}>{g.name}</div>
              <div style={{ fontSize: 11, color: '#475569', marginTop: 1 }}>{g.bracket}</div>
            </div>
          </button>
        ))}
        <div style={s.comingSoon}>
          <span style={{ fontSize: 18, opacity: 0.2 }}>🔒</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>More comps</div>
            <div style={{ fontSize: 11, color: '#1e2630', marginTop: 1 }}>coming soon</div>
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
    <div style={{ display: 'grid', gap: 14, maxWidth: 900, margin: '0 auto' }}>

      {/* Hero */}
      <div style={{ ...s.card, borderTop: `3px solid ${guide.color}`, padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' as const }}>
          <div style={{ width: 56, height: 56, borderRadius: 12, background: `${guide.color}18`, border: `1px solid ${guide.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>
            {guide.icon}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' as const, marginBottom: 4 }}>
              <span style={{ fontSize: 28, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.02em' }}>{guide.name}</span>
              <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>{guide.fullName}</span>
              <span style={{ fontSize: 11, color: '#475569', background: '#1e2630', padding: '2px 10px', borderRadius: 20, fontWeight: 600 }}>{guide.bracket}</span>
            </div>
            <div style={{ fontSize: 14, fontStyle: 'italic', color: guide.color }}>{guide.tagline}</div>
          </div>
        </div>
        <p style={{ margin: '16px 0 0', fontSize: 14, color: '#7a8aa8', lineHeight: 1.75 }}>{guide.description}</p>
      </div>

      {/* Win Condition */}
      <div style={{ ...s.card, background: '#080e1a', borderColor: '#0f2040', padding: '18px 22px' }}>
        <SectionLabel icon="🎯" label="Win Condition" color="#60a5fa" />
        <p style={{ margin: '12px 0 0', fontSize: 14, color: '#7db4e8', lineHeight: 1.75 }}>{guide.winCondition}</p>
      </div>

      {/* How It Works */}
      <div style={{ ...s.card, padding: '18px 22px' }}>
        <SectionLabel icon="⚙️" label="How It Works" color={guide.color} />
        <div style={{ marginTop: 14, display: 'grid', gap: 8 }}>
          {guide.howItWorks.map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ minWidth: 22, height: 22, borderRadius: '50%', background: `${guide.color}20`, border: `1px solid ${guide.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: guide.color, flexShrink: 0, marginTop: 1 }}>
                {i + 1}
              </div>
              <p style={{ margin: 0, fontSize: 13, color: '#7a8aa8', lineHeight: 1.7 }}>{step}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Key Abilities */}
      <div style={{ ...s.card, padding: '18px 22px' }}>
        <SectionLabel icon="✨" label="Key Abilities" color="#a78bfa" />
        <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10 }}>
          {guide.keyAbilities.map(ability => (
            <AbilityCard key={ability.name} ability={ability} />
          ))}
        </div>
      </div>

      {/* Strengths + Weaknesses */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{ ...s.card, background: '#070e09', borderColor: '#0e2414', padding: '18px 20px' }}>
          <SectionLabel icon="✅" label="Strengths" color="#4ade80" />
          <ul style={{ margin: '12px 0 0', padding: 0, listStyle: 'none', display: 'grid', gap: 8 }}>
            {guide.strengths.map((str, i) => (
              <li key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <span style={{ color: '#4ade80', fontSize: 13, flexShrink: 0, marginTop: 2 }}>✓</span>
                <span style={{ fontSize: 12, color: '#64748b', lineHeight: 1.6 }}>{str}</span>
              </li>
            ))}
          </ul>
        </div>
        <div style={{ ...s.card, background: '#100a06', borderColor: '#261508', padding: '18px 20px' }}>
          <SectionLabel icon="⚠️" label="Weaknesses" color="#fb923c" />
          <ul style={{ margin: '12px 0 0', padding: 0, listStyle: 'none', display: 'grid', gap: 8 }}>
            {guide.weaknesses.map((w, i) => (
              <li key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <span style={{ color: '#fb923c', fontSize: 13, flexShrink: 0, marginTop: 2 }}>→</span>
                <span style={{ fontSize: 12, color: '#64748b', lineHeight: 1.6 }}>{w}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

    </div>
  );
}

function AbilityCard({ ability }: { ability: KeyAbility }) {
  return (
    <div style={{
      background: '#0a0e18', border: `1px solid ${ability.color}28`,
      borderLeft: `3px solid ${ability.color}`,
      borderRadius: 10, padding: '12px 14px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
        <span style={{ fontSize: 17 }}>{ability.icon}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>{ability.name}</span>
        <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', padding: '2px 7px', borderRadius: 20, background: `${ability.color}18`, color: ability.color, border: `1px solid ${ability.color}30` }}>
          {ability.who}
        </span>
      </div>
      <p style={{ margin: 0, fontSize: 12, color: '#5a6a88', lineHeight: 1.65 }}>{ability.desc}</p>
    </div>
  );
}

function SectionLabel({ icon, label, color }: { icon: string; label: string; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 14 }}>{icon}</span>
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase' as const, color }}>{label}</span>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s: Record<string, React.CSSProperties> = {
  root: {
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    background: '#08090d',
    color: '#e2e8f0',
    minHeight: '100vh',
    padding: '0 0 80px',
  },
  pageHeader: {
    borderBottom: '1px solid #12181f',
    padding: '40px 32px 28px',
    background: 'linear-gradient(180deg, #0c1018 0%, #08090d 100%)',
  },
  pageHeaderInner: { maxWidth: 960, margin: '0 auto' },
  eyebrow: { fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#60a5fa', margin: '0 0 8px' },
  pageTitle: { fontSize: 34, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.02em', margin: '0 0 10px' },
  pageSubtitle: { fontSize: 14, color: '#4a5568', lineHeight: 1.65, margin: 0 },

  navTabInactive: {
    padding: '6px 14px', borderRadius: 7, border: '1px solid #1a2030',
    background: 'transparent', color: '#3a4a60', fontSize: 11, fontWeight: 600,
    cursor: 'pointer', letterSpacing: '0.04em',
  },
  navTabActive: {
    padding: '6px 14px', borderRadius: 7,
    border: '1px solid rgba(96,165,250,0.35)', background: 'rgba(37,99,235,0.12)',
    color: '#60a5fa', fontSize: 11, fontWeight: 700, cursor: 'default', letterSpacing: '0.04em',
  },

  picker: {
    maxWidth: 960, margin: '20px auto 0', padding: '0 32px',
    display: 'flex', gap: 10, flexWrap: 'wrap' as const,
  },
  tab: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '12px 18px', background: '#0d1118',
    border: '1px solid #1a2030', borderRadius: 12,
    cursor: 'pointer', color: '#64748b',
    transition: 'all 0.15s', textAlign: 'left' as const,
  },
  tabActive: {},
  comingSoon: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '12px 18px', background: '#09090c',
    border: '1px dashed #141820', borderRadius: 12, color: '#1e2630',
  },

  content: { maxWidth: 960, margin: '20px auto 0', padding: '0 32px' },

  card: {
    background: '#0d1118', border: '1px solid #161e2a',
    borderRadius: 12, padding: '16px 18px',
  },
};
