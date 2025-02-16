import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertExpenseSchema } from "@shared/schema";
import { addExpenseToNotion } from "./services/notion";
import multer from "multer";
import path from "path";

export async function registerRoutes(app: Express) {
  // Configure multer for file uploads
  const upload = multer({
    storage: multer.diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
      }
    })
  });

  app.post("/api/expenses", upload.single('receipt'), async (req, res) => {
    try {
      // Parse and validate the incoming data
      const expenseData = {
        ...req.body,
        // Convert the date string to a Date object for schema validation
        date: new Date(req.body.date),
        // Add the file path if a receipt was uploaded
        receiptUrl: req.file ? `/uploads/${req.file.filename}` : undefined
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