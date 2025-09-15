import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Lead, InsertLead, UpdateLead } from "@shared/schema";
import { SearchFilters } from "@/components/leads/advanced-search";

interface UseLeadsParams {
  userId: string;
  page?: number;
  limit?: number;
  filters?: SearchFilters;
  search?: string;
}

interface PaginatedLeads {
  leads: Lead[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface LeadStats {
  totalLeads: number;
  activeLeads: number;
  conversions: number;
  conversionRate: number;
  totalLeadsChange: number;
  activeLeadsChange: number;
  conversionsChange: number;
  conversionRateChange: number;
}

export function useLeads({ userId, page = 1, limit = 10, filters, search }: UseLeadsParams) {
  const queryParams = new URLSearchParams({
    userId,
    page: page.toString(),
    limit: limit.toString(),
  });

  if (search) queryParams.append("search", search);
  if (filters?.propertyType) queryParams.append("propertyType", filters.propertyType);
  if (filters?.status) queryParams.append("status", filters.status);
  if (filters?.priority) queryParams.append("priority", filters.priority);
  if (filters?.source) queryParams.append("source", filters.source);
  if (filters?.bhkType) queryParams.append("bhkType", filters.bhkType);
  if (filters?.minBudget) queryParams.append("minBudget", filters.minBudget.toString());
  if (filters?.maxBudget) queryParams.append("maxBudget", filters.maxBudget.toString());
  if (filters?.location) queryParams.append("location", filters.location);

  return useQuery<PaginatedLeads>({
    queryKey: ["/api/leads", userId, page, limit, filters, search],
    queryFn: async () => {
      const response = await fetch(`/api/leads?${queryParams}`);
      if (!response.ok) {
        throw new Error("Failed to fetch leads");
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useLeadStats(userId: string) {
  return useQuery<LeadStats>({
    queryKey: ["/api/leads/stats", userId],
    queryFn: async () => {
      const response = await fetch(`/api/leads/stats/${userId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch lead stats");
      }
      return response.json();
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useCreateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: InsertLead & { userId: string }) => {
      const response = await apiRequest("POST", "/api/leads", data);
      return response.json();
    },
    onSuccess: (_, variables) => {
      // Invalidate leads queries
      queryClient.invalidateQueries({ queryKey: ["/api/leads", variables.userId] });
      queryClient.invalidateQueries({ queryKey: ["/api/leads/stats", variables.userId] });
    },
  });
}

export function useUpdateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateLead & { userId: string } }) => {
      const response = await apiRequest("PATCH", `/api/leads/${id}`, data);
      return response.json();
    },
    onSuccess: (_, variables) => {
      // Invalidate leads queries
      queryClient.invalidateQueries({ queryKey: ["/api/leads", variables.data.userId] });
      queryClient.invalidateQueries({ queryKey: ["/api/leads/stats", variables.data.userId] });
    },
  });
}

export function useDeleteLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, userId }: { id: string; userId: string }) => {
      const response = await apiRequest("DELETE", `/api/leads/${id}?userId=${userId}`);
      return response.json();
    },
    onSuccess: (_, variables) => {
      // Invalidate leads queries
      queryClient.invalidateQueries({ queryKey: ["/api/leads", variables.userId] });
      queryClient.invalidateQueries({ queryKey: ["/api/leads/stats", variables.userId] });
    },
  });
}

export function useLeadHistory(leadId: string, userId: string) {
  return useQuery({
    queryKey: ["/api/leads", leadId, "history", userId],
    queryFn: async () => {
      const response = await fetch(`/api/leads/${leadId}/history?userId=${userId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch lead history");
      }
      return response.json();
    },
    enabled: !!leadId && !!userId,
  });
}
