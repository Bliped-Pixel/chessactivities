import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'puzzles',
        loadComponent: () => import('./puzzles/puzzles').then(m => m.Puzzles)
    },
    {
        path: 'independents',
        loadComponent: () => import('./independents/independents').then(m => m.Independents)
    },
    {
        path: 'dominance',
        loadComponent: () => import('./dominance/dominance').then(m => m.Dominance)
    },
    {
        path: 'coordinates',
        loadComponent: () => import('./coordinates/coordinates').then(m => m.Coordinates)
    },
    {
        path: 'knights-tour',
        loadComponent: () => import('./knights-tour/knights-tour').then(m => m.KnightsTour)
    },
    {
        path: '',
        redirectTo: 'puzzles',
        pathMatch: 'full'
    }
];
