export type Focus = 'relationships' | 'stress' | 'performance';

export type DailyMission = {
  id: string;
  label: string;
  xp: number;
  tier: 'easy' | 'core' | 'stretch';
  rewardShells: number;
  requiresReflection: boolean;
};

export type LevelMeta = {
  level: number;
  currentXp: number;
  nextLevelXp: number;
  progress: number; // 0-1
  label: string;
};

export function getTodayId(): string {
  return new Date().toISOString().slice(0, 10);
}

export function generateDailyPrompt(focus: Focus, seed: string) {
  const prompts: Record<Focus, string[]> = {
    relationships: [
      'Defuse one tense moment by pausing 3 seconds before you answer.',
      'Give one clear, kind boundary instead of swallowing it.',
      'Turn one defensive reply into a curiosity question.',
    ],
    stress: [
      'Pick one high-pressure moment and plan a 10-second reset you’ll actually use.',
      'Name your top stressor and one thing still under your control.',
      'Protect one 5-minute window just for breathing and posture check.',
    ],
    performance: [
      'Before one key task, define success in a single clear sentence.',
      'Clarify one expectation with a teammate instead of assuming.',
      'Slow one important decision down by 5 seconds before you commit.',
    ],
  };

  const list = prompts[focus] || prompts.relationships;
  const index = simpleHash(seed + focus) % list.length;
  return { text: list[index] };
}

export function getDailyMissions(focus: Focus, date: string): DailyMission[] {
  const base = simpleHash(date + focus).toString();

  return [
    {
      id: base + '-1',
      label: 'Use today’s tiny rep once in a real situation.',
      xp: 15,
      tier: 'core',
      rewardShells: 2,
      requiresReflection: false,
    },
    {
      id: base + '-2',
      label: 'Log a 1-line reflection about that moment.',
      xp: 10,
      tier: 'easy',
      rewardShells: 1,
      requiresReflection: true,
    },
    {
      id: base + '-3',
      label:
        'Apply a Swell skill in a harder-than-average moment (tension, stakes, or urgency).',
      xp: 25,
      tier: 'stretch',
      rewardShells: 4,
      requiresReflection: true,
    },
  ];
}

export function getLevelMeta(totalXp: number): LevelMeta {
  const thresholds = [0, 50, 140, 260, 420, 620];

  let level = 0;
  for (let i = 0; i < thresholds.length; i++) {
    if (totalXp >= thresholds[i]) level = i;
  }

  const currentBase = thresholds[level] ?? 0;
  const nextBase = thresholds[level + 1] ?? currentBase + 200;
  const span = nextBase - currentBase || 1;
  const progress = Math.max(0, Math.min(1, (totalXp - currentBase) / span));

  const label =
    level === 0
      ? 'Arriving'
      : level === 1
      ? 'Settling In'
      : level === 2
      ? 'Steady Current'
      : level === 3
      ? 'Deep Work'
      : level === 4
      ? 'Lighthouse'
      : 'Anchor Point';

  return {
    level,
    currentXp: totalXp,
    nextLevelXp: nextBase,
    progress,
    label,
  };
}

export function getUnlocks(totalXp: number, totalShells: number): string[] {
  const unlocks: string[] = ['shore'];

  if (totalXp >= 20) unlocks.push('towel');
  if (totalXp >= 60) unlocks.push('palms');
  if (totalXp >= 120) unlocks.push('dock');
  if (totalXp >= 220) unlocks.push('lighthouse');

  if (totalShells >= 6) unlocks.push('coral');
  if (totalShells >= 12) unlocks.push('reef');
  if (totalShells >= 20) unlocks.push('fish');
  if (totalShells >= 30) unlocks.push('campfire');

  return Array.from(new Set(unlocks));
}

function simpleHash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/**
 * Default export added so ANY old imports like:
 *   import getawayLogic from '../state/getawayLogic';
 *   getawayLogic.getDailyMissions(...)
 * still work.
 */
const getawayLogic = {
  getTodayId,
  generateDailyPrompt,
  getDailyMissions,
  getLevelMeta,
  getUnlocks,
};

export default getawayLogic;
