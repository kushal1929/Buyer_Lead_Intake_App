import { type User, type InsertUser, type Lead, type InsertLead, type UpdateLead, type LeadHistory, type InsertLeadHistory } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Lead operations
  getLeads(userId: string, filters?: LeadFilters): Promise<LeadWithStats[]>;
  getLead(id: string, userId: string): Promise<Lead | undefined>;
  createLead(lead: InsertLead, userId: string): Promise<Lead>;
  updateLead(id: string, lead: UpdateLead, userId: string): Promise<Lead | undefined>;
  deleteLead(id: string, userId: string): Promise<boolean>;
  
  // Lead statistics
  getLeadStats(userId: string): Promise<LeadStats>;
  
  // Lead history
  getLeadHistory(leadId: string, userId: string): Promise<LeadHistory[]>;
  addLeadHistory(history: InsertLeadHistory): Promise<LeadHistory>;
  
  // Search and pagination
  searchLeads(userId: string, query: string, filters?: LeadFilters): Promise<LeadWithStats[]>;
  getLeadsWithPagination(userId: string, page: number, limit: number, filters?: LeadFilters): Promise<PaginatedLeads>;
}

export interface LeadFilters {
  propertyType?: string;
  status?: string;
  priority?: string;
  source?: string;
  bhkType?: string;
  minBudget?: number;
  maxBudget?: number;
  location?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface LeadStats {
  totalLeads: number;
  activeLeads: number;
  conversions: number;
  conversionRate: number;
  totalLeadsChange: number;
  activeLeadsChange: number;
  conversionsChange: number;
  conversionRateChange: number;
}

export interface LeadWithStats extends Lead {
  lastActivityType?: string;
  initials?: string;
}

export interface PaginatedLeads {
  leads: LeadWithStats[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private leads: Map<string, Lead>;
  private leadHistory: Map<string, LeadHistory>;

  constructor() {
    this.users = new Map();
    this.leads = new Map();
    this.leadHistory = new Map();
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  // Lead operations
  async getLeads(userId: string, filters?: LeadFilters): Promise<LeadWithStats[]> {
    const userLeads = Array.from(this.leads.values())
      .filter(lead => lead.userId === userId)
      .filter(lead => this.applyFilters(lead, filters));

    return userLeads.map(lead => ({
      ...lead,
      initials: this.getInitials(lead.name),
      lastActivityType: this.getLastActivityType(lead.id),
    }));
  }

  async getLead(id: string, userId: string): Promise<Lead | undefined> {
    const lead = this.leads.get(id);
    if (lead && lead.userId === userId) {
      return lead;
    }
    return undefined;
  }

  async createLead(insertLead: InsertLead, userId: string): Promise<Lead> {
    const id = randomUUID();
    const now = new Date();
    const lead: Lead = {
      ...insertLead,
      id,
      userId,
      source: insertLead.source || "website",
      createdAt: now,
      updatedAt: now,
      lastActivityAt: now,
    };
    this.leads.set(id, lead);

    // Add creation history
    await this.addLeadHistory({
      leadId: id,
      action: "created",
      newValue: lead,
      notes: "Lead created",
    });

    return lead;
  }

  async updateLead(id: string, updateLead: UpdateLead, userId: string): Promise<Lead | undefined> {
    const existingLead = await this.getLead(id, userId);
    if (!existingLead) {
      return undefined;
    }

    const updatedLead: Lead = {
      ...existingLead,
      ...updateLead,
      updatedAt: new Date(),
      lastActivityAt: new Date(),
    };

    this.leads.set(id, updatedLead);

    // Add update history
    await this.addLeadHistory({
      leadId: id,
      action: "updated",
      previousValue: existingLead,
      newValue: updatedLead,
      notes: "Lead updated",
    });

    return updatedLead;
  }

  async deleteLead(id: string, userId: string): Promise<boolean> {
    const lead = await this.getLead(id, userId);
    if (!lead) {
      return false;
    }

    this.leads.delete(id);

    // Add deletion history
    await this.addLeadHistory({
      leadId: id,
      action: "deleted",
      previousValue: lead,
      notes: "Lead deleted",
    });

    return true;
  }

  async getLeadStats(userId: string): Promise<LeadStats> {
    const userLeads = Array.from(this.leads.values()).filter(lead => lead.userId === userId);
    const totalLeads = userLeads.length;
    const activeLeads = userLeads.filter(lead => lead.status !== "closed").length;
    const conversions = userLeads.filter(lead => lead.status === "converted").length;
    const conversionRate = totalLeads > 0 ? (conversions / totalLeads) * 100 : 0;

    // Mock percentage changes (in real app, would compare with previous period)
    return {
      totalLeads,
      activeLeads,
      conversions,
      conversionRate,
      totalLeadsChange: 12,
      activeLeadsChange: 8,
      conversionsChange: -3,
      conversionRateChange: 2,
    };
  }

  async getLeadHistory(leadId: string, userId: string): Promise<LeadHistory[]> {
    const lead = await this.getLead(leadId, userId);
    if (!lead) {
      return [];
    }

    return Array.from(this.leadHistory.values())
      .filter(history => history.leadId === leadId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async addLeadHistory(insertHistory: InsertLeadHistory): Promise<LeadHistory> {
    const id = randomUUID();
    const history: LeadHistory = {
      ...insertHistory,
      id,
      userId: "system", // In real app, would get from context
      notes: insertHistory.notes || null,
      createdAt: new Date(),
    };
    this.leadHistory.set(id, history);
    return history;
  }

  async searchLeads(userId: string, query: string, filters?: LeadFilters): Promise<LeadWithStats[]> {
    const userLeads = await this.getLeads(userId, filters);
    
    if (!query.trim()) {
      return userLeads;
    }

    const searchTerm = query.toLowerCase();
    return userLeads.filter(lead => 
      lead.name.toLowerCase().includes(searchTerm) ||
      lead.email.toLowerCase().includes(searchTerm) ||
      lead.phone.includes(searchTerm) ||
      lead.preferredLocation?.toLowerCase().includes(searchTerm) ||
      lead.notes?.toLowerCase().includes(searchTerm)
    );
  }

  async getLeadsWithPagination(userId: string, page: number, limit: number, filters?: LeadFilters): Promise<PaginatedLeads> {
    const allLeads = await this.getLeads(userId, filters);
    const total = allLeads.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const leads = allLeads.slice(offset, offset + limit);

    return {
      leads,
      total,
      page,
      limit,
      totalPages,
    };
  }

  private applyFilters(lead: Lead, filters?: LeadFilters): boolean {
    if (!filters) return true;

    if (filters.propertyType && lead.propertyType !== filters.propertyType) return false;
    if (filters.status && lead.status !== filters.status) return false;
    if (filters.priority && lead.priority !== filters.priority) return false;
    if (filters.source && lead.source !== filters.source) return false;
    if (filters.bhkType && lead.bhkType !== filters.bhkType) return false;
    if (filters.minBudget && lead.maxBudget < filters.minBudget) return false;
    if (filters.maxBudget && lead.minBudget > filters.maxBudget) return false;
    if (filters.location && !lead.preferredLocation?.toLowerCase().includes(filters.location.toLowerCase())) return false;
    if (filters.dateFrom && lead.createdAt < filters.dateFrom) return false;
    if (filters.dateTo && lead.createdAt > filters.dateTo) return false;

    return true;
  }

  private getInitials(name: string): string {
    return name
      .split(" ")
      .map(word => word.charAt(0).toUpperCase())
      .join("")
      .substring(0, 2);
  }

  private getLastActivityType(leadId: string): string {
    const activities = ["Lead created", "Phone call completed", "Email sent", "Meeting scheduled"];
    return activities[Math.floor(Math.random() * activities.length)];
  }
}

export const storage = new MemStorage();
