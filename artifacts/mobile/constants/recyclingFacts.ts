export const RECYCLING_FACTS = [
  "Recycling one aluminum can saves enough energy to run a TV for 3 hours.",
  "A glass bottle takes up to 4,000 years to decompose in a landfill.",
  "Recycling aluminum saves 95% of the energy needed to make it from raw materials.",
  "Every kilogram of aluminum recycled saves 9 kg of CO2 emissions.",
  "Bangalore generates about 4,000 tonnes of solid waste daily — every bit counts.",
  "Cans recycled today can be back on shelves in as little as 60 days.",
  "A plastic bottle takes 450 years to decompose in the environment.",
  "Recycling one plastic bottle saves enough energy to power a lightbulb for 3 hours.",
  "India generates approximately 26,000 tonnes of plastic waste every day.",
  "Glass can be recycled endlessly without loss in quality or purity.",
  "One ton of recycled paper saves 17 trees and 7,000 gallons of water.",
  "Recycled cans produce 95% less air pollution than new aluminum production.",
];

export function getDailyFact(): string {
  const start = new Date(new Date().getFullYear(), 0, 0);
  const dayOfYear = Math.floor((Date.now() - start.getTime()) / 86400000);
  return RECYCLING_FACTS[dayOfYear % RECYCLING_FACTS.length];
}
