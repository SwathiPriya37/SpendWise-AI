import { Component } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ExpenseService } from '../../../core/services/expense.service';
import { AuthService } from '../../../core/services/auth.service';
import { inject } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [MatListModule, MatIconModule, RouterModule, CommonModule],
  template: `
    <div class="sidebar-wrapper">
      <div class="sidebar-header">
        <h2>SpendWise <mat-icon>eco</mat-icon></h2>
        <span class="subtitle">Personal Finance</span>
      </div>
      
      <mat-nav-list class="nav-menu">
        <a mat-list-item routerLink="/dashboard" routerLinkActive="active">
          <mat-icon matListItemIcon>dashboard</mat-icon>
          <div matListItemTitle>Dashboard</div>
        </a>
        <a mat-list-item routerLink="/expenses" routerLinkActive="active">
          <mat-icon matListItemIcon>account_balance_wallet</mat-icon>
          <div matListItemTitle>Expenses</div>
        </a>
        <a mat-list-item routerLink="/budgets" routerLinkActive="active">
          <mat-icon matListItemIcon>pie_chart</mat-icon>
          <div matListItemTitle>Budgets</div>
        </a>
        <a mat-list-item routerLink="/goals" routerLinkActive="active">
          <mat-icon matListItemIcon>track_changes</mat-icon>
          <div matListItemTitle>Savings Goals</div>
        </a>
        <a mat-list-item routerLink="/analytics" routerLinkActive="active">
          <mat-icon matListItemIcon>bar_chart</mat-icon>
          <div matListItemTitle>Analytics</div>
        </a>
        <a mat-list-item routerLink="/reports" routerLinkActive="active">
          <mat-icon matListItemIcon>description</mat-icon>
          <div matListItemTitle>Reports</div>
        </a>
        <a mat-list-item routerLink="/settings" routerLinkActive="active">
          <mat-icon matListItemIcon>settings</mat-icon>
          <div matListItemTitle>Settings</div>
        </a>

        <div class="nav-divider" *ngIf="isAdmin"></div>
        <a mat-list-item routerLink="/admin" routerLinkActive="active" *ngIf="isAdmin" class="admin-link">
          <mat-icon matListItemIcon>admin_panel_settings</mat-icon>
          <div matListItemTitle>Admin Panel</div>
        </a>

      </mat-nav-list>

      <div class="sidebar-footer">
        <div class="overview-card">
          <div class="overview-header">
            <h4>Monthly Overview</h4>
            <span class="month">June 2026</span>
          </div>
          
          <div class="overview-stat">
            <span class="label">Total Income</span>
            <span class="value success">{{ totalIncome | currency }}</span>
          </div>
          
          <div class="overview-stat">
            <span class="label">Total Expenses</span>
            <span class="value danger">{{ totalExpenses | currency }}</span>
          </div>
          
          <div class="progress-container">
            <div class="progress-bar">
              <div class="progress-fill" [style.width]="savingsRate + '%'"></div>
            </div>
            <div class="progress-labels">
              <span>Savings Rate</span>
              <span class="success">{{ savingsRate | number:'1.1-1' }}%</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="logout-section">
        <a mat-list-item (click)="logout()" class="logout-btn">
          <mat-icon matListItemIcon>logout</mat-icon>
          <div matListItemTitle>Logout</div>
        </a>
      </div>
    </div>
  `,
  styles: [
    `
    .sidebar-wrapper {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: var(--sidebar-bg);
      border-right: 1px solid rgba(0,0,0,0.05);
    }
    .sidebar-header {
      padding: 30px 24px;
    }
    .sidebar-header h2 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--primary-green);
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .sidebar-header h2 mat-icon {
      color: #34a853; /* Light green leaf */
    }
    .sidebar-header .subtitle {
      font-size: 0.85rem;
      color: #666;
      margin-top: 4px;
      display: block;
    }
    
    .nav-menu {
      padding: 0 16px;
      flex: 1;
    }
    
    .mat-mdc-list-item {
      border-radius: var(--border-radius);
      margin-bottom: 4px;
      color: #555;
    }
    
    .mat-mdc-list-item.active {
      background: var(--active-bg);
      color: var(--active-text);
      font-weight: 500;
    }
    
    .mat-mdc-list-item.active mat-icon {
      color: var(--active-text);
    }

    .sidebar-footer {
      padding: 24px 16px;
    }

    .overview-card {
      background: #f8f9fa;
      border-radius: var(--border-radius);
      padding: 16px;
      border: 1px solid rgba(0,0,0,0.03);
    }

    :host-context(.dark-theme) .overview-card {
      background: #2d2d3a;
      border-color: rgba(255,255,255,0.05);
    }

    .overview-header {
      margin-bottom: 16px;
    }
    .overview-header h4 {
      margin: 0 0 4px 0;
      font-size: 0.9rem;
      font-weight: 600;
    }
    .overview-header .month {
      font-size: 0.8rem;
      color: #777;
    }

    .overview-stat {
      display: flex;
      flex-direction: column;
      margin-bottom: 12px;
    }
    .overview-stat .label {
      font-size: 0.8rem;
      color: #666;
      margin-bottom: 4px;
    }
    .overview-stat .value {
      font-size: 1rem;
      font-weight: 600;
    }
    .success { color: #00a859; }
    .danger { color: #d93025; }

    .progress-container {
      margin-top: 16px;
    }
    .progress-bar {
      height: 8px;
      background: #e0e0e0;
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 8px;
    }
    :host-context(.dark-theme) .progress-bar {
      background: #444;
    }
    .progress-fill {
      height: 100%;
      background: #00a859;
      border-radius: 4px;
    }
    .progress-labels {
      display: flex;
      justify-content: space-between;
      font-size: 0.8rem;
      color: #666;
    }
    .progress-labels .success {
      font-weight: 600;
    }
    .logout-section {
      padding: 16px;
      border-top: 1px solid rgba(0,0,0,0.05);
    }
    .logout-btn {
      color: #d93025 !important;
      cursor: pointer;
    }
    .nav-divider {
      height: 1px;
      background: rgba(0,0,0,0.08);
      margin: 12px 0;
    }
    :host-context(.dark-theme) .nav-divider {
      background: rgba(255,255,255,0.08);
    }
    .admin-link {
      color: #6366f1 !important;
    }
    .admin-link mat-icon {
      color: #6366f1 !important;
    }
    .admin-link.active {
      background: rgba(99, 102, 241, 0.1) !important;
    }
    `
  ]
})
export class SidebarComponent {
  private expenseService = inject(ExpenseService);
  private authService = inject(AuthService);
  
  totalIncome = 3000; // Static base income for now
  totalExpenses = 0;
  savingsRate = 0;
  isAdmin = false;

  constructor() {
    this.expenseService.expenses$.subscribe(expenses => {
      this.totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
      this.calculateSavings();
    });
    this.authService.currentUser$.subscribe(user => {
      this.isAdmin = user?.role === 'ADMIN';
    });
  }

  private calculateSavings() {
    if (this.totalIncome > 0) {
      const saved = this.totalIncome - this.totalExpenses;
      this.savingsRate = Math.max(0, (saved / this.totalIncome) * 100);
    }
  }

  logout() {
    this.authService.logout();
    window.location.reload(); // Reload to trigger auth guard
  }
}
