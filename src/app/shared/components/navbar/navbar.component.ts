import { Component, EventEmitter, Output, inject } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { ThemeService } from '../../../core/services/theme.service';
import { CommonModule } from '@angular/common';

import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [MatToolbarModule, MatIconModule, MatButtonModule, CommonModule, MatBadgeModule, MatMenuModule],
  template: `
    <mat-toolbar class="custom-navbar">
      <button mat-icon-button (click)="toggleSidenav.emit()">
        <mat-icon>menu</mat-icon>
      </button>
      
      <span class="spacer"></span>
      
      <button mat-icon-button (click)="themeService.toggleTheme()">
        <mat-icon *ngIf="!(themeService.isDarkMode$ | async)">light_mode</mat-icon>
        <mat-icon *ngIf="themeService.isDarkMode$ | async">dark_mode</mat-icon>
      </button>
      
      <button mat-icon-button class="notification-btn" [matMenuTriggerFor]="notificationsMenu">
        <mat-icon matBadge="1" matBadgeColor="accent" matBadgeSize="small">notifications_none</mat-icon>
      </button>
      <mat-menu #notificationsMenu="matMenu">
        <div style="padding: 16px; width: 250px;">
          <h4 style="margin:0 0 8px 0;">Notifications</h4>
          <p style="margin:0; font-size: 0.9rem; color: #555;">Welcome back to SpendWise! Your dashboard is looking great today.</p>
        </div>
      </mat-menu>
      
      <div class="avatar" [matMenuTriggerFor]="profileMenu">
        {{ initials }}
      </div>
      <mat-menu #profileMenu="matMenu">
        <button mat-menu-item disabled>
          <mat-icon>person</mat-icon>
          <span>{{ userName }}</span>
        </button>
        <button mat-menu-item (click)="logout()">
          <mat-icon color="warn">logout</mat-icon>
          <span style="color: #d93025;">Logout</span>
        </button>
      </mat-menu>
    </mat-toolbar>
  `,
  styles: [
    `
    .custom-navbar {
      background-color: var(--primary-green);
      color: white;
      box-shadow: none;
      padding: 0 24px;
    }
    .spacer { flex: 1 1 auto; }
    
    .notification-btn {
      margin-right: 16px;
    }
    
    .avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background-color: #f1f3f4;
      color: var(--primary-green);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.9rem;
      cursor: pointer;
    }
    `
  ]
})
export class NavbarComponent {
  @Output() toggleSidenav = new EventEmitter<void>();
  themeService = inject(ThemeService);
  authService = inject(AuthService);

  initials = 'U';
  userName = 'User';

  constructor() {
    this.authService.currentUser$.subscribe(user => {
      if (user && user.name) {
        this.userName = user.name;
        const parts = user.name.split(' ');
        if (parts.length > 1) {
          this.initials = parts[0][0] + parts[1][0];
        } else {
          this.initials = user.name.substring(0, 2).toUpperCase();
        }
      }
    });
  }

  logout() {
    this.authService.logout();
    window.location.reload();
  }
}
