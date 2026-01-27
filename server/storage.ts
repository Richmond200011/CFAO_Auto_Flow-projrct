import { type User, type InsertUser, type Job, type InsertJob, type UpdateJobRequest } from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Job methods
  getJobs(branch?: string): Promise<Job[]>;
  getJob(id: number): Promise<Job | undefined>;
  createJob(job: InsertJob): Promise<Job>;
  updateJob(id: number, updates: UpdateJobRequest): Promise<Job>;
  deleteJob(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private jobs: Map<number, Job>;
  private currentUserId: number;
  private currentJobId: number;

  constructor() {
    this.users = new Map();
    this.jobs = new Map();
    this.currentUserId = 1;
    this.currentJobId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id, role: insertUser.role || "staff" };
    this.users.set(id, user);
    return user;
  }

  async getJobs(branch?: string): Promise<Job[]> {
    const allJobs = Array.from(this.jobs.values());
    if (branch && branch !== "All Branches") {
      return allJobs.filter(j => j.branch === branch);
    }
    return allJobs;
  }

  async getJob(id: number): Promise<Job | undefined> {
    return this.jobs.get(id);
  }

  async createJob(insertJob: InsertJob): Promise<Job> {
    const id = this.currentJobId++;
    const job: Job = { 
        ...insertJob, 
        id,
        isPriority: insertJob.isPriority ?? false,
        createdAt: new Date() 
    };
    this.jobs.set(id, job);
    return job;
  }

  async updateJob(id: number, updates: UpdateJobRequest): Promise<Job> {
    const existingJob = this.jobs.get(id);
    if (!existingJob) {
      throw new Error(`Job with id ${id} not found`);
    }
    const updatedJob = { ...existingJob, ...updates };
    this.jobs.set(id, updatedJob);
    return updatedJob;
  }

  async deleteJob(id: number): Promise<void> {
    this.jobs.delete(id);
  }
}

export const storage = new MemStorage();
