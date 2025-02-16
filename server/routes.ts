import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertExpenseSchema } from "@shared/schema";

export async function registerRoutes(app: Express) {
  app.post("/api/expenses", async (req, res) => {
    try {
      const expense = insertExpenseSchema.parse(req.body);
      const created = await storage.createExpense(expense);
      res.json(created);
    } catch (error) {
      res.status(400).json({ error: "Invalid expense data" });
    }
  });

  app.get("/api/expenses", async (_req, res) => {
    const expenses = await storage.getExpenses();
    res.json(expenses);
  });

  return createServer(app);
}
