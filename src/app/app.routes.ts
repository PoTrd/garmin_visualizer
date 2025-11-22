import { Routes, CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

const hasDataGuard: CanActivateFn = () => {
  const router = inject(Router);
  const hasData = localStorage.getItem('activities');
  return hasData ? true : router.createUrlTree(['/import']);
};

const noDataGuard: CanActivateFn = () => {
  const router = inject(Router);
  const hasData = localStorage.getItem('activities');
  return hasData ? router.createUrlTree(['/dashboard']) : true;
};

export const routes: Routes = [
    {
        path: 'import',
        pathMatch: 'full',
        canActivate: [noDataGuard],
        loadComponent: () =>
            import('./core/pages/csv-loader-page/csv-loader-page').then(m => m.CsvLoaderPage)
    },
    {
        path: 'dashboard',
        canActivate: [hasDataGuard],
        loadComponent: () =>
            import('./core/pages/dashboard-page/dashboard-page').then(m => m.DashboardPage)
    },
    {
        path: '**', 
        redirectTo: 'dashboard'
    }
];