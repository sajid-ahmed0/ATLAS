export interface User {
  id: number;
  uid: string;
  email: string;
  createdAt: string;
}

export interface Mission {
  id: number;
  userId: number;
  vision: string;
  strengths: string;
  weaknesses: string;
  badHabits: string;
  goodHabits: string;
  personalRules: string;
  motivations: string;
  neverWantToBecome: string;
  successDefinition: string;
  updatedAt: string;
}

export interface Goal {
  id: number;
  userId: number;
  title: string;
  description: string;
  category: string; // health, career, wealth, personal, relationship
  progress: number;
  status: 'PENDING' | 'COMPLETED' | 'ABANDONED';
  targetDate: string;
  createdAt: string;
}

export interface DecisionOption {
  id: number;
  decisionId: number;
  title: string;
  description: string;
  isSelected: boolean;
  createdAt: string;
}

export interface DecisionAnalysis {
  id: number;
  decisionId: number;
  summary: string;
  prosAndCons: Array<{
    optionTitle: string;
    pros: string[];
    cons: string[];
  }>;
  shortTermImpact: string;
  longTermImpact: string;
  opportunityCost: string;
  potentialRisks: string;
  cognitiveBiases: string;
  questionsNotConsidered?: string[]; // Optional in backend DB JSON but sent by Gemini
  alternativeSolutions: string;
  recommendation: string;
  confidenceScore: number;
  reasoning: string;
  createdAt: string;
}

export interface Decision {
  id: number;
  userId: number;
  title: string;
  description: string;
  category: string;
  importance: number;
  mood: string;
  energy: string;
  deadline: string;
  availableTime: string;
  notes: string;
  status: 'PENDING' | 'DECIDED' | 'ARCHIVED';
  createdAt: string;
  options: DecisionOption[];
  analysis: DecisionAnalysis | null;
}

export interface JournalEntry {
  id: number;
  userId: number;
  date: string; // YYYY-MM-DD
  sleepHours: string;
  mood: string;
  energy: string;
  stress: string;
  focus: string;
  challenge: string;
  eveningDecision: string;
  eveningBest: string;
  eveningWorst: string;
  followedPriorities: string;
  regret: string;
  lessons: string;
  gratitude: string;
  createdAt: string;
}

export interface KnowledgeItem {
  id: number;
  userId: number;
  title: string;
  content: string;
  category: string; // notes, career, books, articles, ideas, projects, lessons, memories, quotes, frameworks
  tags: string; // comma separated
  source: string;
  createdAt: string;
}

export interface DashboardRecommendation {
  headline: string;
  focusAdvice: string;
  warningsOrBiases: string;
  alignedHabitToPractice: string;
  microAction: string;
}

export interface InsightsData {
  decisionCategories: Record<string, number>;
  cognitiveBiases: Record<string, number>;
  goalProgress: {
    total: number;
    completed: number;
    pending: number;
    avgProgress: number;
  };
  moodTrends: Array<{
    date: string;
    mood: string;
    energy: string;
    stress: string;
  }>;
  decisionsCount: number;
  journalEntriesCount: number;
}
