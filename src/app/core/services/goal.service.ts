import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { NotificationService } from './notification.service';

export interface SavingsGoal {
  id: number;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class GoalService {
  private http = inject(HttpClient);
  private notification = inject(NotificationService);
  private goalsSubject = new BehaviorSubject<SavingsGoal[]>([]);
  goals$ = this.goalsSubject.asObservable();

  private apiUrl = 'http://localhost:3000/api/goals';

  constructor() {
    this.loadGoals();
  }

  private loadGoals() {
    this.http.get<SavingsGoal[]>(this.apiUrl).subscribe(
      (goals) => this.goalsSubject.next(goals),
      (error) => console.error('Error loading goals', error)
    );
  }

  getGoals(): Observable<SavingsGoal[]> {
    return this.goals$;
  }

  addGoal(goal: Omit<SavingsGoal, 'id'>): Observable<SavingsGoal> {
    return this.http.post<SavingsGoal>(this.apiUrl, goal).pipe(
      tap((newGoal) => {
        const updated = [...this.goalsSubject.value, newGoal];
        this.goalsSubject.next(updated);
        this.notification.success('Savings goal created successfully');
      }),
      catchError(err => {
        this.notification.error('Failed to create savings goal');
        throw err;
      })
    );
  }

  updateGoal(updatedGoal: SavingsGoal): Observable<SavingsGoal> {
    return this.http.put<SavingsGoal>(`${this.apiUrl}/${updatedGoal.id}`, updatedGoal).pipe(
      tap((updated) => {
        const current = this.goalsSubject.value;
        const index = current.findIndex(g => g.id === updated.id);
        if (index !== -1) {
          current[index] = updated;
          this.goalsSubject.next([...current]);
        }
        this.notification.success('Savings goal updated successfully');
      }),
      catchError(err => {
        this.notification.error('Failed to update savings goal');
        throw err;
      })
    );
  }

  deleteGoal(id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        const updated = this.goalsSubject.value.filter(g => g.id !== id);
        this.goalsSubject.next(updated);
        this.notification.info('Savings goal deleted');
      }),
      catchError(err => {
        this.notification.error('Failed to delete savings goal');
        throw err;
      })
    );
  }
}
