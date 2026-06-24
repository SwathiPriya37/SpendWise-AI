import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { GoalService } from '../../../core/services/goal.service';
import { GoalFormComponent } from '../goal-form/goal-form.component';

@Component({
  selector: 'app-goal-tracker',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatProgressBarModule, MatButtonModule, MatIconModule, MatDialogModule],
  templateUrl: './goal-tracker.component.html',
  styleUrl: './goal-tracker.component.scss'
})
export class GoalTrackerComponent {
  goalService = inject(GoalService);
  dialog = inject(MatDialog);
  goals$ = this.goalService.goals$;

  openAddGoalDialog() {
    this.dialog.open(GoalFormComponent, { width: '400px', data: {} });
  }

  editGoal(goal: any) {
    this.dialog.open(GoalFormComponent, { width: '400px', data: { goal } });
  }

  deleteGoal(id: string | number) {
    if(confirm('Are you sure you want to delete this goal?')) {
      this.goalService.deleteGoal(id);
    }
  }

  getCompletionPercentage(current: number, target: number): number {
    return Math.min(100, (current / target) * 100);
  }

  getProgressBarColor(percentage: number): string {
    if (percentage >= 100) return 'primary'; // complete
    if (percentage >= 50) return 'accent'; // halfway
    return 'warn'; // early
  }

  getTimeLeft(deadlineStr: string): string {
    const deadline = new Date(deadlineStr);
    const now = new Date();
    
    if (deadline < now) return 'Overdue';
    
    const diffTime = Math.abs(deadline.getTime() - now.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    
    if (diffDays > 30) {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months > 1 ? 's' : ''} left`;
    }
    return `${diffDays} day${diffDays > 1 ? 's' : ''} left`;
  }

  getProjectedCompletion(goal: any): string {
    // Basic projection logic:
    // If they have saved X amount in Y time, when will they reach Z?
    // Since we don't track historical savings by date right now, 
    // we'll just mock a projection based on the createdAt vs now, or just a simple estimate.
    
    const start = goal.createdAt ? new Date(goal.createdAt) : new Date();
    const now = new Date();
    const elapsedDays = Math.max(1, Math.ceil((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    
    if (goal.currentAmount <= 0) return 'Not enough data';
    if (goal.currentAmount >= goal.targetAmount) return 'Completed!';
    
    const dailySavingRate = goal.currentAmount / elapsedDays;
    const remainingAmount = goal.targetAmount - goal.currentAmount;
    const daysToComplete = Math.ceil(remainingAmount / dailySavingRate);
    
    const projectedDate = new Date();
    projectedDate.setDate(projectedDate.getDate() + daysToComplete);
    
    return projectedDate.toLocaleDateString();
  }

  getMilestoneAlerts(goal: any): string[] {
    const percentage = this.getCompletionPercentage(goal.currentAmount, goal.targetAmount);
    const alerts = [];
    
    if (percentage >= 100) {
      alerts.push('🎉 Goal Completed!');
    } else if (percentage >= 75) {
      alerts.push('🌟 Almost there! 75% reached.');
    } else if (percentage >= 50) {
      alerts.push('🔥 Halfway there!');
    } else if (percentage >= 25) {
      alerts.push('👍 Great start! 25% reached.');
    }
    
    const deadline = new Date(goal.deadline);
    const now = new Date();
    const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)); 
    
    if (diffDays <= 7 && percentage < 100) {
      alerts.push('⚠️ Deadline is approaching fast!');
    }
    
    return alerts;
  }
}
