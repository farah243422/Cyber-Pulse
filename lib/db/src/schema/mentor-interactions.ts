import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const mentorInteractions = pgTable("mentor_interactions", {
  id: serial("id").primaryKey(),
  studentId: text("student_id").notNull(),
  studentName: text("student_name").notNull(),
  labId: text("lab_id").notNull(),
  labTitle: text("lab_title").notNull(),
  question: text("question").notNull(),
  aiResponse: text("ai_response").notNull(),
  responseLevel: integer("response_level").notNull(), // 1=Concept, 2=Hint, 3=Questions, 4=Blocked
  hintsUsed: integer("hints_used").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMentorInteractionSchema = createInsertSchema(mentorInteractions).omit({ id: true, createdAt: true });
export type MentorInteraction = typeof mentorInteractions.$inferSelect;
export type InsertMentorInteraction = typeof mentorInteractions.$inferInsert;
