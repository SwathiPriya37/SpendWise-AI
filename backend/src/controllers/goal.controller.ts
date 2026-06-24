import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

export const getGoals = async (req: AuthRequest, res: Response) => {
  try {
    const goals = await prisma.savingsGoal.findMany({
      where: { userId: req.userId }
    });
    res.json(goals);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching goals' });
  }
};

export const createGoal = async (req: AuthRequest, res: Response) => {
  try {
    const { title, targetAmount, deadline } = req.body;
    const goal = await prisma.savingsGoal.create({
      data: {
        title,
        targetAmount: Number(targetAmount),
        deadline: new Date(deadline),
        userId: req.userId!
      }
    });
    res.status(201).json(goal);
  } catch (error) {
    res.status(500).json({ message: 'Error creating goal' });
  }
};

export const updateGoal = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, targetAmount, currentAmount, deadline } = req.body;
    
    const goal = await prisma.savingsGoal.findFirst({ where: { id: Number(id), userId: req.userId } });
    if (!goal) {
      res.status(404).json({ message: 'Goal not found' });
      return;
    }

    const updatedGoal = await prisma.savingsGoal.update({
      where: { id: Number(id) },
      data: { 
        title, 
        targetAmount: targetAmount ? Number(targetAmount) : undefined,
        currentAmount: currentAmount ? Number(currentAmount) : undefined,
        deadline: deadline ? new Date(deadline) : undefined
      }
    });
    res.json(updatedGoal);
  } catch (error) {
    res.status(500).json({ message: 'Error updating goal' });
  }
};

export const deleteGoal = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const goal = await prisma.savingsGoal.findFirst({ where: { id: Number(id), userId: req.userId } });
    if (!goal) {
      res.status(404).json({ message: 'Goal not found' });
      return;
    }

    await prisma.savingsGoal.delete({ where: { id: Number(id) } });
    res.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting goal' });
  }
};
