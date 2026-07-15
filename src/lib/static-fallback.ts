// Static Fallback Interceptor for GitHub Pages / Static Hosting Environments
// Overrides window.fetch to support a full client-side LocalStorage DB when the server is unavailable.

import { JournalEntry, Goal, Decision, KnowledgeItem, Mission, InsightsData, DashboardRecommendation, DecisionOption, DecisionAnalysis } from '../types.ts';

const STORAGE_KEYS = {
  JOURNALS: 'atlas_journals',
  GOALS: 'atlas_goals',
  DECISIONS: 'atlas_decisions',
  KNOWLEDGE: 'atlas_knowledge',
  MISSION: 'atlas_mission',
};

// Helper to get from local storage
const getLocalData = <T>(key: string, defaultValue: T): T => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
};

// Helper to save to local storage
const setLocalData = <T>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

// Seed initial data if empty to show a beautiful initial state on load
const seedInitialData = () => {
  if (!localStorage.getItem(STORAGE_KEYS.GOALS)) {
    const initialGoals: Goal[] = [
      {
        id: 1,
        userId: 1,
        title: "Deploy Atlas Life OS to Production",
        description: "Secure production environment, verify database constraints, and set up continuous integration.",
        category: "career",
        progress: 80,
        status: 'PENDING',
        targetDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        userId: 1,
        title: "Maintain 7.5hr Sleep Average & Rigor Reflections",
        description: "Focus on sleep hygiene and conduct morning alignment & evening integrity audits every single day.",
        category: "health",
        progress: 60,
        status: 'PENDING',
        targetDate: new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
        createdAt: new Date().toISOString()
      }
    ];
    setLocalData(STORAGE_KEYS.GOALS, initialGoals);
  }

  if (!localStorage.getItem(STORAGE_KEYS.MISSION)) {
    const initialMission: Mission = {
      id: 1,
      userId: 1,
      vision: "Build high-integrity systems that reduce human decision-making biases and align daily execution with ultimate long-term lifespan impact.",
      strengths: "Systemic thinking, full-stack architecture, cognitive bias reduction",
      weaknesses: "Impulsive focus switching, high fatigue tolerance, perfectionism",
      goodHabits: "Daily morning focus definition, hydration tracking, regular code commits",
      badHabits: "Late night doom-scrolling, skipping rest days",
      personalRules: "Never make high-importance decisions when fatigued or anxious. Conduct rigorous evening reflection every day.",
      motivations: "The pursuit of cognitive clarity and continuous self-improvement.",
      neverWantToBecome: "A passive consumer who operates purely on reactionary instincts rather than strategic intent.",
      successDefinition: "Living in complete alignment with personal rules while maintaining optimal mental, emotional, and physical reserves.",
      updatedAt: new Date().toISOString()
    };
    setLocalData(STORAGE_KEYS.MISSION, initialMission);
  }

  const defaultAnalysisId = 1;
  const defaultDecisionId = 1;
  const mockAnalysis: DecisionAnalysis = {
    id: defaultAnalysisId,
    decisionId: defaultDecisionId,
    summary: "A hybrid local fallback provides maximum system resilience, letting the user access, edit, and create cards even on static CDNs like GitHub Pages.",
    prosAndCons: [
      {
        optionTitle: "Hybrid Local Fallback",
        pros: ["100% offline uptime", "Works on static GitHub Pages", "Ultra-fast response time"],
        cons: ["Requires synchronization sync-states", "Local storage size is limited to 5MB"]
      },
      {
        optionTitle: "Pure Cloud Hosting",
        pros: ["Single source of database truth", "Zero client state management overhead"],
        cons: ["Crashes with blank page if API server is offline or not configured"]
      }
    ],
    shortTermImpact: "Immediate responsiveness and zero deployment friction for the Github demo URL.",
    longTermImpact: "Robust dual-mode system architecture that handles server failures gracefully.",
    opportunityCost: "Fewer raw real-time cross-device sockets, but dramatically higher reliability.",
    potentialRisks: "Data divergence if user modifies from multiple offline devices simultaneously.",
    cognitiveBiases: "Sunk Cost Fallacy (fear of discarding previous cloud-only database code), Bias for Action (desire to write code quickly without building robust fallback layers).",
    alternativeSolutions: "Direct IndexedDB client storage, or simple JSON-file local-state caching.",
    recommendation: "Hybrid Local Fallback is highly recommended. It guarantees that Atlas OS is fully responsive, bulletproof, and interactive even when deployed on static environments like GitHub Pages, seamlessly syncing data to the local browser database.",
    confidenceScore: 95,
    reasoning: "Resilience is the ultimate metric for a personal OS. Redundancy at the database level eliminates blank screens on CDN edges.",
    createdAt: new Date().toISOString()
  };

  const mockOptions: DecisionOption[] = [
    { id: 1, decisionId: defaultDecisionId, title: "Hybrid Local Fallback", description: "Use localStorage / IndexedDB interceptor when server is absent.", isSelected: true, createdAt: new Date().toISOString() },
    { id: 2, decisionId: defaultDecisionId, title: "Pure Cloud Hosting", description: "Enforce strict cloud API connection, throwing error if offline.", isSelected: false, createdAt: new Date().toISOString() }
  ];

  if (!localStorage.getItem(STORAGE_KEYS.DECISIONS)) {
    const initialDecisions: Decision[] = [
      {
        id: defaultDecisionId,
        userId: 1,
        title: "Adopt Hybrid Offline-First Architecture for Atlas OS",
        description: "Decide whether to rely 100% on a cloud database or build a seamless local-first fallback layer.",
        category: "Career",
        importance: 9,
        mood: "Clear",
        energy: "High",
        deadline: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
        availableTime: "12 hours",
        notes: "Cloud database allows cross-device sync but raises latency and offline failure rates. Fallback ensures 100% reliability.",
        options: mockOptions,
        analysis: mockAnalysis,
        status: "DECIDED",
        createdAt: new Date().toISOString()
      }
    ];
    setLocalData(STORAGE_KEYS.DECISIONS, initialDecisions);
  }

  if (!localStorage.getItem(STORAGE_KEYS.KNOWLEDGE)) {
    const initialKnowledge: KnowledgeItem[] = [
      {
        id: 1,
        userId: 1,
        title: "The Sunk Cost Fallacy: Cognitive Traps",
        content: "The tendency to continue investing in an endeavor or course of action once an investment in money, effort, or time has been made, even if the current costs outweigh the benefits.\n\nStrategy to mitigate:\n1. Focus purely on prospective future utility.\n2. Force peer feedback from an objective external frame.\n3. Keep a Decision Log (like Atlas OS) to track criteria independently from historical emotional investments.",
        category: "Framework",
        tags: "cognitive bias, decision theory, behavioral economics",
        source: "Thinking, Fast and Slow",
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        userId: 1,
        title: "Lifespan Leverages & Habit Loops",
        content: "James Clear's Atomic Habits framework highlights that systems determine outcomes, not goals. By configuring your personal mission blueprint and tracking daily alignment in Atlas OS, you establish high-integrity habit loops that automate ethical and strategic execution.",
        category: "Book",
        tags: "habit, systems, james clear",
        source: "Atomic Habits",
        createdAt: new Date().toISOString()
      }
    ];
    setLocalData(STORAGE_KEYS.KNOWLEDGE, initialKnowledge);
  }

  if (!localStorage.getItem(STORAGE_KEYS.JOURNALS)) {
    const initialJournals: JournalEntry[] = [
      {
        id: 1,
        userId: 1,
        date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // yesterday
        sleepHours: "7.8 hours",
        mood: "Clear",
        energy: "High",
        stress: "Low",
        focus: "Establish core data persistence blueprints and local storage structures.",
        challenge: "Minor syntax errors during deployment to cloud container.",
        eveningDecision: "Resolved to build a client-side interceptor for static sites.",
        eveningBest: "Build completed perfectly and successfully synced with client.",
        eveningWorst: "Spent 40 minutes debugging a trailing slash in Vite base config.",
        followedPriorities: "Yes, focused entirely on persistence layer first.",
        regret: "None. Operated with high integrity and patience.",
        lessons: "Automated routing fallbacks prevent manual integration mistakes.",
        gratitude: "Grateful for robust compilation tooling and clear, responsive interfaces.",
        createdAt: new Date(Date.now() - 86400000).toISOString()
      }
    ];
    setLocalData(STORAGE_KEYS.JOURNALS, initialJournals);
  }
};

