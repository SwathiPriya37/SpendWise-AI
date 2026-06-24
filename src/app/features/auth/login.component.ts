import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, MatCardModule, MatInputModule, MatButtonModule],
  template: `
    <div class="auth-container">
      <mat-card class="auth-card">
        <mat-card-header>
          <mat-card-title>Login to SpendWise</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="auth-form">
            <mat-form-field appearance="fill" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput formControlName="email" type="email">
            </mat-form-field>
            <mat-form-field appearance="fill" class="full-width">
              <mat-label>Password</mat-label>
              <input matInput formControlName="password" type="password">
            </mat-form-field>
            <div class="error-msg" *ngIf="errorMessage">{{ errorMessage }}</div>
            <button mat-raised-button color="primary" type="submit" [disabled]="loginForm.invalid" class="full-width mt-16">Login</button>
          </form>
          <div class="auth-links mt-16">
            Don't have an account? <a routerLink="/register">Register</a>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
    .auth-container {
      height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background: var(--active-bg);
    }
    .auth-card {
      width: 100%;
      max-width: 400px;
      padding: 24px;
    }
    .auth-form {
      display: flex;
      flex-direction: column;
      margin-top: 16px;
    }
    .full-width {
      width: 100%;
      margin-bottom: 8px;
    }
    .mt-16 {
      margin-top: 16px;
    }
    .error-msg {
      color: #d93025;
      font-size: 0.85rem;
      margin-bottom: 16px;
    }
    .auth-links {
      text-align: center;
      font-size: 0.9rem;
    }
    `
  ]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  errorMessage = '';

  onSubmit() {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Login failed';
        }
      });
    }
  }
}
