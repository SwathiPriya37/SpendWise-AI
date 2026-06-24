import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { 
    path: 'login', 
    loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent) 
  },
  { 
    path: 'register', 
    loadComponent: () => import('./features/auth/register.component').then(m => m.RegisterComponent) 
  },
  { 
    path: 'dashboard', 
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) 
  },
  { 
    path: 'expenses', 
    canActivate: [authGuard],
    loadComponent: () => import('./features/expenses/expense-list/expense-list.component').then(m => m.ExpenseListComponent) 
  },
  { 
    path: 'budgets', 
    canActivate: [authGuard],
    loadComponent: () => import('./features/budgets/budget-planner/budget-planner.component').then(m => m.BudgetPlannerComponent) 
  },
  { 
    path: 'goals', 
    canActivate: [authGuard],
    loadComponent: () => import('./features/goals/goal-tracker/goal-tracker.component').then(m => m.GoalTrackerComponent) 
  },
  { 
    path: 'analytics', 
    canActivate: [authGuard],
    loadComponent: () => import('./features/analytics/analytics.component').then(m => m.AnalyticsComponent) 
  },
  { 
    path: 'reports', 
    canActivate: [authGuard],
    loadComponent: () => import('./features/reports/reports.component').then(m => m.ReportsComponent) 
  },
  { path: '**', redirectTo: 'dashboard' }
];
