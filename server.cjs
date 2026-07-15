var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc2) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc(from, key)) || desc2.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_drizzle_orm2 = require("drizzle-orm");

// src/db/index.ts
var import_node_postgres = require("drizzle-orm/node-postgres");
var import_pg = require("pg");

// src/db/schema.ts
var schema_exports = {};
__export(schema_exports, {
  decisionAnalyses: () => decisionAnalyses,
  decisionAnalysesRelations: () => decisionAnalysesRelations,
  decisionOptions: () => decisionOptions,
  decisionOptionsRelations: () => decisionOptionsRelations,
  decisions: () => decisions,
  decisionsRelations: () => decisionsRelations,
  goals: () => goals,
  goalsRelations: () => goalsRelations,
  journalEntries: () => journalEntries,
  journalEntriesRelations: () => journalEntriesRelations,
  knowledgeItems: () => knowledgeItems,
  knowledgeItemsRelations: () => knowledgeItemsRelations,
  missions: () => missions,
  missionsRelations: () => missionsRelations,
  users: () => users,
  usersRelations: () => usersRelations
});
var import_pg_core = require("drizzle-orm/pg-core");
var import_drizzle_orm = require("drizzle-orm");
var users = (0, import_pg_core.pgTable)("users", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  uid: (0, import_pg_core.text)("uid").notNull().unique(),
  // Firebase Auth UID
  email: (0, import_pg_core.text)("email").notNull(),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow()
});
var missions = (0, import_pg_core.pgTable)("missions", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  userId: (0, import_pg_core.integer)("user_id").references(() => users.id, { onDelete: "cascade" }).notNull().unique(),
  vision: (0, import_pg_core.text)("vision").default(""),
  strengths: (0, import_pg_core.text)("strengths").default(""),
  weaknesses: (0, import_pg_core.text)("weaknesses").default(""),
  badHabits: (0, import_pg_core.text)("bad_habits").default(""),
  goodHabits: (0, import_pg_core.text)("good_habits").default(""),
  personalRules: (0, import_pg_core.text)("personal_rules").default(""),
  motivations: (0, import_pg_core.text)("motivations").default(""),
  neverWantToBecome: (0, import_pg_core.text)("never_want_to_become").default(""),
  successDefinition: (0, import_pg_core.text)("success_definition").default(""),
  updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow()
});
var goals = (0, import_pg_core.pgTable)("goals", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  userId: (0, import_pg_core.integer)("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  title: (0, import_pg_core.text)("title").notNull(),
  description: (0, import_pg_core.text)("description").default(""),
  category: (0, import_pg_core.text)("category").notNull(),
  // health, career, wealth, personal, relationship
  progress: (0, import_pg_core.integer)("progress").default(0),
  // percentage
  status: (0, import_pg_core.text)("status").default("PENDING"),
  // PENDING, COMPLETED, ABANDONED
  targetDate: (0, import_pg_core.text)("target_date").default(""),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow()
});
var decisions = (0, import_pg_core.pgTable)("decisions", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  userId: (0, import_pg_core.integer)("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  title: (0, import_pg_core.text)("title").notNull(),
  description: (0, import_pg_core.text)("description").notNull(),
  category: (0, import_pg_core.text)("category").notNull(),
  importance: (0, import_pg_core.integer)("importance").notNull(),
  // 1 to 10
  mood: (0, import_pg_core.text)("mood").notNull(),
  energy: (0, import_pg_core.text)("energy").notNull(),
  deadline: (0, import_pg_core.text)("deadline").default(""),
  availableTime: (0, import_pg_core.text)("available_time").default(""),
  notes: (0, import_pg_core.text)("notes").default(""),
  status: (0, import_pg_core.text)("status").default("PENDING"),
  // PENDING, DECIDED, ARCHIVED
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow()
});
var decisionOptions = (0, import_pg_core.pgTable)("decision_options", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  decisionId: (0, import_pg_core.integer)("decision_id").references(() => decisions.id, { onDelete: "cascade" }).notNull(),
  title: (0, import_pg_core.text)("title").notNull(),
  description: (0, import_pg_core.text)("description").default(""),
  isSelected: (0, import_pg_core.boolean)("is_selected").default(false),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow()
});
var decisionAnalyses = (0, import_pg_core.pgTable)("decision_analyses", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  decisionId: (0, import_pg_core.integer)("decision_id").references(() => decisions.id, { onDelete: "cascade" }).notNull().unique(),
  summary: (0, import_pg_core.text)("summary").notNull(),
  prosAndCons: (0, import_pg_core.jsonb)("pros_and_cons").notNull(),
  // Map/Array of option pros/cons
  shortTermImpact: (0, import_pg_core.text)("short_term_impact").notNull(),
  longTermImpact: (0, import_pg_core.text)("long_term_impact").notNull(),
  opportunityCost: (0, import_pg_core.text)("opportunity_cost").notNull(),
  potentialRisks: (0, import_pg_core.text)("potential_risks").notNull(),
  cognitiveBiases: (0, import_pg_core.text)("cognitive_biases").notNull(),
  alternativeSolutions: (0, import_pg_core.text)("alternative_solutions").notNull(),
  recommendation: (0, import_pg_core.text)("recommendation").notNull(),
  confidenceScore: (0, import_pg_core.integer)("confidence_score").notNull(),
  reasoning: (0, import_pg_core.text)("reasoning").notNull(),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow()
});
var journalEntries = (0, import_pg_core.pgTable)("journal_entries", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  userId: (0, import_pg_core.integer)("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  date: (0, import_pg_core.text)("date").notNull(),
  // format YYYY-MM-DD
  sleepHours: (0, import_pg_core.text)("sleep_hours").default(""),
  mood: (0, import_pg_core.text)("mood").default(""),
  energy: (0, import_pg_core.text)("energy").default(""),
  stress: (0, import_pg_core.text)("stress").default(""),
  focus: (0, import_pg_core.text)("focus").default(""),
  challenge: (0, import_pg_core.text)("challenge").default(""),
  eveningDecision: (0, import_pg_core.text)("evening_decision").default(""),
  eveningBest: (0, import_pg_core.text)("evening_best").default(""),
  eveningWorst: (0, import_pg_core.text)("evening_worst").default(""),
  followedPriorities: (0, import_pg_core.text)("followed_priorities").default(""),
  regret: (0, import_pg_core.text)("regret").default(""),
  lessons: (0, import_pg_core.text)("lessons").default(""),
  gratitude: (0, import_pg_core.text)("gratitude").default(""),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow()
});
var knowledgeItems = (0, import_pg_core.pgTable)("knowledge_items", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  userId: (0, import_pg_core.integer)("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  title: (0, import_pg_core.text)("title").notNull(),
  content: (0, import_pg_core.text)("content").notNull(),
  category: (0, import_pg_core.text)("category").notNull(),
  // notes, career, books, articles, ideas, projects, lessons, memories, quotes, frameworks
  tags: (0, import_pg_core.text)("tags").default(""),
  // comma separated
  source: (0, import_pg_core.text)("source").default(""),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow()
});
var usersRelations = (0, import_drizzle_orm.relations)(users, ({ one, many }) => ({
  mission: one(missions, {
    fields: [users.id],
    references: [missions.userId]
  }),
  goals: many(goals),
  decisions: many(decisions),
  journalEntries: many(journalEntries),
  knowledgeItems: many(knowledgeItems)
}));
var missionsRelations = (0, import_drizzle_orm.relations)(missions, ({ one }) => ({
  user: one(users, {
    fields: [missions.userId],
    references: [users.id]
  })
}));
var goalsRelations = (0, import_drizzle_orm.relations)(goals, ({ one }) => ({
  user: one(users, {
    fields: [goals.userId],
    references: [users.id]
  })
}));
var decisionsRelations = (0, import_drizzle_orm.relations)(decisions, ({ one, many }) => ({
  user: one(users, {
    fields: [decisions.userId],
    references: [users.id]
  }),
  options: many(decisionOptions),
  analysis: one(decisionAnalyses, {
    fields: [decisions.id],
    references: [decisionAnalyses.decisionId]
  })
}));
var decisionOptionsRelations = (0, import_drizzle_orm.relations)(decisionOptions, ({ one }) => ({
  decision: one(decisions, {
    fields: [decisionOptions.decisionId],
    references: [decisions.id]
  })
}));
var decisionAnalysesRelations = (0, import_drizzle_orm.relations)(decisionAnalyses, ({ one }) => ({
  decision: one(decisions, {
    fields: [decisionAnalyses.decisionId],
    references: [decisions.id]
  })
}));
var journalEntriesRelations = (0, import_drizzle_orm.relations)(journalEntries, ({ one }) => ({
  user: one(users, {
    fields: [journalEntries.userId],
    references: [users.id]
  })
}));
var knowledgeItemsRelations = (0, import_drizzle_orm.relations)(knowledgeItems, ({ one }) => ({
  user: one(users, {
    fields: [knowledgeItems.userId],
    references: [users.id]
  })
}));

