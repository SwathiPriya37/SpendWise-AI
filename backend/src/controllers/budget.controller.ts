import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

export const getBudgets = async (req: AuthRequest, res: Response) => {
  try {
    const budgets = await prisma.budget.findMany({
      where: { userId: req.userId }
    });
    res.json(budgets);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching budgets' });
  }
};

export const createBudget = async (req: AuthRequest, res: Response) => {
  try {
    const { category, limit, month, year, notes } = req.body;
    const budget = await prisma.budget.create({
      data: {
        category,
        limit: Number(limit),
        month: Number(month),
        year: Number(year),
        notes,
        userId: req.userId!
      }
    });

    await prisma.auditLog.create({
      data: { action: 'BUDGET_CREATED', entity: 'Budget', entityId: budget.id, details: `${category} budget - $${limit}`, userId: req.userId! }
    });

    res.status(201).json(budget);
  } catch (error) {
    res.status(500).json({ message: 'Error creating budget' });
  }
};

export const updateBudget = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { category, limit, month, year, notes, spent } = req.body;
    
    const budget = await prisma.budget.findFirst({ where: { id: Number(id), userId: req.userId } });
    if (!budget) {
      res.status(404).json({ message: 'Budget not found' });
      return;
    }

    const updatedBudget = await prisma.budget.update({
      where: { id: Number(id) },
      data: { 
        category, 
        limit: Number(limit), 
        month: Number(month),
        year: Number(year),
        notes,
        spent: spent ? Number(spent) : undefined 
      }
    });
    res.json(updatedBudget);
  } catch (error) {
    res.status(500).json({ message: 'Error updating budget' });
  }
};

export const deleteBudget = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const budget = await prisma.budget.findFirst({ where: { id: Number(id), userId: req.userId } });
    if (!budget) {
      res.status(404).json({ message: 'Budget not found' });
      return;
    }

    await prisma.budget.delete({ where: { id: Number(id) } });

    await prisma.auditLog.create({
      data: { action: 'BUDGET_DELETED', entity: 'Budget', entityId: Number(id), details: `${budget.category} budget deleted`, userId: req.userId! }
    });

    res.json({ message: 'Budget deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting budget' });
  }
};
