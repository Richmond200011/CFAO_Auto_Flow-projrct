import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import {
  type InsertJob,
  type UpdateJobRequest,
  type Job,
} from "@shared/schema";

export type { Job };

const BASE_URL = "http://localhost:3000";

export function useJobs() {
  return useQuery({
    queryKey: [api.services.cards.list.path],
    queryFn: async () => {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(
        BASE_URL + api.services.cards.list.path + "/my-branch",
        {
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        },
      );
      if (!res.ok) throw new Error("Failed to fetch jobs");
      const response = await res.json();
      console.log(response);

      // Map the API response to extract service data and combine with customer/agent info
      const jobs = response.data.map((item: any) => ({
        id: item.service.id,
        serviceNo: item.service.serviceNo,
        serviceType: item.service.serviceType,
        status: item.service.status,
        vehicleRegNo: item.service.vehicleRegNo,
        vehicleBrand: item.service.vehicleBrand,
        customerName: item.customer.name,
        customerPhone: item.customer.phone,
        agentName: item.agent.name,
        priority: item.service.priority,
        createdAt: item.service.createdAt,
        updatedAt: item.service.updatedAt,
        startedAt: item.service.startedAt,
        completedAt: item.service.completedAt,
        estimatedCost: item.service.estimatedCost,
        actualCost: item.service.actualCost,
        estimatedDuration: item.service.estimatedDuration,
        description: item.service.description,
        notes: item.service.notes,
        isPriority: item.service.priority === "high",
        queueNumber: item.service.serviceNo?.split("-")[1] || "N/A",
        regNumber: item.service.vehicleRegNo,
      }));

      return jobs;
    },
  });
}

export function useCreateJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(BASE_URL + "/api/v1/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create job");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["branch-statistics"],
      });
      // Note: Branch statistics will need to be refetched manually from the component
    },
  });
}

export function useUpdateJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: { id: number } & UpdateJobRequest) => {
      const token = localStorage.getItem("accessToken");
      const url = buildUrl(api.services.cards.update.path, { id });
      const res = await fetch(BASE_URL + url + "/status", {
        method: api.services.cards.update.method,
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed to update job");
      return api.services.cards.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["branch-statistics"],
      });
      // Note: Branch statistics will need to be refetched manually from the component
    },
  });
}

export function useDeleteJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const token = localStorage.getItem("accessToken");
      const url = buildUrl(api.services.cards.delete.path, { id });
      const res = await fetch(BASE_URL + url, {
        method: api.services.cards.delete.method,
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      if (!res.ok) throw new Error("Failed to delete job");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["branch-statistics"],
      });
    },
  });
}
