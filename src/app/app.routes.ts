import { Routes } from '@angular/router';
import { authGuard } from './auth/services/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./welcome/welcome.page').then((m) => m.WelcomePage),
  },
  {
    path: 'tabs',
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
    canActivate: [authGuard],
  },
  {
    path: 'login',
    loadComponent: () => import('./registro/registro.page').then((m) => m.RegistroPage),
  },
];
