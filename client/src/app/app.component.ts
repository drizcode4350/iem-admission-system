import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <nav class="nav">
      <a class="brand" routerLink="/">IEM ADMISSIONS</a>
      @if (auth.user(); as u) {
        @if (u.role === 'applicant') {
          <a routerLink="/student" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">Dashboard</a>
          <a routerLink="/student/status" routerLinkActive="active">Status</a>
        }
        @if (u.role === 'admin') {
          <a routerLink="/admin" routerLinkActive="active">Queue</a>
        }
        @if (u.role === 'admin' || u.role === 'director') {
          <a routerLink="/dashboard" routerLinkActive="active">Overview</a>
        }
        <span class="muted">{{ u.fullName }} · {{ u.role }}</span>
        <button class="btn ghost" (click)="auth.logout()">Log out</button>
      } @else {
        <a routerLink="/login" routerLinkActive="active">Sign in</a>
        <a routerLink="/register" routerLinkActive="active">Register</a>
      }
    </nav>
    <main class="container"><router-outlet /></main>
  `,
})
export class AppComponent { auth = inject(AuthService); }
