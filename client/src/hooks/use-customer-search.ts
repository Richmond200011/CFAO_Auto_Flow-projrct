import { useQuery } from "@tanstack/react-query";

const BASE_URL = "http://localhost:3000";

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  branchId: string;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

export function useCustomerSearch(searchTerm: string, enabled = false) {
  return useQuery({
    queryKey: ["customers", "search", searchTerm],
    queryFn: async () => {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(
        `${BASE_URL}/api/v1/customers/search?search=${encodeURIComponent(searchTerm)}&limit=10`,
        {
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        },
      );
      if (!res.ok) throw new Error("Failed to search customers");
      const response = await res.json();
      console.log("Customer search response:", response);
      return response.data as Customer[];
    },
    enabled: enabled && searchTerm.length >= 2, // Only search when we have at least 2 characters
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}
