import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SavingsGoal } from '../models/savings-goal.model';
import { LocalStorageService } from './local-storage.service';

@Injectable({
  providedIn: 'root'
})
export class GoalService {
  private storage = inject(LocalStorageService);
  private goalsSubject = new BehaviorSubject<SavingsGoal[]>([]);
  goals$ = this.goalsSubject.asObservable();

  private readonly GOALS_KEY = 'spendwise_goals';

  constructor() {
    this.loadInitialData();
  }

  private loadInitialData() {
    const saved = this.storage.getItem<SavingsGoal[]>(this.GOALS_KEY);
    if (saved) {
      this.goalsSubject.next(saved);
    } else {
      const mockData: SavingsGoal[] = [
        { id: '1', title: 'Emergency Fund', targetAmount: 10000, currentAmount: 2500, deadline: new Date(new Date().getFullYear(), 11, 31).toISOString() },
        { id: '2', title: 'New Car', targetAmount: 5000, currentAmount: 1000, deadline: new Date(new Date().getFullYear() + 1, 5, 30).toISOString() }
      ];
      this.storage.setItem(this.GOALS_KEY, mockData);
      this.goalsSubject.next(mockData);
    }
  }

  getGoals(): Observable<SavingsGoal[]> {
    return this.goals$;
  }

  addGoal(goal: Omit<SavingsGoal, 'id'>) {
    const newGoal: SavingsGoal = {
      ...goal,
      id: crypto.randomUUID()
    };
    const updated = [...this.goalsSubject.value, newGoal];
    this.storage.setItem(this.GOALS_KEY, updated);
    this.goalsSubject.next(updated);
  }

  updateGoal(updatedGoal: SavingsGoal) {
    const updated = this.goalsSubject.value.map(g => g.id === updatedGoal.id ? updatedGoal : g);
    this.storage.setItem(this.GOALS_KEY, updated);
    this.goalsSubject.next(updated);
  }

  deleteGoal(id: string) {
    const updated = this.goalsSubject.value.filter(g => g.id !== id);
    this.storage.setItem(this.GOALS_KEY, updated);
    this.goalsSubject.next(updated);
  }
}
