import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ message: 'Email already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name }
    });

    // Log the registration
    await prisma.auditLog.create({
      data: { action: 'USER_REGISTERED', entity: 'User', entityId: user.id, details: `User ${email} registered`, userId: user.id }
    });

    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET || 'spendwise_super_secret_key_2026', { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // Log the login
    await prisma.auditLog.create({
      data: { action: 'USER_LOGIN', entity: 'User', entityId: user.id, details: `User ${email} logged in`, userId: user.id }
    });

    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET || 'spendwise_super_secret_key_2026', { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { name } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: { name }
    });

    // Log profile update
    await prisma.auditLog.create({
      data: { action: 'PROFILE_UPDATED', entity: 'User', entityId: user.id, details: `Profile name changed to ${name}`, userId: user.id }
    });

    res.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating profile' });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword) {
      res.status(400).json({ message: 'Invalid current password' });
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    // Log password change
    await prisma.auditLog.create({
      data: { action: 'PASSWORD_CHANGED', entity: 'User', entityId: userId, details: 'Password changed', userId }
    });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error changing password' });
  }
};
