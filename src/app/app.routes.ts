import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/app-shell/layout/layout').then((m) => m.Layout),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'inicio',
      },
      {
        path: ':section',
        loadComponent: () =>
          import('./features/portfolio/page/portfolio').then((m) => m.Portfolio),
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
