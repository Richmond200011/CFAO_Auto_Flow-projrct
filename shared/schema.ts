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
  brand: text("brand").notNull(),
  status: text("status").notNull(), // Checked In, In Diagnostics, Waiting for Parts, Work in Progress, Ready for Pickup
  branch: text("branch").notNull(),
  isPriority: boolean("is_priority").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertJobSchema = createInsertSchema(jobs).extend({
    customerName: z.string().min(2, { message: "Customer name must be at least 2 characters" }),
    regNumber: z.string().min(4, { message: "Registration number must be at least 4 characters" }),
    serviceType: z.string({ required_error: "Please select a service type" }).min(1, { message: "Please select a service type" }),
    brand: z.string({ required_error: "Please select a vehicle brand" }).min(1, { message: "Please select a vehicle brand" }),
}).omit({ id: true, createdAt: true });

export const formJobSchema = insertJobSchema.omit({ branch: true });

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Job = typeof jobs.$inferSelect;
export type InsertJob = z.infer<typeof insertJobSchema>;
export type FormJob = z.infer<typeof formJobSchema>;
export type UpdateJobRequest = Partial<InsertJob>;
