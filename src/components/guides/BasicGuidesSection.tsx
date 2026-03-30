import { useState } from "react";
import { useNavigate } from "react-router-dom";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SpellEntry {
  name: string;
  tag: string;
  icon: string;
  desc: string;
  tip: string;
}

interface CycloneRow {
  situation: string;
  why: string;
}

interface MatchupPhase {
  label: string;
  title: string;
  sub: string;
  body: string[];
}

interface UtilEntry {
  title: string;
  body: string;
}

interface GuideSection {
  id: string;
  title: string;
  content: React.ReactNode;
}

interface Guide {
  id: string;
  class: string;
  spec: string;
  bracket: string;
  color: string;
  accentFrom: string;
  accentTo: string;
  icon: string;
  tagline: string;
  sections: GuideSection[];
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const SPELLS: SpellEntry[] = [
  {
    name: "Lifebloom",
    tag: "Most efficient",
    icon: "🌸",
    desc: "Your bread-and-butter. A rolling HoT that blooms at the end for a big heal. Keep 3 stacks on the tank and refresh before it expires.",
    tip: "Most mana-efficient heal you have. Roll 3 stacks and never let them bloom — refresh around 1–2 sec left.",
  },
  {
    name: "Rejuvenation",
    tag: "Flexible HoT",
    icon: "🍃",
    desc: "A reliable instant HoT you can toss on anyone taking damage. Works while moving, great for multiple targets.",
    tip: "Less mana-efficient than Lifebloom. Favour it for spread damage, not spamming it on one target.",
  },
  {
    name: "Regrowth",
    tag: "Burst + HoT",
    icon: "✨",
    desc: "Direct heal with a built-in HoT. More expensive but delivers an immediate chunk plus lasting ticks — good for spike damage.",
    tip: "Sets up Swiftmend perfectly. Cast before a big predictable hit, then Swiftmend to consume it instantly.",
  },
  {
    name: "NS + Healing Touch",
    tag: "Oh-shit button",
    icon: "⚡",
    desc: "Nature's Swiftness makes your next spell instant. Pair with max-rank Healing Touch for a massive emergency heal.",
    tip: "Save it for genuine emergencies — a tank near death, someone spiked unexpectedly. 3 min CD.",
  },
  {
    name: "Swiftmend",
    tag: "Combo finisher",
    icon: "💚",
    desc: "Instantly consumes a Rejuv or Regrowth HoT to deliver its healing as a burst. Instant cast, short cooldown.",
    tip: "Best near the end of a Rejuv — HoT has given most of its value, so you lose little by consuming it.",
  },
];

const CYCLONE_ROWS: CycloneRow[] = [
  {
    situation: "Your DPS is dying",
    why: "Cyclone their healer. Forces them to stop healing while you stabilise and top your partner. Classic peel — buy time.",
  },
  {
    situation: "Their DPS is low HP",
    why: "Clone their healer to stop the top-up, or Clone the DPS to hold them in kill range once it breaks.",
  },
  {
    situation: "Going for a kill",
    why: "Clone their healer the moment your partner opens. 6-second window of unchained damage. That's your kill window.",
  },
  {
    situation: "Healer out of range",
    why: "Clone the low DPS instead. Freeze them while you top your partner, then swap before it breaks.",
  },
];

const UTILITY: UtilEntry[] = [
  {
    title: "vs Rogues — Rank 1 Roots + Faerie Fire",
    body: "Rank 1 keeps mana cost near zero. Root the moment a rogue is visible — breaks stealth approach, stops gap-closing. Layer Faerie Fire on top to strip armor and make re-stealthing a pain.",
  },
  {
    title: "vs Cripple — Abolish Poison",
    body: "Warriors and rogues both apply slows to lock your partner down. Keep Abolish running on them — it cleanses on application and continues ticking so the next one gets eaten automatically.",
  },
];

const MATCHUP_PHASES: MatchupPhase[] = [
  {
    label: "Early game",
    title: "Hotbot mode",
    sub: "they have everything",
    body: [
      "At the start of the game their warrior has every cooldown — trinkets, Shield Wall, Death Wish. This is not the time to be clever.",
      "Your job is simple: predict who's going to take damage and pre-hot them before it lands. HoTs need to be on your partner before the stun lands — not after. Survive the cooldown window, don't force kills.",
    ],
  },
  {
    label: "Late game",
    title: "Read their healer",
    sub: "they're dry, be patient",
    body: [
      "Once major cooldowns are spent the game shifts. Watch their druid — whoever they're stacking HoTs on is taking pressure next. That's your swap warning.",
      "The moment you see heavy healing on one target, pre-hot your team for the incoming swap and ready your Cyclone. A good Clone into a predicted swap can end the match.",
    ],
  },
];

const DRUID_TELLS = [
  "They stack Lifebloom on their DPS — warrior is about to swap to your partner.",
  "They pop Swiftmend — their partner took burst, topping before your next go.",
  "Their druid goes bear or moves erratically — they're scared. Push.",
  "NS + HT animation — Cyclone right after to negate the follow-up Swiftmend.",
];

// ─── Guide definition ─────────────────────────────────────────────────────────

function buildDruidGuide(): Guide {
  return {
    id: "rdruid-basics",
    class: "Druid",
    spec: "Restoration",
    bracket: "2v2 / 3v3",
    color: "#4ade80",
    accentFrom: "#16a34a",
    accentTo: "#065f46",
    icon: "🌿",
    tagline: "HoT machine. Read the board. Clone wins games.",
    sections: [
      {
        id: "spells",
        title: "Core Spells",
        content: <SpellGrid spells={SPELLS} />,
      },
      {
        id: "cyclone",
        title: "Cyclone — The Main Decision",
        content: <CycloneSection />,
      },
      {
        id: "utility",
        title: "Utility & Matchup Tools",
        content: <UtilitySection />,
      },
      {
        id: "matchup",
        title: "Warrior Druid — Early vs Late",
        content: <MatchupSection />,
      },
    ],
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SpellGrid({ spells }: { spells: SpellEntry[] }) {
  return (
    <div style={{ display: "grid", gap: 10 }}>
      {spells.map((s) => (
        <div key={s.name} style={styles.spellCard}>
          <div style={styles.spellHeader}>
            <span style={styles.spellIcon}>{s.icon}</span>
            <span style={styles.spellName}>{s.name}</span>
            <span style={styles.spellTag}>{s.tag}</span>
          </div>
          <p style={styles.spellDesc}>{s.desc}</p>
          <div style={styles.spellTip}>💡 {s.tip}</div>
        </div>
      ))}

      <div style={styles.manaSection}>
        <p style={styles.manaTitle}>Mana efficiency</p>
        {[
          { label: "Lifebloom", pct: 28, color: "#16a34a" },
          { label: "Rejuvenation", pct: 52, color: "#2563eb" },
          { label: "Regrowth", pct: 78, color: "#d97706" },
          { label: "HT (max rank)", pct: 93, color: "#dc2626" },
        ].map((b) => (
          <div key={b.label} style={styles.barRow}>
            <span style={styles.barLabel}>{b.label}</span>
            <div style={styles.barBg}>
              <div style={{ ...styles.barFill, width: `${b.pct}%`, background: b.color }} />
            </div>
          </div>
        ))}
        <p style={styles.manaNote}>Use max-rank HT only with Nature's Swiftness.</p>
      </div>
    </div>
  );
}

function CycloneSection() {
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <p style={styles.leadText}>
        Cyclone is not a panic button — it's a tool for creating space. Ask every few seconds:{" "}
        <em>who needs to be taken out of the equation right now?</em>
      </p>
      {CYCLONE_ROWS.map((r) => (
        <div key={r.situation} style={styles.cloneRow}>
          <div style={styles.cloneSituation}>{r.situation}</div>
          <div style={styles.cloneWhy}>{r.why}</div>
        </div>
      ))}
    </div>
  );
}

function UtilitySection() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
      {UTILITY.map((u) => (
        <div key={u.title} style={styles.utilCard}>
          <p style={styles.utilTitle}>{u.title}</p>
          <p style={styles.utilBody}>{u.body}</p>
        </div>
      ))}
    </div>
  );
}

