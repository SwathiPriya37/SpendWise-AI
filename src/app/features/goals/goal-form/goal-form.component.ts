import { Component, inject, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { GoalService } from '../../../core/services/goal.service';

@Component({
  selector: 'app-goal-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>{{ isEditMode ? 'Edit' : 'Add' }} Savings Goal</h2>
    <mat-dialog-content>
      <form [formGroup]="goalForm" class="goal-form">
        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Title</mat-label>
          <input matInput formControlName="title" placeholder="e.g. Vacation Fund">
        </mat-form-field>
        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Target Amount</mat-label>
          <input matInput type="number" formControlName="targetAmount" placeholder="0.00">
        </mat-form-field>
        <mat-form-field appearance="fill" class="full-width" *ngIf="isEditMode">
          <mat-label>Current Amount</mat-label>
          <input matInput type="number" formControlName="currentAmount" placeholder="0.00">
        </mat-form-field>
        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Deadline</mat-label>
          <input matInput type="date" formControlName="deadline">
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="primary" [disabled]="goalForm.invalid" (click)="onSubmit()">Save</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .goal-form {
      display: flex;
      flex-direction: column;
      margin-top: 16px;
    }
    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }
  `]
})
export class GoalFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private goalService = inject(GoalService);
  private dialogRef = inject(MatDialogRef<GoalFormComponent>);
  
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}

  goalForm = this.fb.group({
    title: ['', Validators.required],
    targetAmount: ['', [Validators.required, Validators.min(0.01)]],
    currentAmount: [''],
    deadline: [new Date().toISOString().split('T')[0], Validators.required]
  });

  isEditMode = false;

  ngOnInit() {
    if (this.data && this.data.goal) {
      this.isEditMode = true;
      this.goalForm.patchValue({
        title: this.data.goal.title,
        targetAmount: this.data.goal.targetAmount,
        currentAmount: this.data.goal.currentAmount,
        deadline: new Date(this.data.goal.deadline).toISOString().split('T')[0]
      });
    }
  }

  onSubmit() {
    if (this.goalForm.valid) {
      const formValue = this.goalForm.value;
      const goalData = {
        title: formValue.title!,
        targetAmount: Number(formValue.targetAmount),
        currentAmount: formValue.currentAmount ? Number(formValue.currentAmount) : 0,
        deadline: new Date(formValue.deadline!).toISOString()
      };

      if (this.isEditMode) {
        const existingGoal = this.data.goal as any;
        this.goalService.updateGoal({ ...existingGoal, ...goalData }).subscribe(() => {
          this.dialogRef.close(true);
        });
      } else {
        this.goalService.addGoal(goalData).subscribe(() => {
          this.dialogRef.close(true);
        });
      }
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}
