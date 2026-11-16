import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
export const roleGuard = (...roles: string[]): CanActivateFn => () => {
  const auth = inject(AuthService); const router = inject(Router);
  const u = auth.user();
  if (!u) return router.parseUrl('/login');
  return roles.includes(u.role) ? true : router.parseUrl(auth.home(u.role));
};
