import { Request, Response } from 'express';
import { prisma } from '../config/prisma';

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications' });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { id } = req.params;
    const notification = await prisma.notification.updateMany({
      where: { id: Number(id), userId },
      data: { read: true }
    });
    res.json({ message: 'Marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating notification' });
  }
};

export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true }
    });
    res.json({ message: 'All marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating notifications' });
  }
};

export const createDemoNotification = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { message, type } = req.body;
    const notification = await prisma.notification.create({
      data: {
        message: message || 'You have a new alert.',
        type: type || 'INFO',
        userId
      }
    });
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Error creating notification' });
  }
};
