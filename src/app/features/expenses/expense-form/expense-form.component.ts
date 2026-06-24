import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
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
export class ExpenseFormComponent {
  private fb = inject(FormBuilder);
  private expenseService = inject(ExpenseService);
  private dialogRef = inject(MatDialogRef<ExpenseFormComponent>);

  expenseForm = this.fb.group({
    title: ['', Validators.required],
    amount: ['', [Validators.required, Validators.min(0.01)]],
    category: ['', Validators.required],
    date: [new Date().toISOString().split('T')[0], Validators.required],
    notes: ['']
  });

  categories = ['Food', 'Utilities', 'Entertainment', 'Transport', 'Healthcare', 'Other'];

  onSubmit() {
    if (this.expenseForm.valid) {
      const formValue = this.expenseForm.value;
      this.expenseService.addExpense({
        title: formValue.title!,
        amount: Number(formValue.amount),
        category: formValue.category!,
        date: new Date(formValue.date!).toISOString(),
        notes: formValue.notes!
      });
      this.dialogRef.close();
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}
