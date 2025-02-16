import { Client } from "@notionhq/client";

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

export interface NotionExpense {
  user: string;
  category: string;
  subCategory: string;
  description?: string | null;
  amount: string;
  date: string;
  receiptUrl?: string | null;
  notes?: string | null;
}

export async function addExpenseToNotion(expense: NotionExpense) {
  try {
    const response = await notion.pages.create({
      parent: {
        database_id: process.env.NOTION_DATABASE_ID!,
      },
      properties: {
        User: {
          type: "select",
          select: {
            name: expense.user,
          },
        },
        Category: {
          type: "select",
          select: {
            name: expense.category,
          },
        },
        "Sub-Category": {
          type: "select",
          select: {
            name: expense.subCategory,
          },
        },
        Description: {
          type: "rich_text",
          rich_text: [
            {
              type: "text",
              text: {
                content: expense.description || "",
              },
            },
          ],
        },
        Amount: {
          type: "number",
          number: parseFloat(expense.amount),
        },
        Date: {
          type: "date",
          date: {
            start: expense.date,
          },
        },
        Receipt: {
          type: "files",
          files: []  // Initialize as empty array since we're not uploading files directly to Notion
        },
        Notes: {
          type: "rich_text",
          rich_text: [
            {
              type: "text",
              text: {
                content: expense.notes || "",
              },
            },
          ],
        },
      },
    });

    return response;
  } catch (error) {
    console.error("Failed to add expense to Notion:", error);
    throw new Error("Failed to save expense to Notion");
  }
}