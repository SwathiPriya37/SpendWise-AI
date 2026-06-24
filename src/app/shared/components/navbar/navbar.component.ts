import { Component, EventEmitter, Output, inject } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { ThemeService } from '../../../core/services/theme.service';
import { CommonModule } from '@angular/common';

import { MatMenuModule } from '@angular/material/menu';
import { MatListModule } from '@angular/material/list';
import { AuthService } from '../../../core/services/auth.service';
import { AppNotificationService } from '../../../core/services/app-notification.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [MatToolbarModule, MatIconModule, MatButtonModule, CommonModule, MatBadgeModule, MatMenuModule, MatListModule],
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
        <mat-icon [matBadge]="unreadCount" matBadgeColor="accent" matBadgeSize="small" [matBadgeHidden]="unreadCount === 0">notifications_none</mat-icon>
      </button>
      <mat-menu #notificationsMenu="matMenu" class="notification-menu">
        <div class="notification-header">
          <h4>Notifications</h4>
          <button mat-button color="primary" (click)="markAllAsRead()" *ngIf="unreadCount > 0" class="mark-all-btn">Mark all as read</button>
        </div>
        <mat-list class="notification-list">
          <ng-container *ngIf="(notifications$ | async) as notifications">
            <div *ngIf="notifications.length === 0" class="empty-notifications">
              No notifications yet.
            </div>
            <mat-list-item *ngFor="let n of notifications" [class.unread]="!n.read" (click)="markAsRead(n.id)">
              <mat-icon matListItemIcon [ngClass]="n.type.toLowerCase()">
                {{ n.type === 'WARNING' ? 'warning' : (n.type === 'SUCCESS' ? 'check_circle' : 'info') }}
              </mat-icon>
              <div matListItemTitle>{{ n.message }}</div>
              <div matListItemLine class="notification-time">{{ n.createdAt | date:'short' }}</div>
            </mat-list-item>
          </ng-container>
        </mat-list>
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
    
    ::ng-deep .notification-menu {
      max-width: 350px !important;
      width: 350px;
    }
    
    .notification-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      border-bottom: 1px solid #eee;
      
      h4 { margin: 0; font-weight: 600; }
      .mark-all-btn { font-size: 0.8rem; line-height: 24px; }
    }
    
    .notification-list {
      max-height: 400px;
      overflow-y: auto;
      
      .empty-notifications {
        padding: 24px;
        text-align: center;
        color: #888;
      }
      
      mat-list-item {
        cursor: pointer;
        transition: background 0.2s;
        
        &:hover { background: rgba(0,0,0,0.02); }
        &.unread { background: rgba(63, 81, 181, 0.05); }
        
        mat-icon {
          &.warning { color: #ff9800; }
          &.success { color: #4caf50; }
          &.info { color: #2196f3; }
        }
        
        .notification-time {
          font-size: 0.75rem;
          color: #888;
        }
      }
    }
    
    :host-context(.dark-theme) {
      .notification-header { border-bottom-color: #333; h4 { color: #eee; } }
      .notification-list {
        mat-list-item {
          &:hover { background: rgba(255,255,255,0.05); }
          &.unread { background: rgba(255,255,255,0.1); }
          [matListItemTitle] { color: #eee; }
        }
      }
    }
    `
  ]
})
export class NavbarComponent {
  @Output() toggleSidenav = new EventEmitter<void>();
  themeService = inject(ThemeService);
  authService = inject(AuthService);
  notificationService = inject(AppNotificationService);

  initials = 'U';
  userName = 'User';
  
  notifications$ = this.notificationService.notifications$;
  unreadCount = 0;

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
    
    this.notifications$.subscribe(notifications => {
      this.unreadCount = notifications.filter(n => !n.read).length;
    });
  }

  markAsRead(id: number) {
    this.notificationService.markAsRead(id).subscribe();
  }

  markAllAsRead() {
    this.notificationService.markAllAsRead().subscribe();
  }

  logout() {
    this.authService.logout();
    window.location.reload();
  }
}
