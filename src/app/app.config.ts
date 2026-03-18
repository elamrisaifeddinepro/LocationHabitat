import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { provideSignalFormsConfig } from '@angular/forms/signals';
import { routes } from './app.routes';
import { httpErrorInterceptor } from './core/interceptors/http-error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    importProvidersFrom(MatSnackBarModule),
    provideSignalFormsConfig({
      classes: {
        'ng-invalid': (s) => s.invalid(),
        'ng-valid': (s) => s.valid(),
        'ng-touched': (s) => s.touched(),
        'ng-untouched': (s) => !s.touched(),
        'ng-dirty': (s) => s.dirty(),
        'ng-pristine': (s) => !s.dirty(),
        'ng-pending': (s) => s.pending(),
        'ng-disabled': (s) => s.disabled(),
        'ng-enabled': (s) => !s.disabled()
      }
    }),
    provideHttpClient(withInterceptors([httpErrorInterceptor]))
  ]
};
