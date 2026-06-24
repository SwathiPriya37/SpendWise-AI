import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ExpenseService } from '../../../core/services/expense.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ExpenseFormComponent } from '../expense-form/expense-form.component';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-expense-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, MatDialogModule, MatCardModule],
  templateUrl: './expense-list.component.html',
  styleUrl: './expense-list.component.scss'
})
export class ExpenseListComponent {
  expenseService = inject(ExpenseService);
  dialog = inject(MatDialog);
  displayedColumns = ['title', 'category', 'date', 'amount', 'actions'];
  expenses$ = this.expenseService.expenses$;

  openAddExpenseDialog() {
    this.dialog.open(ExpenseFormComponent, {
      width: '400px'
    });
  }

  deleteExpense(id: string) {
    if (confirm('Are you sure you want to delete this expense?')) {
      this.expenseService.deleteExpense(id);
    }
  }
}
