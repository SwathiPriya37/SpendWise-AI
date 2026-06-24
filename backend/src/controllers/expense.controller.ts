import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

export const getExpenses = async (req: AuthRequest, res: Response) => {
  try {
    const expenses = await prisma.expense.findMany({
      where: { userId: req.userId },
      orderBy: { date: 'desc' }
    });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching expenses' });
  }
};

export const createExpense = async (req: AuthRequest, res: Response) => {
  try {
    const { title, amount, category, date, notes } = req.body;
    const expense = await prisma.expense.create({
      data: {
        title,
        amount: Number(amount),
        category,
        date: new Date(date),
        notes,
        userId: req.userId!
      }
    });
    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: 'Error creating expense' });
  }
};

export const updateExpense = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, amount, category, date, notes } = req.body;
    
    const expense = await prisma.expense.findFirst({ where: { id: Number(id), userId: req.userId } });
    if (!expense) {
      res.status(404).json({ message: 'Expense not found' });
      return;
    }

    const updatedExpense = await prisma.expense.update({
      where: { id: Number(id) },
      data: { title, amount: Number(amount), category, date: new Date(date), notes }
    });
    res.json(updatedExpense);
  } catch (error) {
    res.status(500).json({ message: 'Error updating expense' });
  }
};

export const deleteExpense = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const expense = await prisma.expense.findFirst({ where: { id: Number(id), userId: req.userId } });
    if (!expense) {
      res.status(404).json({ message: 'Expense not found' });
      return;
    }

    await prisma.expense.delete({ where: { id: Number(id) } });
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting expense' });
  }
};
