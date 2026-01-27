import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { type InsertJob, type UpdateJobRequest, type Job } from "@shared/schema";

export type { Job };

const STORAGE_KEY = "autoflow:jobs";

function readJobsFromStorage(): Job[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seed: Job[] = [
        {
          id: 1,
          queueNumber: 12,
          regNumber: "GT-1234-22",
          customerName: "Aminu S.",
          serviceType: "Full Service",
          brand: "Toyota",
          status: "In Diagnostics",
          branch: "CFAO Airport Workshop",
          isPriority: false,
          createdAt: new Date(),
        },
        {
          id: 2,
          queueNumber: 13,
          regNumber: "AS-5678-21",
          customerName: "Linda A.",
          serviceType: "Oil Change (Express)",
          brand: "Mitsubishi",
          status: "Work in Progress",
          branch: "CFAO Airport Workshop",
          isPriority: true,
          createdAt: new Date(),
        },
      ];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    return JSON.parse(raw) as Job[];
  } catch (e) {
    return [];
  }
}

function writeJobsToStorage(list: Job[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    // ignore
  }
}

export function useJobs() {
  return useQuery({
    queryKey: [api.jobs.list.path],
    queryFn: async () => {
      return readJobsFromStorage();
    },
  });
}

export function useCreateJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertJob) => {
      const list = readJobsFromStorage();
      const maxId = list.reduce((m, j) => (j.id && j.id > m ? j.id : m), 0);
      const id = maxId + 1;
      const job: Job = {
        id,
        queueNumber: data.queueNumber || 0,
        regNumber: data.regNumber,
        customerName: data.customerName,
        serviceType: data.serviceType,
        brand: (data as any).brand,
        status: data.status,
        branch: (data as any).branch || "CFAO Airport",
        isPriority: !!data.isPriority,
        createdAt: new Date(),
      };
      const out = [...list, job];
      writeJobsToStorage(out);
      return job;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.jobs.list.path] });
    },
  });
}

export function useUpdateJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & UpdateJobRequest) => {
      const list = readJobsFromStorage();
      const idx = list.findIndex((j) => j.id === id);
      if (idx === -1) throw new Error("Job not found");
      const existing = list[idx];
      const updated: Job = { ...existing, ...(updates as Partial<Job>) };
      list[idx] = updated;
      writeJobsToStorage(list);
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.jobs.list.path] });
    },
  });
}

export function useDeleteJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const list = readJobsFromStorage();
      const out = list.filter((j) => j.id !== id);
      writeJobsToStorage(out);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.jobs.list.path] });
    },
  });
}
