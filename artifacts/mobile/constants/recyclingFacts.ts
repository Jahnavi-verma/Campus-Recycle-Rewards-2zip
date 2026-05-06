export interface RecyclingFact {
  text: string;
  emoji: string;
  category: string;
  color: string;
}

export const RECYCLING_FACTS: RecyclingFact[] = [
  {
    text: "Recycling one aluminum can saves enough energy to run a TV for 3 hours.",
    emoji: "📺",
    category: "Energy",
    color: "#F97316",
  },
  {
    text: "A glass bottle takes up to 4,000 years to decompose in a landfill.",
    emoji: "⏳",
    category: "Time",
    color: "#6C63FF",
  },
  {
    text: "Recycling aluminum saves 95% of the energy needed to make it from raw materials.",
    emoji: "⚡",
    category: "Energy",
    color: "#EAB308",
  },
  {
    text: "Every kilogram of aluminum recycled saves 9 kg of CO2 emissions.",
    emoji: "🌿",
    category: "Climate",
    color: "#22C55E",
  },
  {
    text: "Bangalore generates about 4,000 tonnes of solid waste daily — every scan here matters.",
    emoji: "🏙️",
    category: "Local",
    color: "#EC4899",
  },
  {
    text: "Cans recycled today can be back on shelves in as little as 60 days.",
    emoji: "♻️",
    category: "Speed",
    color: "#14B8A6",
  },
  {
    text: "A plastic bottle takes 450 years to decompose in the environment.",
    emoji: "🕰️",
    category: "Time",
    color: "#8B5CF6",
  },
  {
    text: "Recycling one plastic bottle saves enough energy to power a lightbulb for 3 hours.",
    emoji: "💡",
    category: "Energy",
    color: "#F97316",
  },
  {
    text: "India generates approximately 26,000 tonnes of plastic waste every day.",
    emoji: "🇮🇳",
    category: "Local",
    color: "#EF4444",
  },
  {
    text: "Glass can be recycled endlessly without any loss in quality or purity.",
    emoji: "✨",
    category: "Material",
    color: "#06B6D4",
  },
  {
    text: "Recycled cans produce 95% less air pollution than new aluminum production.",
    emoji: "🌬️",
    category: "Climate",
    color: "#22C55E",
  },
  {
    text: "If every Indian recycled one can a week, we'd save 10 billion cans from landfills annually.",
    emoji: "🤯",
    category: "Scale",
    color: "#F97316",
  },
  {
    text: "Making a new aluminum can uses 20x more energy than recycling an old one.",
    emoji: "🔋",
    category: "Energy",
    color: "#6C63FF",
  },
  {
    text: "Recycling aluminium is one of the most efficient recycling processes that exists — it retains 100% of its properties.",
    emoji: "🏆",
    category: "Material",
    color: "#EAB308",
  },
  {
    text: "The average BMSCE student produces around 150g of recyclable waste per day on campus.",
    emoji: "🎓",
    category: "Local",
    color: "#EC4899",
  },
  {
    text: "Producing plastic from recycled materials uses 88% less energy than virgin plastic.",
    emoji: "💪",
    category: "Energy",
    color: "#14B8A6",
  },
  {
    text: "Every year, enough aluminum is thrown away to rebuild the entire commercial airline fleet 4 times over.",
    emoji: "✈️",
    category: "Scale",
    color: "#8B5CF6",
  },
  {
    text: "Recycling 10 cans saves enough energy to power a laptop for a full day.",
    emoji: "💻",
    category: "Energy",
    color: "#F97316",
  },
  {
    text: "Solid waste in Indian cities could generate 1,460 MW of electricity if properly processed.",
    emoji: "🌆",
    category: "Local",
    color: "#EF4444",
  },
  {
    text: "Aluminium was once more valuable than gold — Napoleon III served his finest guests with aluminium cutlery.",
    emoji: "👑",
    category: "History",
    color: "#EAB308",
  },
];

export function getDailyFact(): RecyclingFact {
  const start = new Date(new Date().getFullYear(), 0, 0);
  const dayOfYear = Math.floor((Date.now() - start.getTime()) / 86400000);
  return RECYCLING_FACTS[dayOfYear % RECYCLING_FACTS.length];
}

export function getDailyFactIndex(): number {
  const start = new Date(new Date().getFullYear(), 0, 0);
  const dayOfYear = Math.floor((Date.now() - start.getTime()) / 86400000);
  return dayOfYear % RECYCLING_FACTS.length;
}
