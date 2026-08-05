import { CanActivateFn } from '@angular/router';

export const sessionInactiveGuard: CanActivateFn = (route, state) => {
  return true;
};
