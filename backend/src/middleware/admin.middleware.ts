import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';

export const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== 'ADMIN') {
      res.status(403).json({ message: 'Forbidden: Admin access required' });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error checking admin role' });
  }
};
