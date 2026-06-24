import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ExpenseService } from '../../core/services/expense.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss'
})
export class ReportsComponent {
  expenseService = inject(ExpenseService);

  exportToCSV() {
    this.expenseService.expenses$.subscribe((expenses: any[]) => {
      if (expenses.length === 0) return;
      
      const headers = ['ID', 'Title', 'Amount', 'Category', 'Date', 'Notes'];
      const csvData = expenses.map((e: any) => [
        e.id, 
        e.title, 
        e.amount.toString(), 
        e.category, 
        new Date(e.date).toLocaleDateString(), 
        e.notes || ''
      ]);
      
      const csvContent = [
        headers.join(','),
        ...csvData.map((row: any[]) => row.map((cell: string) => '"' + cell + '"').join(','))
      ].join('\\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'spendwise_expenses_report.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }).unsubscribe();
  }
}
