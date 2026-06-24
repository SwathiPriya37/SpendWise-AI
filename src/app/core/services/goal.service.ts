import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { SavingsGoal } from '../models/savings-goal.model';

@Injectable({
  providedIn: 'root'
})
export class GoalService {
  private http = inject(HttpClient);
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
      })
    );
  }

  deleteGoal(id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        const updated = this.goalsSubject.value.filter(g => g.id !== id);
        this.goalsSubject.next(updated);
      })
    );
  }
}
