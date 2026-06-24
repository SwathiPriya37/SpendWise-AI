import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { ExpenseService } from '../../core/services/expense.service';
import { BudgetService } from '../../core/services/budget.service';
import { GoalService } from '../../core/services/goal.service';
import { AuthService } from '../../core/services/auth.service';
import { combineLatest } from 'rxjs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    MatCardModule, 
    MatIconModule, 
    MatTableModule, 
    MatButtonModule, 
    BaseChartDirective,
    MatDatepickerModule,
    MatNativeDateModule,
    MatMenuModule,
    MatFormFieldModule,
    ReactiveFormsModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  expenseService = inject(ExpenseService);
  budgetService = inject(BudgetService);
  goalService = inject(GoalService);
  authService = inject(AuthService);
  router = inject(Router);

  userName = '';
  recentTransactions: any[] = [];
  displayedColumns = ['title', 'category', 'date', 'amount', 'status', 'actions'];

  totalExpenses = 0;
  totalSavings = 0; 
  budgetLeft = 0; 
  growthPercentage = '0%';
  isGrowthPositive = false;

  dateRange = new FormGroup({
    start: new FormControl<Date | null>(new Date(new Date().getFullYear(), new Date().getMonth(), 1)),
    end: new FormControl<Date | null>(new Date())
  });

  lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      { 
        data: [], 
        label: 'Daily Expenses', 
        fill: true, 
        tension: 0.4, 
        borderColor: '#00a859', 
        backgroundColor: 'rgba(0, 168, 89, 0.1)',
        pointBackgroundColor: '#00a859',
        pointBorderColor: '#ffffff',
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ]
  };
  lineChartOptions: ChartConfiguration<'line'>['options'] = { 
    responsive: true, 
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: { border: { display: false }, grid: { color: '#f0f0f0' } },
      x: { grid: { display: false } }
    }
  };

  pieChartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: [{ 
      data: [],
      backgroundColor: ['#34a853', '#4285f4', '#fbbc04', '#9c27b0', '#ff6d00', '#00bcd4'],
      borderWidth: 2,
      borderColor: '#ffffff'
    }]
  };
  pieChartOptions: ChartConfiguration<'doughnut'>['options'] = { 
    responsive: true, 
    maintainAspectRatio: false,
    cutout: '40%',
    plugins: {
      legend: { display: false }
    }
  };

  customLegend: any[] = [];

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.userName = user?.name || 'User';
    });

    combineLatest([
      this.expenseService.expenses$,
      this.budgetService.budgets$,
      this.goalService.goals$,
      this.dateRange.valueChanges
    ]).subscribe(([expenses, budgets, goals, dates]) => {
      // Date filtering
      const start = dates.start || new Date(0);
      const end = dates.end || new Date();
      end.setHours(23, 59, 59, 999);

      const filteredExpenses = expenses.filter(e => {
        const d = new Date(e.date);
        return d >= start && d <= end;
      });

      // KPIs
      this.totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
      this.totalSavings = goals.reduce((sum, g) => sum + g.currentAmount, 0);
      
      const totalBudgetLimit = budgets.reduce((sum, b) => sum + b.limit, 0);
      this.budgetLeft = Math.max(0, totalBudgetLimit - this.totalExpenses);

      // Previous month mock comparison (just for UI)
      this.growthPercentage = '+2.4%';
      this.isGrowthPositive = true;

      // Recent transactions (last 5)
      this.recentTransactions = [...filteredExpenses]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5)
        .map(e => ({
          id: e.id,
          title: e.title,
          category: e.category,
          date: new Date(e.date).toLocaleDateString(),
          amount: e.amount,
          status: 'Expense'
        }));

      this.updateCharts(filteredExpenses);
    });

    // Trigger initial calculation
    this.dateRange.updateValueAndValidity();
  }

  updateCharts(expenses: any[]) {
    // Pie Chart mapping
    const categoryMap = new Map<string, number>();
    expenses.forEach(e => {
      const current = categoryMap.get(e.category) || 0;
      categoryMap.set(e.category, current + e.amount);
    });

    const labels = Array.from(categoryMap.keys());
    const data = Array.from(categoryMap.values());
    const bgColors = ['#34a853', '#4285f4', '#fbbc04', '#9c27b0', '#ff6d00', '#00bcd4'];

    this.pieChartData = {
      labels,
      datasets: [{
        data,
        backgroundColor: bgColors.slice(0, labels.length),
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    };

    this.customLegend = labels.map((label, i) => {
      const amount = data[i];
      const percentage = this.totalExpenses > 0 ? Math.round((amount / this.totalExpenses) * 100) : 0;
      return {
        label,
        color: bgColors[i % bgColors.length],
        percentage: percentage + '%',
        amount: amount
      };
    });

    // Line Chart Mapping (Daily)
    const dateMap = new Map<string, number>();
    const sortedExpenses = [...expenses].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    sortedExpenses.forEach(e => {
      const dateStr = new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const current = dateMap.get(dateStr) || 0;
      dateMap.set(dateStr, current + e.amount);
    });

    this.lineChartData = {
      labels: Array.from(dateMap.keys()),
      datasets: [{
        ...this.lineChartData.datasets[0],
        data: Array.from(dateMap.values())
      }]
    };
  }

  deleteExpense(id: string) {
    if(confirm('Delete this expense?')) {
      this.expenseService.deleteExpense(id);
    }
  }

  editExpense(id: string) {
    this.router.navigate(['/expenses']);
  }
}
