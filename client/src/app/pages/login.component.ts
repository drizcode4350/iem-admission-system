import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';

@Component({
  standalone: true, imports: [ReactiveFormsModule, RouterLink],
  template: `
  <div class="card" style="max-width:420px;margin:40px auto">
    <h1>Sign in</h1>
    <form [formGroup]="f" (ngSubmit)="go()">
      <label for="email">Email</label><input id="email" formControlName="email" type="email" />
      <label for="pw">Password</label><input id="pw" formControlName="password" type="password" />
      @if (error) { <div class="alert">{{ error }}</div> }
      <p><button class="btn" [disabled]="f.invalid || busy">{{ busy ? 'Signing in…' : 'Sign in' }}</button></p>
    </form>
    <p class="muted">New applicant? <a routerLink="/register">Create an account</a></p>
  </div>`,
})
export class LoginComponent {
  private api = inject(ApiService); private auth = inject(AuthService);
  f = inject(FormBuilder).nonNullable.group({ email: ['', [Validators.required, Validators.email]], password: ['', Validators.required] });
  error = ''; busy = false;
  constructor() { const u = this.auth.user(); if (u) this.auth.setSession(this.auth.token!, u); }
  go() {
    this.busy = true; this.error = '';
    this.api.login(this.f.getRawValue()).subscribe({
      next: (r) => this.auth.setSession(r.token, r.user),
      error: (e) => { this.error = e.error?.message || 'Login failed'; this.busy = false; },
    });
  }
}
