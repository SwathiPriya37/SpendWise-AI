import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ExpenseService } from '../../../core/services/expense.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ExpenseFormComponent } from '../expense-form/expense-form.component';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { combineLatest, startWith, map, tap } from 'rxjs';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';

@Component({
  selector: 'app-expense-list',
  standalone: true,
  imports: [
    CommonModule, 
    MatTableModule, 
    MatButtonModule, 
    MatIconModule, 
    MatDialogModule, 
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    EmptyStateComponent,
    BaseChartDirective
  ],
  templateUrl: './expense-list.component.html',
  styleUrl: './expense-list.component.scss'
})
export class ExpenseListComponent {
  expenseService = inject(ExpenseService);
  dialog = inject(MatDialog);
  fb = inject(FormBuilder);
  
  displayedColumns = ['title', 'category', 'date', 'amount', 'tags', 'actions'];
  
  categories = ['All', 'Food', 'Utilities', 'Entertainment', 'Transport', 'Healthcare', 'Other'];

  filterForm = this.fb.group({
    searchQuery: [''],
    category: ['All'],
    minAmount: [null],
    maxAmount: [null],
    startDate: [null],
    endDate: [null]
  });

  // Chart Data
  lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [{ data: [], label: 'Expenses', fill: true, tension: 0.4, borderColor: '#00a859', backgroundColor: 'rgba(0, 168, 89, 0.1)' }]
  };
  lineChartOptions: ChartConfiguration<'line'>['options'] = { responsive: true, maintainAspectRatio: false };

  pieChartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: [{ data: [], backgroundColor: ['#34a853', '#4285f4', '#fbbc04', '#9c27b0', '#ff6d00', '#00bcd4'] }]
  };
  pieChartOptions: ChartConfiguration<'doughnut'>['options'] = { responsive: true, maintainAspectRatio: false };

  tagChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [{ data: [], label: 'Spent by Tag', backgroundColor: '#3f51b5' }]
  };
  tagChartOptions: ChartConfiguration<'bar'>['options'] = { responsive: true, maintainAspectRatio: false };

  filteredExpenses$ = combineLatest([
    this.expenseService.expenses$,
    this.filterForm.valueChanges.pipe(startWith(this.filterForm.value))
  ]).pipe(
    map(([expenses, filters]) => {
      return expenses.filter(e => {
        // Search Filter
        const matchesSearch = !filters.searchQuery || e.title.toLowerCase().includes(filters.searchQuery.toLowerCase());
        
        // Category Filter
        const matchesCategory = !filters.category || filters.category === 'All' || e.category === filters.category;
        
        // Amount Filter
        const matchesMin = filters.minAmount === null || e.amount >= filters.minAmount;
        const matchesMax = filters.maxAmount === null || e.amount <= filters.maxAmount;
        
        // Date Filter
        const d = new Date(e.date);
        const matchesStart = !filters.startDate || d >= new Date(filters.startDate);
        let matchesEnd = true;
        if (filters.endDate) {
          const endD = new Date(filters.endDate);
          endD.setHours(23, 59, 59, 999);
          matchesEnd = d <= endD;
        }

        return matchesSearch && matchesCategory && matchesMin && matchesMax && matchesStart && matchesEnd;
      });
    }),
    tap(expenses => this.updateCharts(expenses))
  );

  updateCharts(expenses: any[]) {
    // 1. Expense Trend (Line)
    const dateMap = new Map<string, number>();
    const sorted = [...expenses].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    sorted.forEach(e => {
      const d = new Date(e.date).toLocaleDateString();
      dateMap.set(d, (dateMap.get(d) || 0) + e.amount);
    });
    this.lineChartData = {
      labels: Array.from(dateMap.keys()),
      datasets: [{ ...this.lineChartData.datasets[0], data: Array.from(dateMap.values()) }]
    };

    // 2. Category Distribution (Pie)
    const catMap = new Map<string, number>();
    expenses.forEach(e => catMap.set(e.category, (catMap.get(e.category) || 0) + e.amount));
    this.pieChartData = {
      labels: Array.from(catMap.keys()),
      datasets: [{ ...this.pieChartData.datasets[0], data: Array.from(catMap.values()) }]
    };

    // 3. Tag Analytics (Bar)
    const tagMap = new Map<string, number>();
    expenses.forEach(e => {
      if (e.tags) {
        e.tags.forEach((t: any) => {
          const tagName = typeof t === 'string' ? t : t.name;
          tagMap.set(tagName, (tagMap.get(tagName) || 0) + e.amount);
        });
      }
    });
    // Sort tags by highest amount
    const sortedTags = Array.from(tagMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 10); // top 10 tags
    this.tagChartData = {
      labels: sortedTags.map(t => t[0]),
      datasets: [{ ...this.tagChartData.datasets[0], data: sortedTags.map(t => t[1]) }]
    };
  }

  openAddExpenseDialog() {
    this.dialog.open(ExpenseFormComponent, {
      width: '400px',
      data: {}
    });
  }

  editExpense(expense: any) {
    this.dialog.open(ExpenseFormComponent, {
      width: '400px',
      data: { expense }
    });
  }

  deleteExpense(id: string) {
    if (confirm('Are you sure you want to delete this expense?')) {
      this.expenseService.deleteExpense(id);
    }
  }
}
