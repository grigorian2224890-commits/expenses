// api/expenses.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

type Expense = {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string; // ISO string
};

// In-memory storage (resets when the function instance is recycled)
const expenses: Expense[] = [];

export default function handler(req: VercelRequest, res: VercelResponse) {
  // GET /api/expenses – return all expenses
  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      data: expenses,
    });
  }

  // POST /api/expenses – add a new expense
  if (req.method === 'POST') {
    const { amount, description, category, date } = req.body || {};

    const errors: string[] = [];

    // Validation
    if (amount === undefined || amount === null || isNaN(Number(amount))) {
      errors.push('Field "amount" is required and must be a number.');
    }
    if (!description || typeof description !== 'string') {
      errors.push('Field "description" is required and must be a non-empty string.');
    }
    if (!category || typeof category !== 'string') {
      errors.push('Field "category" is required and must be a non-empty string.');
    }
    if (!date || typeof date !== 'string' || isNaN(Date.parse(date))) {
      errors.push('Field "date" is required and must be a valid date string.');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        errors,
      });
    }

    const newExpense: Expense = {
      id: Date.now().toString(),
      amount: Number(amount),
      description,
      category,
      // normalize date to ISO
      date: new Date(date).toISOString(),
    };

    expenses.push(newExpense);

    return res.status(201).json({
      success: true,
      data: newExpense,
    });
  }

  // Method not allowed
  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({
    success: false,
    error: `Method ${req.method} Not Allowed`,
  });
}
