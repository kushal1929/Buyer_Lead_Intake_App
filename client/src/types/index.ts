export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

export interface AuthContext {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "destructive";
}

// Re-export schema types for convenience
export type { Lead, InsertLead, UpdateLead, LeadHistory } from "@shared/schema";
