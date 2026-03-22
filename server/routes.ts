import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { insertLeadSchema } from "@shared/schema";
import { z } from "zod";

const VALID_CITIES = ["paris", "vincennes", "saint-mande", "saint-mandé"];

function normalizeCity(city: string): string {
  return city
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-");
}

const saveleadSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email("Invalid email format")
    .transform((v) => v.toLowerCase().trim()),
  city: z
    .string({ required_error: "City is required" })
    .refine(
      (v) => VALID_CITIES.includes(normalizeCity(v)),
      "City must be Paris, Vincennes, or Saint-Mandé"
    ),
  consent: z
    .literal(true, {
      errorMap: () => ({ message: "Consent must be explicitly true (GDPR)" }),
    }),
  source: z.string().optional(),
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.post(api.inquiries.create.path, async (req, res) => {
    try {
      const input = api.inquiries.create.input.parse(req.body);
      const inquiry = await storage.createInquiry(input);
      res.status(201).json(inquiry);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join("."),
        });
      }
      throw err;
    }
  });

  // GDPR-compliant lead capture endpoint
  app.post("/save-lead", async (req, res) => {
    // Parse and validate
    const parsed = saveleadSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: parsed.error.errors[0].message,
      });
    }

    const { email, city, consent, source } = parsed.data;

    // Consent guard (belt-and-suspenders — schema already enforces this)
    if (!consent) {
      return res.status(400).json({
        success: false,
        message: "Consent required — data not stored (GDPR)",
      });
    }

    // Duplicate email prevention
    const existing = await storage.findLeadByEmail(email);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "This email address is already registered",
      });
    }

    // Save to database
    await storage.createLead({
      email,
      city,
      consent,
      followupRequested: false,
      source: source ?? null,
    });

    return res.status(201).json({ success: true });
  });

  // Internal leads API (used by follow-up feature)
  app.post("/api/leads", async (req, res) => {
    try {
      const input = insertLeadSchema.parse(req.body);
      const lead = await storage.createLead(input);
      res.status(201).json(lead);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.post("/follow-up", async (req, res) => {
    const email = req.body?.email;
    if (!email || typeof email !== "string") {
      return res.status(400).json({ success: false, message: "Email is required" });
    }
    const lead = await storage.requestFollowupByEmail(email);
    if (!lead) {
      return res.status(404).json({ success: false, message: "Email not found" });
    }
    return res.json({ success: true });
  });

  app.post("/api/leads/:id/followup", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid id" });
      const lead = await storage.requestFollowup(id);
      if (!lead) return res.status(404).json({ message: "Lead not found" });
      res.json(lead);
    } catch (err) {
      throw err;
    }
  });

  return httpServer;
}
