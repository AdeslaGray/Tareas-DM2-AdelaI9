import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'rides',
        loadComponent: () => import('../rides/rides-page/rides-page.component').then((m) => m.RidesPageComponent),
      },
      {
        path: 'location',
        loadComponent: () => import('../location/location-page/location-page.component').then((m) => m.LocationPageComponent),
      },
      {
        path: 'profile',
        loadComponent: () => import('../profile/profile-page/profile-page.component').then((m) => m.ProfilePageComponent),
      },
      {
        path: '',
        redirectTo: '/tabs/rides',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/tabs/rides',
    pathMatch: 'full',
  },
];