// src/db/index.ts
var createPool = () => {
  return new import_pg.Pool({
    host: process.env.SQL_HOST,
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    database: process.env.SQL_DB_NAME,
    connectionTimeoutMillis: 15e3
  });
};
var pool = createPool();
pool.on("error", (err) => {
  console.error("Unexpected error on idle SQL pool client:", err);
});
var db = (0, import_node_postgres.drizzle)(pool, { schema: schema_exports });

// src/lib/firebase-admin.ts
var import_app = require("firebase-admin/app");
var import_auth = require("firebase-admin/auth");

// firebase-applet-config.json
var firebase_applet_config_default = {
  projectId: "analog-list-440ks",
  appId: "1:503412123605:web:5842305cc37cc9c0573f5c",
  apiKey: "AIzaSyDSdU1Thleh6Z20YZg0t76b4JJyQsoRl-E",
  authDomain: "analog-list-440ks.firebaseapp.com",
  storageBucket: "analog-list-440ks.firebasestorage.app",
  messagingSenderId: "503412123605",
  measurementId: "",
  oAuthClientId: "503412123605-cqd1i5lnfh5llu16ags3o3amdi0vl39l.apps.googleusercontent.com",
  recaptchaSiteKey: ""
};

// src/lib/firebase-admin.ts
if (!(0, import_app.getApps)().length) {
  (0, import_app.initializeApp)({
    projectId: firebase_applet_config_default.projectId
  });
}
var adminAuth = (0, import_auth.getAuth)();

