import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface AppNotification {
  id: number;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class AppNotificationService {
  private http = inject(HttpClient);
  private notificationsSubject = new BehaviorSubject<AppNotification[]>([]);
  notifications$ = this.notificationsSubject.asObservable();
  private apiUrl = 'http://localhost:3000/api/notifications';

  constructor() {
    this.loadNotifications();
  }

  loadNotifications() {
    this.http.get<AppNotification[]>(this.apiUrl).subscribe(
      (data) => this.notificationsSubject.next(data),
      (error) => console.error('Error loading notifications', error)
    );
  }

  markAsRead(id: number) {
    return this.http.put(`${this.apiUrl}/${id}/read`, {}).pipe(
      tap(() => {
        const current = this.notificationsSubject.value;
        const updated = current.map(n => n.id === id ? { ...n, read: true } : n);
        this.notificationsSubject.next(updated);
      })
    );
  }

  markAllAsRead() {
    return this.http.put(`${this.apiUrl}/read-all`, {}).pipe(
      tap(() => {
        const current = this.notificationsSubject.value;
        const updated = current.map(n => ({ ...n, read: true }));
        this.notificationsSubject.next(updated);
      })
    );
  }

  createDemoNotification(message: string, type: string = 'INFO') {
    return this.http.post(`${this.apiUrl}/demo`, { message, type }).pipe(
      tap(() => this.loadNotifications())
    );
  }
}
