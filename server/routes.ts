import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // -- SEED DATA --
  const existingUsers = await storage.getUserByUsername("sarah@autoflow.com");
  if (!existingUsers) {
    await storage.createUser({
      username: "sarah@autoflow.com",
      password: "password123",
      branch: "CFAO Airport Workshop",
      role: "staff"
    });
    await storage.createUser({
      username: "admin@autoflow.com",
      password: "adminpassword",
      branch: "All Branches",
      role: "superadmin"
    });
  }

  const jobs = await storage.getJobs();
  if (jobs.length === 0) {
    await storage.createJob({
      queueNumber: 12,
      regNumber: "GT-1234-22",
      customerName: "Aminu S.",
      serviceType: "Full Service",
      brand: "Toyota",
      status: "In Diagnostics",
      branch: "CFAO Airport Workshop",
      isPriority: false
    });
    await storage.createJob({
      queueNumber: 13,
      regNumber: "AS-5678-21",
      customerName: "Linda A.",
      serviceType: "Oil Change (Express)",
      brand: "Mitsubishi",
      status: "Work in Progress",
      branch: "CFAO Airport Workshop",
      isPriority: true
    });
  }

  // -- API ROUTES --

  app.post("/api/login", async (req, res) => {
    const { username, password } = req.body;
    const user = await storage.getUserByUsername(username);
    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    res.json(user);
  });

  app.get(api.jobs.list.path, async (req, res) => {
    const branch = req.query.branch as string | undefined;
    const jobs = await storage.getJobs(branch);
    res.json(jobs);
  });

  app.post(api.jobs.create.path, async (req, res) => {
    try {
      const input = api.jobs.create.input.parse(req.body);
      const job = await storage.createJob(input);
      res.status(201).json(job);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.patch(api.jobs.update.path, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const input = api.jobs.update.input.parse(req.body);
      const job = await storage.updateJob(id, input);
      res.json(job);
    } catch (err) {
        res.status(500).json({message: "Error updating job"});
    }
  });

  app.delete(api.jobs.delete.path, async (req, res) => {
      const id = Number(req.params.id);
      await storage.deleteJob(id);
      res.status(204).send();
  });

  return httpServer;
}
