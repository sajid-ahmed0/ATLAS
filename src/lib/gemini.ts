import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

export interface UserMissionContext {
  vision: string;
  strengths: string;
  weaknesses: string;
  badHabits: string;
  goodHabits: string;
  personalRules: string;
  motivations: string;
  neverWantToBecome: string;
  successDefinition: string;
}

export interface DecisionAnalysisResult {
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
  questionsNotConsidered: string[];
  alternativeSolutions: string;
  recommendation: string;
  confidenceScore: number;
  reasoning: string;
}

export interface TodayRecommendationResult {
  headline: string;
  focusAdvice: string;
  warningsOrBiases: string;
  alignedHabitToPractice: string;
  microAction: string;
}

export async function analyzeDecision(
  decision: {
    title: string;
    description: string;
    category: string;
    importance: number;
    mood: string;
    energy: string;
    deadline: string;
    availableTime: string;
    notes: string;
  },
  options: Array<{ title: string; description: string }>,
  mission: UserMissionContext | null
): Promise<DecisionAnalysisResult> {
  const missionText = mission
    ? `
User Vision: ${mission.vision}
User Strengths: ${mission.strengths}
User Weaknesses: ${mission.weaknesses}
Bad Habits to Avoid: ${mission.badHabits}
Good Habits to Build: ${mission.goodHabits}
Personal Rules: ${mission.personalRules}
Motivations: ${mission.motivations}
Identity (Never want to become): ${mission.neverWantToBecome}
Success Definition: ${mission.successDefinition}
`
    : "No personal mission context registered yet.";

  const optionsText = options
    .map((o, idx) => `Option ${idx + 1}: "${o.title}" - Description: ${o.description}`)
    .join("\n");

  const prompt = `
You are the primary strategic consultant and coach for the user's Life Operating System (Atlas).
Analyze this decision with high intellectual depth, challenge assumptions, detect cognitive biases, and prefer long-term alignment over short-term comfort.

DECISION TO ANALYZE:
Title: ${decision.title}
Description: ${decision.description}
Category: ${decision.category}
Importance (1-10): ${decision.importance}
User Current Mood: ${decision.mood}
User Current Energy: ${decision.energy}
Deadline: ${decision.deadline || "None"}
Available Time to Execute: ${decision.availableTime || "Not Specified"}
Additional Notes: ${decision.notes || "None"}

AVAILABLE OPTIONS:
${optionsText}

USER PERSONAL ALIGNMENT CONTEXT (Atlas External Brain):
${missionText}

Perform a rigorous multi-perspective evaluation. Produce output that strictly adheres to the requested JSON schema.
`;

  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: prompt,
    config: {
      systemInstruction: "You are Atlas, the user's wiser future self, a calm strategist, mentor, and thoughtful psychologist. Your voice is supportive, deeply warm, yet uncompromisingly honest. Speak with the grace and clarity of an experienced mentor. Respectfully but firmly challenge self-deception, poor thinking, and short-term laziness. Never simply agree with the user to make them feel better; guide them back to who they are trying to become by evaluating cognitive biases (e.g., sunk cost, status quo bias, hyperbolic discounting) from a place of deep wisdom and care.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING, description: "Executive summary of the decision puzzle" },
          prosAndCons: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                optionTitle: { type: Type.STRING, description: "Title of the option being evaluated" },
                pros: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of logical pros" },
                cons: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of logical cons" },
              },
              required: ["optionTitle", "pros", "cons"],
            },
            description: "Detailed analysis of pros and cons for each available option",
          },
          shortTermImpact: { type: Type.STRING, description: "Impact in the next 1-90 days" },
          longTermImpact: { type: Type.STRING, description: "Impact in the next 1-5 years" },
          opportunityCost: { type: Type.STRING, description: "What is sacrificed by choosing the recommended route" },
          potentialRisks: { type: Type.STRING, description: "Critical vulnerabilities or black-swan risks" },
          cognitiveBiases: { type: Type.STRING, description: "List and explanation of cognitive biases detected in the user's mood, options, or description" },
          questionsNotConsidered: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "3 deep questions the user has not considered that challenge their premise",
          },
          alternativeSolutions: { type: Type.STRING, description: "An alternative 'out of the box' or hybrid option they didn't think of" },
          recommendation: { type: Type.STRING, description: "The definitive strategic path recommendation" },
          confidenceScore: { type: Type.INTEGER, description: "Confidence score (1-100) of your recommendation" },
          reasoning: { type: Type.STRING, description: "The rigorous step-by-step reasoning supporting your recommendation" },
        },
        required: [
          "summary",
          "prosAndCons",
          "shortTermImpact",
          "longTermImpact",
          "opportunityCost",
          "potentialRisks",
          "cognitiveBiases",
          "questionsNotConsidered",
          "alternativeSolutions",
          "recommendation",
          "confidenceScore",
          "reasoning",
        ],
      },
    },
  });

  if (!response.text) {
    throw new Error("No response text from Gemini API.");
  }

  return JSON.parse(response.text) as DecisionAnalysisResult;
}

