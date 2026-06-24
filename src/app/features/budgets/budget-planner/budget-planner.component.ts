import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { BudgetService } from '../../../core/services/budget.service';

import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-budget-planner',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatProgressBarModule, MatIconModule, MatTooltipModule],
  templateUrl: './budget-planner.component.html',
  styleUrl: './budget-planner.component.scss'
})
export class BudgetPlannerComponent {
  budgetService = inject(BudgetService);
  budgets$ = this.budgetService.budgets$;

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
