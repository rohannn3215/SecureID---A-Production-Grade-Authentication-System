import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenService } from '../services/token.service';

export const adminGuard: CanActivateFn = () => {
  const tokenService = inject(TokenService);
  const router = inject(Router);

  const currentUser = tokenService.currentUser();
  if (currentUser && currentUser.role === 'ROLE_ADMIN') {
    return true;
  }

  router.navigate(['/dashboard']);
  return false;
};
