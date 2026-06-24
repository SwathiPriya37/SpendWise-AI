import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="skeleton" 
         [ngClass]="type" 
         [style.width]="width" 
         [style.height]="height"
         [style.border-radius]="borderRadius">
    </div>
  `,
  styles: [`
    .skeleton {
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: skeleton-loading 1.5s infinite;
      
      &.text { border-radius: 4px; height: 16px; margin-bottom: 8px; }
      &.circle { border-radius: 50%; }
      &.rect { border-radius: 8px; }
    }

    @keyframes skeleton-loading {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    :host-context(.dark-theme) {
      .skeleton {
        background: linear-gradient(90deg, #2d2d3a 25%, #3d3d4a 50%, #2d2d3a 75%);
        background-size: 200% 100%;
      }
    }
  `]
})
export class SkeletonComponent {
  @Input() type: 'text' | 'circle' | 'rect' = 'text';
  @Input() width = '100%';
  @Input() height = '';
  @Input() borderRadius = '';
}
