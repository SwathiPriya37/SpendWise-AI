import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, MatCardModule, BaseChartDirective],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.scss'
})
export class AnalyticsComponent {
  barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      { data: [650, 590, 800, 810, 560, 1200], label: 'Expenses', backgroundColor: '#f44336' },
      { data: [200, 300, 400, 450, 600, 500], label: 'Savings', backgroundColor: '#4caf50' }
    ]
  };
  barChartOptions: ChartConfiguration<'bar'>['options'] = { responsive: true, maintainAspectRatio: false };
}
