import { Request, Response } from 'express';
import { prisma } from '../config/prisma';

// GET /api/admin/stats — System statistics
export const getSystemStats = async (req: Request, res: Response) => {
  try {
    const [totalUsers, totalExpenses, totalBudgets, totalGoals, totalIncomes, totalNotifications] = await Promise.all([
      prisma.user.count(),
      prisma.expense.count(),
      prisma.budget.count(),
      prisma.savingsGoal.count(),
      prisma.income.count(),
      prisma.notification.count()
    ]);

    const [totalExpenseAmount, totalIncomeAmount, totalSavingsAmount] = await Promise.all([
      prisma.expense.aggregate({ _sum: { amount: true } }),
      prisma.income.aggregate({ _sum: { amount: true } }),
      prisma.savingsGoal.aggregate({ _sum: { currentAmount: true } })
    ]);

    // Monthly growth data (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const recentExpenses = await prisma.expense.findMany({
      where: { date: { gte: sixMonthsAgo } },
      select: { amount: true, date: true, category: true }
    });

    const recentUsers = await prisma.user.findMany({
      select: { createdAt: true }
    });

    // Group expenses by month
    const monthlyExpenses: Record<string, number> = {};
    recentExpenses.forEach(e => {
      const key = `${e.date.getFullYear()}-${String(e.date.getMonth() + 1).padStart(2, '0')}`;
      monthlyExpenses[key] = (monthlyExpenses[key] || 0) + e.amount;
    });

    // Group users by month
    const monthlyUsers: Record<string, number> = {};
    recentUsers.forEach(u => {
      const key = `${u.createdAt.getFullYear()}-${String(u.createdAt.getMonth() + 1).padStart(2, '0')}`;
      monthlyUsers[key] = (monthlyUsers[key] || 0) + 1;
    });

    // Category distribution
    const categoryDistribution: Record<string, number> = {};
    recentExpenses.forEach(e => {
      categoryDistribution[e.category] = (categoryDistribution[e.category] || 0) + e.amount;
    });

    // Recent activity (last 10 audit logs)
    const recentActivity = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { user: { select: { name: true, email: true } } }
    });

    res.json({
      overview: {
        totalUsers,
        totalExpenses,
        totalBudgets,
        totalGoals,
        totalIncomes,
        totalNotifications,
        totalExpenseAmount: totalExpenseAmount._sum.amount || 0,
        totalIncomeAmount: totalIncomeAmount._sum.amount || 0,
        totalSavingsAmount: totalSavingsAmount._sum.currentAmount || 0
      },
      monthlyExpenses,
      monthlyUsers,
      categoryDistribution,
      recentActivity
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ message: 'Server error fetching admin stats' });
  }
};

// GET /api/admin/audit-logs — Full audit log with pagination & filtering
export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const action = req.query.action as string;
    const entity = req.query.entity as string;
    const search = req.query.search as string;

    const where: any = {};
    if (action) where.action = action;
    if (entity) where.entity = entity;
    if (search) {
      where.OR = [
        { action: { contains: search } },
        { entity: { contains: search } },
        { details: { contains: search } }
      ];
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { user: { select: { name: true, email: true } } }
      }),
      prisma.auditLog.count({ where })
    ]);

    res.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Audit logs error:', error);
    res.status(500).json({ message: 'Server error fetching audit logs' });
  }
};

// GET /api/admin/users — User list with stats
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            expenses: true,
            budgets: true,
            savingsGoals: true,
            incomes: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching users' });
  }
};

// PUT /api/admin/users/:id/role — Update user role
export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id as string);
    const { role } = req.body;

    if (!['USER', 'ADMIN'].includes(role)) {
      res.status(400).json({ message: 'Invalid role. Must be USER or ADMIN.' });
      return;
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { role }
    });

    // Log the role change
    const adminUserId = (req as any).user.userId;
    await prisma.auditLog.create({
      data: {
        action: 'ROLE_CHANGED',
        entity: 'User',
        entityId: userId,
        details: `User ${user.email} role changed to ${role}`,
        userId: adminUserId
      }
    });

    res.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating user role' });
  }
};
