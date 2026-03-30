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
    tagline: 'Train. Control. Burst. Repeat.',
    description:
      'WMD is a physical + magic cleave that wins through sustained pressure and coordinated CC chains. The warrior trains a target relentlessly while the mage locks out healers with Counterspell and Polymorph. Druid keeps the team alive and extends kill windows with Cyclone.',
    winCondition:
      'Warrior trains their healer or squishiest DPS into the ground. Mage Counterspells the enemy healer\'s big heal, then the warrior goes full on the exposed target. Cyclone the second healer or peel target to prevent cross-heals.',
    howItWorks: [
      'Warrior opens on the primary kill target and never stops. Hamstring, Mortal Strike, Slam — constant uptime is the pressure.',
      'Mage watches for the enemy healer\'s cast. One Counterspell into a big heal creates the kill window — the warrior capitalises immediately.',
      'Druid hotbots the warrior and uses Cyclone to either peel off the warrior or extend the kill window on the target.',
      'Warrior uses Intercept/Charge to stay glued. If they try to kite, Hamstring + Druid Roots buys time.',
      'Mage Spellsteals or Frost Novas to control the fight\'s pace and bait defensives.',
    ],
    strengths: [
      'Extremely high sustained physical damage — hard to outheal without heavy mana expenditure',
      'CS + Poly gives tight control with no shared DR',
      'Versatile — can swap targets mid-fight to punish poor positioning',
      'Good against caster-heavy teams (warrior immune to pushback, mage purges)',
    ],
    weaknesses: [
      'Weak against double healer comps — the damage is split and pressure bleeds out',
      'Druid gets trained hard by rogue and warrior cleaves',
      'Mage is a liability in close-range brawls — kiting can be difficult',
      'If the warrior gets kited or crowd-controlled, the whole comp falls apart',
    ],
    keywords: ['wmd', 'warrior mage druid', 'war mage druid'],
  },
  {
    id: 'rd',
    name: 'RD',
    fullName: 'Rogue + Druid',
    bracket: '2v2',
    color: '#fbbf24',
    icon: '🗡️',
    tagline: 'Stealth in. KS. Burst. Clone to close.',
    description:
      'RD is the quintessential 2v2 carry comp. Rogue brings burst, lockdowns, and control. Druid provides mobile healing, and the decisive Cyclone that ends games. The combo is incredibly punishing when both players play their role tightly.',
    winCondition:
      'Rogue Kidney Shots the kill target, calls it out, Druid Cyclones the healer simultaneously. That 6-second unpeeled burst window is where kills happen. Do it again until they\'re dead or out of cooldowns.',
    howItWorks: [
      'Rogue opens from stealth — Garrote silences casters, Ambush for burst openers on melee.',
      'Druid stays back and pre-hots — HoTs need to be rolling before the opener so healing is already in motion.',
      'Rogue builds combo points into Kidney Shot on the kill target. Druid Cyclones the healer the instant KS lands.',
      'Use Blind offensively to extend control windows, not defensively to survive.',
      'Druid uses Cyclone on the healer when they\'re trying to top their partner, not just on cooldown.',
    ],
    strengths: [
      'Rogue\'s control toolkit is unmatched — KS, Gouge, Blind, Vanish gives multiple resets',
      'Extremely hard to punish — Druid mobility keeps the healer alive even under train',
      'High kill potential on any target — burst + lock simultaneously is devastating',
      'Vanish resets bad situations and lets the rogue re-open from stealth',
    ],
    weaknesses: [
      'Druid gets hard-trained by warrior comps — requires heavy defensive play',
      'Rogue is squishy; if peeled off or CCd, the comp\'s pressure disappears',
      'Mana-intensive matchups can drain the druid early in long games',
      'CC-heavy comps (RMP) can prevent the rogue from ever landing meaningful uptime',
    ],
    keywords: ['rd', 'rogue druid', 'rog druid'],
  },
  {
    id: 'rmp',
    name: 'RMP',
    fullName: 'Rogue + Mage + Priest',
    bracket: '3v3',
    color: '#a78bfa',
    icon: '🪄',
    tagline: 'CC everything. Kill the one that\'s left.',
    description:
      'RMP is the gold standard 3v3 control comp. Rogue and Mage chain CC so tightly that the enemy team can barely act. Priest keeps both DPS alive with powerful spot-heals and shields. It wins by completely neutralising the enemy\'s ability to play the game.',
    winCondition:
      'Mage Sheeps a target. Rogue Kidney Shots the target that isn\'t sheeped. Priest supports. Rinse and repeat until someone dies or burns everything. The CC chains create a permanent 2v1 dynamic.',
    howItWorks: [
      'Mage opens with a Polymorph on the highest-threat target (usually their healer or a dangerous DPS).',
      'Rogue immediately Kidney Shots the non-sheeped target — that\'s the kill window.',
      'Priest stays positioned safely, keeping Renews rolling on both DPS and using Power Word: Shield reactively.',
      'If Sheep breaks early, Mage uses Frost Nova + Blink distance to re-Sheep safely.',
      'Rogue uses Blind as a second Sheep to extend CC chains — timing with Mage Sheep is the skill expression.',
    ],
    strengths: [
      'Best CC chain in the game — Sheep and KS share no DR',
      'Extremely punishing against teams with poor trinket management',
      'Priest\'s healing is powerful and efficient under pressure',
      'Versatile kill targets — can swap the plan mid-fight based on who\'s overextended',
    ],
    weaknesses: [
      'Susceptible to melee cleaves — warriors and rogues can train the mage into the ground',
      'If the rogue gets peeled, the CC chain falls apart and RMP becomes a 2v2',
      'Priest is a high-value kill target — teams that train the priest disrupt the whole flow',
      'Requires tight coordination — mistimed CCs mean the kill target gets topped between windows',
    ],
    keywords: ['rmp', 'rogue mage priest', 'rog mage priest'],
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
