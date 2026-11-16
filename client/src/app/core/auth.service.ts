import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { User } from './models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private router = inject(Router);
  user = signal<User | null>(JSON.parse(localStorage.getItem('user') || 'null'));
  get token() { return localStorage.getItem('token'); }
  setSession(token: string, user: User) {
    localStorage.setItem('token', token); localStorage.setItem('user', JSON.stringify(user));
    this.user.set(user); this.router.navigateByUrl(this.home(user.role));
  }
  home(role: string) { return role === 'admin' ? '/admin' : role === 'director' ? '/dashboard' : '/student'; }
  logout() { localStorage.clear(); this.user.set(null); this.router.navigateByUrl('/login'); }
}
