import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  branch: text("branch").notNull(),
  role: text("role").notNull().default("staff"), // "staff" or "superadmin"
});

export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  queueNumber: integer("queue_number").notNull(),
  regNumber: text("reg_number").notNull(),
  customerName: text("customer_name").notNull(),
  serviceType: text("service_type").notNull(),
  status: text("status").notNull(), // Checked In, In Diagnostics, Waiting for Parts, Work in Progress, Ready for Pickup
  branch: text("branch").notNull(),
  isPriority: boolean("is_priority").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertJobSchema = createInsertSchema(jobs).omit({ id: true, createdAt: true });

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Job = typeof jobs.$inferSelect;
export type InsertJob = z.infer<typeof insertJobSchema>;
export type UpdateJobRequest = Partial<InsertJob>;
