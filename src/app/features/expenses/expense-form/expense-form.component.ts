import { Component, inject, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { ExpenseService } from '../../../core/services/expense.service';

@Component({
  selector: 'app-expense-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule],
  templateUrl: './expense-form.component.html',
  styleUrl: './expense-form.component.scss'
})
export class ExpenseFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private expenseService = inject(ExpenseService);
  private dialogRef = inject(MatDialogRef<ExpenseFormComponent>);
  
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}

  expenseForm = this.fb.group({
    title: ['', Validators.required],
    amount: ['', [Validators.required, Validators.min(0.01)]],
    category: ['', Validators.required],
    date: [new Date().toISOString().split('T')[0], Validators.required],
    notes: ['']
  });

  categories = ['Food', 'Utilities', 'Entertainment', 'Transport', 'Healthcare', 'Other'];
  isEditMode = false;

  ngOnInit() {
    if (this.data && this.data.expense) {
      this.isEditMode = true;
      const e = this.data.expense;
      this.expenseForm.patchValue({
        title: e.title,
        amount: e.amount,
        category: e.category,
        date: new Date(e.date).toISOString().split('T')[0],
        notes: e.notes
      });
    }
  }

  onSubmit() {
    if (this.expenseForm.valid) {
      const formValue = this.expenseForm.value;
      const expenseData = {
        title: formValue.title!,
        amount: Number(formValue.amount),
        category: formValue.category!,
        date: new Date(formValue.date!).toISOString(),
        notes: formValue.notes || ''
      };

      if (this.isEditMode) {
        this.expenseService.updateExpense({ ...expenseData, id: this.data.expense.id }).subscribe(() => {
          this.dialogRef.close(true);
        });
      } else {
        this.expenseService.addExpense(expenseData).subscribe(() => {
          this.dialogRef.close(true);
        });
      }
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}
