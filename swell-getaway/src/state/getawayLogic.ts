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

/**
 * Unified daily prompt.
 * We keep the (focus, seed) signature for compatibility,
 * but focus is not used: the prompt represents your full shoreline.
 */
export function generateDailyPrompt(_focus: Focus, seed: string) {
  const prompts: string[] = [
    'Pick one real moment today and try a softer, clearer version of yourself.',
    'Choose one stress spike you expect and decide how you want to handle it.',
    'Give one person a reply you will be proud of later.',
    'Protect one block of focus for work that actually matters to you.',
    'Name one thing that is in your control and act on it.',
    'Turn one defensive instinct into a curious question.',
  ];

  const index = simpleHash(seed + 'unified') % prompts.length;
  return { text: prompts[index] };
}

/**
 * getDailyMissions:
 * Instead of separate modes, each day returns a small mixed stack:
 * - one relationships rep
 * - one stress/regulation rep
 * - one performance rep
 * Deterministic based on date so it feels stable for the day.
 */
export function getDailyMissions(_focus: Focus, date: string): DailyMission[] {
  const base = simpleHash(date);

  const relMissions = [
    'Send one honest check-in to someone who matters.',
    'In one hard moment, listen fully before you answer.',
    'Thank someone directly for something you usually overlook.',
  ];

  const stressMissions = [
    'Take 3 slow breaths before a moment that usually spikes you.',
    'Step away from your screen for 60 seconds when you feel flooded.',
    'Name the top stressor out loud and choose one next step.',
  ];

  const perfMissions = [
    'Give your most important task five extra minutes of clean focus.',
    'Clarify success for one task in a single sentence before you start.',
    'Ask one direct question that removes uncertainty at work.',
  ];

  const pick = (
    list: string[],
    offset: number,
    tier: 'easy' | 'core' | 'stretch',
    xp: number,
    shells: number,
    requiresReflection: boolean
  ): DailyMission => {
    const idx = (base + offset) % list.length;
    const raw = list[idx];
    return {
      id: `${date}-${tier}-${offset}`,
      label: raw,
      xp,
      tier,
      rewardShells: shells,
      requiresReflection,
    };
  };

  const rel = pick(relMissions, 1, 'core', 18, 2, true);
  const stress = pick(stressMissions, 7, 'easy', 10, 1, false);
  const perf = pick(perfMissions, 13, 'stretch', 24, 3, true);

  return [rel, stress, perf];
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
  const progress = Math.max(
    0,
    Math.min(1, (totalXp - currentBase) / span)
  );

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

export function getUnlocks(
  totalXp: number,
  totalShells: number
): string[] {
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
 * Default export so any legacy imports still work.
 */
const getawayLogic = {
  getTodayId,
  generateDailyPrompt,
  getDailyMissions,
  getLevelMeta,
  getUnlocks,
};

export default getawayLogic;

