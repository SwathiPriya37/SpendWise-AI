import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

export const getRecurringExpenses = async (req: AuthRequest, res: Response) => {
  try {
    const recurring = await prisma.recurringExpense.findMany({
      where: { userId: req.userId },
      orderBy: { nextGeneratedDate: 'asc' }
    });
    res.json(recurring);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching recurring expenses' });
  }
};

export const createRecurringExpense = async (req: AuthRequest, res: Response) => {
  try {
    const { title, amount, category, frequency, startDate } = req.body;
    
    // Calculate next generated date based on start date
    const d = new Date(startDate);
    
    const recurring = await prisma.recurringExpense.create({
      data: {
        title,
        amount: Number(amount),
        category,
        frequency,
        startDate: new Date(startDate),
        nextGeneratedDate: d,
        userId: req.userId!
      }
    });
    res.status(201).json(recurring);
  } catch (error) {
    res.status(500).json({ message: 'Error creating recurring expense' });
  }
};

export const processRecurringExpenses = async (req: AuthRequest, res: Response) => {
  try {
    const recurring = await prisma.recurringExpense.findMany({
      where: { 
        userId: req.userId,
        nextGeneratedDate: { lte: new Date() }
      }
    });

    for (const rec of recurring) {
      // Create Expense
      await prisma.expense.create({
        data: {
          title: rec.title,
          amount: rec.amount,
          category: rec.category,
          date: new Date(),
          notes: 'Auto-generated recurring expense',
          userId: req.userId!
        }
      });

      // Calculate next date
      const nextDate = new Date(rec.nextGeneratedDate);
      if (rec.frequency === 'DAILY') nextDate.setDate(nextDate.getDate() + 1);
      else if (rec.frequency === 'WEEKLY') nextDate.setDate(nextDate.getDate() + 7);
      else if (rec.frequency === 'MONTHLY') nextDate.setMonth(nextDate.getMonth() + 1);
      else if (rec.frequency === 'YEARLY') nextDate.setFullYear(nextDate.getFullYear() + 1);

      // Update recurring expense
      await prisma.recurringExpense.update({
        where: { id: rec.id },
        data: { nextGeneratedDate: nextDate }
      });
    }

    res.json({ message: `Processed ${recurring.length} recurring expenses.` });
  } catch (error) {
    res.status(500).json({ message: 'Error processing recurring expenses' });
  }
};

export const deleteRecurringExpense = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const recurring = await prisma.recurringExpense.findFirst({ where: { id: Number(id), userId: req.userId } });
    
    if (!recurring) {
      return res.status(404).json({ message: 'Not found' });
    }
    
    await prisma.recurringExpense.delete({ where: { id: Number(id) } });
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
