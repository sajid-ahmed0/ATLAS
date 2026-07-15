import { pgTable, serial, text, integer, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Define the 'users' table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Define the 'missions' table (user identity & rules)
export const missions = pgTable('missions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
  vision: text('vision').default(''),
  strengths: text('strengths').default(''),
  weaknesses: text('weaknesses').default(''),
  badHabits: text('bad_habits').default(''),
  goodHabits: text('good_habits').default(''),
  personalRules: text('personal_rules').default(''),
  motivations: text('motivations').default(''),
  neverWantToBecome: text('never_want_to_become').default(''),
  successDefinition: text('success_definition').default(''),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Define the 'goals' table
export const goals = pgTable('goals', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(),
  description: text('description').default(''),
  category: text('category').notNull(), // health, career, wealth, personal, relationship
  progress: integer('progress').default(0), // percentage
  status: text('status').default('PENDING'), // PENDING, COMPLETED, ABANDONED
  targetDate: text('target_date').default(''),
  createdAt: timestamp('created_at').defaultNow(),
});

// Define the 'decisions' table
export const decisions = pgTable('decisions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  category: text('category').notNull(),
  importance: integer('importance').notNull(), // 1 to 10
  mood: text('mood').notNull(),
  energy: text('energy').notNull(),
  deadline: text('deadline').default(''),
  availableTime: text('available_time').default(''),
  notes: text('notes').default(''),
  status: text('status').default('PENDING'), // PENDING, DECIDED, ARCHIVED
  createdAt: timestamp('created_at').defaultNow(),
});

// Define the 'decision_options' table
export const decisionOptions = pgTable('decision_options', {
  id: serial('id').primaryKey(),
  decisionId: integer('decision_id').references(() => decisions.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(),
  description: text('description').default(''),
  isSelected: boolean('is_selected').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// Define the 'decision_analyses' table
export const decisionAnalyses = pgTable('decision_analyses', {
  id: serial('id').primaryKey(),
  decisionId: integer('decision_id').references(() => decisions.id, { onDelete: 'cascade' }).notNull().unique(),
  summary: text('summary').notNull(),
  prosAndCons: jsonb('pros_and_cons').notNull(), // Map/Array of option pros/cons
  shortTermImpact: text('short_term_impact').notNull(),
  longTermImpact: text('long_term_impact').notNull(),
  opportunityCost: text('opportunity_cost').notNull(),
  potentialRisks: text('potential_risks').notNull(),
  cognitiveBiases: text('cognitive_biases').notNull(),
  alternativeSolutions: text('alternative_solutions').notNull(),
  recommendation: text('recommendation').notNull(),
  confidenceScore: integer('confidence_score').notNull(),
  reasoning: text('reasoning').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Define the 'journal_entries' table (sleep, mood, evening reflection, etc.)
export const journalEntries = pgTable('journal_entries', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  date: text('date').notNull(), // format YYYY-MM-DD
  sleepHours: text('sleep_hours').default(''),
  mood: text('mood').default(''),
  energy: text('energy').default(''),
  stress: text('stress').default(''),
  focus: text('focus').default(''),
  challenge: text('challenge').default(''),
  eveningDecision: text('evening_decision').default(''),
  eveningBest: text('evening_best').default(''),
  eveningWorst: text('evening_worst').default(''),
  followedPriorities: text('followed_priorities').default(''),
  regret: text('regret').default(''),
  lessons: text('lessons').default(''),
  gratitude: text('gratitude').default(''),
  createdAt: timestamp('created_at').defaultNow(),
});

// Define the 'knowledge_items' table
export const knowledgeItems = pgTable('knowledge_items', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  category: text('category').notNull(), // notes, career, books, articles, ideas, projects, lessons, memories, quotes, frameworks
  tags: text('tags').default(''), // comma separated
  source: text('source').default(''),
  createdAt: timestamp('created_at').defaultNow(),
});

// Define relations for Drizzle query layer
export const usersRelations = relations(users, ({ one, many }) => ({
  mission: one(missions, {
    fields: [users.id],
    references: [missions.userId],
  }),
  goals: many(goals),
  decisions: many(decisions),
  journalEntries: many(journalEntries),
  knowledgeItems: many(knowledgeItems),
}));

export const missionsRelations = relations(missions, ({ one }) => ({
  user: one(users, {
    fields: [missions.userId],
    references: [users.id],
  }),
}));

export const goalsRelations = relations(goals, ({ one }) => ({
  user: one(users, {
    fields: [goals.userId],
    references: [users.id],
  }),
}));

export const decisionsRelations = relations(decisions, ({ one, many }) => ({
  user: one(users, {
    fields: [decisions.userId],
    references: [users.id],
  }),
  options: many(decisionOptions),
  analysis: one(decisionAnalyses, {
    fields: [decisions.id],
    references: [decisionAnalyses.decisionId],
  }),
}));

export const decisionOptionsRelations = relations(decisionOptions, ({ one }) => ({
  decision: one(decisions, {
    fields: [decisionOptions.decisionId],
    references: [decisions.id],
  }),
}));

export const decisionAnalysesRelations = relations(decisionAnalyses, ({ one }) => ({
  decision: one(decisions, {
    fields: [decisionAnalyses.decisionId],
    references: [decisions.id],
  }),
}));

export const journalEntriesRelations = relations(journalEntries, ({ one }) => ({
  user: one(users, {
    fields: [journalEntries.userId],
    references: [users.id],
  }),
}));

export const knowledgeItemsRelations = relations(knowledgeItems, ({ one }) => ({
  user: one(users, {
    fields: [knowledgeItems.userId],
    references: [users.id],
  }),
}));
