import { Component, EventEmitter, Output, inject } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { ThemeService } from '../../../core/services/theme.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [MatToolbarModule, MatIconModule, MatButtonModule, CommonModule, MatBadgeModule],
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
      
      <button mat-icon-button class="notification-btn">
        <mat-icon matBadge="1" matBadgeColor="accent" matBadgeSize="small">notifications_none</mat-icon>
      </button>
      
      <div class="avatar">
        SP
      </div>
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
}
