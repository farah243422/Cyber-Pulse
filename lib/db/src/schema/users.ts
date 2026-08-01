import { pgTable, text, boolean, timestamp } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id:                  text("id").primaryKey(),
  name:                text("name").notNull(),
  email:               text("email").notNull().unique(),
  passwordHash:        text("password_hash"),           // null for OAuth-only accounts
  role:                text("role").notNull().default("Student"),
  university:          text("university"),
  studyPlan:           text("study_plan"),
  major:               text("major"),
  githubConnected:     boolean("github_connected").notNull().default(false),
  githubUsername:      text("github_username"),
  onboardingCompleted: boolean("onboarding_completed").notNull().default(false),
  provider:            text("provider"),                // "google" for OAuth accounts
  picture:             text("picture"),
  createdAt:           timestamp("created_at").defaultNow().notNull(),
});

export type User    = typeof usersTable.$inferSelect;
export type NewUser = typeof usersTable.$inferInsert;