function MatchupSection() {
  return (
    <div style={{ display: "grid", gap: 10 }}>
      {MATCHUP_PHASES.map((p) => (
        <div key={p.label} style={styles.phaseCard}>
          <div style={styles.phaseHeader}>
            <span style={styles.phaseLabel}>{p.label}</span>
            <span style={styles.phaseTitle}>{p.title}</span>
            <span style={styles.phaseSub}>{p.sub}</span>
          </div>
          <div style={{ padding: "12px 16px" }}>
            {p.body.map((line, i) => (
              <p key={i} style={{ ...styles.phaseBody, marginTop: i > 0 ? 8 : 0 }}>{line}</p>
            ))}
          </div>
        </div>
      ))}
      <div style={styles.tellsBox}>
        <p style={styles.tellsTitle}>Reading their druid</p>
        {DRUID_TELLS.map((t, i) => (
          <div key={i} style={styles.tellRow}>
            <span style={styles.tellDot}>›</span>
            <span style={styles.tellText}>{t}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function BasicGuidesSection() {
  const navigate = useNavigate();
  const guides: Guide[] = [buildDruidGuide()];
  const [activeGuide, setActiveGuide] = useState<string>(guides[0].id);
  const [activeSection, setActiveSection] = useState<string>(guides[0].sections[0].id);

  const guide = guides.find((g) => g.id === activeGuide)!;
  const section = guide.sections.find((s) => s.id === activeSection)!;

  return (
    <div style={styles.root}>
      {/* ── Header ── */}
      <div style={styles.pageHeader}>
        <div style={styles.pageHeaderInner}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={{ padding: '6px 14px', borderRadius: 7, border: '1px solid rgba(100,150,255,0.4)', background: 'rgba(74,111,165,0.15)', color: '#7090d0', fontSize: 11, fontWeight: 700, cursor: 'default', letterSpacing: '0.04em' }}>
                📖 Spec Guides
              </button>
              <button onClick={() => navigate('/guides/comps')} style={{ padding: '6px 14px', borderRadius: 7, border: '1px solid #1e2630', background: 'transparent', color: '#475569', fontSize: 11, fontWeight: 600, cursor: 'pointer', letterSpacing: '0.04em' }}>
                ⚔️ Comp Guides
              </button>
            </div>
          </div>
          <p style={styles.pageEyebrow}>Knowledge Base</p>
          <h1 style={styles.pageTitle}>Basic Guides</h1>
          <p style={styles.pageSubtitle}>
            Foundational playbooks for every spec — built from real session takeaways.
          </p>
        </div>
      </div>

      {/* ── Guide picker ── */}
      <div style={styles.guidePicker}>
        {guides.map((g) => (
          <button
            key={g.id}
            onClick={() => { setActiveGuide(g.id); setActiveSection(g.sections[0].id); }}
            style={{
              ...styles.guideTab,
              ...(activeGuide === g.id ? { ...styles.guideTabActive, borderColor: g.color, color: g.color } : {}),
            }}
          >
            <span style={{ fontSize: 18 }}>{g.icon}</span>
            <div>
              <div style={styles.guideTabClass}>{g.spec} {g.class}</div>
              <div style={styles.guideTabBracket}>{g.bracket}</div>
            </div>
          </button>
        ))}
        {/* placeholder for more guides coming soon */}
        <div style={styles.comingSoon}>
          <span style={{ fontSize: 18, opacity: 0.3 }}>🔒</span>
          <div>
            <div style={styles.guideTabClass}>More guides</div>
            <div style={styles.guideTabBracket}>coming soon</div>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={styles.contentArea}>
        {/* Left — guide meta + section nav */}
        <aside style={styles.sidebar}>
          <div style={styles.guideCard}>
            <div style={{ ...styles.guideCardAccent, background: `linear-gradient(135deg, ${guide.accentFrom}, ${guide.accentTo})` }}>
              <span style={styles.guideCardIcon}>{guide.icon}</span>
            </div>
            <div style={styles.guideCardBody}>
              <p style={{ ...styles.guideCardSpec, color: guide.color }}>{guide.spec}</p>
              <p style={styles.guideCardClass}>{guide.class}</p>
              <p style={styles.guideCardTagline}>{guide.tagline}</p>
              <span style={styles.guideCardBracket}>{guide.bracket}</span>
            </div>
          </div>

          <nav style={styles.sectionNav}>
            {guide.sections.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                style={{
                  ...styles.navBtn,
                  ...(activeSection === s.id
                    ? { ...styles.navBtnActive, color: guide.color, borderLeftColor: guide.color }
                    : {}),
                }}
              >
                <span style={styles.navNum}>{String(i + 1).padStart(2, "0")}</span>
                {s.title}
              </button>
            ))}
          </nav>
        </aside>

        {/* Right — section content */}
        <main style={styles.main}>
          <div style={styles.sectionHeader}>
            <p style={styles.sectionNum}>
              {String(guide.sections.findIndex((s) => s.id === activeSection) + 1).padStart(2, "0")} / {String(guide.sections.length).padStart(2, "0")}
            </p>
            <h2 style={styles.sectionTitle}>{section.title}</h2>
          </div>
          <div style={styles.sectionBody}>{section.content}</div>
        </main>
      </div>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  root: {
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    background: "#0a0c0e",
    color: "#e2e8f0",
    minHeight: "100vh",
    padding: "0 0 80px",
  },
  pageHeader: {
    borderBottom: "1px solid #1e2630",
    padding: "48px 32px 32px",
    background: "linear-gradient(180deg, #0d1117 0%, #0a0c0e 100%)",
  },
  pageHeaderInner: { maxWidth: 960, margin: "0 auto" },
  pageEyebrow: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "#4ade80",
    marginBottom: 8,
  },
  pageTitle: {
    fontSize: 36,
    fontWeight: 700,
    color: "#f1f5f9",
    letterSpacing: "-0.02em",
    margin: "0 0 10px",
  },
  pageSubtitle: { fontSize: 15, color: "#64748b", lineHeight: 1.6, margin: 0 },

  guidePicker: {
    maxWidth: 960,
    margin: "24px auto 0",
    padding: "0 32px",
    display: "flex",
    gap: 10,
    flexWrap: "wrap" as const,
  },
  guideTab: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 16px",
    background: "#111720",
    border: "1px solid #1e2630",
    borderRadius: 10,
    cursor: "pointer",
    color: "#94a3b8",
    transition: "all 0.15s",
    textAlign: "left" as const,
  },
  guideTabActive: {
    background: "#0d1a12",
    borderWidth: 1,
  },
  guideTabClass: { fontSize: 13, fontWeight: 600, color: "inherit" },
  guideTabBracket: { fontSize: 11, color: "#475569", marginTop: 1 },
  comingSoon: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 16px",
    background: "#0d0f12",
    border: "1px dashed #1e2630",
    borderRadius: 10,
    color: "#334155",
  },

  contentArea: {
    maxWidth: 960,
    margin: "24px auto 0",
    padding: "0 32px",
    display: "grid",
    gridTemplateColumns: "220px 1fr",
    gap: 20,
    alignItems: "start",
  },

  sidebar: { display: "grid", gap: 12, position: "sticky" as const, top: 24 },
  guideCard: {
    background: "#111720",
    border: "1px solid #1e2630",
    borderRadius: 12,
    overflow: "hidden",
  },
  guideCardAccent: {
    height: 72,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  guideCardIcon: { fontSize: 32 },
  guideCardBody: { padding: "12px 14px 14px" },
  guideCardSpec: { fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" as const, margin: "0 0 2px" },
  guideCardClass: { fontSize: 16, fontWeight: 700, color: "#f1f5f9", margin: "0 0 6px" },
  guideCardTagline: { fontSize: 12, color: "#64748b", lineHeight: 1.5, margin: "0 0 10px" },
  guideCardBracket: {
    display: "inline-block",
    fontSize: 11,
    fontWeight: 600,
    padding: "2px 8px",
    background: "#1e2630",
    borderRadius: 20,
    color: "#64748b",
  },

  sectionNav: {
    background: "#111720",
    border: "1px solid #1e2630",
    borderRadius: 12,
    overflow: "hidden",
    display: "grid",
  },
  navBtn: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 14px",
    background: "none",
    border: "none",
    borderLeft: "2px solid transparent",
    color: "#64748b",
    fontSize: 12,
    fontWeight: 500,
    cursor: "pointer",
    textAlign: "left" as const,
    transition: "all 0.12s",
    borderBottom: "1px solid #1a2030",
  },
  navBtnActive: {
    background: "#0d1a12",
    color: "#4ade80",
  },
  navNum: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.05em",
    color: "#334155",
    minWidth: 20,
  },

  main: {
    background: "#111720",
    border: "1px solid #1e2630",
    borderRadius: 12,
    overflow: "hidden",
  },
  sectionHeader: {
    padding: "20px 24px 16px",
    borderBottom: "1px solid #1a2030",
    background: "#0d1117",
  },
  sectionNum: { fontSize: 11, color: "#334155", fontWeight: 700, letterSpacing: "0.08em", margin: "0 0 4px" },
  sectionTitle: { fontSize: 20, fontWeight: 700, color: "#f1f5f9", margin: 0, letterSpacing: "-0.01em" },
  sectionBody: { padding: "20px 24px" },

  // Spells
  spellCard: {
    background: "#0d1117",
    border: "1px solid #1a2030",
    borderRadius: 10,
    padding: "12px 14px",
  },
  spellHeader: { display: "flex", alignItems: "center", gap: 8, marginBottom: 6 },
  spellIcon: { fontSize: 18 },
  spellName: { fontSize: 14, fontWeight: 600, color: "#e2e8f0", flex: 1 },
  spellTag: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.06em",
    textTransform: "uppercase" as const,
    padding: "2px 8px",
    background: "#162614",
    color: "#4ade80",
    borderRadius: 20,
  },
  spellDesc: { fontSize: 13, color: "#64748b", lineHeight: 1.6, marginBottom: 8 },
  spellTip: {
    fontSize: 12,
    color: "#86efac",
    background: "#0a1f12",
    border: "1px solid #166534",
    borderRadius: 7,
    padding: "6px 10px",
    lineHeight: 1.55,
  },

  // Mana
  manaSection: {
    background: "#0d1117",
    border: "1px solid #1a2030",
    borderRadius: 10,
    padding: "14px 16px",
  },
  manaTitle: { fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "#475569", marginBottom: 10 },
  barRow: { display: "flex", alignItems: "center", gap: 10, marginBottom: 7 },
  barLabel: { fontSize: 12, color: "#64748b", minWidth: 96 },
  barBg: { flex: 1, height: 5, background: "#1a2030", borderRadius: 3, overflow: "hidden" },
  barFill: { height: "100%", borderRadius: 3, transition: "width 0.4s" },
  manaNote: { fontSize: 11, color: "#334155", marginTop: 8 },

  // Cyclone
  leadText: { fontSize: 13, color: "#64748b", lineHeight: 1.7, marginBottom: 4 },
  cloneRow: {
    display: "grid",
    gridTemplateColumns: "150px 1fr",
    border: "1px solid #1a2030",
    borderRadius: 10,
    overflow: "hidden",
  },
  cloneSituation: {
    padding: "10px 12px",
    background: "#0d1117",
    fontSize: 12,
    fontWeight: 600,
    color: "#cbd5e1",
    borderRight: "1px solid #1a2030",
    display: "flex",
    alignItems: "center",
  },
  cloneWhy: { padding: "10px 13px", fontSize: 12, color: "#64748b", lineHeight: 1.55 },

  // Utility
  utilCard: {
    background: "#0d1117",
    border: "1px solid #1a2030",
    borderRadius: 10,
    padding: "12px 14px",
  },
  utilTitle: { fontSize: 12, fontWeight: 600, color: "#cbd5e1", marginBottom: 6 },
  utilBody: { fontSize: 12, color: "#64748b", lineHeight: 1.6 },

  // Matchup
  phaseCard: {
    border: "1px solid #1a2030",
    borderRadius: 10,
    overflow: "hidden",
    background: "#0d1117",
  },
  phaseHeader: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 16px",
    background: "#111820",
    borderBottom: "1px solid #1a2030",
  },
  phaseLabel: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase" as const,
    color: "#4ade80",
    background: "#0a1f12",
    padding: "2px 8px",
    borderRadius: 20,
    border: "1px solid #166534",
  },
  phaseTitle: { fontSize: 13, fontWeight: 600, color: "#e2e8f0" },
  phaseSub: { fontSize: 12, color: "#475569", marginLeft: "auto" },
  phaseBody: { fontSize: 13, color: "#64748b", lineHeight: 1.65 },

  tellsBox: {
    background: "#0d1117",
    border: "1px solid #1a2030",
    borderRadius: 10,
    padding: "14px 16px",
  },
  tellsTitle: { fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "#475569", marginBottom: 10 },
  tellRow: { display: "flex", gap: 10, padding: "7px 0", borderBottom: "1px solid #131c28" },
  tellDot: { color: "#4ade80", fontWeight: 700, marginTop: 1 },
  tellText: { fontSize: 12, color: "#64748b", lineHeight: 1.55 },
};