// src/middleware/auth.ts
var requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: Missing token" });
  }
  const token = authHeader.split("Bearer ")[1];
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("Error verifying Firebase ID token:", error);
    return res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
};

// src/lib/gemini.ts
var import_genai = require("@google/genai");
var ai = new import_genai.GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build"
    }
  }
});
async function analyzeDecision(decision, options, mission) {
  const missionText = mission ? `
User Vision: ${mission.vision}
User Strengths: ${mission.strengths}
User Weaknesses: ${mission.weaknesses}
Bad Habits to Avoid: ${mission.badHabits}
Good Habits to Build: ${mission.goodHabits}
Personal Rules: ${mission.personalRules}
Motivations: ${mission.motivations}
Identity (Never want to become): ${mission.neverWantToBecome}
Success Definition: ${mission.successDefinition}
` : "No personal mission context registered yet.";
  const optionsText = options.map((o, idx) => `Option ${idx + 1}: "${o.title}" - Description: ${o.description}`).join("\n");
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
      systemInstruction: "You are Atlas, a cold, calculated yet supportive, highly intellectual decision consultant. You do not tell the user what they want to hear; you tell them the hard truth based on their long-term vision, core values, and rules. Challenge their self-deception and identify sub-conscious biases (e.g. sunk cost fallacy, hyperbolic discounting, status quo bias).",
      responseMimeType: "application/json",
      responseSchema: {
        type: import_genai.Type.OBJECT,
        properties: {
          summary: { type: import_genai.Type.STRING, description: "Executive summary of the decision puzzle" },
          prosAndCons: {
            type: import_genai.Type.ARRAY,
            items: {
              type: import_genai.Type.OBJECT,
              properties: {
                optionTitle: { type: import_genai.Type.STRING, description: "Title of the option being evaluated" },
                pros: { type: import_genai.Type.ARRAY, items: { type: import_genai.Type.STRING }, description: "List of logical pros" },
                cons: { type: import_genai.Type.ARRAY, items: { type: import_genai.Type.STRING }, description: "List of logical cons" }
              },
              required: ["optionTitle", "pros", "cons"]
            },
            description: "Detailed analysis of pros and cons for each available option"
          },
          shortTermImpact: { type: import_genai.Type.STRING, description: "Impact in the next 1-90 days" },
          longTermImpact: { type: import_genai.Type.STRING, description: "Impact in the next 1-5 years" },
          opportunityCost: { type: import_genai.Type.STRING, description: "What is sacrificed by choosing the recommended route" },
          potentialRisks: { type: import_genai.Type.STRING, description: "Critical vulnerabilities or black-swan risks" },
          cognitiveBiases: { type: import_genai.Type.STRING, description: "List and explanation of cognitive biases detected in the user's mood, options, or description" },
          questionsNotConsidered: {
            type: import_genai.Type.ARRAY,
            items: { type: import_genai.Type.STRING },
            description: "3 deep questions the user has not considered that challenge their premise"
          },
          alternativeSolutions: { type: import_genai.Type.STRING, description: "An alternative 'out of the box' or hybrid option they didn't think of" },
          recommendation: { type: import_genai.Type.STRING, description: "The definitive strategic path recommendation" },
          confidenceScore: { type: import_genai.Type.INTEGER, description: "Confidence score (1-100) of your recommendation" },
          reasoning: { type: import_genai.Type.STRING, description: "The rigorous step-by-step reasoning supporting your recommendation" }
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
          "reasoning"
        ]
      }
    }
  });
  if (!response.text) {
    throw new Error("No response text from Gemini API.");
  }
  return JSON.parse(response.text);
}
async function generateDailyRecommendation(state, mission, activeGoals, recentDecisions) {
  const missionText = mission ? `
Vision: ${mission.vision}
Rules: ${mission.personalRules}
Good habits: ${mission.goodHabits}
Bad habits: ${mission.badHabits}
Identity: ${mission.neverWantToBecome}
` : "No personal alignment rules recorded yet.";
  const goalsText = activeGoals.length > 0 ? activeGoals.map((g) => `- [${g.category}] ${g.title} (Target: ${g.targetDate})`).join("\n") : "No active goals registered.";
  const decisionsText = recentDecisions.length > 0 ? recentDecisions.map((d) => `- ${d.title} (Status: ${d.status})`).join("\n") : "No major recent decisions.";
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
      systemInstruction: "You are Atlas. Your output is rendered as today's top intelligence briefing on the user's OS dashboard. Do not be generic. Be direct, crisp, and extremely practical. Tailor advice to their specific energy level and mission constraints.",
      responseMimeType: "application/json",
      responseSchema: {
        type: import_genai.Type.OBJECT,
        properties: {
          headline: { type: import_genai.Type.STRING, description: "A catchy, motivating yet serious headline for today's focus (e.g. 'Conserve Energy, Solve bottlenecks')" },
          focusAdvice: { type: import_genai.Type.STRING, description: "Personal strategic advice based on energy and stress levels" },
          warningsOrBiases: { type: import_genai.Type.STRING, description: "A quick warning about cognitive pitfalls they might face today based on their mood" },
          alignedHabitToPractice: { type: import_genai.Type.STRING, description: "Which positive habit to actively focus on today" },
          microAction: { type: import_genai.Type.STRING, description: "A single, tiny, non-negotiable micro-action they must take today to stay aligned" }
        },
        required: ["headline", "focusAdvice", "warningsOrBiases", "alignedHabitToPractice", "microAction"]
      }
    }
  });
  if (!response.text) {
    throw new Error("No response text from Gemini API.");
  }
  return JSON.parse(response.text);
}

