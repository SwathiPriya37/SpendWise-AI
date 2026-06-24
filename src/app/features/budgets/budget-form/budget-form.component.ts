import { Component, inject, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { BudgetService } from '../../../core/services/budget.service';

@Component({
  selector: 'app-budget-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>{{ isEditMode ? 'Edit' : 'Add' }} Budget</h2>
    <mat-dialog-content>
      <form [formGroup]="budgetForm" class="budget-form">
        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Category</mat-label>
          <mat-select formControlName="category">
            <mat-option *ngFor="let cat of categories" [value]="cat">{{cat}}</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Monthly Limit</mat-label>
          <input matInput type="number" formControlName="limit" placeholder="0.00">
        </mat-form-field>
        <div style="display: flex; gap: 16px;">
          <mat-form-field appearance="fill" style="flex: 1;">
            <mat-label>Month</mat-label>
            <mat-select formControlName="month">
              <mat-option *ngFor="let m of months" [value]="m.value">{{m.label}}</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="fill" style="flex: 1;">
            <mat-label>Year</mat-label>
            <input matInput type="number" formControlName="year">
          </mat-form-field>
        </div>
        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Notes</mat-label>
          <textarea matInput formControlName="notes" rows="2"></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="primary" [disabled]="budgetForm.invalid" (click)="onSubmit()">Save</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .budget-form {
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
export class BudgetFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private budgetService = inject(BudgetService);
  private dialogRef = inject(MatDialogRef<BudgetFormComponent>);
  
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}

  budgetForm = this.fb.group({
    category: ['', Validators.required],
    limit: ['', [Validators.required, Validators.min(0.01)]],
    month: [new Date().getMonth() + 1, Validators.required],
    year: [new Date().getFullYear(), Validators.required],
    notes: ['']
  });

  categories = ['Food', 'Utilities', 'Entertainment', 'Transport', 'Healthcare', 'Other'];
  months = [
    { value: 1, label: 'January' }, { value: 2, label: 'February' }, { value: 3, label: 'March' },
    { value: 4, label: 'April' }, { value: 5, label: 'May' }, { value: 6, label: 'June' },
    { value: 7, label: 'July' }, { value: 8, label: 'August' }, { value: 9, label: 'September' },
    { value: 10, label: 'October' }, { value: 11, label: 'November' }, { value: 12, label: 'December' }
  ];
  isEditMode = false;

  ngOnInit() {
    if (this.data && this.data.budget) {
      this.isEditMode = true;
      this.budgetForm.patchValue({
        category: this.data.budget.category,
        limit: this.data.budget.limit,
        month: this.data.budget.month,
        year: this.data.budget.year,
        notes: this.data.budget.notes
      });
    }
  }

  onSubmit() {
    if (this.budgetForm.valid) {
      const formValue = this.budgetForm.value;
      const budgetData = {
        category: formValue.category!,
        limit: Number(formValue.limit),
        month: Number(formValue.month),
        year: Number(formValue.year),
        notes: formValue.notes || '',
        spent: 0
      };

      if (this.isEditMode) {
        const existingBudget = this.data.budget as any;
        this.budgetService.updateBudget({ ...existingBudget, ...budgetData }).subscribe(() => {
          this.dialogRef.close(true);
        });
      } else {
        this.budgetService.addBudget(budgetData).subscribe(() => {
          this.dialogRef.close(true);
        });
      }
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}
