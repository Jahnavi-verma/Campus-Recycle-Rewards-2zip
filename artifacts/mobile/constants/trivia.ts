export interface TriviaQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const TRIVIA_QUESTIONS: TriviaQuestion[] = [
  {
    question: "How many times can aluminum be recycled without losing quality?",
    options: ["3 times", "10 times", "50 times", "Indefinitely"],
    correctIndex: 3,
    explanation: "Aluminum retains 100% of its properties through infinite recycling cycles!",
  },
  {
    question: "Recycling one aluminum can saves enough energy to power a TV for how long?",
    options: ["30 minutes", "1 hour", "3 hours", "8 hours"],
    correctIndex: 2,
    explanation: "Just one recycled can = 3 hours of TV. That's wild.",
  },
  {
    question: "How long does a plastic bottle take to decompose in the environment?",
    options: ["50 years", "100 years", "250 years", "450 years"],
    correctIndex: 3,
    explanation: "450 years! That bottle you just recycled would have outlived your great-great-great-grandkids.",
  },
  {
    question: "Recycling aluminum uses how much less energy than making new aluminum?",
    options: ["40%", "60%", "75%", "95%"],
    correctIndex: 3,
    explanation: "95% less energy! Recycled aluminum is basically free energy compared to virgin production.",
  },
  {
    question: "How much CO2 does recycling 1 kg of aluminum save?",
    options: ["1 kg", "3 kg", "9 kg", "15 kg"],
    correctIndex: 2,
    explanation: "9 kg of CO2 saved per kg of aluminum recycled. Your scans here add up fast.",
  },
  {
    question: "Which material can be recycled endlessly with NO quality loss?",
    options: ["Plastic", "Paper", "Glass", "Both Glass and Aluminum"],
    correctIndex: 3,
    explanation: "Glass and aluminum are the two champions — infinitely recyclable without degradation.",
  },
  {
    question: "How quickly can a recycled aluminum can be back on store shelves?",
    options: ["6 months", "60 days", "1 year", "2 years"],
    correctIndex: 1,
    explanation: "60 days from recycling bin to store shelf. Recycling is basically teleportation.",
  },
  {
    question: "Approximately how much solid waste does Bangalore generate daily?",
    options: ["400 tonnes", "1,000 tonnes", "4,000 tonnes", "10,000 tonnes"],
    correctIndex: 2,
    explanation: "4,000 tonnes per day in Bangalore alone. Every scan on campus is part of the solution.",
  },
  {
    question: "Which country recycles the highest percentage of aluminum cans?",
    options: ["USA", "Germany", "Japan", "Brazil"],
    correctIndex: 3,
    explanation: "Brazil recycles ~98% of its aluminum cans — one of the world's best recycling rates.",
  },
  {
    question: "Making a new aluminum can uses how many times more energy than recycling?",
    options: ["5x", "10x", "20x", "50x"],
    correctIndex: 2,
    explanation: "20x more energy for virgin aluminum. Recycling a can is basically a superpower.",
  },
  {
    question: "What percentage of plastic waste in India is recycled?",
    options: ["Under 10%", "About 30%", "About 50%", "Over 70%"],
    correctIndex: 0,
    explanation: "Less than 10% of India's plastic waste gets recycled. Your scans literally move that number.",
  },
  {
    question: "Aluminum was once considered more valuable than which precious metal?",
    options: ["Silver", "Platinum", "Gold", "Copper"],
    correctIndex: 2,
    explanation: "Napoleon III served guests with aluminum cutlery — it was rarer than gold in the 1800s!",
  },
];

export function getDailyTrivia(): TriviaQuestion {
  const start = new Date(new Date().getFullYear(), 0, 0);
  const dayOfYear = Math.floor((Date.now() - start.getTime()) / 86400000);
  return TRIVIA_QUESTIONS[dayOfYear % TRIVIA_QUESTIONS.length];
}
