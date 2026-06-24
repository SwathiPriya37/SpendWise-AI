import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { ExpenseService } from '../../core/services/expense.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatTableModule, MatButtonModule, BaseChartDirective],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  expenseService = inject(ExpenseService);
  recentTransactions: any[] = [];
  displayedColumns = ['title', 'category', 'date', 'amount', 'status', 'actions'];

  totalExpenses = 180.50;
  totalSavings = 2500.00; 
  budgetLeft = 320.00; 
  growthPercentage = '+5.2%';

  lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      { 
        data: [40, 20, 80, 85, 20, 140], 
        label: 'Monthly Expenses', 
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
    labels: ['Food', 'Utilities', 'Entertainment', 'Transport'],
    datasets: [{ 
      data: [90.25, 45.10, 27.08, 18.07],
      backgroundColor: ['#34a853', '#4285f4', '#fbbc04', '#9c27b0'],
      borderWidth: 2,
      borderColor: '#ffffff'
    }]
  };
  pieChartOptions: ChartConfiguration<'doughnut'>['options'] = { 
    responsive: true, 
    maintainAspectRatio: false,
    cutout: '40%',
    plugins: {
      legend: { display: false } // We'll build a custom HTML legend
    }
  };

  constructor() {
    this.expenseService.expenses$.subscribe((expenses: any[]) => {
      // For mockup exact match, using static recent transactions
      this.recentTransactions = [
        { title: 'Groceries', category: 'Food', date: 'Jun 24, 2026', amount: 120.50, status: 'Expense' }
      ];
    });
  }
}
