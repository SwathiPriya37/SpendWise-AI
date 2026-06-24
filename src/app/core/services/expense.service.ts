import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Expense } from '../models/expense.model';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  private http = inject(HttpClient);
  private expensesSubject = new BehaviorSubject<Expense[]>([]);
  expenses$ = this.expensesSubject.asObservable();

  private apiUrl = 'http://localhost:3000/api/expenses';

  constructor() {
    this.loadExpenses();
  }

  private loadExpenses() {
    this.http.get<Expense[]>(this.apiUrl).subscribe(
      (expenses) => this.expensesSubject.next(expenses),
      (error) => console.error('Error loading expenses', error)
    );
  }

  getExpenses(): Observable<Expense[]> {
    return this.expenses$;
  }

  addExpense(expense: Omit<Expense, 'id'>): Observable<Expense> {
    return this.http.post<Expense>(this.apiUrl, expense).pipe(
      tap((newExpense) => {
        const current = this.expensesSubject.value;
        this.expensesSubject.next([newExpense, ...current]);
      })
    );
  }

  updateExpense(updatedExpense: Expense): Observable<Expense> {
    return this.http.put<Expense>(`${this.apiUrl}/${updatedExpense.id}`, updatedExpense).pipe(
      tap((updated) => {
        const current = this.expensesSubject.value;
        const index = current.findIndex(e => e.id === updated.id);
        if (index !== -1) {
          current[index] = updated;
          this.expensesSubject.next([...current]);
        }
      })
    );
  }

  deleteExpense(id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        const current = this.expensesSubject.value;
        this.expensesSubject.next(current.filter(e => e.id !== id));
      })
    );
  }
}
