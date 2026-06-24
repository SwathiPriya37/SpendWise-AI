import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Budget } from '../models/budget.model';
import { LocalStorageService } from './local-storage.service';

@Injectable({
  providedIn: 'root'
})
export class BudgetService {
  private storage = inject(LocalStorageService);
  private budgetsSubject = new BehaviorSubject<Budget[]>([]);
  budgets$ = this.budgetsSubject.asObservable();

  private readonly BUDGETS_KEY = 'spendwise_budgets';

  constructor() {
    this.loadInitialData();
  }

  private loadInitialData() {
    const saved = this.storage.getItem<Budget[]>(this.BUDGETS_KEY);
    if (saved) {
      this.budgetsSubject.next(saved);
    } else {
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      const mockData: Budget[] = [
        { id: '1', category: 'Food', limit: 500, spent: 120.50, month: currentMonth, year: currentYear },
        { id: '2', category: 'Utilities', limit: 150, spent: 60.00, month: currentMonth, year: currentYear }
      ];
      this.storage.setItem(this.BUDGETS_KEY, mockData);
      this.budgetsSubject.next(mockData);
    }
  }

  getBudgets(): Observable<Budget[]> {
    return this.budgets$;
  }

  addBudget(budget: Omit<Budget, 'id'>) {
    const newBudget: Budget = {
      ...budget,
      id: crypto.randomUUID()
    };
    const updated = [...this.budgetsSubject.value, newBudget];
    this.storage.setItem(this.BUDGETS_KEY, updated);
    this.budgetsSubject.next(updated);
  }

  updateBudget(updatedBudget: Budget) {
    const updated = this.budgetsSubject.value.map(b => b.id === updatedBudget.id ? updatedBudget : b);
    this.storage.setItem(this.BUDGETS_KEY, updated);
    this.budgetsSubject.next(updated);
  }

  deleteBudget(id: string) {
    const updated = this.budgetsSubject.value.filter(b => b.id !== id);
    this.storage.setItem(this.BUDGETS_KEY, updated);
    this.budgetsSubject.next(updated);
  }
}
