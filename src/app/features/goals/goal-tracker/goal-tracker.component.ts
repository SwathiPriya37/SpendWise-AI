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
    return (current / target) * 100;
  }
}
