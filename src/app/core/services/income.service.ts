import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface Income {
  id?: number | string;
  title: string;
  amount: number;
  source: string;
  date: string;
  notes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class IncomeService {
  private http = inject(HttpClient);
  private incomesSubject = new BehaviorSubject<Income[]>([]);
  incomes$ = this.incomesSubject.asObservable();

  private apiUrl = 'http://localhost:3000/api/incomes';

  constructor() {
    this.loadIncomes();
  }

  private loadIncomes() {
    this.http.get<Income[]>(this.apiUrl).subscribe({
      next: (incomes) => this.incomesSubject.next(incomes),
      error: (error) => console.error('Error loading incomes', error)
    });
  }

  getIncomes(): Observable<Income[]> {
    return this.incomes$;
  }

  addIncome(income: Income): Observable<Income> {
    return this.http.post<Income>(this.apiUrl, income).pipe(
      tap((newIncome) => {
        const current = this.incomesSubject.value;
        this.incomesSubject.next([newIncome, ...current]);
      })
    );
  }

  updateIncome(income: Income): Observable<Income> {
    return this.http.put<Income>(`${this.apiUrl}/${income.id}`, income).pipe(
      tap((updated) => {
        const current = this.incomesSubject.value;
        const index = current.findIndex(i => i.id === updated.id);
        if (index !== -1) {
          current[index] = updated;
          this.incomesSubject.next([...current]);
        }
      })
    );
  }

  deleteIncome(id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        const current = this.incomesSubject.value;
        this.incomesSubject.next(current.filter(i => i.id !== id));
      })
    );
  }
}
