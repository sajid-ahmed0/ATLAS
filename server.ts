import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { eq, desc, and, sql } from "drizzle-orm";
import { db } from "./src/db/index.ts";
import {
  users,
  missions,
  goals,
  decisions,
  decisionOptions,
  decisionAnalyses,
  journalEntries,
  knowledgeItems
} from "./src/db/schema.ts";
import { requireAuth, AuthRequest } from "./src/middleware/auth.ts";
import { analyzeDecision, generateDailyRecommendation } from "./src/lib/gemini.ts";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json());

  // Helper to resolve the database integer ID from the Firebase UID
  async function getDbUser(uid: string, email: string) {
    try {
      const existing = await db.select().from(users).where(eq(users.uid, uid)).limit(1);
      if (existing.length > 0) {
        return existing[0];
      }
      // Insert / Sync user
      const inserted = await db.insert(users)
        .values({ uid, email })
        .onConflictDoUpdate({
          target: users.uid,
          set: { email },
        })
        .returning();
      
      // Seed initial blank mission
      if (inserted.length > 0) {
        await db.insert(missions)
          .values({ userId: inserted[0].id })
          .onConflictDoNothing();
      }
      return inserted[0];
    } catch (error) {
      console.error("Failed to sync or select user:", error);
      throw new Error("User sync failed.");
    }
  }

  // --- API ROUTES ---

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "healthy", timestamp: new Date().toISOString() });
  });

  // User Sync
  app.post("/api/users/sync", requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user?.uid;
      const email = req.user?.email || "anonymous@atlas.ai";
      if (!uid) return res.status(400).json({ error: "Missing Firebase user identity" });
      const dbUser = await getDbUser(uid, email);
      res.json(dbUser);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Mission Center
  app.get("/api/missions", requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user?.uid;
      const email = req.user?.email || "";
      if (!uid) return res.status(401).json({ error: "Unauthorized" });
      const dbUser = await getDbUser(uid, email);

      const mission = await db.select().from(missions).where(eq(missions.userId, dbUser.id)).limit(1);
      if (mission.length === 0) {
        // Create initial
        const newMission = await db.insert(missions).values({ userId: dbUser.id }).returning();
        return res.json(newMission[0]);
      }
      res.json(mission[0]);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put("/api/missions", requireAuth, async (req: AuthRequest, res) => {
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

      const updated = await db.update(missions)
        .set({
          vision: vision ?? "",
          strengths: strengths ?? "",
          weaknesses: weaknesses ?? "",
          badHabits: badHabits ?? "",
          goodHabits: goodHabits ?? "",
          personalRules: personalRules ?? "",
          motivations: motivations ?? "",
          neverWantToBecome: neverWantToBecome ?? "",
          successDefinition: successDefinition ?? "",
          updatedAt: new Date()
        })
        .where(eq(missions.userId, dbUser.id))
        .returning();

      res.json(updated[0]);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Goals Center
  app.get("/api/goals", requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user?.uid;
      const email = req.user?.email || "";
      if (!uid) return res.status(401).json({ error: "Unauthorized" });
      const dbUser = await getDbUser(uid, email);

      const list = await db.select().from(goals)
        .where(eq(goals.userId, dbUser.id))
        .orderBy(desc(goals.createdAt));
      res.json(list);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/goals", requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user?.uid;
      const email = req.user?.email || "";
      if (!uid) return res.status(401).json({ error: "Unauthorized" });
      const dbUser = await getDbUser(uid, email);

      const { title, description, category, targetDate } = req.body;
      if (!title || !category) {
        return res.status(400).json({ error: "Title and Category are required." });
      }

      const newGoal = await db.insert(goals)
        .values({
          userId: dbUser.id,
          title,
          description: description ?? "",
          category,
          progress: 0,
          status: "PENDING",
          targetDate: targetDate ?? ""
        })
        .returning();

      res.json(newGoal[0]);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put("/api/goals/:id", requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user?.uid;
      const email = req.user?.email || "";
      if (!uid) return res.status(401).json({ error: "Unauthorized" });
      const dbUser = await getDbUser(uid, email);

      const goalId = parseInt(req.params.id);
      const { title, description, category, progress, status, targetDate } = req.body;

      const updated = await db.update(goals)
        .set({
          title: title !== undefined ? title : undefined,
          description: description !== undefined ? description : undefined,
          category: category !== undefined ? category : undefined,
          progress: progress !== undefined ? progress : undefined,
          status: status !== undefined ? status : undefined,
          targetDate: targetDate !== undefined ? targetDate : undefined,
        })
        .where(and(eq(goals.id, goalId), eq(goals.userId, dbUser.id)))
        .returning();

      if (updated.length === 0) {
        return res.status(404).json({ error: "Goal not found" });
      }
      res.json(updated[0]);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/goals/:id", requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user?.uid;
      const email = req.user?.email || "";
      if (!uid) return res.status(401).json({ error: "Unauthorized" });
      const dbUser = await getDbUser(uid, email);

      const goalId = parseInt(req.params.id);
      const deleted = await db.delete(goals)
        .where(and(eq(goals.id, goalId), eq(goals.userId, dbUser.id)))
        .returning();

      if (deleted.length === 0) {
        return res.status(404).json({ error: "Goal not found" });
      }
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Decision Center
  app.get("/api/decisions", requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user?.uid;
      const email = req.user?.email || "";
      if (!uid) return res.status(401).json({ error: "Unauthorized" });
      const dbUser = await getDbUser(uid, email);

      // Fetch decisions
      const decisionList = await db.select().from(decisions)
        .where(eq(decisions.userId, dbUser.id))
        .orderBy(desc(decisions.createdAt));

      // Fetch options and analysis for each decision
      const fullDecisions = await Promise.all(
        decisionList.map(async (dec) => {
          const opts = await db.select().from(decisionOptions)
            .where(eq(decisionOptions.decisionId, dec.id));
          const analysis = await db.select().from(decisionAnalyses)
            .where(eq(decisionAnalyses.decisionId, dec.id))
            .limit(1);

          return {
            ...dec,
            options: opts,
            analysis: analysis[0] || null
          };
        })
      );

      res.json(fullDecisions);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/decisions", requireAuth, async (req: AuthRequest, res) => {
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
        options // Array of { title, description }
      } = req.body;

      if (!title || !description || !category || !options || options.length < 1) {
        return res.status(400).json({ error: "Required fields: title, description, category, and at least one option." });
      }

      // 1. Insert Decision
      const newDec = await db.insert(decisions)
        .values({
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
        })
        .returning();

      const decId = newDec[0].id;

      // 2. Insert Options
      const insertedOptions = await Promise.all(
        options.map(async (opt: any) => {
          const resOpt = await db.insert(decisionOptions)
            .values({
              decisionId: decId,
              title: opt.title,
              description: opt.description ?? "",
              isSelected: false
            })
            .returning();
          return resOpt[0];
        })
      );

      // 3. Fetch User Mission Context
      const userMission = await db.select().from(missions).where(eq(missions.userId, dbUser.id)).limit(1);
      const missionContext = userMission[0] || null;

      // 4. Run Gemini Intelligence Analysis
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
            notes: notes ?? "",
          },
          insertedOptions.map(io => ({ title: io.title, description: io.description || "" })),
          missionContext
        );
      } catch (geminiErr: any) {
        console.error("Gemini decision analysis failed:", geminiErr);
        // Fallback default mock analysis if Gemini has an issue, to ensure user experience doesn't break
        analysisResult = {
          summary: "Analysis calculation was temporarily offline. Here is a basic structural overview.",
          prosAndCons: insertedOptions.map(io => ({
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

      // 5. Save Analysis to DB
      const savedAnalysis = await db.insert(decisionAnalyses)
        .values({
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
        })
        .returning();

      res.json({
        ...newDec[0],
        options: insertedOptions,
        analysis: savedAnalysis[0]
      });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  });

  app.put("/api/decisions/:id/status", requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user?.uid;
      const email = req.user?.email || "";
      if (!uid) return res.status(401).json({ error: "Unauthorized" });
      const dbUser = await getDbUser(uid, email);

      const decisionId = parseInt(req.params.id);
      const { status, selectedOptionId } = req.body;

      // Update decision status
      const updated = await db.update(decisions)
        .set({ status: status ?? "DECIDED" })
        .where(and(eq(decisions.id, decisionId), eq(decisions.userId, dbUser.id)))
        .returning();

      if (updated.length === 0) {
        return res.status(404).json({ error: "Decision not found" });
      }

      // If a specific option was selected
      if (selectedOptionId !== undefined) {
        // Reset selections
        await db.update(decisionOptions)
          .set({ isSelected: false })
          .where(eq(decisionOptions.decisionId, decisionId));

        // Set chosen
        await db.update(decisionOptions)
          .set({ isSelected: true })
          .where(eq(decisionOptions.id, selectedOptionId));
      }

      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/decisions/:id", requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user?.uid;
      const email = req.user?.email || "";
      if (!uid) return res.status(401).json({ error: "Unauthorized" });
      const dbUser = await getDbUser(uid, email);

      const decisionId = parseInt(req.params.id);
      const deleted = await db.delete(decisions)
        .where(and(eq(decisions.id, decisionId), eq(decisions.userId, dbUser.id)))
        .returning();

      if (deleted.length === 0) {
        return res.status(404).json({ error: "Decision not found" });
      }
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Daily Journal Center
  app.get("/api/journal/by-date", requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user?.uid;
      const email = req.user?.email || "";
      if (!uid) return res.status(401).json({ error: "Unauthorized" });
      const dbUser = await getDbUser(uid, email);

      const dateStr = req.query.date as string; // YYYY-MM-DD
      if (!dateStr) return res.status(400).json({ error: "Date parameter is required" });

      const entry = await db.select().from(journalEntries)
        .where(and(eq(journalEntries.userId, dbUser.id), eq(journalEntries.date, dateStr)))
        .limit(1);

      res.json(entry[0] || null);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/journal/history", requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user?.uid;
      const email = req.user?.email || "";
      if (!uid) return res.status(401).json({ error: "Unauthorized" });
      const dbUser = await getDbUser(uid, email);

      const list = await db.select().from(journalEntries)
        .where(eq(journalEntries.userId, dbUser.id))
        .orderBy(desc(journalEntries.date));
      res.json(list);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/journal", requireAuth, async (req: AuthRequest, res) => {
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

      // Upsert journal entry
      const existing = await db.select().from(journalEntries)
        .where(and(eq(journalEntries.userId, dbUser.id), eq(journalEntries.date, date)))
        .limit(1);

      let saved;
      if (existing.length > 0) {
        // Update
        saved = await db.update(journalEntries)
          .set({
            sleepHours: sleepHours !== undefined ? sleepHours : undefined,
            mood: mood !== undefined ? mood : undefined,
            energy: energy !== undefined ? energy : undefined,
            stress: stress !== undefined ? stress : undefined,
            focus: focus !== undefined ? focus : undefined,
            challenge: challenge !== undefined ? challenge : undefined,
            eveningDecision: eveningDecision !== undefined ? eveningDecision : undefined,
            eveningBest: eveningBest !== undefined ? eveningBest : undefined,
            eveningWorst: eveningWorst !== undefined ? eveningWorst : undefined,
            followedPriorities: followedPriorities !== undefined ? followedPriorities : undefined,
            regret: regret !== undefined ? regret : undefined,
            lessons: lessons !== undefined ? lessons : undefined,
            gratitude: gratitude !== undefined ? gratitude : undefined,
          })
          .where(eq(journalEntries.id, existing[0].id))
          .returning();
      } else {
        // Insert
        saved = await db.insert(journalEntries)
          .values({
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
            gratitude: gratitude ?? "",
          })
          .returning();
      }

      res.json(saved[0]);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Knowledge base
  app.get("/api/knowledge", requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user?.uid;
      const email = req.user?.email || "";
      if (!uid) return res.status(401).json({ error: "Unauthorized" });
      const dbUser = await getDbUser(uid, email);

      const list = await db.select().from(knowledgeItems)
        .where(eq(knowledgeItems.userId, dbUser.id))
        .orderBy(desc(knowledgeItems.createdAt));
      res.json(list);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/knowledge", requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user?.uid;
      const email = req.user?.email || "";
      if (!uid) return res.status(401).json({ error: "Unauthorized" });
      const dbUser = await getDbUser(uid, email);

      const { title, content, category, tags, source } = req.body;
      if (!title || !content || !category) {
        return res.status(400).json({ error: "Required: title, content, and category." });
      }

      const item = await db.insert(knowledgeItems)
        .values({
          userId: dbUser.id,
          title,
          content,
          category,
          tags: tags ?? "",
          source: source ?? ""
        })
        .returning();

      res.json(item[0]);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put("/api/knowledge/:id", requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user?.uid;
      const email = req.user?.email || "";
      if (!uid) return res.status(401).json({ error: "Unauthorized" });
      const dbUser = await getDbUser(uid, email);

      const itemId = parseInt(req.params.id);
      const { title, content, category, tags, source } = req.body;

      const updated = await db.update(knowledgeItems)
        .set({
          title: title !== undefined ? title : undefined,
          content: content !== undefined ? content : undefined,
          category: category !== undefined ? category : undefined,
          tags: tags !== undefined ? tags : undefined,
          source: source !== undefined ? source : undefined,
        })
        .where(and(eq(knowledgeItems.id, itemId), eq(knowledgeItems.userId, dbUser.id)))
        .returning();

      if (updated.length === 0) {
        return res.status(404).json({ error: "Knowledge item not found" });
      }
      res.json(updated[0]);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/knowledge/:id", requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user?.uid;
      const email = req.user?.email || "";
      if (!uid) return res.status(401).json({ error: "Unauthorized" });
      const dbUser = await getDbUser(uid, email);

      const itemId = parseInt(req.params.id);
      const deleted = await db.delete(knowledgeItems)
        .where(and(eq(knowledgeItems.id, itemId), eq(knowledgeItems.userId, dbUser.id)))
        .returning();

      if (deleted.length === 0) {
        return res.status(404).json({ error: "Knowledge item not found" });
      }
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // AI Recommendation Generation (Today's operating directive)
  app.get("/api/dashboard/recommendation", requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user?.uid;
      const email = req.user?.email || "";
      if (!uid) return res.status(401).json({ error: "Unauthorized" });
      const dbUser = await getDbUser(uid, email);

      // 1. Get today's journal state
      const todayStr = new Date().toISOString().split("T")[0];
      const journal = await db.select().from(journalEntries)
        .where(and(eq(journalEntries.userId, dbUser.id), eq(journalEntries.date, todayStr)))
        .limit(1);

      const state = journal[0]
        ? {
            mood: journal[0].mood || "Neutral",
            energy: journal[0].energy || "Medium",
            stress: journal[0].stress || "Medium",
            focus: journal[0].focus || "Unspecified",
            challenge: journal[0].challenge || "Unspecified"
          }
        : {
            mood: "Neutral",
            energy: "Medium",
            stress: "Low",
            focus: "General daily tasks",
            challenge: "None logged yet"
          };

      // 2. Mission Rules Context
      const userMission = await db.select().from(missions)
        .where(eq(missions.userId, dbUser.id)).limit(1);
      const missionContext = userMission[0] || null;

      // 3. Active goals
      const activeGoals = await db.select().from(goals)
        .where(and(eq(goals.userId, dbUser.id), eq(goals.status, "PENDING")));

      // 4. Recent decisions
      const recentDecisions = await db.select().from(decisions)
        .where(eq(decisions.userId, dbUser.id))
        .orderBy(desc(decisions.createdAt))
        .limit(5);

      // 5. Generate with Gemini
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
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Dynamic Insights Aggregation API
  app.get("/api/insights", requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user?.uid;
      const email = req.user?.email || "";
      if (!uid) return res.status(401).json({ error: "Unauthorized" });
      const dbUser = await getDbUser(uid, email);

      // Fetch base records
      const allGoals = await db.select().from(goals).where(eq(goals.userId, dbUser.id));
      const allDecisions = await db.select().from(decisions).where(eq(decisions.userId, dbUser.id));
      const allJournal = await db.select().from(journalEntries)
        .where(eq(journalEntries.userId, dbUser.id))
        .orderBy(desc(journalEntries.date))
        .limit(30); // Last 30 entries

      // Fetch all analyses to extract cognitive bias frequency
      const decisionList = await db.select().from(decisions).where(eq(decisions.userId, dbUser.id));
      const analyses = await Promise.all(
        decisionList.map(async (d) => {
          return db.select().from(decisionAnalyses).where(eq(decisionAnalyses.decisionId, d.id)).limit(1);
        })
      );

      // Aggregate Decision Categories
      const decisionCategories: Record<string, number> = {};
      allDecisions.forEach(d => {
        decisionCategories[d.category] = (decisionCategories[d.category] || 0) + 1;
      });

      // Aggregate Biases
      const biasFrequency: Record<string, number> = {};
      analyses.forEach(arr => {
        if (arr.length > 0 && arr[0].cognitiveBiases) {
          const text = arr[0].cognitiveBiases.toLowerCase();
          const commonBiases = [
            "sunk cost", "hyperbolic discounting", "status quo", "loss aversion", 
            "confirmation bias", "anchoring", "overconfidence", "optimism bias", "dunning-kruger"
          ];
          commonBiases.forEach(bias => {
            if (text.includes(bias)) {
              const properName = bias.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
              biasFrequency[properName] = (biasFrequency[properName] || 0) + 1;
            }
          });
        }
      });

      // Goal Progress Calculation
      const goalProgress = {
        total: allGoals.length,
        completed: allGoals.filter(g => g.status === "COMPLETED").length,
        pending: allGoals.filter(g => g.status === "PENDING").length,
        avgProgress: allGoals.length > 0 
          ? Math.round(allGoals.reduce((sum, g) => sum + (g.progress || 0), 0) / allGoals.length)
          : 0
      };

      // Mood & Stress trends
      const moodTrends = allJournal.map(j => ({
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
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });


  // --- VITE MIDDLEWARE SETUP ---

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Atlas full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
