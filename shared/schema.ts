import { pgTable, text, serial, date, decimal, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  user: text("user").notNull(),
  category: text("category").notNull(),
  subCategory: text("sub_category").notNull(),
  description: text("description"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  date: date("date").notNull(),
  receiptUrl: text("receipt_url"),
  notes: text("notes"),
  createdAt: date("created_at").notNull().defaultNow()
});

export const insertExpenseSchema = createInsertSchema(expenses)
  .omit({ id: true, createdAt: true })
  .extend({
    amount: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "Amount must be a positive number",
    }),
    date: z.date(),
  });

export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type Expense = typeof expenses.$inferSelect;

export const categorySchema = z.object({
  Transportation: z.array(z.string()),
  Gifts: z.array(z.string()),
  "Fun & Entertainment": z.array(z.string()),
  "Personal Care": z.array(z.string()),
  "Food & Beverage": z.array(z.string()),
  "Rental Property": z.array(z.string()),
  Home: z.array(z.string()),
  Yoshi: z.array(z.string()),
  "Misc (please describe)": z.array(z.string()),
});

export type Categories = z.infer<typeof categorySchema>;

export const categories: Categories = {
  Transportation: ["Gas", "Maintenance", "Parking", "Public Transit"],
  Gifts: ["Birthday", "Holiday", "Special Occasion"],
  "Fun & Entertainment": ["Movies", "Games", "Events", "Hobbies"],
  "Personal Care": ["Haircut", "Skincare", "Healthcare"],
  "Food & Beverage": ["Groceries", "Restaurants", "Coffee", "Snacks"],
  "Rental Property": ["Maintenance", "Utilities", "Insurance"],
  Home: ["Utilities", "Furniture", "Maintenance", "Supplies"],
  Yoshi: ["Food", "Vet", "Supplies"],
  "Misc (please describe)": ["Other"],
};