export async function generateDailyRecommendation(
  state: {
    mood: string;
    energy: string;
    stress: string;
    focus: string;
    challenge: string;
  },
  mission: UserMissionContext | null,
  activeGoals: Array<{ title: string; category: string; targetDate: string }>,
  recentDecisions: Array<{ title: string; status: string }>
): Promise<TodayRecommendationResult> {
  const missionText = mission
    ? `
Vision: ${mission.vision}
Rules: ${mission.personalRules}
Good habits: ${mission.goodHabits}
Bad habits: ${mission.badHabits}
Identity: ${mission.neverWantToBecome}
`
    : "No personal alignment rules recorded yet.";

  const goalsText = activeGoals.length > 0
    ? activeGoals.map(g => `- [${g.category}] ${g.title} (Target: ${g.targetDate})`).join("\n")
    : "No active goals registered.";

  const decisionsText = recentDecisions.length > 0
    ? recentDecisions.map(d => `- ${d.title} (Status: ${d.status})`).join("\n")
    : "No major recent decisions.";

  const prompt = `
Generate Today's AI Recommendation for the user's Life Operating System (Atlas).
Consider their personal framework, today's starting mood, energy level, and current goals to formulate a highly targeted, realistic, daily directive.

TODAY'S STATE:
Mood: ${state.mood}
Energy Level: ${state.energy}
Stress Level: ${state.stress}
Focus: ${state.focus}
Biggest Today's Challenge: ${state.challenge}

USER LIFE MISSION & STRATEGIC RULES:
${missionText}

ACTIVE GOALS TO ALIGN WITH:
${goalsText}

RECENT DECISIONS TO KEEP IN MIND:
${decisionsText}

Provide a practical, wise, and highly specific dashboard recommendation. Output strictly JSON.
`;

  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: prompt,
    config: {
      systemInstruction: "You are Atlas, the user's wiser future self, a calm strategist, and loving mentor. Your daily recommendation should feel like an intimate, wise conversation with someone who knows them completely and wants the absolute best for them. Be practical, warm, crisp, and extremely clear. Avoid technical or cold system language; instead, use human, compassionate, and direct guidance tailored to their current energy and emotional state to help them focus on what truly matters today.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          headline: { type: Type.STRING, description: "A catchy, motivating yet serious headline for today's focus (e.g. 'Conserve Energy, Solve bottlenecks')" },
          focusAdvice: { type: Type.STRING, description: "Personal strategic advice based on energy and stress levels" },
          warningsOrBiases: { type: Type.STRING, description: "A quick warning about cognitive pitfalls they might face today based on their mood" },
          alignedHabitToPractice: { type: Type.STRING, description: "Which positive habit to actively focus on today" },
          microAction: { type: Type.STRING, description: "A single, tiny, non-negotiable micro-action they must take today to stay aligned" },
        },
        required: ["headline", "focusAdvice", "warningsOrBiases", "alignedHabitToPractice", "microAction"],
      },
    },
  });

  if (!response.text) {
    throw new Error("No response text from Gemini API.");
  }

  return JSON.parse(response.text) as TodayRecommendationResult;
}
