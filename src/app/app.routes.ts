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
    path: 'about',
    loadComponent: () => import('./features/static/pages/static-page/static-page.component').then(m => m.StaticPageComponent),
    data: {
      title: 'À propos',
      description: 'Location Habitat est une plateforme moderne de location immobilière qui permet de consulter, publier et gérer des annonces de logements de manière simple, rapide et sécurisée.'
    }
  },
  {
    path: 'terms',
    loadComponent: () => import('./features/static/pages/static-page/static-page.component').then(m => m.StaticPageComponent),
    data: {
      title: "Conditions d'utilisation",
      description: "Cette page présente les règles générales d’utilisation de la plateforme Location Habitat, les responsabilités des utilisateurs et les conditions d’accès aux services proposés."
    }
  },
  {
    path: 'privacy',
    loadComponent: () => import('./features/static/pages/static-page/static-page.component').then(m => m.StaticPageComponent),
    data: {
      title: 'Politique de confidentialité',
      description: 'Cette page explique comment les données personnelles des utilisateurs sont collectées, utilisées, protégées et conservées sur la plateforme.'
    }
  },
  {
    path: 'security',
    loadComponent: () => import('./features/static/pages/static-page/static-page.component').then(m => m.StaticPageComponent),
    data: {
      title: 'Sécurité',
      description: 'Location Habitat met en œuvre des mécanismes de sécurité pour protéger les comptes utilisateurs, les échanges et les données sensibles.'
    }
  },
  {
    path: 'faq',
    loadComponent: () => import('./features/static/pages/static-page/static-page.component').then(m => m.StaticPageComponent),
    data: {
      title: 'FAQ',
      description: 'Retrouvez ici les réponses aux questions fréquentes concernant l’inscription, la connexion, la publication des annonces, la messagerie et la gestion du compte.'
    }
  },
  {
    path: 'help',
    loadComponent: () => import('./features/static/pages/static-page/static-page.component').then(m => m.StaticPageComponent),
    data: {
      title: "Centre d'aide",
      description: 'Le centre d’aide vous accompagne dans l’utilisation du site et vous guide dans les principales actions disponibles sur la plateforme.'
    }
  },
  {
    path: 'contact',
    loadComponent: () => import('./features/static/pages/static-page/static-page.component').then(m => m.StaticPageComponent),
    data: {
      title: 'Contact',
      description: 'Vous pouvez utiliser cette page pour contacter l’équipe de la plateforme ou obtenir des informations générales sur le service.'
    }
  },
  {
    path: 'accessibility',
    loadComponent: () => import('./features/static/pages/static-page/static-page.component').then(m => m.StaticPageComponent),
    data: {
      title: 'Accessibilité',
      description: 'Location Habitat cherche à proposer une navigation claire, lisible et accessible à tous les utilisateurs sur différents appareils.'
    }
  },
  {
    path: 'report-issue',
    loadComponent: () => import('./features/static/pages/static-page/static-page.component').then(m => m.StaticPageComponent),
    canActivate: [authGuard],
    data: {
      title: 'Signaler un problème',
      description: 'Cette page permet à un utilisateur connecté de signaler un problème technique, une erreur d’affichage ou un comportement inattendu sur la plateforme.',
      protectedPage: true
    }
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