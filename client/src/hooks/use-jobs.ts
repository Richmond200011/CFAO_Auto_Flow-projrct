import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertJob, type UpdateJobRequest, type Job } from "@shared/schema";

export type { Job };

const BASE_URL = "https://58f193b812d7.ngrok-free.app";

export function useJobs() {
  return useQuery({
    queryKey: [api.services.cards.list.path],
    queryFn: async () => {
      const res = await fetch(BASE_URL + api.services.cards.list.path);
      if (!res.ok) throw new Error("Failed to fetch jobs");
      return api.services.cards.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertJob) => {
      const res = await fetch(BASE_URL + api.services.cards.create.path, {
        method: api.services.cards.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create job");
      return api.services.cards.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.services.cards.list.path] });
    },
  });
}

export function useUpdateJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & UpdateJobRequest) => {
      const url = buildUrl(api.services.cards.update.path, { id });
      const res = await fetch(BASE_URL + url, {
        method: api.services.cards.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed to update job");
      return api.services.cards.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.services.cards.list.path] });
    },
  });
}

export function useDeleteJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.services.cards.delete.path, { id });
      const res = await fetch(BASE_URL + url, { method: api.services.cards.delete.method });
      if (!res.ok) throw new Error("Failed to delete job");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.services.cards.list.path] });
    },
  });
}
