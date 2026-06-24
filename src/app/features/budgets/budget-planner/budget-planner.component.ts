import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { BudgetService } from '../../../core/services/budget.service';
import { ExpenseService } from '../../../core/services/expense.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { BudgetFormComponent } from '../budget-form/budget-form.component';
import { combineLatest, map } from 'rxjs';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';

@Component({
  selector: 'app-budget-planner',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatProgressBarModule, MatIconModule, MatTooltipModule, MatDialogModule, MatButtonModule, MatTableModule, BaseChartDirective],
  templateUrl: './budget-planner.component.html',
  styleUrl: './budget-planner.component.scss'
})
export class BudgetPlannerComponent {
  budgetService = inject(BudgetService);
  expenseService = inject(ExpenseService);
  dialog = inject(MatDialog);

  displayedColumns = ['category', 'limit', 'spent', 'remaining', 'status', 'actions'];

  // Summary Metrics
  totalBudget = 0;
  budgetUsed = 0;
  remainingBudget = 0;
  utilizationPercentage = 0;

  // Alerts
  alerts: string[] = [];

  // Chart
  pieChartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: [{ data: [], backgroundColor: ['#34a853', '#4285f4', '#fbbc04', '#9c27b0', '#ff6d00', '#00bcd4'] }]
  };
  pieChartOptions: ChartConfiguration<'doughnut'>['options'] = { responsive: true, maintainAspectRatio: false };

  // Enriched Budgets Stream
  budgetData$ = combineLatest([
    this.budgetService.budgets$,
    this.expenseService.expenses$
  ]).pipe(
    map(([budgets, expenses]) => {
      let tBudget = 0;
      let tUsed = 0;
      let currentAlerts: string[] = [];
      
      const enriched = budgets.map(budget => {
        // Find matching expenses
        const matchingExpenses = expenses.filter(e => {
          const d = new Date(e.date);
          return e.category === budget.category && 
                 d.getMonth() + 1 === budget.month && 
                 d.getFullYear() === budget.year;
        });

        const actualSpent = matchingExpenses.reduce((sum, e) => sum + e.amount, 0);
        const percentage = (actualSpent / budget.limit) * 100;
        
        let status = 'On Track';
        if (percentage >= 100) status = 'Exceeded';
        else if (percentage >= 75) status = 'Warning';

        tBudget += budget.limit;
        tUsed += actualSpent;

        if (percentage >= 100) {
          currentAlerts.push(`${budget.category} budget exceeded! (${actualSpent} / ${budget.limit})`);
        } else if (percentage >= 85) {
          currentAlerts.push(`${budget.category} budget reaches ${Math.round(percentage)}%.`);
        }

        return {
          ...budget,
          spent: actualSpent,
          remaining: budget.limit - actualSpent,
          percentage,
          status
        };
      });

      this.totalBudget = tBudget;
      this.budgetUsed = tUsed;
      this.remainingBudget = tBudget - tUsed;
      this.utilizationPercentage = tBudget > 0 ? (tUsed / tBudget) * 100 : 0;
      this.alerts = currentAlerts;

      this.updateChart(enriched);

      return enriched;
    })
  );

  updateChart(budgets: any[]) {
    this.pieChartData = {
      labels: budgets.map(b => b.category),
      datasets: [{
        ...this.pieChartData.datasets[0],
        data: budgets.map(b => b.limit)
      }]
    };
  }

  openAddBudgetDialog() {
    this.dialog.open(BudgetFormComponent, { width: '400px', data: {} });
  }

  editBudget(budget: any) {
    this.dialog.open(BudgetFormComponent, { width: '400px', data: { budget } });
  }

  deleteBudget(id: string | number) {
    if(confirm('Are you sure you want to delete this budget?')) {
      this.budgetService.deleteBudget(id);
    }
  }

  getProgressBarColor(percentage: number): string {
    if (percentage >= 100) return 'warn';
    if (percentage >= 75) return 'accent';
    return 'primary';
  }
}
