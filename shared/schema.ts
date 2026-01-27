import { z } from "zod";

export const insertJobSchema = z.object({
  customerName: z.string().min(2, { message: "Customer name must be at least 2 characters" }),
  regNumber: z.string().min(4, { message: "Registration number must be at least 4 characters" }),
  serviceType: z.string({ required_error: "Please select a service type" }).min(1, { message: "Please select a service type" }),
  brand: z.string({ required_error: "Please select a vehicle brand" }).min(1, { message: "Please select a vehicle brand" }),
  status: z.string().min(1),
  branch: z.string().min(1),
  queueNumber: z.number().optional(),
  isPriority: z.boolean().optional(),
  createdAt: z.date().optional(),
});

export const formJobSchema = insertJobSchema.omit({ branch: true });

export type User = {
  id: number;
  username: string;
  password: string;
  branch: string;
  role: string;
};

export type Job = {
  id: number;
  queueNumber: number;
  regNumber: string;
  customerName: string;
  serviceType: string;
  brand: string;
  status: string;
  branch: string;
  isPriority: boolean | null;
  createdAt: Date | null;
};

export type InsertJob = z.infer<typeof insertJobSchema>;
export type FormJob = z.infer<typeof formJobSchema>;
export type UpdateJobRequest = Partial<InsertJob>;
