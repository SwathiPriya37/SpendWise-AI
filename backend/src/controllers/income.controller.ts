import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

export const getIncomes = async (req: AuthRequest, res: Response) => {
  try {
    const incomes = await prisma.income.findMany({
      where: { userId: req.userId },
      orderBy: { date: 'desc' }
    });
    res.json(incomes);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const createIncome = async (req: AuthRequest, res: Response) => {
  try {
    const { title, amount, source, date, notes } = req.body;
    const income = await prisma.income.create({
      data: {
        title,
        amount: Number(amount),
        source,
        date: new Date(date),
        notes,
        userId: req.userId!
      }
    });
    res.status(201).json(income);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateIncome = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, amount, source, date, notes } = req.body;
    
    const income = await prisma.income.findFirst({ where: { id: Number(id), userId: req.userId } });
    if (!income) {
      res.status(404).json({ message: 'Income not found or unauthorized' });
      return;
    }

    const updatedIncome = await prisma.income.update({
      where: { id: Number(id) },
      data: { title, amount: Number(amount), source, date: new Date(date), notes }
    });
    
    res.json(updatedIncome);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteIncome = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const income = await prisma.income.findFirst({ where: { id: Number(id), userId: req.userId } });
    if (!income) {
      res.status(404).json({ message: 'Income not found or unauthorized' });
      return;
    }
    
    await prisma.income.delete({
      where: { id: Number(id) }
    });
    
    res.json({ message: 'Income removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
