import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Budget } from '../models/budget.model';

@Injectable({
  providedIn: 'root'
})
export class BudgetService {
  private http = inject(HttpClient);
  private budgetsSubject = new BehaviorSubject<Budget[]>([]);
  budgets$ = this.budgetsSubject.asObservable();

  private apiUrl = 'http://localhost:3000/api/budgets';

  constructor() {
    this.loadBudgets();
  }

  private loadBudgets() {
    this.http.get<Budget[]>(this.apiUrl).subscribe(
      (budgets) => this.budgetsSubject.next(budgets),
      (error) => console.error('Error loading budgets', error)
    );
  }

  getBudgets(): Observable<Budget[]> {
    return this.budgets$;
  }

  addBudget(budget: Omit<Budget, 'id'>): Observable<Budget> {
    return this.http.post<Budget>(this.apiUrl, budget).pipe(
      tap((newBudget) => {
        const updated = [...this.budgetsSubject.value, newBudget];
        this.budgetsSubject.next(updated);
      })
    );
  }

  updateBudget(updatedBudget: Budget): Observable<Budget> {
    return this.http.put<Budget>(`${this.apiUrl}/${updatedBudget.id}`, updatedBudget).pipe(
      tap((updated) => {
        const current = this.budgetsSubject.value;
        const index = current.findIndex(b => b.id === updated.id);
        if (index !== -1) {
          current[index] = updated;
          this.budgetsSubject.next([...current]);
        }
      })
    );
  }

  deleteBudget(id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        const updated = this.budgetsSubject.value.filter(b => b.id !== id);
        this.budgetsSubject.next(updated);
      })
    );
  }
}
