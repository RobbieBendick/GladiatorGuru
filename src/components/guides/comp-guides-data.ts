// ─── Comp Guide Data ──────────────────────────────────────────────────────────
// Add new comps here. `keywords` is used to match against session.comp (case-insensitive).

export interface CompGuide {
  id: string;
  name: string;       // short name shown in UI, e.g. "WMD"
  fullName: string;   // e.g. "Warrior + Mage + Druid"
  bracket: '2v2' | '3v3' | '2v2 / 3v3';
  color: string;      // accent color
  icon: string;       // emoji
  tagline: string;
  description: string;
  winCondition: string;
  howItWorks: string[];
  strengths: string[];
  weaknesses: string[];
  keywords: string[]; // matched against session.comp (case-insensitive contains)
}

export const COMP_GUIDES: CompGuide[] = [
  {
    id: 'wmd',
    name: 'WMD',
    fullName: 'Warrior + Mage + Druid',
    bracket: '3v3',
    color: '#60a5fa',
    icon: '⚔️',
    tagline: 'Train. Lock out. Burst. Priest killer.',
    description:
      'WMD is a physical + magic cleave that wins through sustained pressure and coordinated CC chains. The mage and druid lock out the enemy mage or druid with Counterspell and Feral Charge, giving the warrior uninterrupted uptime on the kill target.',
    winCondition:
      'Warrior and mage together are the highest burst in the game — better than lock + war on top of someone. This makes WMD a premier priest killer comp. Mage and druid can run independent CC rotations, Poly and Cyclone on two different targets all game, as well as Cloning whoever is low.',
    howItWorks: [
      'Warrior opens and never leaves the kill target. Hamstring, Mortal Strike, Slam — the goal is zero downtime.',
      'Mage and druid work together to give the warrior full uptime: Counterspell on a Poly or after a Clone/Root creates the window for the warrior to keep training freely.',
      'Mage and druid can lock two different players simultaneously all game — Poly one, Cyclone another. Neither target can be healed. Warrior destroys whoever is left.',
      'Mage Spellsteals and Frost Novas to further control positioning and bait defensive cooldowns.',
    ],
    strengths: [
      'Warrior + mage is the highest burst combo in the game — priests, locks, and clothies die fast',
      'Exceptional into RMP and any priest/rogue/X comp — CS and Shatter can end rogues caught in the open',
      'Dual independent CC (Poly + Cyclone) means the enemy team is always playing 1v3 or 2v3',
      'Good into melee cleaves — mage kiting tools and druid mobility punish predictable trains',
      'Not bad into double healer or any priest team — the damage output overwhelms even sustained healing',
    ],
    weaknesses: [
      'The comp requires a really good mage — mage is doing most of the setup and a weak mage means the warrior never gets clean uptime',
      'Gnome is obviously a huge advantage on mage for the racial root break, effectively giving a second trinket and making kiting / escaping roots much more reliable',
      'Lock Druid is a tough matchup — warlock pressure on the druid combined with fear chains is hard to deal with',
      'Double healer can be 50/50 — heavily depends on how clean the CC setups are',
      'If the warrior gets hard kited or peeled for an extended period, the comp\'s pressure window is wasted',
    ],
    keywords: ['wmd', 'warrior mage druid', 'war mage druid'],
  },
];

/** Look up a comp guide by matching against session.comp field (case-insensitive). */
export function findCompGuide(comp: string): CompGuide | null {
  if (!comp) return null;
  const lower = comp.toLowerCase();
  return COMP_GUIDES.find(g =>
    g.keywords.some(kw => lower.includes(kw)) || lower.includes(g.name.toLowerCase())
  ) ?? null;
}
