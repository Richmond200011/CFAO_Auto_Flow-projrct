import { useQuery } from "@tanstack/react-query";
import { api } from "@/utils/api";

interface BranchStatistics {
  checkedIn: number;
  inDiagnostics: number;
  waitingParts: number;
  workInProgress: number;
  readyForPickup: number;
  totalVehicles: number;
  averageWaitTime: number;
  activeTechnicians: number;
  totalTechnicians: number;
  totalInQueue: number;
}

const fetchBranchStatistics = async (): Promise<BranchStatistics> => {
  const response = await api.get("/branches/my-statistics");
  const result = await response.json();

  console.log("Statistics API response:", result);

  const statistics: BranchStatistics = {
    checkedIn: result.data?.serviceStatusCounts?.["checked-in"] ?? 0,
    inDiagnostics: result.data?.serviceStatusCounts?.["in-diagnostics"] ?? 0,
    waitingParts: result.data?.serviceStatusCounts?.["waiting-for-parts"] ?? 0,
    workInProgress: result.data?.serviceStatusCounts?.["work-in-progress"] ?? 0,
    readyForPickup: result.data?.serviceStatusCounts?.["ready-for-pickup"] ?? 0,
    totalVehicles: result.data?.totalServices ?? 0,
    totalInQueue: result.data?.queue?.totalInQueue ?? 0,
    averageWaitTime: 0,
    activeTechnicians: 0,
    totalTechnicians: 0,
  };

  console.log("Mapped statistics:", statistics);

  return statistics;
};

export const useBranchStatistics = () => {
  return useQuery({
    queryKey: ["branch-statistics"],
    queryFn: fetchBranchStatistics,

    // Optional but recommended for dashboards
    staleTime: 30 * 1000, // data considered fresh for 30s
    refetchInterval: 60 * 1000, // auto-refetch every 1 min
    retry: 2, // retry failed requests twice
  });
};
