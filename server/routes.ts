import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertExpenseSchema } from "@shared/schema";
import { addExpenseToNotion } from "./services/notion";

export async function registerRoutes(app: Express) {
  app.post("/api/expenses", async (req, res) => {
    try {
      // Parse and validate the incoming data
      const expenseData = {
        ...req.body,
        // Convert the date string to a Date object for schema validation
        date: new Date(req.body.date)
      };

      const expense = insertExpenseSchema.parse(expenseData);

      // Save to local storage
      const created = await storage.createExpense(expense);

      // Save to Notion
      try {
        // Convert date back to ISO string for Notion
        const notionExpense = {
          ...expense,
          date: expense.date.toISOString().split('T')[0]
        };
        await addExpenseToNotion(notionExpense);
      } catch (notionError) {
        console.error("Failed to save to Notion:", notionError);
        // Continue with response even if Notion save fails
      }

      res.json(created);
    } catch (error) {
      console.error("Error saving expense:", error);
      res.status(400).json({ error: "Invalid expense data" });
    }
  });

  app.get("/api/expenses", async (_req, res) => {
    const expenses = await storage.getExpenses();
    res.json(expenses);
  });

  return createServer(app);
}