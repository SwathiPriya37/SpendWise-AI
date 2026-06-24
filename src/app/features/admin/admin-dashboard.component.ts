import { Component, inject, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AdminService, SystemStats, AuditLog, AdminUser } from '../../core/services/admin.service';
import { NotificationService } from '../../core/services/notification.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatCardModule, MatIconModule, MatButtonModule, MatTableModule,
    MatPaginatorModule, MatInputModule, MatSelectModule, MatChipsModule,
    MatTabsModule, MatMenuModule, MatTooltipModule, MatProgressBarModule
  ],
  template: `
    <div class="admin-dashboard">
      <!-- Header -->
      <div class="admin-header">
        <div class="header-content">
          <div class="header-title">
            <mat-icon class="header-icon">admin_panel_settings</mat-icon>
            <div>
              <h1>Admin Dashboard</h1>
              <p>System overview and management console</p>
            </div>
          </div>
          <div class="header-actions">
            <button mat-stroked-button (click)="refreshData()">
              <mat-icon>refresh</mat-icon> Refresh
            </button>
          </div>
        </div>
      </div>

      <!-- Stats Cards Row -->
      <div class="stats-grid" *ngIf="stats">
        <div class="stat-card stat-users">
          <div class="stat-icon-bg">
            <mat-icon>people</mat-icon>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.overview.totalUsers }}</span>
            <span class="stat-label">Total Users</span>
          </div>
          <div class="stat-trend up">
            <mat-icon>trending_up</mat-icon>
          </div>
        </div>

        <div class="stat-card stat-expenses">
          <div class="stat-icon-bg">
            <mat-icon>receipt_long</mat-icon>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.overview.totalExpenses }}</span>
            <span class="stat-label">Total Transactions</span>
          </div>
          <div class="stat-meta">
            {{ stats.overview.totalExpenseAmount | currency }}
          </div>
        </div>

        <div class="stat-card stat-budgets">
          <div class="stat-icon-bg">
            <mat-icon>account_balance</mat-icon>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.overview.totalBudgets }}</span>
            <span class="stat-label">Active Budgets</span>
          </div>
          <div class="stat-meta">
            {{ stats.overview.totalIncomeAmount | currency }} income
          </div>
        </div>

        <div class="stat-card stat-goals">
          <div class="stat-icon-bg">
            <mat-icon>flag</mat-icon>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.overview.totalGoals }}</span>
            <span class="stat-label">Savings Goals</span>
          </div>
          <div class="stat-meta">
            {{ stats.overview.totalSavingsAmount | currency }} saved
          </div>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="charts-row">
        <mat-card class="chart-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>show_chart</mat-icon> Expense Trends
            </mat-card-title>
            <mat-card-subtitle>Monthly expense volume</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <canvas #expenseChart></canvas>
          </mat-card-content>
        </mat-card>

        <mat-card class="chart-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>donut_large</mat-icon> Category Distribution
            </mat-card-title>
            <mat-card-subtitle>Spending by category</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <canvas #categoryChart></canvas>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Tabs: Users & Audit Logs -->
      <mat-card class="management-card">
        <mat-tab-group animationDuration="300ms">
          <!-- Users Tab -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon class="tab-icon">people</mat-icon>
              User Management
            </ng-template>
            <div class="tab-content">
              <table mat-table [dataSource]="users" class="users-table">
                <ng-container matColumnDef="name">
                  <th mat-header-cell *matHeaderCellDef>Name</th>
                  <td mat-cell *matCellDef="let user">
                    <div class="user-cell">
                      <div class="user-avatar">{{ getInitials(user.name) }}</div>
                      <div>
                        <div class="user-name">{{ user.name || 'Unnamed' }}</div>
                        <div class="user-email">{{ user.email }}</div>
                      </div>
                    </div>
                  </td>
                </ng-container>

                <ng-container matColumnDef="role">
                  <th mat-header-cell *matHeaderCellDef>Role</th>
                  <td mat-cell *matCellDef="let user">
                    <span class="role-badge" [ngClass]="user.role.toLowerCase()">{{ user.role }}</span>
                  </td>
                </ng-container>

                <ng-container matColumnDef="stats">
                  <th mat-header-cell *matHeaderCellDef>Activity</th>
                  <td mat-cell *matCellDef="let user">
                    <div class="user-stats">
                      <span matTooltip="Expenses"><mat-icon>receipt</mat-icon> {{ user._count.expenses }}</span>
                      <span matTooltip="Budgets"><mat-icon>pie_chart</mat-icon> {{ user._count.budgets }}</span>
                      <span matTooltip="Goals"><mat-icon>flag</mat-icon> {{ user._count.savingsGoals }}</span>
                    </div>
                  </td>
                </ng-container>

                <ng-container matColumnDef="joined">
                  <th mat-header-cell *matHeaderCellDef>Joined</th>
                  <td mat-cell *matCellDef="let user">{{ user.createdAt | date:'mediumDate' }}</td>
                </ng-container>

                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef>Actions</th>
                  <td mat-cell *matCellDef="let user">
                    <button mat-icon-button [matMenuTriggerFor]="userMenu" matTooltip="Manage">
                      <mat-icon>more_vert</mat-icon>
                    </button>
                    <mat-menu #userMenu="matMenu">
                      <button mat-menu-item (click)="toggleRole(user)" *ngIf="user.role === 'USER'">
                        <mat-icon>admin_panel_settings</mat-icon> Promote to Admin
                      </button>
                      <button mat-menu-item (click)="toggleRole(user)" *ngIf="user.role === 'ADMIN'">
                        <mat-icon>person</mat-icon> Demote to User
                      </button>
                    </mat-menu>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="userColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: userColumns;"></tr>
              </table>
            </div>
          </mat-tab>

          <!-- Audit Logs Tab -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon class="tab-icon">history</mat-icon>
              Audit Logs
            </ng-template>
            <div class="tab-content">
              <div class="audit-filters">
                <mat-form-field appearance="outline" class="search-field">
                  <mat-label>Search logs...</mat-label>
                  <input matInput [(ngModel)]="auditSearch" (keyup.enter)="searchAuditLogs()">
                  <mat-icon matSuffix>search</mat-icon>
                </mat-form-field>
                <mat-form-field appearance="outline" class="filter-field">
                  <mat-label>Filter by Action</mat-label>
                  <mat-select [(ngModel)]="auditActionFilter" (selectionChange)="searchAuditLogs()">
                    <mat-option value="">All Actions</mat-option>
                    <mat-option value="USER_LOGIN">Login</mat-option>
                    <mat-option value="USER_REGISTERED">Registration</mat-option>
                    <mat-option value="EXPENSE_CREATED">Expense Created</mat-option>
                    <mat-option value="BUDGET_CREATED">Budget Created</mat-option>
                    <mat-option value="GOAL_UPDATED">Goal Updated</mat-option>
                    <mat-option value="PROFILE_UPDATED">Profile Updated</mat-option>
                    <mat-option value="PASSWORD_CHANGED">Password Changed</mat-option>
                    <mat-option value="ROLE_CHANGED">Role Changed</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>

              <table mat-table [dataSource]="auditLogs" class="audit-table">
                <ng-container matColumnDef="timestamp">
                  <th mat-header-cell *matHeaderCellDef>Timestamp</th>
                  <td mat-cell *matCellDef="let log">{{ log.createdAt | date:'medium' }}</td>
                </ng-container>

                <ng-container matColumnDef="user">
                  <th mat-header-cell *matHeaderCellDef>User</th>
                  <td mat-cell *matCellDef="let log">{{ log.user?.name || log.user?.email || 'System' }}</td>
                </ng-container>

                <ng-container matColumnDef="action">
                  <th mat-header-cell *matHeaderCellDef>Action</th>
                  <td mat-cell *matCellDef="let log">
                    <span class="action-badge" [ngClass]="getActionClass(log.action)">{{ formatAction(log.action) }}</span>
                  </td>
                </ng-container>

                <ng-container matColumnDef="entity">
                  <th mat-header-cell *matHeaderCellDef>Entity</th>
                  <td mat-cell *matCellDef="let log">{{ log.entity }}</td>
                </ng-container>

                <ng-container matColumnDef="details">
                  <th mat-header-cell *matHeaderCellDef>Details</th>
                  <td mat-cell *matCellDef="let log">{{ log.details || '—' }}</td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="auditColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: auditColumns;"></tr>
              </table>

              <mat-paginator
                [length]="auditTotal"
                [pageSize]="20"
                [pageSizeOptions]="[10, 20, 50]"
                (page)="onAuditPageChange($event)">
              </mat-paginator>
            </div>
          </mat-tab>

          <!-- Recent Activity Tab -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon class="tab-icon">timeline</mat-icon>
              Recent Activity
            </ng-template>
            <div class="tab-content activity-timeline">
              <div class="timeline-item" *ngFor="let activity of recentActivity">
                <div class="timeline-dot" [ngClass]="getActionClass(activity.action)"></div>
                <div class="timeline-content">
                  <div class="timeline-header">
                    <span class="timeline-action">{{ formatAction(activity.action) }}</span>
                    <span class="timeline-time">{{ activity.createdAt | date:'short' }}</span>
                  </div>
                  <p class="timeline-details">{{ activity.details }}</p>
                  <span class="timeline-user">by {{ activity.user?.name || activity.user?.email }}</span>
                </div>
              </div>
              <div class="empty-timeline" *ngIf="recentActivity.length === 0">
                <mat-icon>history</mat-icon>
                <p>No recent activity</p>
              </div>
            </div>
          </mat-tab>
        </mat-tab-group>
      </mat-card>
    </div>
  `,
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements OnInit, AfterViewInit {
  private adminService = inject(AdminService);
  private notification = inject(NotificationService);

  @ViewChild('expenseChart') expenseChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('categoryChart') categoryChartRef!: ElementRef<HTMLCanvasElement>;

  stats: SystemStats | null = null;
  users: AdminUser[] = [];
  auditLogs: AuditLog[] = [];
  recentActivity: AuditLog[] = [];
  
  userColumns = ['name', 'role', 'stats', 'joined', 'actions'];
  auditColumns = ['timestamp', 'user', 'action', 'entity', 'details'];

  auditSearch = '';
  auditActionFilter = '';
  auditPage = 1;
  auditTotal = 0;

  private expenseChart: Chart | null = null;
  private categoryChart: Chart | null = null;

  ngOnInit() {
    this.loadData();
  }

  ngAfterViewInit() {
    // Charts are rendered after data loads
  }

  loadData() {
    this.adminService.getSystemStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.recentActivity = data.recentActivity;
        setTimeout(() => this.renderCharts(), 100);
      },
      error: () => this.notification.error('Failed to load admin stats')
    });

    this.adminService.getAllUsers().subscribe({
      next: (data) => this.users = data.users,
      error: () => this.notification.error('Failed to load users')
    });

    this.loadAuditLogs();
  }

  loadAuditLogs() {
    this.adminService.getAuditLogs(this.auditPage, 20, {
      action: this.auditActionFilter,
      search: this.auditSearch
    }).subscribe({
      next: (data) => {
        this.auditLogs = data.logs;
        this.auditTotal = data.pagination.total;
      },
      error: () => this.notification.error('Failed to load audit logs')
    });
  }

  refreshData() {
    this.loadData();
    this.notification.success('Dashboard refreshed');
  }

  searchAuditLogs() {
    this.auditPage = 1;
    this.loadAuditLogs();
  }

  onAuditPageChange(event: PageEvent) {
    this.auditPage = event.pageIndex + 1;
    this.loadAuditLogs();
  }

  toggleRole(user: AdminUser) {
    const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
    this.adminService.updateUserRole(user.id, newRole).subscribe({
      next: () => {
        this.notification.success(`User ${user.name} role changed to ${newRole}`);
        this.loadData();
      },
      error: () => this.notification.error('Failed to update user role')
    });
  }

  getInitials(name: string): string {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length > 1) return parts[0][0] + parts[1][0];
    return name.substring(0, 2).toUpperCase();
  }

  getActionClass(action: string): string {
    if (action.includes('LOGIN') || action.includes('REGISTER')) return 'action-auth';
    if (action.includes('CREATED')) return 'action-create';
    if (action.includes('UPDATED') || action.includes('CHANGED')) return 'action-update';
    if (action.includes('DELETED')) return 'action-delete';
    return 'action-default';
  }

  formatAction(action: string): string {
    return action.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  }

  private renderCharts() {
    if (!this.stats) return;

    // Expense Trend Line Chart
    if (this.expenseChartRef?.nativeElement) {
      if (this.expenseChart) this.expenseChart.destroy();
      
      const months = Object.keys(this.stats.monthlyExpenses).sort();
      const expenseData = months.map(m => this.stats!.monthlyExpenses[m]);
      const labels = months.map(m => {
        const [year, month] = m.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      });

      this.expenseChart = new Chart(this.expenseChartRef.nativeElement, {
        type: 'line',
        data: {
          labels: labels.length > 0 ? labels : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            label: 'Total Expenses',
            data: expenseData.length > 0 ? expenseData : [1200, 1900, 3000, 2500, 2200, 3100],
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#6366f1',
            pointRadius: 5,
            pointHoverRadius: 8
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
            x: { grid: { display: false } }
          }
        }
      });
    }

    // Category Distribution Doughnut Chart
    if (this.categoryChartRef?.nativeElement) {
      if (this.categoryChart) this.categoryChart.destroy();

      const categories = Object.keys(this.stats.categoryDistribution);
      const catData = categories.map(c => this.stats!.categoryDistribution[c]);
      const colors = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#06b6d4'];

      this.categoryChart = new Chart(this.categoryChartRef.nativeElement, {
        type: 'doughnut',
        data: {
          labels: categories.length > 0 ? categories : ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment'],
          datasets: [{
            data: catData.length > 0 ? catData : [35, 20, 15, 20, 10],
            backgroundColor: colors.slice(0, Math.max(categories.length, 5)),
            borderWidth: 0,
            hoverOffset: 8
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '65%',
          plugins: {
            legend: { position: 'bottom', labels: { padding: 16, usePointStyle: true } }
          }
        }
      });
    }
  }
}
