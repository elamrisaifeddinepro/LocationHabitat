import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { formLeaveGuard } from './core/guards/form-leave.guard';
import { ResetPasswordComponent } from './features/auth/pages/reset-password/reset-password.component';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'reset-password',
    component: ResetPasswordComponent
  },
  {
    path: 'auth/login',
    loadComponent: () => import('./features/auth/pages/login/login.component').then(m => m.LoginComponent),
    canActivate: [guestGuard]
  },
  {
    path: 'auth/register',
    loadComponent: () => import('./features/auth/pages/register/register.component').then(m => m.RegisterComponent),
    canActivate: [guestGuard]
  },
  {
    path: 'auth/forgot-password',
    loadComponent: () => import('./features/auth/pages/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
    canActivate: [guestGuard]
  },
  {
    path: 'auth/reset-password',
    loadComponent: () => import('./features/auth/pages/reset-password/reset-password.component').then(m => m.ResetPasswordComponent),
    canActivate: [guestGuard]
  },
  {
    path: 'announcements',
    loadComponent: () => import('./features/announcements/pages/announcements-list/announcements-list.component').then(m => m.AnnouncementsListComponent)
  },
  {
    path: 'announcements/new',
    loadComponent: () => import('./features/announcements/pages/announcement-form/announcement-form.component').then(m => m.AnnouncementFormComponent),
    canActivate: [authGuard],
    canDeactivate: [formLeaveGuard]
  },
  {
    path: 'announcements/edit/:id',
    loadComponent: () => import('./features/announcements/pages/announcement-form/announcement-form.component').then(m => m.AnnouncementFormComponent),
    canActivate: [authGuard],
    canDeactivate: [formLeaveGuard]
  },
  {
    path: 'announcements/:id',
    loadComponent: () => import('./features/announcements/pages/announcement-detail/announcement-detail.component').then(m => m.AnnouncementDetailComponent)
  },
  {
    path: 'favorites',
    loadComponent: () => import('./features/favorites/pages/favorites/favorites.component').then(m => m.FavoritesComponent),
    canActivate: [authGuard]
  },
  {
    path: 'my-announcements',
    loadComponent: () => import('./features/announcements/pages/my-announcements/my-announcements.component').then(m => m.MyAnnouncementsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'profile',
    loadComponent: () => import('./features/profile/pages/profile-edit/profile-edit.component').then(m => m.ProfileEditComponent),
    canActivate: [authGuard],
    canDeactivate: [formLeaveGuard]
  },
  {
    path: 'messages',
    loadComponent: () => import('./features/messages/pages/inbox/inbox.component').then(m => m.InboxComponent),
    canActivate: [authGuard]
  },
  {
    path: 'messages/send',
    loadComponent: () => import('./features/messages/pages/send-message/send-message.component').then(m => m.SendMessageComponent),
    canActivate: [authGuard]
  },
  {
    path: '**',
    loadComponent: () => import('./features/not-found/page-not-found/page-not-found.component').then(m => m.PageNotFoundComponent)
  }
];