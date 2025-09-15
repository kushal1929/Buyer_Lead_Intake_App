import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertLeadSchema, updateLeadSchema, insertUserSchema } from "@shared/schema";
import { z } from "zod";
import rateLimit from "express-rate-limit";

// Rate limiting middleware
const createLeadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per windowMs
  message: { error: "Too many lead creation attempts, please try again later." },
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: "Too many requests, please try again later." },
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Apply rate limiting to all API routes
  app.use("/api", generalLimiter);

  // User routes
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation failed", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create user" });
      }
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // Lead routes
  app.get("/api/leads", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;

      // Parse filters
      const filters = {
        propertyType: req.query.propertyType as string,
        status: req.query.status as string,
        priority: req.query.priority as string,
        source: req.query.source as string,
        bhkType: req.query.bhkType as string,
        minBudget: req.query.minBudget ? parseInt(req.query.minBudget as string) : undefined,
        maxBudget: req.query.maxBudget ? parseInt(req.query.maxBudget as string) : undefined,
        location: req.query.location as string,
      };

      // Remove undefined values
      Object.keys(filters).forEach(key => {
        if (filters[key as keyof typeof filters] === undefined || filters[key as keyof typeof filters] === "") {
          delete filters[key as keyof typeof filters];
        }
      });

      let result;
      if (search) {
        const leads = await storage.searchLeads(userId, search, filters);
        result = {
          leads: leads.slice((page - 1) * limit, page * limit),
          total: leads.length,
          page,
          limit,
          totalPages: Math.ceil(leads.length / limit),
        };
      } else {
        result = await storage.getLeadsWithPagination(userId, page, limit, filters);
      }

      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch leads" });
    }
  });

  app.get("/api/leads/:id", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }

      const lead = await storage.getLead(req.params.id, userId);
      if (!lead) {
        return res.status(404).json({ error: "Lead not found" });
      }
      res.json(lead);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch lead" });
    }
  });

  app.post("/api/leads", createLeadLimiter, async (req, res) => {
    try {
      const userId = req.body.userId;
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }

      const leadData = insertLeadSchema.parse(req.body);
      const lead = await storage.createLead(leadData, userId);
      res.status(201).json(lead);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation failed", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create lead" });
      }
    }
  });

  app.patch("/api/leads/:id", async (req, res) => {
    try {
      const userId = req.body.userId;
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }

      const leadData = updateLeadSchema.parse(req.body);
      const lead = await storage.updateLead(req.params.id, leadData, userId);
      if (!lead) {
        return res.status(404).json({ error: "Lead not found" });
      }
      res.json(lead);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation failed", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to update lead" });
      }
    }
  });

  app.delete("/api/leads/:id", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }

      const deleted = await storage.deleteLead(req.params.id, userId);
      if (!deleted) {
        return res.status(404).json({ error: "Lead not found" });
      }
      res.json({ message: "Lead deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete lead" });
    }
  });

  // Lead statistics
  app.get("/api/leads/stats/:userId", async (req, res) => {
    try {
      const stats = await storage.getLeadStats(req.params.userId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch lead statistics" });
    }
  });

  // Lead history
  app.get("/api/leads/:id/history", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }

      const history = await storage.getLeadHistory(req.params.id, userId);
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch lead history" });
    }
  });

  // CSV Export endpoint
  app.get("/api/leads/export/csv", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }

      const leads = await storage.getLeads(userId);
      
      // Convert leads to CSV format
      const csvHeader = "Name,Email,Phone,Property Type,BHK,Location,Min Budget,Max Budget,Status,Priority,Source,Notes,Created At\n";
      const csvData = leads.map(lead => {
        return [
          lead.name,
          lead.email,
          lead.phone,
          lead.propertyType,
          lead.bhkType || "",
          lead.preferredLocation || "",
          lead.minBudget,
          lead.maxBudget,
          lead.status,
          lead.priority,
          lead.source,
          lead.notes || "",
          lead.createdAt.toISOString(),
        ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(",");
      }).join("\n");

      const csv = csvHeader + csvData;
      
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=leads.csv");
      res.send(csv);
    } catch (error) {
      res.status(500).json({ error: "Failed to export leads" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
