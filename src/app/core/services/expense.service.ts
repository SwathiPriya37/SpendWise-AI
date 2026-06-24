import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Expense } from '../models/expense.model';
import { LocalStorageService } from './local-storage.service';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  private storage = inject(LocalStorageService);
  private expensesSubject = new BehaviorSubject<Expense[]>([]);
  expenses$ = this.expensesSubject.asObservable();

  private readonly EXPENSES_KEY = 'spendwise_expenses';

  constructor() {
    this.loadInitialData();
  }

  private loadInitialData() {
    const saved = this.storage.getItem<Expense[]>(this.EXPENSES_KEY);
    if (saved) {
      this.expensesSubject.next(saved);
    } else {
      // Mock data
      const mockData: Expense[] = [
        { id: '1', title: 'Groceries', amount: 120.50, category: 'Food', date: new Date().toISOString(), notes: 'Weekly groceries' },
        { id: '2', title: 'Internet Bill', amount: 60.00, category: 'Utilities', date: new Date(Date.now() - 86400000 * 2).toISOString() }
      ];
      this.storage.setItem(this.EXPENSES_KEY, mockData);
      this.expensesSubject.next(mockData);
    }
  }

  getExpenses(): Observable<Expense[]> {
    return this.expenses$;
  }

  addExpense(expense: Omit<Expense, 'id'>) {
    const newExpense: Expense = {
      ...expense,
      id: crypto.randomUUID()
    };
    const current = this.expensesSubject.value;
    const updated = [newExpense, ...current];
    this.storage.setItem(this.EXPENSES_KEY, updated);
    this.expensesSubject.next(updated);
  }

  updateExpense(updatedExpense: Expense) {
    const current = this.expensesSubject.value;
    const updated = current.map(e => e.id === updatedExpense.id ? updatedExpense : e);
    this.storage.setItem(this.EXPENSES_KEY, updated);
    this.expensesSubject.next(updated);
  }

  deleteExpense(id: string) {
    const current = this.expensesSubject.value;
    const updated = current.filter(e => e.id !== id);
    this.storage.setItem(this.EXPENSES_KEY, updated);
    this.expensesSubject.next(updated);
  }
}
