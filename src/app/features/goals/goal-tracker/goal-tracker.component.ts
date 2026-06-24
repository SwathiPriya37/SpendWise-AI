import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { GoalService } from '../../../core/services/goal.service';

@Component({
  selector: 'app-goal-tracker',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatProgressBarModule],
  templateUrl: './goal-tracker.component.html',
  styleUrl: './goal-tracker.component.scss'
})
export class GoalTrackerComponent {
  goalService = inject(GoalService);
  goals$ = this.goalService.goals$;

  getCompletionPercentage(current: number, target: number): number {
    return (current / target) * 100;
  }
}