export const initStaticFallback = async () => {
  let isBackendAvailable = false;

  try {
    // Perform a fast, non-blocking check to see if the server API is reachable
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);
    
    const checkRes = await window.fetch('/api/health', { 
      signal: controller.signal,
      headers: { 'Cache-Control': 'no-cache' }
    });
    clearTimeout(timeoutId);
    
    if (checkRes.ok) {
      const data = await checkRes.json();
      if (data && data.status === 'ok') {
        isBackendAvailable = true;
        console.log('Atlas Server Backend is online. Connected to PostgreSQL.');
      }
    }
  } catch (err) {
    console.warn('Atlas Server Backend is offline or unreachable. Initializing local storage fallback database...', err);
  }

  // Force fallback if we are on GitHub Pages (*.github.io)
  if (window.location.hostname.includes('github.io')) {
    isBackendAvailable = false;
    console.log('GitHub Pages deployment detected. Activating Client-Side Local Storage Fallback Engine.');
  }

  if (isBackendAvailable) {
    return; // Do nothing, let requests go to the real server
  }

  // Seed the mock databases
  seedInitialData();

  // Reference the original fetch
  const originalFetch = window.fetch;

  // Intercept fetch
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const urlStr = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    
    // Only intercept /api/ routes
    if (!urlStr.includes('/api/')) {
      return originalFetch(input, init);
    }

    console.log(`[Static Fallback DB] Intercepted Request: ${init?.method || 'GET'} ${urlStr}`);

    try {
      // 1. Health check
      if (urlStr.endsWith('/api/health')) {
        return new Response(JSON.stringify({ status: 'ok', mode: 'static-fallback' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // 2. User Sync
      if (urlStr.includes('/api/users/sync')) {
        const mockUser = {
          id: 1,
          email: 'local.strategist@atlas.os',
          displayName: 'Local Strategist',
          createdAt: new Date().toISOString()
        };
        return new Response(JSON.stringify(mockUser), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // 3. Missions (Blueprint)
      if (urlStr.includes('/api/missions')) {
        if (init?.method === 'PUT') {
          const body = JSON.parse(init.body as string);
          const current = getLocalData<any>(STORAGE_KEYS.MISSION, {});
          const updated = { ...current, ...body, id: 1, userId: 1, updatedAt: new Date().toISOString() };
          setLocalData(STORAGE_KEYS.MISSION, updated);
          return new Response(JSON.stringify(updated), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        } else {
          const mission = getLocalData<any>(STORAGE_KEYS.MISSION, {});
          return new Response(JSON.stringify(mission), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }

      // 4. Goals
      if (urlStr.includes('/api/goals')) {
        const urlObj = new URL(urlStr, window.location.origin);
        const pathSegments = urlObj.pathname.split('/');
        
        if (init?.method === 'POST') {
          const body = JSON.parse(init.body as string);
          const goals = getLocalData<Goal[]>(STORAGE_KEYS.GOALS, []);
          const newGoal: Goal = {
            id: Date.now(),
            userId: 1,
            title: body.title,
            description: body.description || '',
            category: body.category || 'career',
            progress: 0,
            status: 'PENDING',
            targetDate: body.targetDate || new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
            createdAt: new Date().toISOString()
          };
          goals.unshift(newGoal);
          setLocalData(STORAGE_KEYS.GOALS, goals);
          return new Response(JSON.stringify(newGoal), {
            status: 201,
            headers: { 'Content-Type': 'application/json' }
          });
        } else if (init?.method === 'PUT') {
          // Check for specific goal update
          const goalId = parseInt(pathSegments[pathSegments.length - 1]);
          const body = JSON.parse(init.body as string);
          const goals = getLocalData<Goal[]>(STORAGE_KEYS.GOALS, []);
          const updatedGoals = goals.map(g => {
            if (g.id === goalId) {
              return { ...g, ...body };
            }
            return g;
          });
          setLocalData(STORAGE_KEYS.GOALS, updatedGoals);
          const updated = updatedGoals.find(g => g.id === goalId);
          return new Response(JSON.stringify(updated), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        } else if (init?.method === 'DELETE') {
          const goalId = parseInt(pathSegments[pathSegments.length - 1]);
          const goals = getLocalData<Goal[]>(STORAGE_KEYS.GOALS, []);
          const filtered = goals.filter(g => g.id !== goalId);
          setLocalData(STORAGE_KEYS.GOALS, filtered);
          return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        } else {
          // GET goals
          const goals = getLocalData<Goal[]>(STORAGE_KEYS.GOALS, []);
          return new Response(JSON.stringify(goals), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }

      // 5. Decisions
      if (urlStr.includes('/api/decisions')) {
        const urlObj = new URL(urlStr, window.location.origin);
        const pathSegments = urlObj.pathname.split('/');

        if (init?.method === 'POST') {
          const body = JSON.parse(init.body as string);
          const decisions = getLocalData<Decision[]>(STORAGE_KEYS.DECISIONS, []);
          
          const decisionId = Date.now();
          const optionsList = body.options || [];
          const formattedOptions: DecisionOption[] = optionsList.map((o: any, idx: number) => ({
            id: idx + 1,
            decisionId: decisionId,
            title: o.title || `Option ${String.fromCharCode(65 + idx)}`,
            description: o.description || '',
            isSelected: false,
            createdAt: new Date().toISOString()
          }));

          const optionNames = formattedOptions.map(o => o.title);
          const optionScores: Record<string, number> = {};
          optionNames.forEach((name, i) => {
            optionScores[name] = Math.round(70 + Math.random() * 25 - (i * 8));
          });

          const bestOptionName = Object.entries(optionScores).sort((a, b) => b[1] - a[1])[0][0];

          const localAiAnalysis: DecisionAnalysis = {
            id: decisionId + 10,
            decisionId: decisionId,
            summary: `Local evaluation of decision parameters. Based on high importance rating (${body.importance}/10) and current state (Mood: ${body.mood}, Energy: ${body.energy}), we mapped risks against defined personal rules.`,
            prosAndCons: formattedOptions.map(o => ({
              optionTitle: o.title,
              pros: ["Immediate option clarity", "Aligned with strategic goals"],
              cons: ["Resource commitment required"]
            })),
            shortTermImpact: "Clear immediate direction with reduced choice paralysis.",
            longTermImpact: "Structured decision hygiene establishing standard risk profiles.",
            opportunityCost: "Focus bandwidth spent on evaluation instead of quick actions.",
            potentialRisks: "Incomplete local evaluation ruleset.",
            cognitiveBiases: "Status Quo Bias (reluctance to transition away from historical comfortzones), Overoptimism (underestimating timeframe friction).",
            alternativeSolutions: "No alternative client path selected.",
            recommendation: `The strategic recommendation is to prioritize ${bestOptionName}. It presents the highest immediate leverage and maintains the largest amount of secondary flexibility, aligned directly with your personal rules.`,
            confidenceScore: 85,
            reasoning: `Analysis of metrics suggest that ${bestOptionName} offers optimal short-term traction with minimal integration overhead.`,
            createdAt: new Date().toISOString()
          };

          const newDecision: Decision = {
            id: decisionId,
            userId: 1,
            title: body.title,
            description: body.description,
            category: body.category || 'Career',
            importance: parseInt(body.importance) || 5,
            mood: body.mood || 'Neutral',
            energy: body.energy || 'Medium',
            deadline: body.deadline || '',
            availableTime: body.availableTime || '',
            notes: body.notes || '',
            options: formattedOptions,
            analysis: localAiAnalysis,
            status: 'PENDING',
            createdAt: new Date().toISOString(),
          };

          decisions.unshift(newDecision);
          setLocalData(STORAGE_KEYS.DECISIONS, decisions);
          return new Response(JSON.stringify(newDecision), {
            status: 201,
            headers: { 'Content-Type': 'application/json' }
          });
        } else if (init?.method === 'PUT' && urlStr.includes('/status')) {
          const decisionId = parseInt(pathSegments[pathSegments.length - 2]);
          const body = JSON.parse(init.body as string);
          const decisions = getLocalData<Decision[]>(STORAGE_KEYS.DECISIONS, []);
          const updatedDecisions = decisions.map(d => {
            if (d.id === decisionId) {
              const updatedOptions = d.options.map(opt => ({
                ...opt,
                isSelected: opt.id === body.selectedOptionId
              }));
              return { ...d, status: body.status, selectedOptionId: body.selectedOptionId, options: updatedOptions };
            }
            return d;
          });
          setLocalData(STORAGE_KEYS.DECISIONS, updatedDecisions);
          const updated = updatedDecisions.find(d => d.id === decisionId);
          return new Response(JSON.stringify(updated), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        } else if (init?.method === 'DELETE') {
          const decisionId = parseInt(pathSegments[pathSegments.length - 1]);
          const decisions = getLocalData<Decision[]>(STORAGE_KEYS.DECISIONS, []);
          const filtered = decisions.filter(d => d.id !== decisionId);
          setLocalData(STORAGE_KEYS.DECISIONS, filtered);
          return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        } else {
          // GET decisions
          const decisions = getLocalData<Decision[]>(STORAGE_KEYS.DECISIONS, []);
          return new Response(JSON.stringify(decisions), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }

      // 6. Knowledge
      if (urlStr.includes('/api/knowledge')) {
        const urlObj = new URL(urlStr, window.location.origin);
        const pathSegments = urlObj.pathname.split('/');

        if (init?.method === 'POST') {
          const body = JSON.parse(init.body as string);
          const items = getLocalData<KnowledgeItem[]>(STORAGE_KEYS.KNOWLEDGE, []);
          const newItem: KnowledgeItem = {
            id: Date.now(),
            userId: 1,
            title: body.title,
            content: body.content,
            category: body.category || 'Framework',
            tags: body.tags || '',
            source: body.source || '',
            createdAt: new Date().toISOString()
          };
          items.unshift(newItem);
          setLocalData(STORAGE_KEYS.KNOWLEDGE, items);
          return new Response(JSON.stringify(newItem), {
            status: 201,
            headers: { 'Content-Type': 'application/json' }
          });
        } else if (init?.method === 'DELETE') {
          const itemId = parseInt(pathSegments[pathSegments.length - 1]);
          const items = getLocalData<KnowledgeItem[]>(STORAGE_KEYS.KNOWLEDGE, []);
          const filtered = items.filter(item => item.id !== itemId);
          setLocalData(STORAGE_KEYS.KNOWLEDGE, filtered);
          return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        } else {
          // GET knowledge
          const items = getLocalData<KnowledgeItem[]>(STORAGE_KEYS.KNOWLEDGE, []);
          return new Response(JSON.stringify(items), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }

      // 7. Journal
      if (urlStr.includes('/api/journal')) {
        const urlObj = new URL(urlStr, window.location.origin);
        const journals = getLocalData<JournalEntry[]>(STORAGE_KEYS.JOURNALS, []);

        if (urlStr.includes('/by-date')) {
          const targetDate = urlObj.searchParams.get('date') || new Date().toISOString().split('T')[0];
          const entry = journals.find(j => j.date === targetDate);
          return new Response(JSON.stringify(entry || null), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        } else if (urlStr.includes('/history')) {
          const sorted = [...journals].sort((a, b) => b.date.localeCompare(a.date));
          return new Response(JSON.stringify(sorted), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        } else if (init?.method === 'POST') {
          const body = JSON.parse(init.body as string);
          let targetEntry: JournalEntry;
          const existsIdx = journals.findIndex(j => j.date === body.date);

          if (existsIdx >= 0) {
            journals[existsIdx] = {
              ...journals[existsIdx],
              ...body,
            };
            targetEntry = journals[existsIdx];
          } else {
            targetEntry = {
              id: Date.now(),
              userId: 1,
              ...body,
              createdAt: new Date().toISOString()
            };
            journals.unshift(targetEntry);
          }
          setLocalData(STORAGE_KEYS.JOURNALS, journals);
          return new Response(JSON.stringify(targetEntry), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }

      // 8. AI Recommendations for Dashboard Briefing
      if (urlStr.includes('/api/dashboard/recommendation')) {
        const journals = getLocalData<JournalEntry[]>(STORAGE_KEYS.JOURNALS, []);
        const goals = getLocalData<Goal[]>(STORAGE_KEYS.GOALS, []);
        
        const latestJournal = journals[0];

        const currentMood = latestJournal?.mood || 'Balanced';
        const currentStress = latestJournal?.stress || 'Low';

        let headline = 'Strategic Equilibrium Maintained';
        let focusAdvice = 'Your emotional alignment telemetry points to a balanced focus envelope. Double down on irreversible, high-leverage code architecture today.';
        let warningsOrBiases = 'Beware of immediate comfort biases or hyper-focus loops that prevent high-level code architecture reviews.';
        let alignedHabitToPractice = 'Rigorous Evening Reflection: Audit exactly where your code, design time, and cognitive resources were deployed.';
        let microAction = 'Review open files, prune unused boilerplate blocks, and write clear commits.';

        if (currentStress === 'High' || currentMood === 'Overwhelmed') {
          headline = 'Mitigate Cognitive Overload';
          focusAdvice = 'Current stress metrics indicate a warning zone. Restructure objectives into single-task cycles. Delegate non-critical pipeline friction.';
          warningsOrBiases = 'Action Bias (feeling the urge to code continuously without taking breaks or structure design parameters first).';
          alignedHabitToPractice = 'Strategic Pauses: Walk away from the keyboard for 15 minutes before making structural database commits.';
          microAction = 'Outline a 3-bullet design checklist before executing.';
        } else if (currentMood === 'Fatigued') {
          headline = 'Resource Reserve Recovery';
          focusAdvice = 'Physical or mental reserves are running thin. Allocate today purely to clean documentation, code formatting, or lightweight refactoring.';
          warningsOrBiases = 'Premature Optimization (writing complex recursive blocks when standard linear methods are faster and easier to parse).';
          alignedHabitToPractice = 'Strict Timeboxing: End code sessions exactly at the planned hour to restore sleep quotas.';
          microAction = 'Shut down development server by 10 PM tonight.';
        } else if (currentMood === 'Inspired') {
          headline = 'Expedite Strategic Breakthroughs';
          focusAdvice = 'Inspiration levels are at peak reserves. Today is your window to design and code complex architectural improvements or dynamic user interfaces.';
          warningsOrBiases = 'Scope Creep (getting distracted by shiny new sub-features that are completely unrelated to your core task).';
          alignedHabitToPractice = 'Strict Scope Containment: Constrain your implementation to the literal guidelines of the current ticket.';
          microAction = 'Commit your core modules before starting any secondary UI styling.';
        }

        const recommendation: DashboardRecommendation = {
          headline,
          focusAdvice,
          warningsOrBiases,
          alignedHabitToPractice,
          microAction
        };

        return new Response(JSON.stringify(recommendation), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // 9. Insights compiling
      if (urlStr.includes('/api/insights')) {
        const journals = getLocalData<JournalEntry[]>(STORAGE_KEYS.JOURNALS, []);
        const decisions = getLocalData<Decision[]>(STORAGE_KEYS.DECISIONS, []);
        const goals = getLocalData<Goal[]>(STORAGE_KEYS.GOALS, []);

        // Compile mood timeline trends
        const moodTimeline = [...journals]
          .sort((a, b) => a.date.localeCompare(b.date))
          .map(j => ({
            date: j.date,
            mood: j.mood || 'Neutral',
            energy: j.energy || 'Medium',
            stress: j.stress || 'Low'
          }));

        // Compile decision categories
        const categoriesMap: Record<string, number> = {};
        decisions.forEach(d => {
          const cat = d.category || 'Career';
          categoriesMap[cat] = (categoriesMap[cat] || 0) + 1;
        });

        // Compile cognitive biases count
        const biasesMap: Record<string, number> = {
          "Sunk Cost Fallacy": 0,
          "Confirmation Bias": 0,
          "Action Bias": 0
        };
        decisions.forEach(d => {
          if (d.analysis && d.analysis.cognitiveBiases) {
            if (d.analysis.cognitiveBiases.toLowerCase().includes('sunk cost')) biasesMap["Sunk Cost Fallacy"]++;
            if (d.analysis.cognitiveBiases.toLowerCase().includes('confirmation')) biasesMap["Confirmation Bias"]++;
            if (d.analysis.cognitiveBiases.toLowerCase().includes('action')) biasesMap["Action Bias"]++;
          }
        });

        // Calculate goal progress
        const totalGoals = goals.length;
        const avgProgress = totalGoals > 0 
          ? Math.round(goals.reduce((acc, g) => acc + g.progress, 0) / totalGoals) 
          : 0;

        const insights: InsightsData = {
          decisionsCount: decisions.length,
          journalEntriesCount: journals.length,
          goalProgress: {
            total: totalGoals,
            completed: goals.filter(g => g.status === 'COMPLETED').length,
            pending: goals.filter(g => g.status !== 'COMPLETED').length,
            avgProgress: avgProgress
          },
          moodTrends: moodTimeline,
          decisionCategories: categoriesMap,
          cognitiveBiases: biasesMap
        };

        return new Response(JSON.stringify(insights), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Return a basic 404 for any other API route
      return new Response(JSON.stringify({ error: 'Route not mocked in static fallback mode' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (err) {
      console.error('[Static Fallback DB Error]', err);
      return new Response(JSON.stringify({ error: 'Fallback processing error', details: String(err) }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  };
};
