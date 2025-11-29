import { Routes } from '@angular/router';
import { authGuard, adminGuard, guestGuard } from './guards/auth.guards';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./home/home').then(m => m.Home)
    },
    {
        path: 'login',
        loadComponent: () => import('./login/login').then(m => m.Login),
        canActivate: [guestGuard]
    },
    {
        path: 'signup',
        loadComponent: () => import('./signup/signup').then(m => m.Signup),
        canActivate: [guestGuard]
    },
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
        path: 'quiz',
        loadComponent: () => import('./quiz/quiz').then(m => m.Quiz),
        canActivate: [authGuard]
    },
    {
        path: 'admin',
        loadComponent: () => import('./admin/admin').then(m => m.Admin),
        canActivate: [adminGuard]
    }
];
