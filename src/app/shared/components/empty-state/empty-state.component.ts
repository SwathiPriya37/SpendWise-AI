import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, RouterModule],
  template: `
    <div class="empty-state-container">
      <div class="icon-wrapper" [ngClass]="color">
        <mat-icon>{{ icon }}</mat-icon>
      </div>
      <h2>{{ title }}</h2>
      <p>{{ description }}</p>
      <a *ngIf="actionRoute" mat-raised-button color="primary" [routerLink]="actionRoute">
        {{ actionLabel }}
      </a>
    </div>
  `,
  styles: [`
    .empty-state-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 24px;
      text-align: center;
      background: #fff;
      border-radius: 12px;
      border: 1px dashed #e0e0e0;
      margin: 16px 0;

      .icon-wrapper {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 16px;

        mat-icon {
          font-size: 32px;
          width: 32px;
          height: 32px;
        }

        &.primary { background: #e8f0fe; color: #1a73e8; }
        &.accent { background: #f3e8fd; color: #9333ea; }
        &.warn { background: #fdeceb; color: #d93025; }
        &.success { background: #e5f5eb; color: #007946; }
      }

      h2 {
        margin: 0 0 8px 0;
        font-size: 1.25rem;
        color: #333;
      }

      p {
        margin: 0 0 24px 0;
        color: #666;
        max-width: 300px;
      }
    }

    :host-context(.dark-theme) {
      .empty-state-container {
        background: var(--card-bg);
        border-color: #333;
        h2 { color: #eee; }
        p { color: #aaa; }
      }
    }
  `]
})
export class EmptyStateComponent {
  @Input() icon = 'inbox';
  @Input() title = 'No data found';
  @Input() description = 'There is currently no data to display here.';
  @Input() color: 'primary' | 'accent' | 'warn' | 'success' = 'primary';
  @Input() actionLabel?: string;
  @Input() actionRoute?: string;
}
