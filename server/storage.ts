import { type Inquiry, type InsertInquiry, inquiries, type Lead, type InsertLead, leads } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  createInquiry(inquiry: InsertInquiry): Promise<Inquiry>;
  createLead(lead: InsertLead): Promise<Lead>;
  findLeadByEmail(email: string): Promise<Lead | undefined>;
  requestFollowup(id: number): Promise<Lead | undefined>;
  requestFollowupByEmail(email: string): Promise<Lead | undefined>;
}

export class DatabaseStorage implements IStorage {
  async createInquiry(insertInquiry: InsertInquiry): Promise<Inquiry> {
    const [inquiry] = await db
      .insert(inquiries)
      .values(insertInquiry)
      .returning();
    return inquiry;
  }

  async createLead(insertLead: InsertLead): Promise<Lead> {
    const [lead] = await db
      .insert(leads)
      .values(insertLead)
      .returning();
    return lead;
  }

  async findLeadByEmail(email: string): Promise<Lead | undefined> {
    const [lead] = await db
      .select()
      .from(leads)
      .where(eq(leads.email, email.toLowerCase().trim()));
    return lead;
  }

  async requestFollowup(id: number): Promise<Lead | undefined> {
    const [lead] = await db
      .update(leads)
      .set({ followupRequested: true })
      .where(eq(leads.id, id))
      .returning();
    return lead;
  }

  async requestFollowupByEmail(email: string): Promise<Lead | undefined> {
    const [lead] = await db
      .update(leads)
      .set({ followupRequested: true })
      .where(eq(leads.email, email.toLowerCase().trim()))
      .returning();
    return lead;
  }
}

export const storage = new DatabaseStorage();
