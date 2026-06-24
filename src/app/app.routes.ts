import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { 
    path: 'dashboard', 
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) 
  },
  { 
    path: 'expenses', 
    loadComponent: () => import('./features/expenses/expense-list/expense-list.component').then(m => m.ExpenseListComponent) 
  },
  { 
    path: 'budgets', 
    loadComponent: () => import('./features/budgets/budget-planner/budget-planner.component').then(m => m.BudgetPlannerComponent) 
  },
  { 
    path: 'goals', 
    loadComponent: () => import('./features/goals/goal-tracker/goal-tracker.component').then(m => m.GoalTrackerComponent) 
  },
  { 
    path: 'analytics', 
    loadComponent: () => import('./features/analytics/analytics.component').then(m => m.AnalyticsComponent) 
  },
  { 
    path: 'reports', 
    loadComponent: () => import('./features/reports/reports.component').then(m => m.ReportsComponent) 
  },
  { path: '**', redirectTo: 'dashboard' }
];
