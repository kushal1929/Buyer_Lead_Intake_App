import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const propertyTypeEnum = pgEnum("property_type", ["residential", "commercial", "industrial", "land"]);
export const leadStatusEnum = pgEnum("lead_status", ["new", "contacted", "qualified", "converted", "closed"]);
export const leadPriorityEnum = pgEnum("lead_priority", ["low", "medium", "high"]);
export const leadSourceEnum = pgEnum("lead_source", ["website", "referral", "social", "advertisement", "other"]);
export const bhkTypeEnum = pgEnum("bhk_type", ["1bhk", "2bhk", "3bhk", "4bhk", "5bhk"]);

export const leads = pgTable("leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  
  // Personal Information
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  
  // Property Requirements
  propertyType: propertyTypeEnum("property_type").notNull(),
  bhkType: bhkTypeEnum("bhk_type"),
  preferredLocation: text("preferred_location"),
  minBudget: integer("min_budget").notNull(),
  maxBudget: integer("max_budget").notNull(),
  
  // Lead Management
  status: leadStatusEnum("status").default("new").notNull(),
  priority: leadPriorityEnum("priority").default("medium").notNull(),
  source: leadSourceEnum("source").default("website").notNull(),
  notes: text("notes"),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  lastActivityAt: timestamp("last_activity_at").defaultNow().notNull(),
});

export const leadHistory = pgTable("lead_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  leadId: varchar("lead_id").references(() => leads.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  action: text("action").notNull(),
  previousValue: jsonb("previous_value"),
  newValue: jsonb("new_value"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
  lastActivityAt: true,
}).extend({
  // Add validation rules
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  minBudget: z.number().min(0, "Budget must be positive"),
  maxBudget: z.number().min(0, "Budget must be positive"),
}).refine((data) => data.maxBudget >= data.minBudget, {
  message: "Max budget must be greater than or equal to min budget",
  path: ["maxBudget"],
}).refine((data) => {
  // BHK is required for residential properties
  if (data.propertyType === "residential" && !data.bhkType) {
    return false;
  }
  return true;
}, {
  message: "BHK configuration is required for residential properties",
  path: ["bhkType"],
});

export const updateLeadSchema = insertLeadSchema.partial();

export const insertLeadHistorySchema = createInsertSchema(leadHistory).omit({
  id: true,
  userId: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Lead = typeof leads.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type UpdateLead = z.infer<typeof updateLeadSchema>;

export type LeadHistory = typeof leadHistory.$inferSelect;
export type InsertLeadHistory = z.infer<typeof insertLeadHistorySchema>;

// Enums for frontend
export const PropertyType = {
  RESIDENTIAL: "residential" as const,
  COMMERCIAL: "commercial" as const,
  INDUSTRIAL: "industrial" as const,
  LAND: "land" as const,
};

export const LeadStatus = {
  NEW: "new" as const,
  CONTACTED: "contacted" as const,
  QUALIFIED: "qualified" as const,
  CONVERTED: "converted" as const,
  CLOSED: "closed" as const,
};

export const LeadPriority = {
  LOW: "low" as const,
  MEDIUM: "medium" as const,
  HIGH: "high" as const,
};

export const LeadSource = {
  WEBSITE: "website" as const,
  REFERRAL: "referral" as const,
  SOCIAL: "social" as const,
  ADVERTISEMENT: "advertisement" as const,
  OTHER: "other" as const,
};

export const BHKType = {
  ONE_BHK: "1bhk" as const,
  TWO_BHK: "2bhk" as const,
  THREE_BHK: "3bhk" as const,
  FOUR_BHK: "4bhk" as const,
  FIVE_BHK: "5bhk" as const,
};
