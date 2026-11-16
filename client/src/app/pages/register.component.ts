import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';

@Component({
  standalone: true, imports: [ReactiveFormsModule, RouterLink],
  template: `
  <div class="card" style="max-width:420px;margin:40px auto">
    <h1>Create applicant account</h1>
    <form [formGroup]="f" (ngSubmit)="go()">
      <label for="n">Full name</label><input id="n" formControlName="fullName" />
      @if (show('fullName')) { <div class="err">{{ errors['fullName'] || 'At least 3 characters' }}</div> }
      <label for="e">Email</label><input id="e" type="email" formControlName="email" />
      @if (show('email')) { <div class="err">{{ errors['email'] || 'Valid email required' }}</div> }
      <label for="p">Password</label><input id="p" type="password" formControlName="password" />
      @if (show('password')) { <div class="err">{{ errors['password'] || 'Min 8 chars with a letter and a number' }}</div> }
      @if (error) { <div class="alert">{{ error }}</div> }
      <p><button class="btn" [disabled]="busy">Register</button></p>
    </form>
    <p class="muted">Already registered? <a routerLink="/login">Sign in</a></p>
  </div>`,
})
export class RegisterComponent {
  private api = inject(ApiService); private auth = inject(AuthService);
  f = inject(FormBuilder).nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d).{8,}$/)]],
  });
  errors: Record<string, string> = {}; error = ''; busy = false;
  show(k: string) { const c = this.f.get(k)!; return !!this.errors[k] || (c.invalid && c.touched); }
  go() {
    this.f.markAllAsTouched(); if (this.f.invalid) return;
    this.busy = true; this.error = ''; this.errors = {};
    this.api.register(this.f.getRawValue()).subscribe({
      next: (r) => this.auth.setSession(r.token, r.user),
      error: (e) => {
  console.error('Registration error:', e);
  this.errors = e.error?.errors || {};
  this.error = `Error ${e.status}: ${e.error?.message || e.message || 'Unknown error'}`;
  this.busy = false;
},
    });
  }
}
