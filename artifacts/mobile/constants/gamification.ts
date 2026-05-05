export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export const BADGES: Badge[] = [
  {
    id: "first_recycle",
    name: "First Step",
    description: "Completed your first recycling session",
    icon: "star",
  },
  {
    id: "ten_items",
    name: "Getting Warmed Up",
    description: "Recycled 10 items total",
    icon: "award",
  },
  {
    id: "fifty_items",
    name: "Green Warrior",
    description: "Recycled 50 items total",
    icon: "shield",
  },
  {
    id: "hundred_items",
    name: "Eco Champion",
    description: "Recycled 100 items total",
    icon: "zap",
  },
  {
    id: "week_streak",
    name: "7-Day Streak",
    description: "Recycled 7 days in a row",
    icon: "trending-up",
  },
  {
    id: "points_1k",
    name: "1K Club",
    description: "Earned 1,000 binGO points",
    icon: "activity",
  },
  {
    id: "points_5k",
    name: "Elite Recycler",
    description: "Earned 5,000 binGO points",
    icon: "target",
  },
];

const LEVEL_THRESHOLDS = [0, 200, 500, 1000, 2000, 3500, 5000, 8000, 12000, 20000];
const LEVEL_TITLES = [
  "Newbie",
  "Starter",
  "Recycler",
  "Green Buddy",
  "Eco Warrior",
  "Earth Guardian",
  "Planet Protector",
  "Green Legend",
  "Eco Master",
  "binGO Champion",
];

export function getLevelInfo(points: number): {
  level: number;
  title: string;
  nextLevelPoints: number;
  progress: number;
} {
  let level = 0;
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (points >= LEVEL_THRESHOLDS[i]) {
      level = i;
      break;
    }
  }

  const isMax = level >= LEVEL_THRESHOLDS.length - 1;
  const currentLevelPoints = LEVEL_THRESHOLDS[level];
  const nextLevelPoints = isMax
    ? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1]
    : LEVEL_THRESHOLDS[level + 1];
  const progress = isMax
    ? 1
    : (points - currentLevelPoints) / (nextLevelPoints - currentLevelPoints);

  return {
    level: level + 1,
    title: LEVEL_TITLES[level],
    nextLevelPoints,
    progress: Math.min(1, Math.max(0, progress)),
  };
}

export const POINTS_PER_CAN = 10;
export const POINTS_PER_BOTTLE = 15;
export const CO2_PER_CAN = 0.08;
export const CO2_PER_BOTTLE = 0.12;
