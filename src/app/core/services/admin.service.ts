import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SystemStats {
  overview: {
    totalUsers: number;
    totalExpenses: number;
    totalBudgets: number;
    totalGoals: number;
    totalIncomes: number;
    totalNotifications: number;
    totalExpenseAmount: number;
    totalIncomeAmount: number;
    totalSavingsAmount: number;
  };
  monthlyExpenses: Record<string, number>;
  monthlyUsers: Record<string, number>;
  categoryDistribution: Record<string, number>;
  recentActivity: AuditLog[];
}

export interface AuditLog {
  id: number;
  action: string;
  entity: string;
  entityId: number | null;
  details: string | null;
  userId: number;
  createdAt: string;
  user: { name: string; email: string };
}

export interface AuditLogResponse {
  logs: AuditLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AdminUser {
  id: number;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  _count: {
    expenses: number;
    budgets: number;
    savingsGoals: number;
    incomes: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/admin';

  getSystemStats(): Observable<SystemStats> {
    return this.http.get<SystemStats>(`${this.apiUrl}/stats`);
  }

  getAuditLogs(page = 1, limit = 20, filters?: { action?: string; entity?: string; search?: string }): Observable<AuditLogResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    
    if (filters?.action) params = params.set('action', filters.action);
    if (filters?.entity) params = params.set('entity', filters.entity);
    if (filters?.search) params = params.set('search', filters.search);

    return this.http.get<AuditLogResponse>(`${this.apiUrl}/audit-logs`, { params });
  }

  getAllUsers(): Observable<{ users: AdminUser[] }> {
    return this.http.get<{ users: AdminUser[] }>(`${this.apiUrl}/users`);
  }

  updateUserRole(userId: number, role: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${userId}/role`, { role });
  }
}
