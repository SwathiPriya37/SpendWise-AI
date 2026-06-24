import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

export const getExpenses = async (req: AuthRequest, res: Response) => {
  try {
    const expenses = await prisma.expense.findMany({
      where: { userId: req.userId },
      orderBy: { date: 'desc' },
      include: { tags: true }
    });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching expenses' });
  }
};

export const createExpense = async (req: AuthRequest, res: Response) => {
  try {
    const { title, amount, category, date, notes, tags } = req.body;
    
    // Process tags: e.g. ['#food', '#travel']
    const tagConnectOrCreate = (tags || []).map((tagName: string) => ({
      where: { name: tagName },
      create: { name: tagName }
    }));

    const expense = await prisma.expense.create({
      data: {
        title,
        amount: Number(amount),
        category,
        date: new Date(date),
        notes,
        userId: req.userId!,
        tags: {
          connectOrCreate: tagConnectOrCreate
        }
      },
      include: { tags: true }
    });

    // Audit log
    await prisma.auditLog.create({
      data: { action: 'EXPENSE_CREATED', entity: 'Expense', entityId: expense.id, details: `${title} - $${amount}`, userId: req.userId! }
    });

    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: 'Error creating expense' });
  }
};

export const updateExpense = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, amount, category, date, notes, tags } = req.body;
    
    const expense = await prisma.expense.findFirst({ where: { id: Number(id), userId: req.userId } });
    if (!expense) {
      res.status(404).json({ message: 'Expense not found' });
      return;
    }

    const tagConnectOrCreate = (tags || []).map((tagName: string) => ({
      where: { name: tagName },
      create: { name: tagName }
    }));

    const updatedExpense = await prisma.expense.update({
      where: { id: Number(id) },
      data: { 
        title, 
        amount: Number(amount), 
        category, 
        date: new Date(date), 
        notes,
        tags: {
          set: [], // clear existing
          connectOrCreate: tagConnectOrCreate
        }
      },
      include: { tags: true }
    });

    await prisma.auditLog.create({
      data: { action: 'EXPENSE_UPDATED', entity: 'Expense', entityId: Number(id), details: `${title} updated`, userId: req.userId! }
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

    await prisma.auditLog.create({
      data: { action: 'EXPENSE_DELETED', entity: 'Expense', entityId: Number(id), details: `${expense.title} deleted`, userId: req.userId! }
    });

    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting expense' });
  }
};
