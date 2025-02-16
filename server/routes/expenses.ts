import { Router } from "express";
import { addExpenseToNotion } from "../services/notion";

const router = Router();

router.post("/api/expenses", async (req, res) => {
  try {
    const expenseData = req.body;
    
    // Add to Notion
    const notionResponse = await addExpenseToNotion(expenseData);
    
    res.json({
      success: true,
      notionId: notionResponse.id
    });
  } catch (error) {
    console.error("Error saving expense:", error);
    res.status(500).json({
      success: false,
      error: "Failed to save expense"
    });
  }
});

export default router;
