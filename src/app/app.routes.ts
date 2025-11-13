import { Routes } from '@angular/router';

export const routes: Routes = [
	{
		path: 'import',
		pathMatch: 'full',
		loadComponent: () =>
			import('./core/pages/csv-loader-page/csv-loader-page').then(m => m.CsvLoaderPage)
	},
	{
		path: 'dashboard',
		loadComponent: () =>
			import('./core/pages/dashboard-page/dashboard-page').then(m => m.DashboardPage)
	},
	{ path: '**', redirectTo: '/import' }
];
