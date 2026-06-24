import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { BudgetService } from '../../../core/services/budget.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { BudgetFormComponent } from '../budget-form/budget-form.component';

@Component({
  selector: 'app-budget-planner',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatProgressBarModule, MatIconModule, MatTooltipModule, MatDialogModule, MatButtonModule],
  templateUrl: './budget-planner.component.html',
  styleUrl: './budget-planner.component.scss'
})
export class BudgetPlannerComponent {
  budgetService = inject(BudgetService);
  dialog = inject(MatDialog);
  budgets$ = this.budgetService.budgets$;

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

  getUtilizationPercentage(spent: number, limit: number): number {
    return (spent / limit) * 100;
  }

  getProgressBarColor(spent: number, limit: number): string {
    const percentage = this.getUtilizationPercentage(spent, limit);
    if (percentage >= 100) return 'warn';
    if (percentage >= 80) return 'accent';
    return 'primary';
  }
}
