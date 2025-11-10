export type WowVersion = 'TBC' | 'MOP';

export interface Spec {
  name: string;
  versions: WowVersion[];
}

export interface Class {
  name: string;
  versions: WowVersion[];
  specs: Spec[];
}

// All classes with their available versions and specs
export const CLASSES: Class[] = [
  {
    name: 'Warrior',
    versions: ['TBC', 'MOP'],
    specs: [
      { name: 'Arms', versions: ['TBC', 'MOP'] },
      { name: 'Fury', versions: ['TBC', 'MOP'] },
      { name: 'Protection', versions: ['TBC', 'MOP'] },
    ],
  },
  {
    name: 'Paladin',
    versions: ['TBC', 'MOP'],
    specs: [
      { name: 'Holy', versions: ['TBC', 'MOP'] },
      { name: 'Protection', versions: ['TBC', 'MOP'] },
      { name: 'Retribution', versions: ['TBC', 'MOP'] },
    ],
  },
  {
    name: 'Hunter',
    versions: ['TBC', 'MOP'],
    specs: [
      { name: 'Beast Mastery', versions: ['TBC', 'MOP'] },
      { name: 'Marksmanship', versions: ['TBC', 'MOP'] },
      { name: 'Survival', versions: ['TBC', 'MOP'] },
    ],
  },
  {
    name: 'Rogue',
    versions: ['TBC', 'MOP'],
    specs: [
      {
        name: 'Assassination',
        versions: ['TBC', 'MOP'],
      },
      { name: 'Combat', versions: ['TBC', 'MOP'] },
      { name: 'Subtlety', versions: ['TBC', 'MOP'] },
    ],
  },
  {
    name: 'Priest',
    versions: ['TBC', 'MOP'],
    specs: [
      { name: 'Discipline', versions: ['TBC', 'MOP'] },
      { name: 'Holy', versions: ['TBC', 'MOP'] },
      { name: 'Shadow', versions: ['TBC', 'MOP'] },
    ],
  },
  {
    name: 'Shaman',
    versions: ['TBC', 'MOP'],
    specs: [
      { name: 'Elemental', versions: ['TBC', 'MOP'] },
      { name: 'Enhancement', versions: ['TBC', 'MOP'] },
      { name: 'Restoration', versions: ['TBC', 'MOP'] },
    ],
  },
  {
    name: 'Mage',
    versions: ['TBC', 'MOP'],
    specs: [
      { name: 'Arcane', versions: ['TBC', 'MOP'] },
      { name: 'Fire', versions: ['TBC', 'MOP'] },
      { name: 'Frost', versions: ['TBC', 'MOP'] },
    ],
  },
  {
    name: 'Warlock',
    versions: ['TBC', 'MOP'],
    specs: [
      { name: 'Affliction', versions: ['TBC', 'MOP'] },
      { name: 'Demonology', versions: ['TBC', 'MOP'] },
      { name: 'Destruction', versions: ['TBC', 'MOP'] },
    ],
  },
  {
    name: 'Druid',
    versions: ['TBC', 'MOP'],
    specs: [
      { name: 'Balance', versions: ['TBC', 'MOP'] },
      { name: 'Feral', versions: ['TBC', 'MOP'] },
      { name: 'Feral Combat', versions: ['MOP'] },
      { name: 'Guardian', versions: ['MOP'] },
      { name: 'Restoration', versions: ['TBC', 'MOP'] },
    ],
  },
  {
    name: 'Death Knight',
    versions: ['MOP'],
    specs: [
      { name: 'Blood', versions: ['MOP'] },
      { name: 'Frost', versions: ['MOP'] },
      { name: 'Unholy', versions: ['MOP'] },
    ],
  },
  {
    name: 'Monk',
    versions: ['MOP'],
    specs: [
      { name: 'Brewmaster', versions: ['MOP'] },
      { name: 'Mistweaver', versions: ['MOP'] },
      { name: 'Windwalker', versions: ['MOP'] },
    ],
  },
];

// Get classes available for a specific version
export function getClassesForVersion(version: WowVersion): Class[] {
  return CLASSES.filter(classData => classData.versions.includes(version));
}

// Get specs for a specific class and version
export function getSpecsForClass(
  version: WowVersion,
  className: string
): string[] {
  const classData = CLASSES.find(c => c.name === className);
  if (!classData) return [];

  return classData.specs
    .filter(spec => spec.versions.includes(version))
    .map(spec => spec.name);
}

// Get all available versions
export function getAvailableVersions(): WowVersion[] {
  return ['TBC', 'MOP'];
}

// World of Warcraft class colors (hex codes)
export const CLASS_COLORS: Record<string, string> = {
  'Death Knight': '#C41E3A',
  'Demon Hunter': '#A330C9',
  Druid: '#FF7C0A',
  Evoker: '#33937F',
  Hunter: '#AAD372',
  Mage: '#3FC7EB',
  Monk: '#00FF98',
  Paladin: '#F48CBA',
  Priest: '#FFFFFF',
  Rogue: '#FFF468',
  Shaman: '#0070DD',
  Warlock: '#8788EE',
  Warrior: '#C69B6D',
};

// Get class color by class name
export function getClassColor(className: string): string {
  return CLASS_COLORS[className] || '#FFFFFF'; // Default to white if class not found
}
