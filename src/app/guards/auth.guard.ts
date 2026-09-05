import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export class AuthGuard {
  static canActivate: CanActivateFn = async () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const isAuth = await authService.isAuthenticated();

    if (isAuth) {
      return true;
    }

    await router.navigate(['/registro']);
    return false;
  };
}