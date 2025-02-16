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
  "Fun + Entertainment": z.array(z.string()),
  Subscriptions: z.array(z.string()),
  "Personal Care": z.array(z.string()),
  "Health & Fitness": z.array(z.string()),
  "Food & Beverage": z.array(z.string()),
  "Rental Property": z.array(z.string()),
  Home: z.array(z.string()),
  Yoshi: z.array(z.string()),
});

export type Categories = z.infer<typeof categorySchema>;

export const categories: Categories = {
  Transportation: ["Presto", "Uber", "Car Insurance", "Gas", "Parking"],
  Gifts: ["Gifts_Friends-Family"],
  "Fun + Entertainment": ["Activities"],
  Subscriptions: [
    "Spotify",
    "YouTube Premium",
    "ChatGPT",
    "Perplexity",
    "Telus_Netflix/Disney+",
    "Amazon Prime",
    "Notion",
    "Clay",
    "Quickbooks",
    "iCloud_Lex",
    "iCloud_Ty",
    "Affirm_Lex-Laptop",
    "Affirm_Ty-Laptop",
    "Affirm_Ty-Laptop-Applecare",
    "Affirm_Samsung-Frame"
  ],
  "Personal Care": ["Haircuts_Tyler", "Nails_Alexa", "Dry Cleaning"],
  "Health & Fitness": ["Vitamins & Supplements", "Gym Membership_Tyler"],
  "Food & Beverage": ["Groceries", "LCBO", "Coffee", "Uber Eats + Eating Out"],
  "Rental Property": [
    "Mortgage_320-Richmond",
    "Condo Fees_320-Richmond",
    "Mortgage_32-Trolley",
    "Condo Fees_32-Trolley",
    "Maintenance & Repairs"
  ],
  Home: [
    "Utilities - Hydro",
    "Cleaner",
    "Rent",
    "Utilities - Internet",
    "Cellphones",
    "Cleaning Supplies"
  ],
  Yoshi: ["Pet Insurance", "Pet Food", "Dog Walker", "Dog Toys", "Vet Bill"]
};