// server.ts
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use(import_express.default.json());
  async function getDbUser(uid, email) {
    try {
      const existing = await db.select().from(users).where((0, import_drizzle_orm2.eq)(users.uid, uid)).limit(1);
      if (existing.length > 0) {
        return existing[0];
      }
      const inserted = await db.insert(users).values({ uid, email }).onConflictDoUpdate({
        target: users.uid,
        set: { email }
      }).returning();
      if (inserted.length > 0) {
        await db.insert(missions).values({ userId: inserted[0].id }).onConflictDoNothing();
      }
      return inserted[0];
    } catch (error) {
      console.error("Failed to sync or select user:", error);
      throw new Error("User sync failed.");
    }
  }
  app.get("/api/health", (req, res) => {
    res.json({ status: "healthy", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
  });
  app.post("/api/users/sync", requireAuth, async (req, res) => {
    try {
      const uid = req.user?.uid;
      const email = req.user?.email || "anonymous@atlas.ai";
      if (!uid) return res.status(400).json({ error: "Missing Firebase user identity" });
      const dbUser = await getDbUser(uid, email);
      res.json(dbUser);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/missions", requireAuth, async (req, res) => {
    try {
      const uid = req.user?.uid;
      const email = req.user?.email || "";
      if (!uid) return res.status(401).json({ error: "Unauthorized" });
      const dbUser = await getDbUser(uid, email);
      const mission = await db.select().from(missions).where((0, import_drizzle_orm2.eq)(missions.userId, dbUser.id)).limit(1);
      if (mission.length === 0) {
        const newMission = await db.insert(missions).values({ userId: dbUser.id }).returning();
        return res.json(newMission[0]);
      }
      res.json(mission[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.put("/api/missions", requireAuth, async (req, res) => {
    try {
      const uid = req.user?.uid;
      const email = req.user?.email || "";
      if (!uid) return res.status(401).json({ error: "Unauthorized" });
      const dbUser = await getDbUser(uid, email);
      const {
        vision,
        strengths,
        weaknesses,
        badHabits,
        goodHabits,
        personalRules,
        motivations,
        neverWantToBecome,
        successDefinition
      } = req.body;
      const updated = await db.update(missions).set({
        vision: vision ?? "",
        strengths: strengths ?? "",
        weaknesses: weaknesses ?? "",
        badHabits: badHabits ?? "",
        goodHabits: goodHabits ?? "",
        personalRules: personalRules ?? "",
        motivations: motivations ?? "",
        neverWantToBecome: neverWantToBecome ?? "",
        successDefinition: successDefinition ?? "",
        updatedAt: /* @__PURE__ */ new Date()
      }).where((0, import_drizzle_orm2.eq)(missions.userId, dbUser.id)).returning();
      res.json(updated[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/goals", requireAuth, async (req, res) => {
    try {
      const uid = req.user?.uid;
      const email = req.user?.email || "";
      if (!uid) return res.status(401).json({ error: "Unauthorized" });
      const dbUser = await getDbUser(uid, email);
      const list = await db.select().from(goals).where((0, import_drizzle_orm2.eq)(goals.userId, dbUser.id)).orderBy((0, import_drizzle_orm2.desc)(goals.createdAt));
      res.json(list);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/goals", requireAuth, async (req, res) => {
    try {
      const uid = req.user?.uid;
      const email = req.user?.email || "";
      if (!uid) return res.status(401).json({ error: "Unauthorized" });
      const dbUser = await getDbUser(uid, email);
      const { title, description, category, targetDate } = req.body;
      if (!title || !category) {
        return res.status(400).json({ error: "Title and Category are required." });
      }
      const newGoal = await db.insert(goals).values({
        userId: dbUser.id,
        title,
        description: description ?? "",
        category,
        progress: 0,
        status: "PENDING",
        targetDate: targetDate ?? ""
      }).returning();
      res.json(newGoal[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.put("/api/goals/:id", requireAuth, async (req, res) => {
    try {
      const uid = req.user?.uid;
      const email = req.user?.email || "";
      if (!uid) return res.status(401).json({ error: "Unauthorized" });
      const dbUser = await getDbUser(uid, email);
      const goalId = parseInt(req.params.id);
      const { title, description, category, progress, status, targetDate } = req.body;
      const updated = await db.update(goals).set({
        title: title !== void 0 ? title : void 0,
        description: description !== void 0 ? description : void 0,
        category: category !== void 0 ? category : void 0,
        progress: progress !== void 0 ? progress : void 0,
        status: status !== void 0 ? status : void 0,
        targetDate: targetDate !== void 0 ? targetDate : void 0
      }).where((0, import_drizzle_orm2.and)((0, import_drizzle_orm2.eq)(goals.id, goalId), (0, import_drizzle_orm2.eq)(goals.userId, dbUser.id))).returning();
      if (updated.length === 0) {
        return res.status(404).json({ error: "Goal not found" });
      }
      res.json(updated[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.delete("/api/goals/:id", requireAuth, async (req, res) => {
    try {
      const uid = req.user?.uid;
      const email = req.user?.email || "";
      if (!uid) return res.status(401).json({ error: "Unauthorized" });
      const dbUser = await getDbUser(uid, email);
      const goalId = parseInt(req.params.id);
      const deleted = await db.delete(goals).where((0, import_drizzle_orm2.and)((0, import_drizzle_orm2.eq)(goals.id, goalId), (0, import_drizzle_orm2.eq)(goals.userId, dbUser.id))).returning();
      if (deleted.length === 0) {
        return res.status(404).json({ error: "Goal not found" });
      }
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/decisions", requireAuth, async (req, res) => {
    try {
      const uid = req.user?.uid;
      const email = req.user?.email || "";
      if (!uid) return res.status(401).json({ error: "Unauthorized" });
      const dbUser = await getDbUser(uid, email);
      const decisionList = await db.select().from(decisions).where((0, import_drizzle_orm2.eq)(decisions.userId, dbUser.id)).orderBy((0, import_drizzle_orm2.desc)(decisions.createdAt));
      const fullDecisions = await Promise.all(
        decisionList.map(async (dec) => {
          const opts = await db.select().from(decisionOptions).where((0, import_drizzle_orm2.eq)(decisionOptions.decisionId, dec.id));
          const analysis = await db.select().from(decisionAnalyses).where((0, import_drizzle_orm2.eq)(decisionAnalyses.decisionId, dec.id)).limit(1);
          return {
            ...dec,
            options: opts,
            analysis: analysis[0] || null
          };
        })
      );
      res.json(fullDecisions);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/decisions", requireAuth, async (req, res) => {
    try {
      const uid = req.user?.uid;
      const email = req.user?.email || "";
      if (!uid) return res.status(401).json({ error: "Unauthorized" });
      const dbUser = await getDbUser(uid, email);
      const {
        title,
        description,
        category,
        importance,
        mood,
        energy,
        deadline,
        availableTime,
        notes,
        options
        // Array of { title, description }
      } = req.body;
      if (!title || !description || !category || !options || options.length < 1) {
        return res.status(400).json({ error: "Required fields: title, description, category, and at least one option." });
      }
      const newDec = await db.insert(decisions).values({
        userId: dbUser.id,
        title,
        description,
        category,
        importance: importance ? parseInt(importance) : 5,
        mood: mood ?? "Neutral",
        energy: energy ?? "Medium",
        deadline: deadline ?? "",
        availableTime: availableTime ?? "",
        notes: notes ?? "",
        status: "PENDING"
      }).returning();
      const decId = newDec[0].id;
      const insertedOptions = await Promise.all(
        options.map(async (opt) => {
          const resOpt = await db.insert(decisionOptions).values({
            decisionId: decId,
            title: opt.title,
            description: opt.description ?? "",
            isSelected: false
          }).returning();
          return resOpt[0];
        })
      );
      const userMission = await db.select().from(missions).where((0, import_drizzle_orm2.eq)(missions.userId, dbUser.id)).limit(1);
      const missionContext = userMission[0] || null;
      let analysisResult;
      try {
        analysisResult = await analyzeDecision(
          {
            title,
            description,
            category,
            importance: importance ? parseInt(importance) : 5,
            mood: mood ?? "Neutral",
            energy: energy ?? "Medium",
            deadline: deadline ?? "",
            availableTime: availableTime ?? "",
            notes: notes ?? ""
          },
          insertedOptions.map((io) => ({ title: io.title, description: io.description || "" })),
          missionContext
        );
      } catch (geminiErr) {
        console.error("Gemini decision analysis failed:", geminiErr);
        analysisResult = {
          summary: "Analysis calculation was temporarily offline. Here is a basic structural overview.",
          prosAndCons: insertedOptions.map((io) => ({
            optionTitle: io.title,
            pros: ["Independent action path"],
            cons: ["Requires validation and risk mitigation"]
          })),
          shortTermImpact: "Needs careful execution tracking in the first 30 days.",
          longTermImpact: "Expected to influence alignment with personal milestones.",
          opportunityCost: "Requires allocating focus and time away from adjacent priorities.",
          potentialRisks: "Incomplete initial assumption analysis.",
          cognitiveBiases: "Subject to status quo bias and optimization lag.",
          questionsNotConsidered: ["How does this change life constraints?", "Is this reversible?", "What is the simplest fail-fast test?"],
          alternativeSolutions: "Combine aspects of the existing options to draft a hybrid plan.",
          recommendation: "Review the risks carefully, validate the simplest path, and execute.",
          confidenceScore: 70,
          reasoning: "Based on structural alignment constraints."
        };
      }
      const savedAnalysis = await db.insert(decisionAnalyses).values({
        decisionId: decId,
        summary: analysisResult.summary,
        prosAndCons: analysisResult.prosAndCons,
        shortTermImpact: analysisResult.shortTermImpact,
        longTermImpact: analysisResult.longTermImpact,
        opportunityCost: analysisResult.opportunityCost,
        potentialRisks: analysisResult.potentialRisks,
        cognitiveBiases: analysisResult.cognitiveBiases,
        alternativeSolutions: analysisResult.alternativeSolutions,
        recommendation: analysisResult.recommendation,
        confidenceScore: analysisResult.confidenceScore,
        reasoning: analysisResult.reasoning
      }).returning();
      res.json({
        ...newDec[0],
        options: insertedOptions,
        analysis: savedAnalysis[0]
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  });
  app.put("/api/decisions/:id/status", requireAuth, async (req, res) => {
    try {
      const uid = req.user?.uid;
      const email = req.user?.email || "";
      if (!uid) return res.status(401).json({ error: "Unauthorized" });
      const dbUser = await getDbUser(uid, email);
      const decisionId = parseInt(req.params.id);
      const { status, selectedOptionId } = req.body;
      const updated = await db.update(decisions).set({ status: status ?? "DECIDED" }).where((0, import_drizzle_orm2.and)((0, import_drizzle_orm2.eq)(decisions.id, decisionId), (0, import_drizzle_orm2.eq)(decisions.userId, dbUser.id))).returning();
      if (updated.length === 0) {
        return res.status(404).json({ error: "Decision not found" });
      }
      if (selectedOptionId !== void 0) {
        await db.update(decisionOptions).set({ isSelected: false }).where((0, import_drizzle_orm2.eq)(decisionOptions.decisionId, decisionId));
        await db.update(decisionOptions).set({ isSelected: true }).where((0, import_drizzle_orm2.eq)(decisionOptions.id, selectedOptionId));
      }
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.delete("/api/decisions/:id", requireAuth, async (req, res) => {
    try {
      const uid = req.user?.uid;
      const email = req.user?.email || "";
      if (!uid) return res.status(401).json({ error: "Unauthorized" });
      const dbUser = await getDbUser(uid, email);
      const decisionId = parseInt(req.params.id);
      const deleted = await db.delete(decisions).where((0, import_drizzle_orm2.and)((0, import_drizzle_orm2.eq)(decisions.id, decisionId), (0, import_drizzle_orm2.eq)(decisions.userId, dbUser.id))).returning();
      if (deleted.length === 0) {
        return res.status(404).json({ error: "Decision not found" });
      }
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/journal/by-date", requireAuth, async (req, res) => {
    try {
      const uid = req.user?.uid;
      const email = req.user?.email || "";
      if (!uid) return res.status(401).json({ error: "Unauthorized" });
      const dbUser = await getDbUser(uid, email);
      const dateStr = req.query.date;
      if (!dateStr) return res.status(400).json({ error: "Date parameter is required" });
      const entry = await db.select().from(journalEntries).where((0, import_drizzle_orm2.and)((0, import_drizzle_orm2.eq)(journalEntries.userId, dbUser.id), (0, import_drizzle_orm2.eq)(journalEntries.date, dateStr))).limit(1);
      res.json(entry[0] || null);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/journal/history", requireAuth, async (req, res) => {
    try {
      const uid = req.user?.uid;
      const email = req.user?.email || "";
      if (!uid) return res.status(401).json({ error: "Unauthorized" });
      const dbUser = await getDbUser(uid, email);
      const list = await db.select().from(journalEntries).where((0, import_drizzle_orm2.eq)(journalEntries.userId, dbUser.id)).orderBy((0, import_drizzle_orm2.desc)(journalEntries.date));
      res.json(list);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/journal", requireAuth, async (req, res) => {
    try {
      const uid = req.user?.uid;
      const email = req.user?.email || "";
      if (!uid) return res.status(401).json({ error: "Unauthorized" });
      const dbUser = await getDbUser(uid, email);
      const {
        date,
        sleepHours,
        mood,
        energy,
        stress,
        focus,
        challenge,
        eveningDecision,
        eveningBest,
        eveningWorst,
        followedPriorities,
        regret,
        lessons,
        gratitude
      } = req.body;
      if (!date) return res.status(400).json({ error: "Date is required" });
      const existing = await db.select().from(journalEntries).where((0, import_drizzle_orm2.and)((0, import_drizzle_orm2.eq)(journalEntries.userId, dbUser.id), (0, import_drizzle_orm2.eq)(journalEntries.date, date))).limit(1);
      let saved;
      if (existing.length > 0) {
        saved = await db.update(journalEntries).set({
          sleepHours: sleepHours !== void 0 ? sleepHours : void 0,
          mood: mood !== void 0 ? mood : void 0,
          energy: energy !== void 0 ? energy : void 0,
          stress: stress !== void 0 ? stress : void 0,
          focus: focus !== void 0 ? focus : void 0,
          challenge: challenge !== void 0 ? challenge : void 0,
          eveningDecision: eveningDecision !== void 0 ? eveningDecision : void 0,
          eveningBest: eveningBest !== void 0 ? eveningBest : void 0,
          eveningWorst: eveningWorst !== void 0 ? eveningWorst : void 0,
          followedPriorities: followedPriorities !== void 0 ? followedPriorities : void 0,
          regret: regret !== void 0 ? regret : void 0,
          lessons: lessons !== void 0 ? lessons : void 0,
          gratitude: gratitude !== void 0 ? gratitude : void 0
        }).where((0, import_drizzle_orm2.eq)(journalEntries.id, existing[0].id)).returning();
      } else {
        saved = await db.insert(journalEntries).values({
          userId: dbUser.id,
          date,
          sleepHours: sleepHours ?? "",
          mood: mood ?? "Neutral",
          energy: energy ?? "Medium",
          stress: stress ?? "Low",
          focus: focus ?? "",
          challenge: challenge ?? "",
          eveningDecision: eveningDecision ?? "",
          eveningBest: eveningBest ?? "",
          eveningWorst: eveningWorst ?? "",
          followedPriorities: followedPriorities ?? "",
          regret: regret ?? "",
          lessons: lessons ?? "",
          gratitude: gratitude ?? ""
        }).returning();
      }
      res.json(saved[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/knowledge", requireAuth, async (req, res) => {
    try {
      const uid = req.user?.uid;
      const email = req.user?.email || "";
      if (!uid) return res.status(401).json({ error: "Unauthorized" });
      const dbUser = await getDbUser(uid, email);
      const list = await db.select().from(knowledgeItems).where((0, import_drizzle_orm2.eq)(knowledgeItems.userId, dbUser.id)).orderBy((0, import_drizzle_orm2.desc)(knowledgeItems.createdAt));
      res.json(list);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/knowledge", requireAuth, async (req, res) => {
    try {
      const uid = req.user?.uid;
      const email = req.user?.email || "";
      if (!uid) return res.status(401).json({ error: "Unauthorized" });
      const dbUser = await getDbUser(uid, email);
      const { title, content, category, tags, source } = req.body;
      if (!title || !content || !category) {
        return res.status(400).json({ error: "Required: title, content, and category." });
      }
      const item = await db.insert(knowledgeItems).values({
        userId: dbUser.id,
        title,
        content,
        category,
        tags: tags ?? "",
        source: source ?? ""
      }).returning();
      res.json(item[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.put("/api/knowledge/:id", requireAuth, async (req, res) => {
    try {
      const uid = req.user?.uid;
      const email = req.user?.email || "";
      if (!uid) return res.status(401).json({ error: "Unauthorized" });
      const dbUser = await getDbUser(uid, email);
      const itemId = parseInt(req.params.id);
      const { title, content, category, tags, source } = req.body;
      const updated = await db.update(knowledgeItems).set({
        title: title !== void 0 ? title : void 0,
        content: content !== void 0 ? content : void 0,
        category: category !== void 0 ? category : void 0,
        tags: tags !== void 0 ? tags : void 0,
        source: source !== void 0 ? source : void 0
      }).where((0, import_drizzle_orm2.and)((0, import_drizzle_orm2.eq)(knowledgeItems.id, itemId), (0, import_drizzle_orm2.eq)(knowledgeItems.userId, dbUser.id))).returning();
      if (updated.length === 0) {
        return res.status(404).json({ error: "Knowledge item not found" });
      }
      res.json(updated[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.delete("/api/knowledge/:id", requireAuth, async (req, res) => {
    try {
      const uid = req.user?.uid;
      const email = req.user?.email || "";
      if (!uid) return res.status(401).json({ error: "Unauthorized" });
      const dbUser = await getDbUser(uid, email);
      const itemId = parseInt(req.params.id);
      const deleted = await db.delete(knowledgeItems).where((0, import_drizzle_orm2.and)((0, import_drizzle_orm2.eq)(knowledgeItems.id, itemId), (0, import_drizzle_orm2.eq)(knowledgeItems.userId, dbUser.id))).returning();
      if (deleted.length === 0) {
        return res.status(404).json({ error: "Knowledge item not found" });
      }
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/dashboard/recommendation", requireAuth, async (req, res) => {
    try {
      const uid = req.user?.uid;
      const email = req.user?.email || "";
      if (!uid) return res.status(401).json({ error: "Unauthorized" });
      const dbUser = await getDbUser(uid, email);
      const todayStr = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      const journal = await db.select().from(journalEntries).where((0, import_drizzle_orm2.and)((0, import_drizzle_orm2.eq)(journalEntries.userId, dbUser.id), (0, import_drizzle_orm2.eq)(journalEntries.date, todayStr))).limit(1);
      const state = journal[0] ? {
        mood: journal[0].mood || "Neutral",
        energy: journal[0].energy || "Medium",
        stress: journal[0].stress || "Medium",
        focus: journal[0].focus || "Unspecified",
        challenge: journal[0].challenge || "Unspecified"
      } : {
        mood: "Neutral",
        energy: "Medium",
        stress: "Low",
        focus: "General daily tasks",
        challenge: "None logged yet"
      };
      const userMission = await db.select().from(missions).where((0, import_drizzle_orm2.eq)(missions.userId, dbUser.id)).limit(1);
      const missionContext = userMission[0] || null;
      const activeGoals = await db.select().from(goals).where((0, import_drizzle_orm2.and)((0, import_drizzle_orm2.eq)(goals.userId, dbUser.id), (0, import_drizzle_orm2.eq)(goals.status, "PENDING")));
      const recentDecisions = await db.select().from(decisions).where((0, import_drizzle_orm2.eq)(decisions.userId, dbUser.id)).orderBy((0, import_drizzle_orm2.desc)(decisions.createdAt)).limit(5);
      let rec;
      try {
        rec = await generateDailyRecommendation(state, missionContext, activeGoals, recentDecisions);
      } catch (geminiErr) {
        console.error("Gemini briefing failed, using fallback:", geminiErr);
        rec = {
          headline: "Calibrate Focus & Avoid Burnout",
          focusAdvice: "Maintain stable, deliberate output. Align activities with active career/personal milestones.",
          warningsOrBiases: "Be mindful of hyperbolic discounting (preferring short-term comfort over long-term goals).",
          alignedHabitToPractice: "Deliberate time-boxing and avoiding impulsive contexts.",
          microAction: "Write down your single non-negotiable priority for today and execute it first."
        };
      }
      res.json(rec);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/insights", requireAuth, async (req, res) => {
    try {
      const uid = req.user?.uid;
      const email = req.user?.email || "";
      if (!uid) return res.status(401).json({ error: "Unauthorized" });
      const dbUser = await getDbUser(uid, email);
      const allGoals = await db.select().from(goals).where((0, import_drizzle_orm2.eq)(goals.userId, dbUser.id));
      const allDecisions = await db.select().from(decisions).where((0, import_drizzle_orm2.eq)(decisions.userId, dbUser.id));
      const allJournal = await db.select().from(journalEntries).where((0, import_drizzle_orm2.eq)(journalEntries.userId, dbUser.id)).orderBy((0, import_drizzle_orm2.desc)(journalEntries.date)).limit(30);
      const decisionList = await db.select().from(decisions).where((0, import_drizzle_orm2.eq)(decisions.userId, dbUser.id));
      const analyses = await Promise.all(
        decisionList.map(async (d) => {
          return db.select().from(decisionAnalyses).where((0, import_drizzle_orm2.eq)(decisionAnalyses.decisionId, d.id)).limit(1);
        })
      );
      const decisionCategories = {};
      allDecisions.forEach((d) => {
        decisionCategories[d.category] = (decisionCategories[d.category] || 0) + 1;
      });
      const biasFrequency = {};
      analyses.forEach((arr) => {
        if (arr.length > 0 && arr[0].cognitiveBiases) {
          const text2 = arr[0].cognitiveBiases.toLowerCase();
          const commonBiases = [
            "sunk cost",
            "hyperbolic discounting",
            "status quo",
            "loss aversion",
            "confirmation bias",
            "anchoring",
            "overconfidence",
            "optimism bias",
            "dunning-kruger"
          ];
          commonBiases.forEach((bias) => {
            if (text2.includes(bias)) {
              const properName = bias.split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
              biasFrequency[properName] = (biasFrequency[properName] || 0) + 1;
            }
          });
        }
      });
      const goalProgress = {
        total: allGoals.length,
        completed: allGoals.filter((g) => g.status === "COMPLETED").length,
        pending: allGoals.filter((g) => g.status === "PENDING").length,
        avgProgress: allGoals.length > 0 ? Math.round(allGoals.reduce((sum, g) => sum + (g.progress || 0), 0) / allGoals.length) : 0
      };
      const moodTrends = allJournal.map((j) => ({
        date: j.date,
        mood: j.mood || "Neutral",
        energy: j.energy || "Medium",
        stress: j.stress || "Medium"
      })).reverse();
      res.json({
        decisionCategories,
        cognitiveBiases: biasFrequency,
        goalProgress,
        moodTrends,
        decisionsCount: allDecisions.length,
        journalEntriesCount: allJournal.length
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Atlas full-stack server running on http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
