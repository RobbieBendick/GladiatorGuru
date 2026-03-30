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
  {
    id: 'rmd',
    name: 'RMD',
    fullName: 'Rogue + Mage + Druid',
    bracket: '3v3',
    color: '#d4b44a',
    icon: '🗡️',
    description:
      'RMD is like RMP but with a druid instead of a priest — you gain Abolish Poison and Cyclone but lose the magic dispel. The extra interrupt from Feral Charge replaces Fear, making the comp rely on CC coordination and execution rather than sustained fear chains. High skill cap, but the most fun comp to play as a druid.',
    winCondition:
      'Isolate a target and kill them once no one has trinkets. The rogue stuns, the mage does big damage, and Poly + Cyclone spam means the other team is always playing 1v3. When the rogue and mage are both on one target with no way out, that target dies.',
    howItWorks: [
      'Open fast — especially vs RMP and other mobile comps. Blind the healer early to fish for a trinket before the real kill window.',
      'Vs rogue teams: force Cloak of Shadows early. Once Cloak is gone the rogue is wide open to CC and you control the game from there.',
      'Abolish Poison keeps wounds from stacking — use it to stay ahead of Mortal Strike and wound effects so your healing stays effective all game.',
      'Spam Poly and Cyclone on two different targets simultaneously. Spammable Cyclone is the comp\'s version of RMP\'s Fear — when you\'re getting free clones all game, the other team can never coordinate a response.',
    ],
    keyAbilities: [
      {
        icon: '⚡',
        name: 'Kidney Shot',
        who: 'Rogue',
        color: '#FFF468',
        desc: 'The main setup stun. Sets up the kill window — mage goes in hard the moment Kidney lands and the target has no way out.',
      },
      {
        icon: '🙈',
        name: 'Blind',
        who: 'Rogue',
        color: '#FFF468',
        desc: 'Use early to force a trinket before the real kill attempt. Once the trinket is gone, Kidney Shot later in the game is essentially a guaranteed kill window.',
      },
      {
        icon: '🔇',
        name: 'Counterspell',
        who: 'Mage',
        color: '#3FC7EB',
        desc: 'Lock out heals or anything that would break rogue uptime — a CS on a Poly or incoming Clone that would end the stun chain keeps the pressure going.',
      },
      {
        icon: '🐑',
        name: 'Polymorph',
        who: 'Mage',
        color: '#3FC7EB',
        desc: 'Combine with Cyclone for dual CC on two different targets simultaneously. Neither can be healed. Spam it — the more the other team is polymorphed the more free the rogue is.',
      },
      {
        icon: '🌀',
        name: 'Cyclone',
        who: 'Druid',
        color: '#FF7C0A',
        desc: 'The replacement for RMP\'s Fear — and spammable. Clone whoever is low, whoever would interfere with the stun chain, or run it on two targets at once with Poly. Getting free clones all game is what makes this comp feel unbeatable when it\'s clicking.',
      },
      {
        icon: '🧪',
        name: 'Abolish Poison',
        who: 'Druid',
        color: '#FF7C0A',
        desc: 'Prevents Mortal Strike and wound effects from permanently stacking. Keeps healing strong all game and lets the mage kite rogues freely without losing globals to dispels.',
      },
    ],
    roleNotes: [
      {
        who: 'Rogue',
        color: '#FFF468',
        icon: '🗡️',
        points: [
          'Lock someone down hard and commit — rogue uptime is everything for this comp.',
          'Blind early to bait the trinket. Once they\'ve used it, your Kidney Shot later is the real kill window.',
          'Use Vanish, Cloak, and trinket defensively to survive and stay in the fight — save them for when it\'s actually kill time so you can finish with no interruptions.',
        ],
      },
      {
        who: 'Mage',
        color: '#3FC7EB',
        icon: '❄️',
        points: [
          'Counterspell anything that would break the rogue\'s uptime — Poly, Clone, incoming heals on the kill target.',
          'Do big damage during rogue stuns — this is when the target is locked and can\'t react.',
          'Kite with the druid when things get dicey and play positioning well. A dead mage ends the comp\'s pressure.',
        ],
      },
      {
        who: 'Druid',
        color: '#FF7C0A',
        icon: '🌳',
        points: [
          'Pre-hot everyone before the opener so healing is already rolling when the rogue goes in.',
          'Spam Cyclone as much as possible — spammable clones are what separates RMD from RMP and it\'s the druid\'s biggest contribution.',
          'Keep Abolish Poison running constantly to counter wounds and help the mage kite.',
          'Generally play well positionally and focus on big clones over reactive healing — if you\'re cloning the right people, your team won\'t take as much damage anyway.',
        ],
      },
    ],
    strengths: [
      'Lots of control — Poly + Cyclone spam means the other team is constantly playing shorthanded',
      'Strong into RMP — can mirror the CC game and out-clone them',
      'Good into melee cleaves — rogue tools and druid mobility handle trains well',
      'Shatter setups hit extremely hard when rogue stuns line up with mage burst',
      'High skill cap means it rewards good players more than most comps — the better the players, the more dominant it gets',
      'Most fun comp to play as a druid — constant action, constant decisions',
    ],
    weaknesses: [
      'Bad into double healer — worse than WMD here, less raw pressure to break through sustained healing',
      'No magic dispel (lost from RMP) — can\'t clear enemy buffs or certain debuffs',
      'Lock teams can be a problem — warlock pressure combined with fear chains is hard to handle without a priest\'s dispel',
      'Requires all three players operating at a high level — weak individual play breaks the comp\'s coordination',
    ],
    keywords: ['rmd', 'rogue mage druid'],
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
