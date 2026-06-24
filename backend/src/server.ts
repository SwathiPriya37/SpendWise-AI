import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import expenseRoutes from './routes/expense.routes';
import budgetRoutes from './routes/budget.routes';
import goalRoutes from './routes/goal.routes';
import incomeRoutes from './routes/income.routes';
import recurringRoutes from './routes/recurring.routes';
import notificationRoutes from './routes/notification.routes';
import adminRoutes from './routes/admin.routes';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/incomes', incomeRoutes);
app.use('/api/recurring', recurringRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
