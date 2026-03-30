// ─── Comp Guide Data ──────────────────────────────────────────────────────────
// Add new comps here. `keywords` is used to match against session.comp (case-insensitive).

export interface KeyAbility {
  icon: string;
  name: string;
  who: string;   // e.g. "Warrior", "Mage", "Druid"
  color: string; // class color accent
  desc: string;
}

export interface RoleNote {
  who: string;
  color: string;
  icon: string;
  points: string[];
}

export interface CompGuide {
  id: string;
  name: string;
  fullName: string;
  bracket: '2v2' | '3v3' | '2v2 / 3v3';
  color: string;
  icon: string;
  tagline: string;
  description: string;
  winCondition: string;
  howItWorks: string[];
  keyAbilities: KeyAbility[];
  roleNotes?: RoleNote[];
  strengths: string[];
  weaknesses: string[];
  keywords: string[];
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
      'Warrior opens with full HoTs on them and gets the game started — druid pre-hots before the engage so healing is already rolling the moment the warrior goes in.',
      'Mage and druid work together to give the warrior full uptime: Counterspell on a Poly or after a Clone/Root creates the window for the warrior to keep training freely.',
      'Mage and druid can lock two different players simultaneously all game — Poly one, Cyclone another. Neither target can be healed. Warrior destroys whoever is left.',
    ],
    keyAbilities: [
      {
        icon: '⚡',
        name: 'Intercept',
        who: 'Warrior',
        color: '#C69B6D',
        desc: 'Charge to the target in combat. Keeps the warrior glued and makes peeling nearly impossible — especially with Gnome racial to break roots and charge again immediately.',
      },
      {
        icon: '❄️',
        name: 'Shatter',
        who: 'Mage',
        color: '#3FC7EB',
        desc: 'Freeze a target with Frost Nova or Frostbite then Frostbolt + Ice Lance for a guaranteed crit combo. On a rogue caught in the open or a mage out of position this ends games instantly. Combines with Intercept — warrior charges in to keep the target locked down after the shatter lands.',
      },
      {
        icon: '🌀',
        name: 'Cyclone',
        who: 'Druid',
        color: '#FF7C0A',
        desc: 'Takes someone entirely out of the game for 6 seconds. Run it on two different targets all game — Clone the healer when the warrior goes in, Clone the DPS if they\'re low. Also used to Clone rogues and mages who are hard to deal with in melee, removing them from the fight while the warrior trains their partner.',
      },
      {
        icon: '🌸',
        name: 'Lifebloom Bloom',
        who: 'Druid',
        color: '#FF7C0A',
        desc: 'Intentionally letting Lifebloom expire delivers a large burst heal. Against high burst comps, timing a bloom to land during an incoming kill attempt can be the difference between surviving and dying — use it as a deliberate tool, not an accident.',
      },
      {
        icon: '🧪',
        name: 'Abolish Poison',
        who: 'Druid',
        color: '#FF7C0A',
        desc: 'Super key for this comp. Keeps Abolish running on the mage so it auto-cleanses slows and poisons — this lets the mage kite rogues far more effectively without wasting globals. Also means Mortal Strike and wound effects can\'t permanently stack up, because we can reset them. On top of that, druid can Cyclone the rogues and mages causing the issues — taking them out of the game entirely while Abolish does its work.',
      },
    ],
    roleNotes: [
      {
        who: 'Druid',
        color: '#FF7C0A',
        icon: '🌳',
        points: [
          'Run Tree of Life form and lean into it — you can generally get away with more PvE gear than other healers because the goal is just big HoTs rolling on everyone at all times.',
          'The whole philosophy is offensive healing. Start every game super hotted up on all three players and ready to max range Blind immediately. You should almost never need to peel in the opener.',
          'Keep Abolish Poison up constantly and over-hot everyone so you can stay as far forward as possible. The less you have to react to damage, the more you can use globals to set up the fight.',
          'If anyone tries to train you, they should get punished immediately — mage Blizzards or Vengeances, warrior Intercepts and Disarms. The druid being left alone is the ideal scenario and good opponents know it, so they\'ll test it early.',
          'This comp has a compounding effect: the better each player individually, the more the other team is forced to play defensively. If your mage and warrior are really shutting people down, the pressure compounds and the other team never gets to breathe. The comp feels noticeably weaker when individual players aren\'t operating at a high level — it relies on everyone doing their job well simultaneously.',
        ],
      },
    ],
    strengths: [
      'Warrior + mage is the highest burst combo in the game — priests, locks, and clothies die fast',
      'Dampens extremely well vs priest teams — if you just survive long enough, the priest or mage goes oom and you can kill whoever is left with no healer',
      'Exceptional into RMP and any priest/rogue/X comp — CS and Shatter can end rogues caught in the open',
      'Dual independent CC (Poly + Cyclone) means the enemy team is always playing 1v3 or 2v3',
      'Good into melee cleaves — mage kiting tools and druid mobility punish predictable trains',
      'Not bad into double healer or any priest team — the damage output overwhelms even sustained healing',
    ],
    weaknesses: [
      'The comp requires a really good mage — mage is doing most of the setup and a weak mage means the warrior never gets clean uptime',
      'Gnome is obviously a huge advantage on warrior for the racial root break, effectively giving a second trinket and making it much harder to peel the warrior off a target',
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
